import { eventDispatcher } from '@deepkit/event';
import {
  onServerMainBootstrap,
  onServerMainShutdown,
} from '@deepkit/framework';

import {
  Kafka,
  KafkaMessageBuilder,
  KafkaMessageProducer,
} from '@convoy/kafka';

export class DeepkitKafkaMessageProducer extends KafkaMessageProducer {
  // FIXME: Workaround for https://github.com/deepkit/deepkit-framework/issues/211
  /*constructor(kafka: Kafka, message: KafkaMessageBuilder) {
    super(kafka, message);
  }*/

  @eventDispatcher.listen(onServerMainBootstrap)
  override async bootstrap(): Promise<void> {
    await super.bootstrap();
  }

  @eventDispatcher.listen(onServerMainShutdown)
  override async shutdown(): Promise<void> {
    await super.shutdown();
  }
}
