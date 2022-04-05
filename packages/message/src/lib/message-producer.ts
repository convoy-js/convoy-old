import { uuid } from '@deepkit/type';

import { Message } from './message';

export abstract class MessageProducer {
  abstract sendBatch<T>(
    destination: string,
    messages: readonly Message<T>[],
    isEvent: boolean,
  ): Promise<void>;

  abstract send<T>(
    destination: string,
    message: Message<T>,
    isEvent: boolean,
  ): Promise<void>;

  generateMessageId(): string {
    return uuid();
  }
}
