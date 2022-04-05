import {
  BackReference,
  cast,
  DatabaseField,
  Embedded,
  entity,
  PrimaryKey,
  uuid,
  UUID,
} from '@deepkit/type';
import { Version } from '@convoy/database';

import { SagaExecutionState } from '../saga-execution-state';
import { SagaInstanceParticipant } from './saga-instance-participant.entity';

@entity.name('saga_instance')
export class SagaInstance<D> {
  id: UUID & PrimaryKey = uuid();
  type: string & PrimaryKey;
  state: Embedded<SagaExecutionState> = new SagaExecutionState();
  dataType: string;
  data: D & DatabaseField<{ type: 'json' }>;
  version: Version;
  participants: SagaInstanceParticipant[] & BackReference = [];
  lastRequestId?: string;

  addParticipant(
    destination: string,
    resource: string,
  ): SagaInstanceParticipant {
    const participant = cast<SagaInstanceParticipant>({
      destination,
      resource,
    });
    this.participants.push(participant);
    return participant;
  }
}
