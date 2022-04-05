import type { ClassType } from '@deepkit/core';

import type { AsyncLikeFn, Handler, Instance } from '@convoy/common';
import type { Message } from '@convoy/message';

import type { CommandMessage } from './command-message';
import { CommandMessageHeaders } from './command-message-headers';
import type { CommandHandlerPreLock } from './reply-lock';
import type { Command } from './types';

export type CommandMessageHandler<
  C extends Command,
  R = Instance | Message<C> | undefined,
> = AsyncLikeFn<[cm: CommandMessage<C>, pvs?: Map<string, string>], R | R[]>;

export interface CommandMessageHandlerOptions<T = any> {
  readonly withLock?: boolean;
  readonly preLock?: CommandHandlerPreLock<T>;
}

export class CommandHandler<C = any>
  implements Handler<CommandMessageHandler<C>>
{
  constructor(
    readonly channel: string,
    readonly command: ClassType<C>,
    readonly invoke: CommandMessageHandler<C>,
    readonly options: CommandMessageHandlerOptions = {},
    readonly resource?: string,
  ) {}

  /*private resourceMatches(message: Message): boolean {
    return (
      !this.resource ||
      resourceMatches(
        message.getHeader(CommandMessageHeaders.RESOURCE),
        this.resource,
      )
    );
  }*/

  private commandTypeMatches(message: Message<C>): boolean {
    return (
      this.command.name ===
      message.getRequiredHeader(CommandMessageHeaders.COMMAND_TYPE)
    );
  }

  handles(message: Message<C>): boolean {
    return this.commandTypeMatches(message); // && this.resourceMatches(message);
  }
}
