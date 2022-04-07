import type { ClassType } from '@deepkit/core';
import { Database, DatabaseSession } from '@deepkit/orm';
import type {
  OrmEntity,
  Query,
  HydratorFn,
  DatabaseAdapter,
} from '@deepkit/orm';
import type { PrimaryKeyFields } from '@deepkit/type';

import { DatabaseTransactionContext } from './database-transaction-context';

export class DatabaseWrapper<DA extends DatabaseAdapter> extends Database<DA> {
  get ctx(): DatabaseSession<DA> | this {
    const session = DatabaseTransactionContext.getSession<DA>();
    return session || this;
  }

  // @ts-ignore
  query<T extends OrmEntity>(classType: ClassType<T>): Query<T> {
    return this.ctx.query(classType);
  }

  // @ts-ignore
  raw<A extends Array<any>>(...args: A): any {
    return this.ctx.raw(...args);
  }

  add(...items: OrmEntity[]): void {
    this.ctx.add(...items);
  }

  async remove(...items: OrmEntity[]): Promise<void> {
    await this.ctx.remove(...items);
  }

  getReference<T>(
    classType: ClassType<T>,
    primaryKey: any | PrimaryKeyFields<T>,
  ): T {
    return this.ctx.getReference(classType, primaryKey);
  }

  reset(): void {
    if (this.ctx instanceof DatabaseSession) {
      this.ctx.reset();
    }
  }

  getHydrator(): HydratorFn {
    return this.ctx.getHydrator();
  }

  async hydrateEntity<T extends object>(item: T): Promise<void> {
    await this.ctx.hydrateEntity(item);
  }

  async flush(): Promise<void> {
    await this.ctx.flush();
  }
}
