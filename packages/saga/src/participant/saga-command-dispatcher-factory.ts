import { CommandHandlers } from '@convoy/command';
import type { DispatcherFactory } from '@convoy/common';
import {
  InternalMessageConsumer,
  InternalMessageProducer,
} from '@convoy/message';

import { SagaCommandDispatcher } from './saga-command-dispatcher';
import { SagaLockManager } from '../common';

export class SagaCommandDispatcherFactory
  implements DispatcherFactory<SagaCommandDispatcher, CommandHandlers>
{
  constructor(
    private readonly messageConsumer: InternalMessageConsumer,
    private readonly messageProducer: InternalMessageProducer,
    private readonly sagaLockManager: SagaLockManager,
  ) {}

  create(
    commandDispatcherId: string,
    commandHandlers: CommandHandlers,
  ): SagaCommandDispatcher {
    return new SagaCommandDispatcher(
      commandDispatcherId,
      commandHandlers,
      this.messageConsumer,
      this.messageProducer,
      this.sagaLockManager,
    );
  }
}
