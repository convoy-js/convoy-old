import type { ReceiveType } from '@deepkit/type';
import { Builder } from '@convoy/common';
import { CommandEndpoint } from './command-endpoint';

export class CommandEndpointBuilder<C> implements Builder<CommandEndpoint<C>> {
  static forCommand<C>(command: ReceiveType<C>): CommandEndpointBuilder<C> {
    return new CommandEndpointBuilder(command);
  }

  private readonly replies: ReceiveType<any>[] = [];
  private channel: string;

  constructor(private readonly command: ReceiveType<C>) {}

  withChannel(channel: string): this {
    this.channel = channel;
    return this;
  }

  withReply<R>(reply: ReceiveType<R>): this {
    this.replies.push(reply);
    return this;
  }

  build(): CommandEndpoint<C> {
    return new CommandEndpoint<C>(this.channel, this.command, this.replies);
  }
}
