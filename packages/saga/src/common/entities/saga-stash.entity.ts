import { entity, PrimaryKey, UUID, MapName } from '@deepkit/type';
import { MessageHeaders, MessageRecordHeaders } from '@convoy/message';
import { Version } from '@convoy/database';

@entity.name('saga_stash')
export class SagaStash {
  readonly messageId: UUID & PrimaryKey;
  readonly target: string;
  readonly sagaType: string;
  readonly sagaId: UUID;

  private _messageHeaders: MessageRecordHeaders & MapName<'messageHeaders'>;
  get messageHeaders(): MessageHeaders {
    return MessageHeaders.fromRecord(this._messageHeaders);
  }
  set messageHeaders(value: MessageHeaders) {
    this._messageHeaders = value.asRecord();
  }

  readonly messagePayload: Uint8Array;
  readonly version: Version;
}
