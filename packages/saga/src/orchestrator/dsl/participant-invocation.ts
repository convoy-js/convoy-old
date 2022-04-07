import {
  CommandProvider,
  CommandReplyOutcome,
  CommandWithDestination,
  ReplyMessageHeaders,
} from '@convoy/command';
import { Predicate } from '@convoy/common';
import { Message } from '@convoy/message';

import type { CommandEndpoint } from './command-endpoint';

export abstract class BaseParticipantInvocation<D, C> {
  readonly isInvocable?: Predicate<D>;
  abstract createCommandToSend(data: D): Promise<CommandWithDestination<C>>;
  isSuccessfulReply<T>(message: Message<T>): boolean {
    return (
      CommandReplyOutcome.SUCCESS ===
      message.getRequiredHeader(ReplyMessageHeaders.REPLY_OUTCOME)
    );
  }
}

export class ParticipantInvocation<D, C> extends BaseParticipantInvocation<
  D,
  C
> {
  constructor(
    private readonly commandBuilder: CommandProvider<
      D,
      CommandWithDestination<C>
    >,
    readonly isInvocable?: Predicate<D>,
  ) {
    super();
  }

  async createCommandToSend(data: D): Promise<CommandWithDestination<C>> {
    return this.commandBuilder(data);
  }
}

export class ParticipantEndpointInvocation<
  D,
  C,
> extends BaseParticipantInvocation<D, C> {
  constructor(
    private readonly commandEndpoint: CommandEndpoint<C>,
    private readonly commandProvider: CommandProvider<D, C>,
    readonly isInvocable?: Predicate<D>,
  ) {
    super();
  }

  async createCommandToSend(data: D): Promise<CommandWithDestination<C>> {
    return new CommandWithDestination(
      this.commandEndpoint.channel,
      await this.commandProvider(data),
    );
  }
}
