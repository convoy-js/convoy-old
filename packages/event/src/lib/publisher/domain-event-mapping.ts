import type { DomainEvent } from '../event';

export class DomainEventMapping {
  eventToExternalEventType(aggregateType: string, event: DomainEvent): string {
    return event.constructor.name;
  }
}
