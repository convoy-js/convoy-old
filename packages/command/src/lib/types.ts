import type { ClassType } from '@deepkit/core';

import type { AsyncLikeFn } from '@convoy/common';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Command {}

export type CommandType<> = ClassType<Command>;

export type CommandProvider<T, C extends Command> = AsyncLikeFn<[T], C>;
