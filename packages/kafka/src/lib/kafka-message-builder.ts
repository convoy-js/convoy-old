import { typedArrayToBuffer } from '@deepkit/type';
import type {
  EachMessagePayload,
  IHeaders,
  Message as ProducerMessage,
} from 'kafkajs';

import { Message, MessageHeaders } from '@convoy/message';

import { KafkaMessage } from './kafka-message';
import type { ClassType } from '@deepkit/core';

export class KafkaMessageBuilder {
  async to(message: Message): Promise<ProducerMessage> {
    const value = typedArrayToBuffer(message.encode());
    const headers = message.headers.asRecord();

    return {
      key: message.id,
      value,
      headers,
    };
  }

  async from<T>({
    message,
    partition,
  }: EachMessagePayload): Promise<KafkaMessage<T>> {
    const payload = new Uint8Array(message.value as Buffer);
    const headers = MessageHeaders.fromRecord({
      ...message.headers,
      [Message.ID]: message.key,
    });

    // TODO - global store containing all events & commands schemas
    const schema = {} as unknown as ClassType<T>;

    return new KafkaMessage(
      schema,
      payload,
      headers,
      // eslint-disable-next-line prefer-rest-params
      arguments[0] as EachMessagePayload
    );
  }
}
