import { entity, t } from '@deepkit/type';

@entity.name('saga-execution-state')
export class SagaExecutionState {
  static makeEndState(): SagaExecutionState {
    return new SagaExecutionState(-1, false, true);
  }

  constructor(
    readonly currentlyExecuting: number = -1,
    public compensating: boolean = false,
    public endState: boolean = false,
  ) {}

  startCompensating(): SagaExecutionState {
    return new SagaExecutionState(this.currentlyExecuting, true);
  }

  nextState(size: number): SagaExecutionState {
    return new SagaExecutionState(
      this.compensating
        ? this.currentlyExecuting - size
        : this.currentlyExecuting + size,
      this.compensating,
    );
  }
}
