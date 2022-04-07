import { getClassName, getClassTypeFromInstance } from '@deepkit/core';

import { Message } from '@convoy/message';

import { CommandReplyOutcome, Failure, Success } from './command-reply-outcome';
import { ReplyMessageHeaders } from './reply-message-headers';

export function withReply<R>(
  reply: R,
  outcome: CommandReplyOutcome,
): Message<R> {
  return new Message<R>(getClassTypeFromInstance(reply), reply)
    .setHeader(ReplyMessageHeaders.REPLY_OUTCOME, outcome)
    .setHeader(ReplyMessageHeaders.REPLY_TYPE, getClassName(reply));
}

export function withSuccess<R>(reply?: R): Message<R | Success> {
  return withReply(reply ?? new Success(), CommandReplyOutcome.SUCCESS);
}

export function withFailure<R>(reply?: R): Message<R | Failure> {
  return withReply(reply ?? new Failure(), CommandReplyOutcome.FAILURE);
}
