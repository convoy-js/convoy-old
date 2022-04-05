import type { ClassType } from '@deepkit/core';
import type { AsyncLikeFn, Handler } from '@convoy/common';
import type { Message } from '@convoy/message';
import type { ReceiveType } from '@deepkit/type';
import { getClassName } from '@deepkit/core';

import { DomainEventEnvelope } from './domain-event-envelope';
import { EventMessageHeaders } from '../publisher/event-message-headers';

export type DomainEventMessageHandler<E> = AsyncLikeFn<
  [dee: DomainEventEnvelope<E>],
  void
>;

export class DomainEventHandler<E>
  implements Handler<DomainEventMessageHandler<E>>
{
  constructor(
    readonly event: ReceiveType<E>,
    readonly invoke: DomainEventMessageHandler<E>,
    readonly aggregateType: string,
  ) {}

  handles(message: Message<E>): boolean {
    return (
      this.aggregateType ===
        message.getHeader(EventMessageHeaders.AGGREGATE_TYPE) &&
      getClassName(this.event) ===
        message.getRequiredHeader(EventMessageHeaders.EVENT_TYPE)
    );
  }
}
