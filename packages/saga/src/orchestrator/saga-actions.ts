import { CommandWithDestination } from '@convoy/command';
import { RuntimeException } from '@convoy/common';
import type { Builder } from '@convoy/common';

import { SagaExecutionState } from './saga-execution-state';

export class SagaActions<D> {
  constructor(
    readonly commands: readonly CommandWithDestination[],
    readonly local: boolean,
    readonly updatedSagaData?: D,
    readonly updatedState?: SagaExecutionState,
    readonly localException?: RuntimeException,
  ) {}
}

export class SagaActionsBuilder<D> implements Builder<SagaActions<D>> {
  private commands: readonly CommandWithDestination[] = [];
  private local = false;
  private updatedSagaData?: D;
  private updatedState?: SagaExecutionState;
  private localException?: RuntimeException;

  withCommand(command: CommandWithDestination<any>): this {
    this.commands = [...this.commands, command];
    return this;
  }

  withUpdatedState(state: SagaExecutionState): this {
    this.updatedState = state;
    return this;
  }

  withUpdatedSagaData(data: D): this {
    this.updatedSagaData = data;
    return this;
  }

  withIsEndState(endState: boolean): this {
    this.updatedState!.endState = endState;
    return this;
  }

  withCommands(commands: readonly CommandWithDestination<any>[]): this {
    this.commands = [...this.commands, ...commands];
    return this;
  }

  withIsCompensating(compensating: boolean): this {
    this.updatedState!.compensating = compensating;
    return this;
  }

  withIsLocal(localException?: RuntimeException): this {
    this.localException = localException;
    this.local = true;
    return this;
  }

  build(): SagaActions<D> {
    return new SagaActions<D>(
      this.commands,
      this.local,
      this.updatedSagaData,
      this.updatedState,
      this.localException,
    );
  }
}
