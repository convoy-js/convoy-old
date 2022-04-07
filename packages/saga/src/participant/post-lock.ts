import { Message } from '@convoy/message';
import { CommandMessage, LockTarget } from '@convoy/command';

export type SagaCommandHandlerPostLock<T, C> = (
  this: T,
  postLock: PostLock<C>,
) => void;

export interface PostLock<C> {
  apply<R>(commandMessage: CommandMessage<C>, reply: Message<R>): LockTarget;
}
