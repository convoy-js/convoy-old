import type { ClassType } from '@deepkit/core';
import type { AsyncLike, AsyncLikeFn, DataObject } from '@convoy/common';
import { Message } from '@convoy/message';

import type { StepOutcome } from './step-outcome';

export type SagaStepReplyHandler<D, R = unknown> = AsyncLikeFn<
  [data: D, reply: R],
  void
>;

export interface SagaStepReply<D, R = unknown> {
  readonly type: ClassType<R>;
  readonly handler: SagaStepReplyHandler<D, R>;
}

export interface SagaStep<D extends DataObject> {
  isSuccessfulReply(compensating: boolean, message: Message): boolean;
  getReply<T>(message: Message, compensating: boolean): SagaStepReply<D> | void;
  createStepOutcome(data: D, compensating: boolean): Promise<StepOutcome>;
  hasAction(data: D): AsyncLike<boolean>;
  hasCompensation(data: D): AsyncLike<boolean>;
}
