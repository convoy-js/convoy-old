import type { Message, MessageHeaders } from '@convoy/message';

export class CommandMessage<C> {
  constructor(
    readonly command: C,
    readonly message: Message<C>,
    readonly correlationHeaders: MessageHeaders,
  ) {}
}
