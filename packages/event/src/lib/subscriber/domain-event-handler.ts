import type { ClassType } from '@deepkit/core';
import type { AsyncLikeFn, Handler } from '@convoy/common';
import { Message } from '@convoy/message';

import { DomainEventEnvelope } from './domain-event-envelope';
import { EventMessageHeaders } from '../publisher/event-message-headers';
import type { DomainEvent } from '../event';

export type DomainEventMessageHandler<E extends DomainEvent> = AsyncLikeFn<
  [dee: DomainEventEnvelope<E>],
  void
>;

export class DomainEventHandler<E = any>
  implements Handler<DomainEventMessageHandler<E>>
{
  constructor(
    readonly event: ClassType<DomainEvent>,
    readonly invoke: DomainEventMessageHandler<E>,
    readonly aggregateType: string,
  ) {}

  handles(message: Message): boolean {
    return (
      this.aggregateType ===
        message.getHeader(EventMessageHeaders.AGGREGATE_TYPE) &&
      this.event.name ===
        message.getRequiredHeader(EventMessageHeaders.EVENT_TYPE)
    );
  }
}
