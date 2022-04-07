import { DatabaseWrapper } from '@convoy/database';
import { Message } from '@convoy/message';
import { cast } from '@deepkit/type';
import { ReceiveTypesStore } from '@convoy/common';

import { SagaStash } from './entities/saga-stash.entity';
import { SagaLock } from './entities/saga-lock.entity';

export class SagaLockManager {
  async claimLock(
    sagaType: string,
    sagaId: string,
    target: string,
  ): Promise<boolean> {
    return true;
  }

  async stashMessage<T>(
    sagaType: string,
    sagaId: string,
    target: string,
    message: Message<T>,
  ): Promise<void> {}

  async unlock<T>(sagaId: string, target: string): Promise<Message<T> | void> {}
}

export class SagaDatabaseLockManager extends SagaLockManager {
  constructor(private readonly db: DatabaseWrapper<any>) {
    super();
  }

  // TODO
  private async getLockedSagaIdByTarget(
    target: string,
  ): Promise<string | undefined> {
    /*
    const entity = await this.sagaLockRepository
      .createQueryBuilder()
      .setLock('pessimistic_write')
      .where({ target })
      .select('saga_id')
      .getOne();

    return entity?.sagaId;*/
    return undefined;
  }

  async claimLock(
    sagaType: string,
    sagaId: string,
    target: string,
  ): Promise<boolean> {
    while (true) {
      try {
        await this.db.persist(
          cast<SagaLock>({
            target,
            sagaType,
            sagaId,
          }),
        );
        return true;
      } catch (e) {
        const owningSagaId = await this.getLockedSagaIdByTarget(target);
        if (owningSagaId) {
          return owningSagaId === sagaId;
        }
      }
    }
  }

  async stashMessage<T>(
    sagaType: string,
    sagaId: string,
    target: string,
    message: Message<T>,
  ): Promise<void> {
    const messageId = message.getRequiredHeader(Message.ID);

    this.db.add(
      cast<SagaStash>({
        messagePayload: message.payload.encoded,
        messageHeaders: message.headers,
        messageId,
        sagaType,
        sagaId,
        target,
      }),
    );
  }

  async unlock<T>(sagaId: string, target: string): Promise<Message<T> | void> {
    const owningSagaId = await this.getLockedSagaIdByTarget(target);
    if (!owningSagaId) {
      throw new Error(`owningSagaId is not present for ${target} ${sagaId}`);
    }

    if (owningSagaId !== sagaId) {
      throw new Error(
        `Expected owner of ${target} to be ${sagaId} but is ${owningSagaId}`,
      );
    }

    const sagaStashTargetQuery = this.db.query(SagaStash).filter({ target });
    const stashedMessage = await sagaStashTargetQuery.findOne();
    if (!stashedMessage) {
      await sagaStashTargetQuery.deleteOne();
      return;
    }

    await this.db.query(SagaLock).filter({ target }).patchOne({
      sagaType: stashedMessage.sagaType,
      sagaId: stashedMessage.sagaId,
    });

    await this.db
      .query(SagaStash)
      .filter({ messageId: stashedMessage.messageId })
      .deleteOne();

    const sagaReceiveType = ReceiveTypesStore.get(stashedMessage.sagaType);
    return new Message(
      sagaReceiveType,
      stashedMessage.messagePayload,
      stashedMessage.messageHeaders,
    );
  }
}
