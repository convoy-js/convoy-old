import type { AsyncLike } from '@convoy/common';

import type { SagaDefinition } from './saga-definition';
import { TypeClass } from '@deepkit/type';

export type SagaLifecycleHooks<Data> = Partial<
  OnSagaRolledBack<Data> & OnSagaCompletedSuccessfully<Data> & OnStarting<Data>
>;

export abstract class Saga<Data> implements SagaLifecycleHooks<Data> {
  constructor(readonly sagaDataType: TypeClass) {}

  abstract readonly sagaDefinition: SagaDefinition<Data>;
}

export interface OnSagaCompletedSuccessfully<Data> extends Saga<Data> {
  onSagaCompletedSuccessfully(sagaId: string, data: Data): AsyncLike<void>;
}

export interface OnStarting<Data> extends Saga<Data> {
  onStarting(sagaId: string, data: Data): AsyncLike<void>;
}

export interface OnSagaRolledBack<Data> extends Saga<Data> {
  onSagaRolledBack(sagaId: string, data: Data): AsyncLike<void>;
}
