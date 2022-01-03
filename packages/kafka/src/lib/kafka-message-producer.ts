import { Message, MessageProducer } from '@convoy/message';

import { Kafka } from './kafka';
import { KafkaMessageBuilder } from './kafka-message-builder';

export class KafkaMessageProducer extends MessageProducer {
  constructor(
    private readonly kafka: Kafka,
    private readonly message: KafkaMessageBuilder
  ) {
    super();
  }

  async sendBatch(
    destination: string,
    messages: readonly Message[],
    isEvent: boolean
  ): Promise<void> {
    await this.kafka.producer.send({
      topic: destination,
      messages: await Promise.all(
        messages.map((message) => this.message.to(message))
      ),
    });
  }

  async send(
    destination: string,
    message: Message,
    isEvent: boolean
  ): Promise<void> {
    await this.sendBatch(destination, [message], isEvent);
  }

  async bootstrap(): Promise<void> {
    await this.kafka.producer.connect();
  }

  async shutdown(): Promise<void> {
    await this.kafka.producer.disconnect();
  }
}
