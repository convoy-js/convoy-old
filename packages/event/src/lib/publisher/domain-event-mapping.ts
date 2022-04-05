import { getClassName } from '@deepkit/core';

export class DomainEventMapping {
  eventToExternalEventType<E>(aggregateType: string, event: E): string {
    return getClassName(event);
  }
}
