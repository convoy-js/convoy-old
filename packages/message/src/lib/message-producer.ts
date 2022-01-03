import { uuid } from '@deepkit/type';

import { Message } from './message';

export abstract class MessageProducer {
  abstract sendBatch(
    destination: string,
    messages: readonly Message[],
    isEvent: boolean,
  ): Promise<void>;

  abstract send(
    destination: string,
    message: Message,
    isEvent: boolean,
  ): Promise<void>;

  generateMessageId(): string {
    return uuid();
  }
}
