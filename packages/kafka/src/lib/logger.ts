import { LogEntry, logLevel } from 'kafkajs';
import {
  ConsoleTransport,
  Logger,
  ScopeFormatter,
  TimestampFormatter,
} from '@deepkit/logger';
('');

export const KafkaLogger = new Logger(
  [new ConsoleTransport()],
  [new ScopeFormatter(), new TimestampFormatter()]
).scoped('kafka');

export const KafkaClientLogger =
  (logger: Logger) =>
  ({ namespace, level, label, log: { message, ...others } }: LogEntry) => {
    let method: keyof Logger;

    switch (level) {
      case logLevel.ERROR:
      case logLevel.NOTHING:
        method = 'error';
        break;
      case logLevel.WARN:
        method = 'warning';
        break;
      case logLevel.INFO:
        method = 'log';
        break;
      case logLevel.DEBUG:
      default:
        method = 'debug';
        break;
    }

    logger[method]?.(
      `${label} [${namespace}] ${message} ${JSON.stringify(others)}`
    );
  };
