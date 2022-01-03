import { MessageHeaders } from '@convoy/message';

export const COMMAND_WITH_DESTINATION = Symbol('__commandWithDestination__');

export class CommandWithDestination<C = any> {
  constructor(
    readonly channel: string,
    readonly command: C,
    readonly resource?: string,
    readonly extraHeaders = new MessageHeaders(),
  ) {}
}
