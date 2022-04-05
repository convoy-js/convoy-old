import type { AsyncLikeFn } from '@convoy/common';

import type { CommandMessage } from '../command-message';
import type { LockTarget } from './lock-target';

export type CommandHandlerPreLock<T = any> = AsyncLikeFn<
  [commandMessage: CommandMessage<T>],
  LockTarget
>;
