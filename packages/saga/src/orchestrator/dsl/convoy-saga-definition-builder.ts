import { Builder } from '@convoy/common';
import { SagaDefinition } from '../saga-definition';
import { SagaStep } from './saga-step';

import { ConvoySaga } from './convoy-saga';
import { ConvoySagaDefinition } from './convoy-saga-definition';

export class ConvoySagaDefinitionBuilder<D>
  implements Builder<SagaDefinition<D>>
{
  private readonly sagaSteps: SagaStep<D>[] = [];

  constructor(readonly saga: ConvoySaga<D>) {}

  addStep(step: SagaStep<D>): void {
    this.sagaSteps.push(step);
  }

  build(): SagaDefinition<D> {
    return new ConvoySagaDefinition<D>(this.sagaSteps);
  }
}
