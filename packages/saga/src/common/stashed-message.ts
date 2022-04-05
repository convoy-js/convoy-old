import { Message } from '@convoy/message';

export class StashedMessage<T> {
  constructor(
    readonly sagaType: string,
    readonly sagaId: string,
    readonly message: Message<T>,
  ) {}
}
