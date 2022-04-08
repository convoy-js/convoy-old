import { App } from '@deepkit/app';
import { FrameworkModule } from '@deepkit/framework';

import { KafkaMessageModule } from '@convoy/kafka/deepkit';
import { CommandsModule } from '@convoy/command/deepkit';

import { Controller } from './app/controller';

new App({
  imports: [
    new KafkaMessageModule({
      brokers: ['localhost:9092'],
    }),
    new CommandsModule(),
    new FrameworkModule(),
  ],
  controllers: [Controller],
}).run();
