import { createModule } from '@deepkit/app';
import {
  BrokersFunction,
  ISocketFactory,
  KafkaConfig,
  RetryOptions,
  SASLOptions,
} from 'kafkajs';

import { MessageModule } from '@convoy/message/deepkit';
import { MessageConsumer, MessageProducer } from '@convoy/message';
import { Kafka, KafkaMessageBuilder } from '@convoy/kafka';

import { DeepkitKafkaMessageConsumer } from './deepkit-kafka-message-consumer';
import { DeepkitKafkaMessageProducer } from './deepkit-kafka-message-producer';

export class KafkaMessageModuleConfig {
  brokers!: string[] | BrokersFunction;
  // ssl?: tls.ConnectionOptions | boolean;
  sasl?: SASLOptions;
  clientId?: string;
  connectionTimeout?: number;
  authenticationTimeout?: number;
  reauthenticationThreshold?: number;
  requestTimeout?: number;
  enforceRequestTimeout?: boolean;
  retry?: RetryOptions;
  socketFactory?: ISocketFactory;
}

export class KafkaMessageModule extends createModule({
  providers: [
    KafkaMessageBuilder,
    DeepkitKafkaMessageConsumer,
    DeepkitKafkaMessageProducer,
  ],
  config: KafkaMessageModuleConfig,
  // forRoot: true,
  exports: [
    DeepkitKafkaMessageConsumer,
    DeepkitKafkaMessageProducer,
    MessageModule,
  ],
  listeners: [DeepkitKafkaMessageConsumer, DeepkitKafkaMessageProducer],
}) {
  override root = true;
  override imports = [new MessageModule()];

  override process() {
    this.addProvider({
      provide: Kafka,
      useValue: new Kafka(this.config),
    });
    this.addExport(Kafka);

    const messageModule = this.getImportedModuleByClass(MessageModule);

    messageModule.addProvider({
      provide: MessageConsumer,
      useExisting: DeepkitKafkaMessageConsumer,
    });
    messageModule.addExport(MessageConsumer);

    messageModule.addProvider({
      provide: MessageProducer,
      useExisting: DeepkitKafkaMessageProducer,
    });
    messageModule.addExport(MessageProducer);
  }
}
