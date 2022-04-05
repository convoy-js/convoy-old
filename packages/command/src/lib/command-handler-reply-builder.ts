import type { ClassType } from '@deepkit/core';
import { getClassName, getClassTypeFromInstance } from '@deepkit/core';

import type { Reply } from '@convoy/common';
import { Message } from '@convoy/message';

import { CommandReplyOutcome, Failure, Success } from './command-reply-outcome';
import { ReplyMessageHeaders } from './reply-message-headers';

export function withReply<T extends Reply>(
  reply: T,
  outcome: CommandReplyOutcome,
): Message<T> {
  return new Message<T>(getClassTypeFromInstance(reply), reply)
    .setHeader(ReplyMessageHeaders.REPLY_OUTCOME, outcome)
    .setHeader(ReplyMessageHeaders.REPLY_TYPE, getClassName(reply));
}

export function withSuccess<T>(reply?: T): Message<T | Success> {
  return withReply(reply ?? new Success(), CommandReplyOutcome.SUCCESS);
}

export function withFailure<T>(reply?: T): Message<T | Failure> {
  return withReply(reply ?? new Failure(), CommandReplyOutcome.FAILURE);
}
