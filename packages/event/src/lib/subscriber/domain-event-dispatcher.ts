import type { Dispatcher } from '@convoy/common';
import { Message, MessageConsumer } from '@convoy/message';

import { EventMessageHeaders } from '../publisher/event-message-headers';
import { DomainEventHandlers } from './domain-event-handlers';
import { DomainEventEnvelope } from './domain-event-envelope';

export class DomainEventDispatcher implements Dispatcher {
  constructor(
    private readonly eventDispatcherId: string,
    private readonly domainEventHandlers: DomainEventHandlers,
    private readonly messageConsumer: MessageConsumer,
  ) {}

  async subscribe(): Promise<void> {
    // await Promise.all(
    //   this.domainEventHandlers.getHandlers().map(async handler => {
    //     await this.messageConsumer.subscribe(
    //       this.eventDispatcherId,
    //       [handler.aggregateType], // [`${handler.aggregateType}-${handler.event.name}`],
    //       this.handleMessage.bind(this),
    //       true,
    //     );
    //   }),
    // );

    await this.messageConsumer.subscribe(
      this.eventDispatcherId,
      this.domainEventHandlers.getAggregateTypesAndEvents(),
      this.handleMessage.bind(this),
      true,
    );
  }

  async handleMessage(message: Message): Promise<void> {
    const aggregateType = message.getRequiredHeader(
      EventMessageHeaders.AGGREGATE_TYPE,
    );

    const handler = this.domainEventHandlers.findTargetMethod(message);
    if (!handler) return;

    const event = message.decode();
    const aggregateId = message.getRequiredHeader(
      EventMessageHeaders.AGGREGATE_ID,
    );
    const messageId = message.getRequiredHeader(Message.ID);
    const dee = new DomainEventEnvelope(
      message,
      aggregateType,
      aggregateId,
      messageId,
      event,
    );

    await handler.invoke(dee);
  }
}
