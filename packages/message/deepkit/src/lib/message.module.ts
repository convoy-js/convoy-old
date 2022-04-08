import { createModule } from '@deepkit/app';
import { ClassType } from '@deepkit/core';
import {
  InternalMessageConsumer,
  InternalMessageProducer,
  MessageConsumer,
  MessageProducer,
} from '@convoy/message';
import { resolveReceiveType } from '@deepkit/type';

/*export class MessageModuleConfig {
  producer?: ClassType<MessageProducer>;
  consumer?: ClassType<MessageConsumer>;
}*/

export class MessageModule extends createModule({
  providers: [InternalMessageProducer, InternalMessageConsumer],
  exports: [InternalMessageProducer, InternalMessageConsumer],
  // config: MessageModuleConfig,
  // forRoot: true,
}) {
  override root = true;
  /*override process() {
    console.log('process');
    const { consumer, producer } = this.config;
    if (consumer) {
      this.addProvider({
        provide: MessageConsumer,
        useExisting: consumer,
      });
      this.addExport(MessageConsumer);
    }
    if (producer) {
      this.addProvider({
        provide: MessageProducer,
        useExisting: producer,
      });
      this.addExport(MessageProducer);
    }
  }*/
}
