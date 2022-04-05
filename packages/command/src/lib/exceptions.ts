import type { Message } from '@convoy/message';

export class MissingCommandHandlerException extends Error {
  constructor(message: Message<any>) {
    super(`No command handler found for message ${message.id}`);
  }
}
