import type { AsyncLike, AsyncLikeFn } from '@convoy/common';
import type { ReceiveType } from '@deepkit/type';
import { Message } from '@convoy/message';

import type { StepOutcome } from './step-outcome';

export type SagaStepReplyHandler<D, R = unknown> = AsyncLikeFn<
  [data: D, reply: R],
  void
>;

export interface SagaStepReply<D, R = unknown> {
  readonly type: ReceiveType<R>;
  readonly handler: SagaStepReplyHandler<D, R>;
}

export interface SagaStep<D> {
  isSuccessfulReply<T>(compensating: boolean, message: Message<T>): boolean;
  getReply<T>(
    message: Message<T>,
    compensating: boolean,
  ): SagaStepReply<D> | void;
  createStepOutcome(data: D, compensating: boolean): Promise<StepOutcome>;
  hasAction(data: D): AsyncLike<boolean>;
  hasCompensation(data: D): AsyncLike<boolean>;
}
