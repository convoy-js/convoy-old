import type { Instance } from '@convoy/common';
import type { Message } from '@convoy/message';

import { withFailure, withSuccess } from '../command-handler-reply-builder';
import { LockTarget } from './lock-target';
import { ReplyMessage } from './reply-message';
import { Failure, Success } from '../command-reply-outcome';
import { getClassTypeFromInstance } from '@deepkit/core';

export class ReplyMessageBuilder {
  constructor(private readonly lockTarget: LockTarget) {}

  withSuccess<T>(reply?: T): Message<T | Success> {
    const message = withSuccess(reply);

    return new ReplyMessage(message, this.lockTarget);
  }

  withFailure<T>(reply?: T): Message<T | Failure> {
    const message = withFailure(reply);

    return new ReplyMessage(message, this.lockTarget);
  }
}

export function withLock<T extends Instance>(
  aggregate: T,
  id?: string,
): ReplyMessageBuilder {
  const lockTarget = new LockTarget(getClassTypeFromInstance(aggregate), id);
  return new ReplyMessageBuilder(lockTarget);
}
