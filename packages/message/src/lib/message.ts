import { getBSONDeserializer, getBSONSerializer } from '@deepkit/bson';
import { ReceiveType, validateFunction } from '@deepkit/type';

import { convoyBsonBinarySerializer } from '@convoy/common';
import type { AsyncLikeFn, Consumer, IMessage } from '@convoy/common';

import { MessageLogger } from './logger';
import { MessageHeaders } from './message-headers';
import {
  MessageInvalidPayloadException,
  MessageMissingHeaderException,
} from './exceptions';

export type MessageHandler<T> = Consumer<Message<T>, void>;

export type MessageSubscription = Promise<AsyncLikeFn>;

export interface MessagePayload<T> {
  readonly encoded: Uint8Array;
  readonly decoded: T;
}

export class Message<T> implements IMessage<T> {
  static readonly ID = 'id';
  static readonly PARTITION_ID = 'partition_id';
  static readonly DESTINATION = 'destination';
  static readonly DATE = 'date';
  static readonly TYPE = 'type';

  readonly #encode = getBSONSerializer<T>(
    convoyBsonBinarySerializer,
    this.schema,
  );
  readonly #decode = getBSONDeserializer<T>(
    convoyBsonBinarySerializer,
    this.schema,
  );
  readonly #validate = validateFunction<T | Uint8Array>(
    convoyBsonBinarySerializer,
    this.schema,
  );
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

  static from<T>(type: ReceiveType<T>, payload: Uint8Array): Message<T> {
    return new Message<T>(type, payload);
  }

  constructor(
    readonly schema: ReceiveType<T>,
    readonly _somePayload: T | Uint8Array,
    headers?: MessageHeaders,
  ) {
    this.headers = new MessageHeaders(headers ? [...headers] : []);
    // this.headers.set(Message.TYPE, (schema as ClassType<T>).name);
  }

  private validateOrThrow(payload: T | Uint8Array): asserts payload is T {
    const validationErrors = this.#validate(payload);

    if (validationErrors.length) {
      MessageLogger.error(validationErrors);

      throw new MessageInvalidPayloadException(this, validationErrors);
    }
  }

  decode(): T {
    if (!this.#decodedPayload) {
      let decoded = this._somePayload;

      if (this._somePayload instanceof Uint8Array) {
        decoded = this.#decode(this._somePayload);
      } else {
        this.validateOrThrow(decoded);
      }

      this.#decodedPayload = decoded;
    }

    return this.#decodedPayload;
  }

  encode(): Uint8Array {
    if (!this.#encodedPayload) {
      if (!(this._somePayload instanceof Uint8Array)) {
        this.validateOrThrow(this._somePayload);
        this.#encodedPayload = this.#encode(this._somePayload);
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
