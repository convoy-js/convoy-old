import { entity, ValidationErrorItem } from '@deepkit/type';

import type { Message } from './message';

@entity.name('@error/message-missing-header')
export class MessageMissingHeaderException extends Error {
  constructor(header: string, message: Message<any>) {
    super(`No such header "${header}" in message - ${message.toString()}`);
  }
}

@entity.name('@error/missing-header')
export class MissingHeaderException extends Error {
  constructor(header: string) {
    super(`No such header "${header}"`);
  }
}

@entity.name('@error/missing-required-id')
export class MessageMissingRequiredIDException extends Error {
  constructor(message: Message<any>) {
    super(`Message needs an ID - ${message.toString()}`);
  }
}

@entity.name('@error/message-invalid-payload')
export class MessageInvalidPayloadException extends Error {
  constructor(
    message: Message<any>,
    readonly validationErrors: readonly ValidationErrorItem[] = [],
  ) {
    super('Invalid payload: ' + JSON.stringify(validationErrors, null, 2));
  }
}
