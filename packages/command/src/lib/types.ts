import type { ClassType } from '@deepkit/core';

import type { AsyncLikeFn } from '@convoy/common';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Command {}

export type CommandProvider<T, C> = AsyncLikeFn<[T], C>;
