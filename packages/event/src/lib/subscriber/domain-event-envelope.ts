import type { Message } from '@convoy/message';
import type { DomainEvent } from '../event';

export class DomainEventEnvelope<E extends DomainEvent = DomainEvent> {
  constructor(
    readonly message: Message,
    readonly aggregateType: string,
    readonly aggregateId: string,
    readonly eventId: string,
    readonly event: E,
  ) {}
}
