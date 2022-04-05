import type { ID, RecordLiteral } from './types';
import { ReceiveType } from '@deepkit/type';

export interface MessagePayload<T> {
  readonly encoded: Uint8Array;
  readonly decoded: T;
}

export type MessageHeaders = Map<string, string | Buffer>;

export interface IMessage<T = any> {
  id: ID;
  partition: number;
  type: string;
  payload: MessagePayload<T>;
  schema: ReceiveType<T>;
  headers: MessageHeaders;
  // decode(): RecordLiteral;
  // encode(): Uint8Array;
  setHeaders(headers: MessageHeaders): this;
  setHeader(name: string, value: string | Buffer | number): this;
  withExtraHeaders(headers: MessageHeaders): this;
  removeHeader(name: string): boolean;
  getHeader(name: string, defaultValue?: string): string;
  getRequiredHeader(name: string): string;
  hasHeader(name: string): boolean;
}
