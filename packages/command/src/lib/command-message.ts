import type { Message, MessageHeaders } from '@convoy/message';

import type { Command } from './types';

export class CommandMessage<C extends Command = any> {
  constructor(
    readonly command: C,
    readonly message: Message<C>,
    readonly correlationHeaders: MessageHeaders,
  ) {}
}
