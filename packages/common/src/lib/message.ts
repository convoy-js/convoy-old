import type { ClassType } from '@deepkit/core';
import type { ClassSchema } from '@deepkit/type';

import type { ID, RecordLiteral } from './types';

export interface MessagePayload<P = RecordLiteral> {
  encoded: Uint8Array;
  decoded: P;
}

export type MessageHeaders = Map<string, string | Buffer>;

export interface IMessage<P = RecordLiteral> {
  id: ID;
  partition: number;
  type: string;
  payload: MessagePayload;
  schema: ClassType | ClassSchema;
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
