import type { Message } from '@convoy/message';
import type { DataObject } from '@convoy/common';

import type { SagaActions } from './saga-actions';
import type { SagaExecutionState } from './saga-execution-state';

export interface SagaDefinition<D> {
  start(sagaData: D): Promise<SagaActions<D>>;
  handleReply<T>(
    currentState: SagaExecutionState,
    sagaData: D,
    message: Message<T>,
  ): Promise<SagaActions<D>>;
}
