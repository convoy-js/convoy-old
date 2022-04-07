import type { ReceiveType } from '@deepkit/type';
import {
  CommandHandler,
  CommandMessageHandler,
  CommandMessageHandlerOptions,
} from '@convoy/command';

import { PostLock } from './post-lock';
import { SagaCommandHandlerPreLock } from './pre-lock';

export type SagaCommandHandlerPostLock<T, C> = (
  this: T,
  postLock: PostLock<C>,
) => void;

export class SagaCommandHandler<C> extends CommandHandler<C> {
  constructor(
    channel: string,
    command: ReceiveType<C>,
    invoke: CommandMessageHandler<C>,
    readonly options: CommandMessageHandlerOptions<C> = {},
    resource?: string,
    readonly preLock?: SagaCommandHandlerPreLock<C>,
    readonly postLock?: SagaCommandHandlerPostLock<any, C>,
  ) {
    super(channel, command, invoke, options, resource);
  }
}
