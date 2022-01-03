import { entity, t } from '@deepkit/type';

@entity.name('saga-execution-state')
export class SagaExecutionState {
  static makeEndState(): SagaExecutionState {
    return new SagaExecutionState(-1, false, true);
  }

  constructor(
    @t readonly currentlyExecuting: number = -1,
    @t public compensating: boolean = false,
    @t public endState: boolean = false,
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
