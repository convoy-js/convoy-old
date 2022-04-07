import { CommandWithDestination, ConvoyCommandProducer } from '@convoy/command';
import { Message } from '@convoy/message';

import { SagaMessageHeaders } from '../common';

export class SagaCommandProducer {
  constructor(private readonly commandProducer: ConvoyCommandProducer) {}

  // TODO: Kafka transactions
  async sendCommands<T>(
    sagaType: string,
    sagaId: string,
    commands: readonly CommandWithDestination<any>[],
    sagaReplyChannel: string,
  ): Promise<string | undefined> {
    let message: Message<T> | undefined;

    for (const command of commands) {
      const headers = new SagaMessageHeaders(sagaType, sagaId);

      message = await this.commandProducer.send(
        command.channel,
        command.command,
        sagaReplyChannel,
        headers,
        command.resource,
      );
    }

    return message?.id;
  }
}
