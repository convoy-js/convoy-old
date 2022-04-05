import type { TopicPartitionOffsetAndMetadata } from 'kafkajs';

import { RuntimeException } from '@convoy/common';
import type { MessageSubscription } from '@convoy/message';
import { MessageConsumer } from '@convoy/message';
import { DatabaseTransactionContext } from '@convoy/database';

import { Kafka } from './kafka';
import type { KafkaMessageHandler } from './kafka-message';
import { KafkaMessageBuilder } from './kafka-message-builder';
import { KafkaMessageProcessor } from './kafka-message-processor';
import { KafkaLogger } from './logger';

export class KafkaMessageConsumer extends MessageConsumer {
  private readonly processors = new Map<string, KafkaMessageProcessor>();

  constructor(
    private readonly kafka: Kafka,
    private readonly message: KafkaMessageBuilder,
    private readonly transactionContext: DatabaseTransactionContext, // private readonly orm: MikroORM, // @Inject(NEST_CONVOY_ASYNC_LOCAL_STORAGE) // private readonly storage: AsyncLocalStorage<EntityManager>,
  ) {
    super();
  }

  private addHandlerToProcessor(
    channel: string,
    handler: KafkaMessageHandler<any>,
  ): void {
    if (!this.processors.has(channel)) {
      this.processors.set(channel, new KafkaMessageProcessor());
    }
    this.processors.get(channel)!.addHandler(handler);
  }

  private async maybeCommitOffsets(
    processor: KafkaMessageProcessor,
  ): Promise<void> {
    const tpos = processor.offsetsToCommit();
    const offsets = processor.serializeOffsetsToCommit(tpos);

    KafkaLogger.debug(`Committing offsets ${JSON.stringify(offsets)}`);
    await this.kafka.consumer.commitOffsets(
      offsets as TopicPartitionOffsetAndMetadata[],
    );
    KafkaLogger.debug(`Committed offsets`);

    processor.noteOffsetsCommitted(tpos);
  }

  async subscribe<T>(
    subscriberId: string,
    topics: string[],
    handler: KafkaMessageHandler<T>,
  ): MessageSubscription {
    await Promise.all(
      topics.map(async channel => {
        await this.kafka.consumer.subscribe({
          topic: channel,
          fromBeginning: true,
        });
        this.addHandlerToProcessor(channel, handler);
      }),
    );

    return async () => {
      // TODO: Why is there not an unsubscribe option? - https://github.com/tulios/kafkajs/issues/947
      // await this.kafka.consumer.pause(channels.map(topic => ({ topic })));
      topics.forEach(channel => {
        this.processors.delete(channel);
      });
    };
  }

  async bootstrap(): Promise<void> {
    await this.kafka.consumer.run({
      autoCommit: false,
      eachMessage: async payload => {
        const processor = this.processors.get(payload.topic);
        if (!processor) {
          throw new RuntimeException(
            `No KafkaMessageProcessor available for topic ${payload.topic}`,
          );
        }

        const message = await this.message.from(payload);
        try {
          await processor.process(message, payload);
        } catch (err) {
          KafkaLogger.error(err);
        }

        await this.maybeCommitOffsets(processor);
      },
    });

    await this.kafka.consumer.connect();
  }

  async shutdown(): Promise<void> {
    await this.kafka.consumer.disconnect();
  }
}
