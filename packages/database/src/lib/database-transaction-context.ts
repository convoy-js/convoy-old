import type { DatabaseAdapter, DatabaseSession } from '@deepkit/orm';
import { AsyncLocalStorage } from 'async_hooks';

import type { AsyncLikeFn } from '@convoy/common';

import type { DatabaseWrapper } from './database-wrapper';

export class DatabaseTransactionContext<
  DA extends DatabaseAdapter = DatabaseAdapter,
  DS extends DatabaseSession<DA> = DatabaseSession<DA>,
> {
  private static instance?: DatabaseTransactionContext;

  static getSession<DA extends DatabaseAdapter>():
    | DatabaseSession<DA>
    | undefined {
    // @ts-ignore
    return DatabaseTransactionContext.instance?.getSession();
  }

  static async create<V>(
    cb: AsyncLikeFn<[session: DatabaseSession<any>], V>,
  ): Promise<V> {
    return DatabaseTransactionContext.instance!.create(cb);
  }

  // Unfortunately, using ALS will slightly decrease performance by a mere 1.5% ish
  private readonly storage = new AsyncLocalStorage<DS>();

  constructor(private readonly db: DatabaseWrapper<DA>) {
    DatabaseTransactionContext.instance = this;
  }

  getSession(): DS | undefined {
    return this.storage.getStore();
  }

  async create<V>(next: AsyncLikeFn<[session: DS], V>): Promise<V> {
    const session = this.db.createSession() as DS;

    return new Promise<V>((resolve, reject) => {
      this.storage.run(session, async () => {
        session.useTransaction();

        try {
          console.log('test');
          const res = await next(session);
          await session.commit();
          return resolve(res);
        } catch (err) {
          await session.rollback();
          return reject(err);
        }
      });
    });
  }
}
