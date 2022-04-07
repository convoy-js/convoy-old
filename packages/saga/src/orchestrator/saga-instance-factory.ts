import type { ReceiveType } from '@deepkit/type';
import type { ClassType } from '@deepkit/core';

import { Saga } from './saga';
import { SagaInstance } from './entities';
import { SagaManager } from './saga-manager';
import { SagaManagerFactory } from './saga-manager-factory';
import { MissingSagaManagerException } from '../common';

export class SagaInstanceFactory {
  private sagaManagers: WeakMap<ClassType<Saga<unknown>>, SagaManager<unknown>>;

  constructor(private readonly sagaManagerFactory: SagaManagerFactory) {}

  private async createSagaManager<D>(saga: Saga<D>): Promise<SagaManager<D>> {
    const sagaManager = this.sagaManagerFactory.create<D>(saga);
    await sagaManager.subscribeToReplyChannel();
    return sagaManager;
  }

  private getSagaManager<D>(
    sagaType: ClassType<Saga<D>>,
  ): SagaManager<D> | undefined {
    return this.sagaManagers.get(sagaType)! as SagaManager<D>;
  }

  async create<D>(
    sagaType: ClassType<Saga<D>>,
    data: D,
  ): Promise<SagaInstance<D>> {
    if (!this.sagaManagers.has(sagaType)) {
      throw new MissingSagaManagerException(sagaType);
    }

    return this.getSagaManager(sagaType)!.createInstance(data);
  }
}
