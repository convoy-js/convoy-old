import { ConsoleTransport, Logger, ScopeFormatter } from '@deepkit/logger';
import { cast } from '@deepkit/type';
import { getClassName } from '@deepkit/core';
import {
  CommandMessageHeaders,
  CommandReplyOutcome,
  ConvoyCommandProducer,
  Failure,
  ReplyMessageHeaders,
  Success,
  LockTarget,
} from '@convoy/command';
import {
  InternalMessageConsumer,
  Message,
  MessageHeaders,
} from '@convoy/message';
import { DatabaseWrapper } from '@convoy/database';

import {
  CannotClaimResourceLockException,
  SagaCommandHeaders,
  SagaLockManager,
  StateMachineEmptyException,
} from '../common';

import { SagaCommandProducer } from './saga-command-producer';
import { Saga, SagaLifecycleHooks } from './saga';
import { SagaDefinition } from './saga-definition';
import { SagaActions } from './saga-actions';
import { SagaUnlockCommand, SagaReplyHeaders } from '../common';
import { SagaInstance } from './entities';

export class SagaManager<D> {
  private readonly logger = new Logger(
    [new ConsoleTransport()],
    [new ScopeFormatter()],
  ).scoped('saga-manager');

  private get sagaType(): string {
    return getClassName(this.saga);
  }

  private get sagaReplyChannel(): string {
    return this.sagaType + '-reply';
  }

  private get sagaSubscriberId(): string {
    return this.sagaType + '-consumer';
  }

  constructor(
    private readonly saga: Saga<D> & SagaLifecycleHooks<D>,
    // private readonly sagaInstanceRepository: SagaInstanceRepository,
    private readonly db: DatabaseWrapper<any>,
    private readonly commandProducer: ConvoyCommandProducer,
    private readonly messageConsumer: InternalMessageConsumer,
    private readonly sagaLockManager: SagaLockManager,
    private readonly sagaCommandProducer: SagaCommandProducer,
  ) {}

  private getSagaDefinition(): SagaDefinition<D> {
    const sm = this.saga.sagaDefinition;

    if (!sm) {
      throw new StateMachineEmptyException(this.saga);
    }

    return sm;
  }

  private createFailureMessage(): Message<Failure> {
    return new Message(Failure, new Failure())
      .setHeader(ReplyMessageHeaders.REPLY_OUTCOME, CommandReplyOutcome.FAILURE)
      .setHeader(ReplyMessageHeaders.REPLY_TYPE, Failure.name);
  }

  private createSuccessMessage(): Message<Success> {
    return new Message(Success, new Success())
      .setHeader(ReplyMessageHeaders.REPLY_OUTCOME, CommandReplyOutcome.SUCCESS)
      .setHeader(ReplyMessageHeaders.REPLY_TYPE, Success.name);
  }

  private updateState(
    sagaInstance: SagaInstance<D>,
    actions: SagaActions<D>,
  ): void {
    if (actions.updatedState) {
      sagaInstance.state = actions.updatedState;
    }
  }

  private async performEndStateActions(
    sagaId: string,
    sagaInstance: SagaInstance<D>,
    sagaData: D,
  ): Promise<void> {
    for (const participant of sagaInstance.participants) {
      const headers = new MessageHeaders();
      headers.set(SagaCommandHeaders.SAGA_ID, sagaId);
      headers.set(SagaCommandHeaders.SAGA_TYPE, this.sagaType);

      await this.commandProducer.send(
        participant.destination,
        new SagaUnlockCommand(),
        this.sagaReplyChannel,
        headers,
        participant.resource,
      );
    }

    if (sagaInstance.state.compensating) {
      await this.saga.onSagaRolledBack?.(sagaInstance.id, sagaData);
    } else {
      await this.saga.onSagaCompletedSuccessfully?.(sagaInstance.id, sagaData);
    }
  }

  private async processActions(
    sagaInstance: SagaInstance<D>,
    sagaData: D,
    actions: SagaActions<D>,
  ): Promise<void> {
    while (true) {
      if (actions.localException) {
        actions = await this.getSagaDefinition().handleReply(
          actions.updatedState!,
          actions.updatedSagaData!,
          this.createFailureMessage(),
        );
      } else {
        // only do this if successful
        sagaInstance.lastRequestId =
          await this.sagaCommandProducer.sendCommands(
            this.sagaType,
            sagaInstance.id,
            actions.commands,
            this.sagaReplyChannel,
          );

        this.updateState(sagaInstance, actions);

        sagaInstance.data = actions.updatedSagaData || sagaData;

        if (actions.updatedState.endState) {
          await this.performEndStateActions(
            sagaInstance.id,
            sagaInstance,
            sagaData,
          );
        }

        this.db.add(sagaInstance);

        if (!actions.local) break;

        actions = await this.getSagaDefinition().handleReply(
          actions.updatedState!,
          actions.updatedSagaData!,
          this.createSuccessMessage(),
        );
      }
    }
  }

  private isReplyForThisSagaType<T>(message: Message<T>): boolean {
    const sagaReplyType = message.getHeader(SagaReplyHeaders.REPLY_SAGA_TYPE);
    return sagaReplyType === this.sagaType;
  }

  private async handleReply<T>(message: Message<T>): Promise<void> {
    if (!this.isReplyForThisSagaType(message)) return;

    const sagaId = message.getRequiredHeader(SagaReplyHeaders.REPLY_SAGA_ID);
    const sagaType = message.getRequiredHeader(
      SagaReplyHeaders.REPLY_SAGA_TYPE,
    );

    const sagaInstance = await this.db
      .query<SagaInstance<any>>(SagaInstance)
      .filter({ type: sagaType, id: sagaId })
      .findOne();

    const resource = message.getHeader(SagaReplyHeaders.REPLY_LOCKED);
    if (resource) {
      const destination = message.getRequiredHeader(
        CommandMessageHeaders.inReply(CommandMessageHeaders.DESTINATION),
      );
      sagaInstance.addParticipant(destination, resource);
      this.db.add(sagaInstance);
    }

    const actions = await this.getSagaDefinition().handleReply(
      sagaInstance.state,
      sagaInstance.data,
      message,
    );

    await this.processActions(sagaInstance, sagaInstance.data, actions);
  }

  async handleMessage<T>(message: Message<T>): Promise<void> {
    this.logger.debug(`handleMessage invoked with - ${message.toString()}`);

    if (message.hasHeader(SagaReplyHeaders.REPLY_SAGA_ID)) {
      await this.handleReply(message);
    } else {
      this.logger.warning(
        "handleMessage doesn't know what to do with: " + message.toString(),
      );
    }
  }

  async subscribeToReplyChannel(): Promise<void> {
    await this.messageConsumer.subscribe(
      this.sagaSubscriberId,
      [this.sagaReplyChannel],
      this.handleMessage.bind(this),
    );
  }

  createInstance(data: D): Promise<SagaInstance<D>>;
  createInstance(data: D, lockTarget?: string): Promise<SagaInstance<D>>;
  createInstance<T>(
    data: D,
    targetType: T,
    targetId: string,
  ): Promise<SagaInstance<D>>;
  async createInstance<T>(
    sagaData: D,
    target?: string | T,
    targetId?: string,
  ): Promise<SagaInstance<D>> {
    const lockTarget = new LockTarget(target, targetId);
    const resource = lockTarget.target;

    const sagaInstance = cast<SagaInstance<D>>({
      type: this.sagaType,
      dataType: getClassName(sagaData),
      data: sagaData,
    });
    await this.db.persist(sagaInstance);

    await this.saga.onStarting?.(sagaInstance.id, sagaData);

    if (resource) {
      if (
        !(await this.sagaLockManager.claimLock(
          this.sagaType,
          sagaInstance.id,
          resource,
        ))
      ) {
        throw new CannotClaimResourceLockException();
      }
    }

    const actions = await this.getSagaDefinition().start(sagaData);

    if (actions.localException) {
      throw actions.localException;
    }

    await this.processActions(sagaInstance, sagaData, actions);

    return sagaInstance;
  }
}
