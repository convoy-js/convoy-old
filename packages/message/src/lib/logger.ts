import { ConsoleTransport, Logger, ScopeFormatter, TimestampFormatter } from '@deepkit/logger';

export const MessageLogger = new Logger(
  [new ConsoleTransport()],
  [new ScopeFormatter(), new TimestampFormatter()],
).scoped('message');
