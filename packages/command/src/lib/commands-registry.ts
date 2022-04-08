import type { ClassType } from '@deepkit/core';

import {
  InternalMessageConsumer,
  InternalMessageProducer,
} from '@convoy/message';

import type { CommandHandlerConfig } from './decorators/command-dispatcher';
import { CommandHandlers } from './command-handlers';
import { InternalCommandDispatcher } from './internal-command-dispatcher';
import { CommandHandler } from './command-handler';

export abstract class CommandsRegistry<M = unknown> {
  readonly handlers = new CommandHandlers();

  protected constructor(
    private readonly messageConsumer: InternalMessageConsumer,
    private readonly messageProducer: InternalMessageProducer,
  ) {}

  abstract getInstance<T>(controller: ClassType<T>, module?: M): T;

  async init(): Promise<void> {
    const commandDispatcher = new InternalCommandDispatcher(
      this.constructor.name,
      this.handlers,
      this.messageConsumer,
      this.messageProducer,
    );

    console.log('init');

    await commandDispatcher.subscribe();
  }

  register<T>(
    { type, methodName, options }: CommandHandlerConfig<T>,
    controller: ClassType,
    channel: string,
    module?: M,
  ) {
    const instance = this.getInstance(controller, module);
    const handler = instance[methodName].bind(instance);
    this.handlers.add(new CommandHandler(channel, type, handler, options));
  }
}
