import { MessageHeaders } from '@convoy/message';

export const COMMAND_WITH_DESTINATION = Symbol('COMMAND_DESTINATION');

export class CommandWithDestination<C> {
  constructor(
    readonly channel: string,
    readonly command: C,
    readonly resource?: string,
    readonly extraHeaders = new MessageHeaders(),
  ) {}
}
