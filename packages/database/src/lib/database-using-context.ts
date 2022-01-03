import type { ClassType } from '@deepkit/core';
import { Database, DatabaseSession } from '@deepkit/orm';
import type { DatabaseAdapter } from '@deepkit/orm';
import type { ClassSchema } from '@deepkit/type';

import { DatabaseTransactionContext } from './database-transaction-context';

export class DatabaseUsingContext<
  DA extends DatabaseAdapter,
> extends DatabaseSession<DA> {
  static create<DA extends DatabaseAdapter>(
    adapter: DA,
    schemas: (ClassType | ClassSchema)[] = [],
  ): DatabaseSession<DA> {
    const db = new Database(adapter, schemas);

    return new Proxy(db as unknown as DatabaseSession<DA>, {
      get: (target: DatabaseUsingContext<DA>, property: string) => {
        return (...args: any[]) => {
          return (target.ctx as any)[property](...args);
        };
      },
    });
  }

  get ctx(): DatabaseSession<DA> | this {
    const session = DatabaseTransactionContext.getSession<DA>();
    return session || this;
  }
}
