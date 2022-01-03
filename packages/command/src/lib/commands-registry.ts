import type { ClassType } from '@deepkit/core';

import { InternalCommandDispatcher } from '@convoy/commands/internal-command-dispatcher';
import { CommandHandlers } from '@convoy/commands/command-handlers';
import { CommandHandler } from '@convoy/commands/command-handler';
import {
  InternalMessageConsumer,
  InternalMessageProducer,
} from '@convoy/message';

import type { CommandHandlerConfig } from './decorators';

export abstract class CommandsRegistry<M = unknown> {
  readonly handlers = new CommandHandlers();

  protected constructor(
    private readonly messageConsumer: InternalMessageConsumer,
    private readonly messageProducer: InternalMessageProducer
  ) {}

  abstract getInstance<T>(controller: ClassType<T>, module?: M): T;

  async init(): Promise<void> {
    const commandDispatcher = new InternalCommandDispatcher(
      this.constructor.name,
      this.handlers,
      this.messageConsumer,
      this.messageProducer
    );

    await commandDispatcher.subscribe();
  }

  register(
    { type, methodName, options }: CommandHandlerConfig,
    controller: ClassType,
    module?: M
  ) {
    const instance = this.getInstance(controller, module);
    const handler = instance[methodName].bind(instance);
    this.handlers.add(new CommandHandler('', type, handler, options));
  }
}
