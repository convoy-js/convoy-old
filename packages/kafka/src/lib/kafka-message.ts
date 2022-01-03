import type { EachMessagePayload } from 'kafkajs';
import type { ClassType } from '@deepkit/core';

import { Message, MessageHeaders } from '@convoy/message';
import type { Consumer, RecordLiteral } from '@convoy/common';

export type KafkaMessageHandler = Consumer<KafkaMessage, void>;

export class KafkaMessage<T = RecordLiteral> extends Message<T> {
  static readonly PARTITION = 'kafka_partition';
  static readonly OFFSET = 'kafka_offset';
  static readonly TOPIC = 'kafka_topic';

  /*static from(
    message: Message,
    kafkaPayload: EachMessagePayload
  ): KafkaMessage {
    return new KafkaMessage(
      message.getPayload(),
      message.getHeaders(),
      kafkaPayload
    );
  }*/

  get topic(): string {
    return this.getRequiredHeader(KafkaMessage.TOPIC);
  }

  get partition(): number {
    return +this.getRequiredHeader(KafkaMessage.PARTITION);
  }

  get offset(): bigint {
    return BigInt(this.getRequiredHeader(KafkaMessage.OFFSET));
  }

  public constructor(
    schema: ClassType<T>,
    payload: T | Uint8Array,
    headers: MessageHeaders,
    { topic, partition, message: { offset } }: EachMessagePayload
  ) {
    super(schema, payload, headers);

    this.setHeader(KafkaMessage.TOPIC, topic);
    this.setHeader(KafkaMessage.PARTITION, partition);
    this.setHeader(KafkaMessage.OFFSET, offset);
  }
}
