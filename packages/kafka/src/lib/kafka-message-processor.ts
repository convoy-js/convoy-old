import type {
  EachMessagePayload,
  TopicPartitionOffsetAndMetadata,
} from 'kafkajs';

// import { Transactional } from '@convoy/database';

import { KafkaMessage } from './kafka-message';
import type { KafkaMessageHandler } from './kafka-message';
import { TopicPartitionOffsetTracker } from './topic-partition-offset-tracker';
import { TopicPartitionOffset } from './topic-partition-offset';

export class KafkaMessageProcessor {
  readonly topicPartitionOffsetTracker = new TopicPartitionOffsetTracker();

  constructor(private handlers: readonly KafkaMessageHandler<any>[] = []) {}

  addHandler<T>(handler: KafkaMessageHandler<T>): void {
    this.handlers = [...this.handlers, handler];
  }

  // @Transactional()
  async process<T>(
    message: KafkaMessage<T>,
    payload: EachMessagePayload,
  ): Promise<TopicPartitionOffset> {
    const tpo = new TopicPartitionOffset(
      payload.topic,
      payload.partition,
      BigInt(payload.message.offset),
    );

    this.topicPartitionOffsetTracker.noteUnprocessed(tpo);
    await Promise.all(this.handlers.map(handle => handle(message)));
    this.topicPartitionOffsetTracker.noteProcessed(tpo);

    return tpo;
  }

  noteOffsetsCommitted(tpo: readonly TopicPartitionOffset[]): void {
    this.topicPartitionOffsetTracker.noteCommitted(tpo);
  }

  serializeOffsetsToCommit(
    tpos: readonly TopicPartitionOffset[],
  ): readonly TopicPartitionOffsetAndMetadata[] {
    return tpos.map(({ topic, offset, partition }) => ({
      topic,
      partition,
      offset: offset.toString(),
    }));
  }

  offsetsToCommit(): readonly TopicPartitionOffset[] {
    return this.topicPartitionOffsetTracker.offsetsToCommit();
  }

  // TODO
  // getPendingOffsets(): string {
  //   const this.topicPartitionOffsetTracker.toCommit();
  //   return this.topicPartitionOffsetTracker.getPendingOffsets();
  // }
}
