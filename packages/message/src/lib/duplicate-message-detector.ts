import type { Message, MessageHandler } from './message';

export class DuplicateMessageDetector {
  async doWithMessage<T>(
    subscriberId: string,
    message: Message<T>,
    handleMessage: MessageHandler<T>,
  ): Promise<void> {
    await handleMessage(message);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async isDuplicate(consumerId: string, messageId: string): Promise<boolean> {
    return false;
  }
}
