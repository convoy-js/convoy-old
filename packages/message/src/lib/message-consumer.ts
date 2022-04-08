import type { AsyncLikeFn } from '@convoy/common';

import { DuplicateMessageDetector } from './duplicate-message-detector';
import type { MessageHandler, MessageSubscription } from './message';
import { Message } from './message';

export abstract class MessageConsumer {
  protected readonly handlers = new Map<
    string,
    readonly MessageHandler<any>[]
  >();

  protected addHandlerToChannel(
    channel: string,
    handler: MessageHandler<any>,
  ): void {
    const handlers = this.handlers.get(channel) || [];
    this.handlers.set(channel, [...handlers, handler]);
  }

  protected getHandlersByChannel(
    channel: string,
  ): readonly MessageHandler<any>[] {
    return this.handlers.get(channel) || [];
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  abstract subscribe<T>(
    subscriberId: string,
    channels: readonly string[],
    handler: MessageHandler<T>,
    isEventHandler?: boolean,
  ): MessageSubscription;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  close(): Promise<void> | void {}
}

export class InternalMessageConsumer extends MessageConsumer {
  private readonly subs = new Map<string, AsyncLikeFn>();

  constructor(
    // private readonly channelMapping: ConvoyChannelMapping,
    private readonly target: MessageConsumer,
    private readonly duplicateMessageDetector: DuplicateMessageDetector = new DuplicateMessageDetector(),
  ) {
    super();
  }

  // TODO: @Transactional should actually be here, or ..?
  async handleMessage<T>(
    subscriberId: string,
    message: Message<T>,
    handler: MessageHandler<T>,
  ): Promise<void> {
    await this.duplicateMessageDetector.doWithMessage(
      subscriberId,
      message,
      handler,
    );
  }

  async subscribe<T>(
    subscriberId: string,
    channels: readonly string[],
    handler: MessageHandler<T>,
    isEventHandler?: boolean,
  ): MessageSubscription {
    Message.logger.debug(`Subscribing ${subscriberId} to channels ${channels}`);

    /*const transformedChannels = channels.map(channel =>
      this.channelMapping.transform(channel),
    );*/
    const sub = await this.target.subscribe(
      subscriberId,
      channels,
      (message: Message<T>) =>
        this.handleMessage(subscriberId, message, handler),
      isEventHandler,
    );
    this.subs.set(subscriberId, sub);

    return sub;
  }

  async close(): Promise<void> {
    for (const unsubscribe of this.subs.values()) {
      await unsubscribe();
    }

    await this.target.close();
  }
}
