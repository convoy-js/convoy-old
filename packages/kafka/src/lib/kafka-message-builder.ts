import { ReceiveType, typedArrayToBuffer } from '@deepkit/type';
import type { EachMessagePayload, Message as ProducerMessage } from 'kafkajs';

import { ReceiveTypesStore } from '@convoy/common';
import { Message, MessageHeaders } from '@convoy/message';

import { KafkaMessage } from './kafka-message';

export class KafkaMessageBuilder {
  to<T>(message: Message<T>): ProducerMessage {
    const value = typedArrayToBuffer(message.encode());
    const headers = message.headers.asRecord();

    return {
      key: message.id,
      value,
      headers,
    };
  }

  from<T>({ message, partition }: EachMessagePayload): KafkaMessage<T> {
    const payload = new Uint8Array(message.value);
    const headers = MessageHeaders.fromRecord({
      ...message.headers,
      [Message.ID]: message.key,
    });

    const receiveTypeName = headers.getRequired(Message.TYPE) as string;
    const receiveType = ReceiveTypesStore.get(
      receiveTypeName,
    ) as ReceiveType<T>;

    return new KafkaMessage<T>(
      receiveType,
      payload,
      headers,
      // eslint-disable-next-line prefer-rest-params
      arguments[0] as EachMessagePayload,
    );
  }
}
