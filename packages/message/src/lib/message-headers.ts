// import type { EntityProperty, Platform } from '@mikro-orm/core';
// import { Type } from '@mikro-orm/core';

import { MissingHeaderException } from './exceptions';

export type MessageRecordHeaders = Record<string, string | Buffer>;

export class MessageHeaders extends Map<string, string | Buffer> {
  static fromRecord(headers: MessageRecordHeaders): MessageHeaders {
    return new MessageHeaders(Object.entries(headers));
  }

  set(key: string, value: string | Buffer | number): this {
    super.set(key, String(value));
    return this;
  }

  asRecord(): MessageRecordHeaders {
    return Object.fromEntries(this);
  }

  getRequired(name: string): string | Buffer {
    const value = this.get(name);
    if (!value) {
      throw new MissingHeaderException(name);
    }
    return value;
  }
}

/*export class MessageHeadersType extends Type<
  MessageHeaders,
  MessageRecordHeaders
  > {
  getColumnType(prop: EntityProperty, platform: Platform): string {
    return platform.getJsonDeclarationSQL();
  }

  convertToDatabaseValue(value: MessageHeaders): MessageRecordHeaders {
    return value.asRecord();
  }

  convertToJSValue(value: MessageRecordHeaders): MessageHeaders {
    return MessageHeaders.fromRecord(value);
  }
}*/
