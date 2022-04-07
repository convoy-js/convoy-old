import { Builder } from '@convoy/common';
import { MessageHeaders, MessageRecordHeaders } from '@convoy/message';

import { CommandWithDestination } from './command-with-destination';

export class CommandWithDestinationBuilder<C>
  implements Builder<CommandWithDestination<C>>
{
  static send<C>(command: C): CommandWithDestinationBuilder<C> {
    return new CommandWithDestinationBuilder(command);
  }

  private extraHeaders?: MessageHeaders;
  private resource?: string;
  private destinationChannel?: string;

  constructor(private readonly command: C) {}

  to(destinationChannel: string): this {
    this.destinationChannel = destinationChannel;
    return this;
  }

  /*forResource(resource: string, ...pathParams: Record<string, string>[]): this {
    this.resource = new ResourcePathPattern(resource)
      .replacePlaceholders(pathParams)
      .toPath();

    return this;
  }*/

  withExtraHeaders(headers: MessageHeaders | MessageRecordHeaders): this {
    this.extraHeaders =
      headers instanceof MessageHeaders
        ? headers
        : MessageHeaders.fromRecord(headers);

    return this;
  }

  build(): CommandWithDestination<C> {
    if (!this.destinationChannel) {
      throw new Error('Destination is required');
    }

    return new CommandWithDestination(
      this.destinationChannel,
      this.command,
      this.resource,
      this.extraHeaders,
    );
  }
}
