import { InternalMessageProducer } from '../../../message/src/lib/internal-message-producer';
import {
  InternalMessageConsumer,
  Message,
  MessageHeaders,
} from '@convoy/message';
import { Dispatcher } from '@convoy/common';
import { correlateMessageHeaders } from './correlate-message-headers';
import type { ClassType } from '@deepkit/core';
import { CommandHandlers } from './command-handlers';
import { withFailure, withSuccess } from './command-handler-reply-builder';
import { CommandHandler } from './command-handler';
import { CommandMessage } from './command-message';
import { withLock } from './reply-lock';
import { Failure, Success } from './command-reply-outcome';
import { MissingCommandHandlerException } from './exceptions';
import { CommandMessageHeaders } from '@convoy/command';
import { CommandsLogger } from './logger';
import { getClassName } from '@deepkit/core';

export class InternalCommandDispatcher implements Dispatcher {
  constructor(
    protected readonly commandDispatcherId: string,
    protected readonly commandHandlers: CommandHandlers,
    protected readonly messageConsumer: InternalMessageConsumer,
    protected readonly messageProducer: InternalMessageProducer,
  ) {}

  private async handleException(
    message: Message<any>,
    replyChannel: string,
    error: unknown,
  ): Promise<void> {
    const reply = withFailure(error);
    const correlationHeaders = correlateMessageHeaders(message);
    await this.sendReplies(correlationHeaders, [reply], replyChannel);
  }

  private async sendReplies(
    correlationHeaders: MessageHeaders,
    replies: readonly Message<any>[],
    replyChannel: string,
  ): Promise<void> {
    const messages = replies.map(
      reply => reply.withExtraHeaders(correlationHeaders),
      //new Message(reply, reply.constructor as ClassType, correlationHeaders),
    );

    await this.messageProducer.sendBatch(replyChannel, messages);
  }

  protected async invoke<C>(
    handler: CommandHandler<C>,
    message: CommandMessage<C>,
  ): Promise<readonly Message<C | Failure | Success>[]> {
    try {
      const result = await handler.invoke(message);
      const replies = Array.isArray(result) ? result : [result];
      return replies.map(reply =>
        reply instanceof Message
          ? reply
          : handler.options.withLock
          ? withLock(message.command).withSuccess(reply)
          : withSuccess(reply),
      );
    } catch (err) {
      const errors = err instanceof AggregateError ? err.errors : [err];
      return errors.map(reply =>
        handler.options.withLock
          ? withLock(message.command).withFailure(reply)
          : withFailure(reply),
      );
    }
  }

  async subscribe(): Promise<void> {
    await this.messageConsumer.subscribe(
      this.commandDispatcherId,
      this.commandHandlers.getChannels(),
      this.handleMessage.bind(this),
    );
  }

  async handleMessage<T>(message: Message<T>): Promise<void> {
    const commandHandler = this.commandHandlers.findTargetMethod(message);
    if (!commandHandler) {
      throw new MissingCommandHandlerException(message);
    }

    const correlationHeaders = correlateMessageHeaders(message);
    const replyChannel = message.getRequiredHeader(
      CommandMessageHeaders.REPLY_TO,
    );

    let replies: readonly Message<any>[];
    try {
      const command = message.decode();

      const commandMessage = new CommandMessage(
        command,
        message,
        correlationHeaders,
      );
      replies = await this.invoke(commandHandler, commandMessage);
      console.log(replies);
      CommandsLogger.debug(
        `Generated replies ${commandHandler.command.name} ${getClassName(
          message,
        )} ${replies.map(reply => reply.toString())}`,
      );
    } catch (err) {
      // TODO: This should never be executed (unless payload cannot be parsed), as "invoke" handles errors as well
      CommandsLogger.error(
        `Generated error ${this.commandDispatcherId} ${err}`,
      );
      await this.handleException(message, replyChannel, err);
      return;
    }

    if (Array.isArray(replies)) {
      await this.sendReplies(correlationHeaders, replies, replyChannel);
    } else {
      CommandsLogger.debug('Null replies - not publishing');
    }
  }
}
