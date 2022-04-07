import { ConvoyCommandProducer } from '@convoy/command';
import { InternalMessageConsumer } from '@convoy/message';
import { DatabaseWrapper } from '@convoy/database';

import { SagaLockManager } from '../common';
import { SagaCommandProducer } from './saga-command-producer';
import { SagaManager } from './saga-manager';
import { Saga } from './saga';

export class SagaManagerFactory {
  constructor(
    private readonly commandProducer: ConvoyCommandProducer,
    private readonly database: DatabaseWrapper<any>,
    private readonly messageConsumer: InternalMessageConsumer,
    private readonly sagaLockManager: SagaLockManager,
    private readonly sagaCommandProducer: SagaCommandProducer,
  ) {}

  create<D>(saga: Saga<D>): SagaManager<D> {
    return new SagaManager(
      saga,
      this.database,
      this.commandProducer,
      this.messageConsumer,
      this.sagaLockManager,
      this.sagaCommandProducer,
    );
  }
}
