import type { Message } from '@convoy/message';
import type { DomainEvent } from '../event';

export class DomainEventEnvelope<E> {
  constructor(
    readonly message: Message<E>,
    readonly aggregateType: string,
    readonly aggregateId: string,
    readonly eventId: string,
    readonly event: E,
  ) {}
}
