import type { ValidationFailedItem } from '@deepkit/type/dist/cjs/src/jit-validation';
import { entity } from '@deepkit/type';

import type { Message } from './message';

@entity.name('@error/message-missing-header')
export class MessageMissingHeaderException extends Error {
  constructor(header: string, message: Message) {
    super(`No such header "${header}" in message - ${message.toString()}`);
  }
}

@entity.name('@error/missing-required-id')
export class MessageMissingRequiredIDException extends Error {
  constructor(message: Message) {
    super(`Message needs an ID - ${message.toString()}`);
  }
}

@entity.name('@error/message-invalid-payload')
export class MessageInvalidPayloadException extends Error {
  constructor(
    message: Message,
    readonly validationErrors: readonly ValidationFailedItem[] = [],
  ) {
    super('Invalid payload: ' + JSON.stringify(validationErrors, null, 2));
  }
}
