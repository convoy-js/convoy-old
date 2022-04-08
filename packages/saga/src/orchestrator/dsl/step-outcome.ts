import { CommandWithDestination } from '@convoy/command';

import type { SagaActionsBuilder } from '../saga-actions';

export interface StepOutcome {
  visit<D>(
    localConsumer: (localException?: Error) => SagaActionsBuilder<D>,
    commandsConsumer: (
      commands: readonly CommandWithDestination<any>[],
    ) => SagaActionsBuilder<D>,
  ): unknown;
}

export class LocalStepOutcome implements StepOutcome {
  constructor(private readonly localOutcome?: Error) {}

  visit<D>(
    localConsumer: (localException?: Error) => SagaActionsBuilder<D>,
    commandsConsumer: (
      commands: readonly CommandWithDestination<any>[],
    ) => SagaActionsBuilder<D>,
  ): void {
    localConsumer(this.localOutcome);
  }
}

export class RemoteStepOutcome implements StepOutcome {
  constructor(
    private readonly commandsToSend: readonly CommandWithDestination<any>[],
  ) {}

  visit<D>(
    localConsumer: (localException?: Error) => SagaActionsBuilder<D>,
    commandsConsumer: (
      commands: readonly CommandWithDestination<any>[],
    ) => SagaActionsBuilder<D>,
  ): void {
    commandsConsumer(this.commandsToSend);
  }
}
