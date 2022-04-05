import { Handlers } from '@convoy/common';

import type { CommandHandler } from './command-handler';

export class CommandHandlers extends Handlers<CommandHandler> {
  getChannels(): readonly string[] {
    return this.handlers.map(handler => handler.channel);
  }
}
