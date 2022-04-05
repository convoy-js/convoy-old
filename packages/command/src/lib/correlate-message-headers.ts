import { MessageHeaders } from '@convoy/message';
import type { Message } from '@convoy/message';

import { CommandMessageHeaders } from './command-message-headers';
import { ReplyMessageHeaders } from './reply-message-headers';

export function correlateMessageHeaders(message: Message<any>): MessageHeaders {
  const correlationHeaders = new MessageHeaders(
    [...message.headers.entries()]
      .filter(([key]) =>
        CommandMessageHeaders.headerStartsWithCommandPrefix(key),
      )
      .map(([key, value]) => [CommandMessageHeaders.inReply(key), value]),
  );

  correlationHeaders.set(ReplyMessageHeaders.IN_REPLY_TO, message.id);

  return correlationHeaders;
}
