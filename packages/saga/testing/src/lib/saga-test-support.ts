/// <reference types="jest" />
import { getClassName, getClassTypeFromInstance } from '@deepkit/core';
import { uuid } from '@deepkit/type';

import {
  InternalMessageConsumer,
  InternalMessageProducer,
  Message,
  MessageHeaders,
  MessageRecordHeaders,
} from '@convoy/message';
import {
  CommandMessageHeaders,
  CommandReplyOutcome,
  ConvoyCommandProducer,
  Failure,
  ReplyMessageHeaders,
  Success,
} from '@convoy/command';
import { DatabaseWrapper } from '@convoy/database';
import {
  SagaInstance,
  ConvoySaga,
  SagaManager,
  SagaLockManager,
  SagaReplyHeaders,
  SagaCommandProducer,
} from '@convoy/saga';

import { MessageWithDestination } from './message-with-destination';

export type SagaExpectationTest = (
  sentCommands: MessageWithDestination<any>[],
) => void;

export class SagaExpectCommandTest<C, D> {
  private expectedExtraHeaders?: MessageRecordHeaders;
  private expectedCommand!: C;
  private expect!: SagaExpectationTest;

  constructor(
    private readonly sentCommandIdx: number,
    private readonly expects: SagaExpectationTest[],
    private readonly sagaManager: SagaManager<D>,
    private readonly sagaInstance: SagaInstance<D>,
  ) {}

  private async sendReply<R>(
    reply: R,
    outcome: CommandReplyOutcome,
  ): Promise<void> {
    const message = new Message(
      getClassTypeFromInstance(reply),
      reply,
      new MessageHeaders([
        [Message.ID, uuid()],
        [ReplyMessageHeaders.REPLY_OUTCOME, outcome],
        [ReplyMessageHeaders.REPLY_TYPE, getClassName(reply)],
        [SagaReplyHeaders.REPLY_SAGA_TYPE, this.sagaInstance.type],
        [SagaReplyHeaders.REPLY_SAGA_ID, this.sagaInstance.id],
      ]),
    );

    await this.sagaManager.handleMessage(message);
  }

  async successReply<R>(reply?: R): Promise<void> {
    await this.sendReply(reply || new Success(), CommandReplyOutcome.SUCCESS);
  }

  async failureReply<R>(reply?: R): Promise<void> {
    await this.sendReply(reply || new Failure(), CommandReplyOutcome.FAILURE);
  }

  command(command: C): this {
    this.expectedCommand = command;
    return this;
  }

  withExtraHeaders(
    expectedExtraHeaders: MessageHeaders | MessageRecordHeaders,
  ): this {
    this.expectedExtraHeaders =
      expectedExtraHeaders instanceof MessageHeaders
        ? expectedExtraHeaders.asRecord()
        : expectedExtraHeaders;

    return this;
  }

  to(commandChannel: string): this {
    this.expect = (sentCommands: MessageWithDestination<any>[]) => {
      const sentCommand = sentCommands[0];

      expect(commandChannel).toEqual(sentCommand.destination);
      expect(getClassName(this.expectedCommand)).toEqual(
        sentCommand.message.getRequiredHeader(
          CommandMessageHeaders.COMMAND_TYPE,
        ),
      );

      if (this.expectedExtraHeaders) {
        expect(sentCommand.message.headers.asRecord()).toMatchObject(
          expect.objectContaining(this.expectedExtraHeaders),
        );
      }

      sentCommands.shift();
    };

    this.expects.push(this.expect);

    return this;
  }
}

export class ConvoySagaTestSupport<D> {
  private readonly expectations: SagaExpectationTest[][] = [];
  private sagaManager!: SagaManager<D>;
  private createException?: Error;
  public readonly sentCommands: MessageWithDestination<any>[] = [];
  public sagaInstance!: SagaInstance<D>;

  constructor(
    private readonly db: DatabaseWrapper<any>,
    private readonly messageConsumer: InternalMessageConsumer,
    private readonly commandProducer: ConvoyCommandProducer,
    private readonly sagaCommandProducer: SagaCommandProducer,
  ) {}

  private runExpectations(): void {
    expect(this.sentCommands).toHaveLength(this.expectations.length);

    this.expectations.forEach(expectations => {
      expectations.forEach(expect => expect(this.sentCommands));
    });
  }

  private assertNoCommands(): void {
    switch (this.sentCommands.length) {
      case 0:
        break;
      case 1:
        const { message, destination } = this.sentCommands[0];
        fail(
          `Expected saga to have finished but found a command of ${message.getRequiredHeader(
            CommandMessageHeaders.COMMAND_TYPE,
          )} sent to ${destination}: ${message.toString()}`,
        );
        break;
      default:
        expect(this.sentCommands).toHaveLength(0);
        break;
    }
  }

  expect<C>(): SagaExpectCommandTest<C, D> {
    if (this.createException) {
      throw this.createException;
    }

    const expects: SagaExpectationTest[] = [];
    const idx = this.expectations.push(expects) - 1;

    return new SagaExpectCommandTest(
      idx,
      expects,
      this.sagaManager,
      this.sagaInstance,
    );
  }

  async create(saga: ConvoySaga<D>, sagaData: D): Promise<this> {
    class TestSagaLockManager extends SagaLockManager {
      override claimLock = jest.fn().mockReturnValue(true);
    }

    this.sagaManager = new SagaManager(
      saga,
      this.db,
      this.commandProducer,
      this.messageConsumer,
      new TestSagaLockManager(),
      this.sagaCommandProducer,
    );

    try {
      await this.sagaManager.createInstance(sagaData);
    } catch (err) {
      this.createException = err as Error;
    }

    return this;
  }

  expectCompletedSuccessfully(): void {
    this.runExpectations();
    this.assertNoCommands();

    expect(this.sagaInstance.state.endState).toBeTruthy();
    expect(this.sagaInstance.state.compensating).toBeFalsy();
  }

  expectRolledBack(): void {
    this.runExpectations();
    this.assertNoCommands();

    if (!this.sagaInstance.state.endState) {
      fail('Expected ' + this.sagaInstance.type + ' to have end state');
    }

    if (!this.sagaInstance.state.compensating) {
      fail('Expected ' + this.sagaInstance.type + ' to be compensating');
    }
  }

  expectException(expectedException: Error): this {
    expect(this.createException).toBe(expectedException);
    return this;
  }
}

export class TestMessageProducer<D>
  implements Pick<InternalMessageProducer, 'send' | 'sendBatch'>
{
  constructor(private readonly sagaTestSupport: ConvoySagaTestSupport<D>) {}

  async send<T>(destination: string, message: Message<T>): Promise<void> {
    message.setHeader(Message.ID, uuid());
    this.sagaTestSupport.sentCommands.push(
      new MessageWithDestination(destination, message),
    );
  }

  async sendBatch(
    destination: string,
    messages: readonly Message<any>[],
    isEvent: boolean | undefined,
  ): Promise<void> {
    await Promise.all(messages.map(message => this.send(destination, message)));
  }
}
