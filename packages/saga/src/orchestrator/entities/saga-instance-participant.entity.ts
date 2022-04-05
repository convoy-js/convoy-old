import { entity, PrimaryKey, Reference, UUID } from '@deepkit/type';
import { Version } from '@convoy/database';

import { SagaInstance } from './saga-instance.entity';

@entity.name('saga_instance_participant')
export class SagaInstanceParticipant {
  destination: string;
  resource: string;
  sagaInstance: SagaInstance<any> & Reference;
  version: Version;
}
