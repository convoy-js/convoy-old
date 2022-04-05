import { KafkaMessageProcessor } from '../kafka-message-processor';
import { KafkaMessageBuilder } from '../kafka-message-builder';
import { KafkaMessage } from '../kafka-message';
import { Message } from '@convoy/message';
import type { EachMessagePayload } from 'kafkajs';
import { AutoIncrement, Packed, PrimaryKey } from '@deepkit/type';

describe('KafkaMessageProcessor', () => {
  it('process', async () => {
    const processor = new KafkaMessageProcessor();

    const messageBuilder = new KafkaMessageBuilder();

    class Schema {
      readonly id: string;
    }

    const message = new Message<Schema>(Schema, {
      id: '1',
    });
    /*const producerMessage = messageBuilder.to(message);

    const payload: EachMessagePayload = {
      topic: 'test',
      partition: 0,
      heartbeat: async () => {},
      message: {
        ...producerMessage,
        size: 0,
        offset: '0',
        attributes: 0,
        timestamp: '',
      } as EachMessagePayload['message'],
    };

    const consumerMessage = messageBuilder.from(Schema, payload);

    const handler = jest.fn();
    processor.addHandler(handler);

    const noteProcessedSpy = jest.spyOn(
      processor.topicPartitionOffsetTracker,
      'noteProcessed',
    );

    await processor.process(consumerMessage, payload);

    const tpos = processor.offsetsToCommit();
    const offsets = processor.serializeOffsetsToCommit(tpos);

    expect(noteProcessedSpy).toHaveBeenCalledWith();*/
  });
});
