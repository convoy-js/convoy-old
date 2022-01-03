import type { RuntimeException, DataObject } from '@convoy/common';
import { CommandWithDestination } from '@convoy/command';

import type { SagaActionsBuilder } from '../saga-actions';
export interface StepOutcome {
  visit<D extends DataObject>(
    localConsumer: (localException?: RuntimeException) => SagaActionsBuilder<D>,
    commandsConsumer: (
      commands: readonly CommandWithDestination[],
    ) => SagaActionsBuilder<D>,
  ): unknown;
}

export class LocalStepOutcome implements StepOutcome {
  constructor(private readonly localOutcome?: RuntimeException) {}

  visit<D extends DataObject>(
    localConsumer: (localException?: RuntimeException) => SagaActionsBuilder<D>,
    commandsConsumer: (
      commands: readonly CommandWithDestination[],
    ) => SagaActionsBuilder<D>,
  ): void {
    localConsumer(this.localOutcome);
  }
}

export class RemoteStepOutcome implements StepOutcome {
  constructor(
    private readonly commandsToSend: readonly CommandWithDestination[],
  ) {}

  visit<D extends DataObject>(
    localConsumer: (localException?: RuntimeException) => SagaActionsBuilder<D>,
    commandsConsumer: (
      commands: readonly CommandWithDestination[],
    ) => SagaActionsBuilder<D>,
  ): void {
    commandsConsumer(this.commandsToSend);
  }
}
