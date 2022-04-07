import { CommandWithDestination } from '@convoy/command';
import { Builder } from '@convoy/common';

import type { SagaExecutionState } from './saga-execution-state';

export class SagaActions<D> {
  constructor(
    readonly commands: readonly CommandWithDestination<any>[],
    readonly local: boolean,
    readonly updatedSagaData?: D,
    readonly updatedState?: SagaExecutionState,
    readonly localException?: Error,
  ) {}
}

export class SagaActionsBuilder<D> implements Builder<SagaActions<D>> {
  private commands: readonly CommandWithDestination<any>[] = [];
  private local = false;
  private updatedSagaData?: D;
  private updatedState?: SagaExecutionState;
  private localException?: Error;

  withCommand<C>(command: CommandWithDestination<C>): this {
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

  withCommands<C>(commands: readonly CommandWithDestination<C>[]): this {
    this.commands = [...this.commands, ...commands];
    return this;
  }

  withIsCompensating(compensating: boolean): this {
    this.updatedState!.compensating = compensating;
    return this;
  }

  withIsLocal(localException?: Error): this {
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
