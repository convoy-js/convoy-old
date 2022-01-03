import type { Message, MessageHandler } from './message';

export class DuplicateMessageDetector {
  async doWithMessage(
    subscriberId: string,
    message: Message,
    handleMessage: MessageHandler
  ): Promise<void> {
    await handleMessage(message);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async isDuplicate(consumerId: string, messageId: string): Promise<boolean> {
    return false;
  }
}
