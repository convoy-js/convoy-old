import type { Consumer } from '@convoy/common';

import type { SagaDefinition } from '../saga-definition';
import { BaseStepBuilder, StepBuilder } from './step-builder';
import { ConvoySagaDefinitionBuilder } from './convoy-saga-definition-builder';
import { LocalStep } from './local-step';

export class LocalStepBuilder<D> implements BaseStepBuilder<D> {
  private compensation?: Consumer<D>;

  constructor(
    private readonly parent: ConvoySagaDefinitionBuilder<D>,
    private readonly handler: Consumer<D>,
  ) {}

  private addStep() {
    this.parent.addStep(
      new LocalStep<D>(this.handler.bind(this.parent.saga), this.compensation),
    );
  }

  /**
   * Compensates for action failures in a reversed order
   */
  withCompensation(localCompensation: Consumer<D>): this {
    this.compensation = localCompensation.bind(this.parent.saga);
    return this;
  }

  /**
   * Step
   */
  step(): StepBuilder<D> {
    this.addStep();
    return new StepBuilder<D>(this.parent);
  }

  build(): SagaDefinition<D> {
    this.addStep();
    // TODO - pull up with template method for completing current step
    return this.parent.build();
  }
}
