import { AppModule, createModule } from '@deepkit/app';
import { ClassType } from '@deepkit/core';
import { commandDispatcherClass, ConvoyCommandProducer } from '@convoy/command';
import { MessageModule } from '@convoy/message/deepkit';

import { DeepkitCommandsRegistry } from './deepkit-commands-registry';

export class CommandsModule extends createModule({
  providers: [DeepkitCommandsRegistry, ConvoyCommandProducer],
  listeners: [DeepkitCommandsRegistry],
  // forRoot: true,
}) {
  override root = true;
  override imports = [new MessageModule()];

  override processController(module: AppModule<any>, controller: ClassType) {
    const store = commandDispatcherClass._fetch(controller);
    if (!store) return;

    if (!module.isProvided(controller)) module.addProvider(controller);

    for (const config of store.commands.values()) {
      this.setupProvider(undefined, DeepkitCommandsRegistry).register(
        config,
        controller,
        store.channel,
        module,
      );
    }
  }
}
