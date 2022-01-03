import type { ClassType, AbstractClassType } from '@deepkit/core';
import { Database, DatabaseSession } from '@deepkit/orm';
import type { Entity, Query, HydratorFn, DatabaseAdapter } from '@deepkit/orm';
import type { ClassSchema, PrimaryKeyFields } from '@deepkit/type';

import { DatabaseTransactionContext } from './database-transaction-context';
import { Repository } from './repository';

export class DatabaseWrapper<DA extends DatabaseAdapter> extends Database<DA> {
  get ctx(): DatabaseSession<DA> | this {
    const session = DatabaseTransactionContext.getSession<DA>();
    return session || this;
  }

  // @ts-ignore
  query<T extends Entity>(
    classType: AbstractClassType<T> | ClassSchema<T>
  ): Query<T> {
    return this.ctx.query(classType);
  }

  // @ts-ignore
  raw<A extends Array<any>>(...args: A): any {
    return this.ctx.raw(...args);
  }

  async add(...items: Entity[]): Promise<void> {
    await this.ctx.add(...items);
  }

  async remove(...items: Entity[]): Promise<void> {
    await this.ctx.remove(...items);
  }

  getReference<T>(
    classType: ClassType<T> | ClassSchema<T>,
    primaryKey: any | PrimaryKeyFields<T>
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

  getRepository<E extends Entity>(entity: AbstractClassType<E>): Repository<E> {
    return new Repository(this, entity);
  }
}
