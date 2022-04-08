import {
  InternalMessageProducer,
  Message,
  MessageHeaders,
} from '@convoy/message';

import { EventMessageHeaders } from './event-message-headers';
import { getClassName, getClassTypeFromInstance } from '@deepkit/core';

export class DomainEventPublisher {
  constructor(private readonly messageProducer: InternalMessageProducer) {}

  private createMessageForDomainEvent<E>(
    aggregateType: string,
    aggregateId: string | number,
    headers: MessageHeaders,
    event: E,
  ): Message<E> {
    return new Message(getClassTypeFromInstance(event), event, headers)
      .setHeader(Message.PARTITION_ID, aggregateId)
      .setHeader(EventMessageHeaders.AGGREGATE_ID, aggregateId)
      .setHeader(EventMessageHeaders.AGGREGATE_TYPE, aggregateType)
      .setHeader(EventMessageHeaders.EVENT_TYPE, getClassName(event));
  }

  async publish<E extends readonly any[]>(
    aggregateType: string,
    aggregateId: string | number,
    domainEvents: E,
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
    //     await this.producer.send(
    //       aggregateType.name,
    //       domainEventMessage,
    //       true,
    //     );
    //   }
  }
}
