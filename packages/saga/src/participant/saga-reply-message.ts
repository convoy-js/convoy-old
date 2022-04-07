import type { ReceiveType } from '@deepkit/type';
import { Message, MessageHeaders } from '@convoy/message';
import { LockTarget } from '@convoy/command';

export class SagaReplyMessage<T> extends Message<T> {
  constructor(
    type: ReceiveType<T>,
    payload: T,
    headers: MessageHeaders,
    readonly lockTarget?: LockTarget,
  ) {
    super(type, payload, headers);
  }
}
