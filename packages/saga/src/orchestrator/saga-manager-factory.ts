import { ConvoyCommandProducer } from '@convoy/command';
import { InternalMessageConsumer } from '@convoy/message';

import { SagaInstanceRepository } from './saga-instance-repository';
import { SagaCommandProducer } from './saga-command-producer';
import { SagaManager } from './saga-manager';
import { Saga } from './saga';
import { SagaLockManager } from '../common/saga-lock-manager';

export class SagaManagerFactory {
  constructor(
    private readonly sagaInstanceRepository: SagaInstanceRepository,
    private readonly commandProducer: ConvoyCommandProducer,
    private readonly messageConsumer: InternalMessageConsumer,
    private readonly sagaLockManager: SagaLockManager,
    private readonly sagaCommandProducer: SagaCommandProducer,
  ) {}

  create<D>(saga: Saga<D>): SagaManager<D> {
    return new SagaManager(
      saga,
      this.sagaInstanceRepository,
      this.commandProducer,
      this.messageConsumer,
      this.sagaLockManager,
      this.sagaCommandProducer,
    );
  }
}
