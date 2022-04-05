import { Message } from '@convoy/message';

import type { LockTarget } from './lock-target';

export class ReplyMessage<T> extends Message<T> {
  constructor(message: Message<T>, readonly lockTarget?: LockTarget) {
    super(message.schema, message._somePayload, message.headers);
  }
}
