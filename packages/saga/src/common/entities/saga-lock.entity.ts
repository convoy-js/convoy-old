import { entity, PrimaryKey, UUID } from '@deepkit/type';
import { Version } from '@convoy/database';

@entity.name('saga-lock')
export class SagaLock {
  readonly target: string & PrimaryKey;
  readonly sagaId: string & UUID;
  readonly sagaType: string;
  readonly version: Version;
}
