import { AppModule } from '@deepkit/app';
import { InjectorContext } from '@deepkit/injector';
import { ClassType } from '@deepkit/core';
import { eventDispatcher } from '@deepkit/event';
import { onServerMainBootstrap } from '@deepkit/framework';

import { CommandsRegistry } from '@convoy/command';
import {
  InternalMessageConsumer,
  InternalMessageProducer,
} from '@convoy/message';

export class DeepkitCommandsRegistry extends CommandsRegistry<AppModule<any>> {
  constructor(
    private readonly injector: InjectorContext,
    messageConsumer: InternalMessageConsumer,
    messageProducer: InternalMessageProducer,
  ) {
    super(messageConsumer, messageProducer);
  }

  @eventDispatcher.listen(onServerMainBootstrap)
  async onServerMainBootstrap(): Promise<void> {
    console.log('onServerMainBootstrap');
    await this.init();
  }

  getInstance<T>(
    controller: ClassType<T>,
    module: AppModule<any> | undefined,
  ): T {
    return this.injector.get<T>(controller, module) as T;
  }
}
