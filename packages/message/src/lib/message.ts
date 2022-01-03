import { getBSONDecoder, getBSONSerializer } from '@deepkit/bson';
import type { ClassType } from '@deepkit/core';
import { validateFactory } from '@deepkit/type/dist/cjs/src/validation';

import type {
  AsyncLikeFn,
  Consumer,
  IMessage,
  MessagePayload,
  RecordLiteral,
} from '@convoy/common';

import { MessageLogger } from './logger';
import { MessageHeaders } from './message-headers';
import {
  MessageInvalidPayloadException,
  MessageMissingHeaderException,
} from './exceptions';

export type MessageHandler<P = RecordLiteral> = Consumer<Message<P>, void>;

export type MessageSubscription = Promise<AsyncLikeFn>;

export class Message<T = RecordLiteral> implements IMessage {
  static readonly ID = 'id';
  static readonly PARTITION_ID = 'partition_id';
  static readonly DESTINATION = 'destination';
  static readonly DATE = 'date';
  static readonly TYPE = 'type';

  readonly #_encode = getBSONSerializer(this.schema);
  readonly #_decode = getBSONDecoder<T>(this.schema);
  readonly #_validate = validateFactory(this.schema);
  #encodedPayload: Uint8Array;
  #decodedPayload: T;

  headers: MessageHeaders;

  get payload(): MessagePayload<T> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const _this = this;

    return {
      get encoded() {
        return _this.encode();
      },
      get decoded() {
        return _this.decode();
      },
    };
  }

  get id(): string {
    return this.getRequiredHeader(Message.ID);
  }

  get partition(): number {
    return +this.getRequiredHeader(Message.PARTITION_ID);
  }

  get type(): string {
    return this.getRequiredHeader(Message.TYPE);
  }

  static from<T>(type: ClassType<T>, payload: Uint8Array): Message<T> {
    return new Message<T>(type, payload);
  }

  constructor(
    readonly schema: ClassType<T>,
    readonly _somePayload: T | Uint8Array,
    headers?: MessageHeaders
  ) {
    this.headers = new MessageHeaders(headers ? [...headers] : []);
  }

  private validateOrThrow(payload: T | Uint8Array): asserts payload is T {
    const validationErrors = this.#_validate(payload);

    if (validationErrors.length) {
      MessageLogger.error(validationErrors);

      throw new MessageInvalidPayloadException(this, validationErrors);
    }
  }

  decode(): T {
    if (!this.#decodedPayload) {
      let decoded = this._somePayload;

      if (this._somePayload instanceof Uint8Array) {
        decoded = this.#_decode(this._somePayload);
      }

      this.validateOrThrow(decoded);
      this.#decodedPayload = decoded;
    }

    return this.#decodedPayload;
  }

  encode(): Uint8Array {
    if (!this.#encodedPayload) {
      if (!(this._somePayload instanceof Uint8Array)) {
        this.validateOrThrow(this._somePayload);
        this.#encodedPayload = this.#_encode(this._somePayload);
      } else {
        this.#encodedPayload = this._somePayload;
      }
    }

    return this.#encodedPayload;
  }

  setHeaders(headers: MessageHeaders): this {
    this.headers = headers;
    return this;
  }

  setHeader(name: string, value: string | number): this {
    this.headers.set(name, value);
    return this;
  }

  withExtraHeaders(headers: MessageHeaders): this {
    this.headers = new MessageHeaders([...this.headers, ...headers]);
    return this;
  }

  removeHeader(name: string): boolean {
    return this.headers.delete(name);
  }

  getHeader(name: string, defaultValue = ''): string {
    return String(this.headers.get(name) ?? defaultValue);
  }

  getRequiredHeader(name: string): string {
    const value = this.getHeader(name);
    if (!value) {
      throw new MessageMissingHeaderException(name, this);
    }
    return value;
  }

  hasHeader(name: string): boolean {
    return this.headers.has(name);
  }
}
