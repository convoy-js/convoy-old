import { getClassName, getClassTypeFromInstance } from '@deepkit/core';

import type { InternalMessageProducer } from '@convoy/message';
import { Message, MessageHeaders } from '@convoy/message';

import { CommandMessageHeaders } from './command-message-headers';
import type { Command } from './types';

export class ConvoyCommandProducer {
  constructor(private readonly messageProducer: InternalMessageProducer) {}

  createMessage<C>(
    channel: string,
    command: C,
    replyTo: string,
    headers: MessageHeaders,
    resource?: string,
  ): Message<C> {
    const message = new Message(
      getClassTypeFromInstance(command),
      command,
      headers,
    )
      .setHeader(CommandMessageHeaders.DESTINATION, channel)
      .setHeader(CommandMessageHeaders.COMMAND_TYPE, getClassName(command))
      .setHeader(CommandMessageHeaders.REPLY_TO, replyTo);

    if (resource) {
      message.setHeader(CommandMessageHeaders.RESOURCE, resource);
    }

    return message;
  }

  async sendBatch<C extends Command>(
    channel: string,
    commands: C[],
    replyTo: string,
    headers = new MessageHeaders(),
    resource?: string,
  ): Promise<readonly Message<C>[]> {
    const messages = commands.map(cmd =>
      this.createMessage(channel, cmd, replyTo, headers, resource),
    );
    const destination = channel; /*`${channel}-${message.getRequiredHeader(
      CommandMessageHeaders.COMMAND_TYPE,
    )}`*/
    await this.messageProducer.sendBatch(destination, messages);
    return messages;
  }

  async send<C extends Command>(
    channel: string,
    command: C,
    replyTo: string,
    headers = new MessageHeaders(),
    resource?: string,
  ): Promise<Message<C>> {
    const [message] = await this.sendBatch(
      channel,
      [command],
      replyTo,
      headers,
      resource,
    );
    return message;
  }
}
