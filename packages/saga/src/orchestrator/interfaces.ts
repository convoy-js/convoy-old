import type { AsyncLike, DataObject } from '@convoy/common';

import type { SagaDefinition } from './saga-definition';

export type SagaLifecycleHooks<D extends DataObject> = Partial<
  OnSagaRolledBack<D> & OnSagaCompletedSuccessfully<D> & OnSagaStarting<D>
>;

export abstract class Saga<D extends DataObject>
  implements SagaLifecycleHooks<D>
{
  abstract readonly sagaDefinition: SagaDefinition<D>;
}

export interface OnSagaCompletedSuccessfully<D extends DataObject>
  extends Saga<D> {
  onSagaCompletedSuccessfully(sagaId: string, data: D): AsyncLike<void>;
}

export interface OnSagaStarting<D extends DataObject> extends Saga<D> {
  onSagaStarting(sagaId: string, data: D): AsyncLike<void>;
}

export interface OnSagaRolledBack<D extends DataObject> extends Saga<D> {
  onSagaRolledBack(sagaId: string, data: D): AsyncLike<void>;
}
