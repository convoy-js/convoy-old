import { Message, MessageHeaders, MessageProducer } from '@convoy/message';
import type { ClassType } from '@deepkit/core';

import { DomainEvent } from '../event';
import { EventMessageHeaders } from './event-message-headers';

export class DomainEventPublisher {
  constructor(private readonly messageProducer: MessageProducer) {}

  private createMessageForDomainEvent(
    aggregateType: string,
    aggregateId: string | number,
    headers: MessageHeaders,
    event: DomainEvent,
  ): Message {
    return new Message(
      event.constructor as ClassType<DomainEvent>,
      event,
      headers,
    )
      .setHeader(Message.PARTITION_ID, aggregateId)
      .setHeader(EventMessageHeaders.AGGREGATE_ID, aggregateId)
      .setHeader(EventMessageHeaders.AGGREGATE_TYPE, aggregateType)
      .setHeader(EventMessageHeaders.EVENT_TYPE, event.constructor.name);
  }

  async publish(
    aggregateType: string,
    aggregateId: string | number,
    domainEvents: readonly DomainEvent[],
    headers = new MessageHeaders(),
  ): Promise<void> {
    const messages = domainEvents.map(domainEvent =>
      this.createMessageForDomainEvent(
        aggregateType,
        aggregateId,
        headers,
        domainEvent,
      ),
    );

    await this.messageProducer.sendBatch(aggregateType, messages, true);

    //   for (const event of domainEvents) {
    //     // const eventType = this.domainEventNameMapping.eventToExternalEventType(
    //     //   aggregateType?.name,
    //     //   event,
    //     // );
    //     const domainEventMessage = this.createMessageForDomainEvent(
    //       aggregateType,
    //       String(aggregateId),
    //       headers,
    //       event,
    //     );
    //
    //     await this.messageProducer.send(
    //       aggregateType.name,
    //       domainEventMessage,
    //       true,
    //     );
    //   }
  }
}
