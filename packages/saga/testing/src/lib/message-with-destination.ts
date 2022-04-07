import { Message } from '@convoy/message';

export class MessageWithDestination<T> {
  constructor(readonly destination: string, readonly message: Message<T>) {}
}
