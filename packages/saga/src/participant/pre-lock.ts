import { AsyncLikeFn } from '@convoy/common';
import { CommandMessage, LockTarget } from '@convoy/command';

export type SagaCommandHandlerPreLock<C> = AsyncLikeFn<
  [commandMessage: CommandMessage<C>],
  LockTarget
>;
