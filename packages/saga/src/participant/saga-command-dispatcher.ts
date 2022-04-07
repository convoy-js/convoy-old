import {
  InternalCommandDispatcher,
  CommandHandlers,
  CommandHandler,
  CommandMessage,
} from '@convoy/command';
import {
  InternalMessageConsumer,
  InternalMessageProducer,
  Message,
} from '@convoy/message';

import {
  CannotClaimLockException,
  SagaLockManager,
  StashMessageRequiredException,
} from '../common';
import { SagaCommandHandler } from './saga-command-handler';
import {
  addLockedHeader,
  getCommandTarget,
  getLock,
  getSagaId,
  getSagaType,
  isUnlockMessage,
} from './utils';

export class SagaCommandDispatcher extends InternalCommandDispatcher {
  constructor(
    commandDispatcherId: string,
    commandHandlers: CommandHandlers,
    messageConsumer: InternalMessageConsumer,
    messageProducer: InternalMessageProducer,
    private readonly sagaLockManager: SagaLockManager,
  ) {
    super(
      commandDispatcherId,
      commandHandlers,
      messageConsumer,
      messageProducer,
    );
  }

  protected async invoke<C>(
    commandHandler: CommandHandler,
    commandMessage: CommandMessage<C>,
  ): Promise<readonly Message<any>[]> {
    const sagaType = getSagaType(commandMessage.message);
    const sagaId = getSagaId(commandMessage.message);
    let lockedTarget: string | undefined;

    if (commandHandler instanceof SagaCommandHandler) {
      if (typeof commandHandler.preLock === 'function') {
        lockedTarget = (await commandHandler.preLock(commandMessage)).target;
        const hasClaimedLock = await this.sagaLockManager.claimLock(
          sagaType,
          sagaId,
          lockedTarget!,
        );
        if (!hasClaimedLock) {
          throw new StashMessageRequiredException(
            commandMessage,
            lockedTarget!,
          );
        }
      }
    }

    const messages = await super.invoke(commandHandler, commandMessage);

    if (lockedTarget) {
      return addLockedHeader(messages, lockedTarget);
    } else {
      const lockTarget = getLock(messages);
      if (lockTarget) {
        const hasClaimedLock = await this.sagaLockManager.claimLock(
          sagaType,
          sagaId,
          lockTarget.target,
        );
        if (!hasClaimedLock) {
          throw new CannotClaimLockException(
            sagaType,
            sagaId,
            lockTarget.target,
          );
        }

        return addLockedHeader(messages, lockTarget.target);
      } else {
        return messages;
      }
    }
  }

  async handleMessage<T>(message: Message<T>): Promise<void> {
    const sagaType = getSagaType(message);
    const sagaId = getSagaId(message);
    const target = getCommandTarget(message);

    if (isUnlockMessage(message)) {
      const unlockedMessage = await this.sagaLockManager.unlock(sagaId, target);
      if (unlockedMessage) {
        await super.handleMessage(unlockedMessage);
      }
    } else {
      try {
        await super.handleMessage(message);
      } catch (err) {
        if (err instanceof StashMessageRequiredException) {
          await this.sagaLockManager.stashMessage(
            sagaType,
            sagaId,
            target,
            message,
          );
        } else {
          throw err;
        }
      }
    }
  }
}
