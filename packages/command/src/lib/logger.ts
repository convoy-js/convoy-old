import { ConsoleTransport, Logger, ScopeFormatter } from '@deepkit/logger';

export const CommandsLogger = new Logger(
  [new ConsoleTransport()],
  [new ScopeFormatter()],
).scoped('command');
