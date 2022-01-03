import 'reflect-metadata';
import { Database, DatabaseSession } from '@deepkit/orm';
import { SQLiteDatabaseAdapter } from '@deepkit/sqlite';
import { entity, t } from '@deepkit/type';

import { DatabaseTransactionContext } from './database-transaction-context';
import { DatabaseWrapper } from './database-wrapper';
import { Transactional } from './decorators';
import { Repository } from './repository';

describe('DatabaseWrapper', () => {
  let db: DatabaseWrapper<SQLiteDatabaseAdapter>;
  let ctx: DatabaseTransactionContext;

  @entity.name('user')
  class User {
    @t.primary.autoIncrement
    readonly id: number = 0;
    @t
    readonly created: Date = new Date();

    constructor(@t readonly name: string) {}
  }

  beforeEach(async () => {
    db = new DatabaseWrapper(new SQLiteDatabaseAdapter(), [User]);
    await db.migrate();

    ctx = new DatabaseTransactionContext(db);
  });

  it('should add entity in transaction context using @Transactional() decorator', async () => {
    class UserService {
      constructor(
        private readonly db: DatabaseWrapper<SQLiteDatabaseAdapter>
      ) {}

      @Transactional()
      async create(): Promise<User> {
        expect(this.db.ctx).toBeInstanceOf(DatabaseSession);

        const user = new User('User 1');
        await this.db.add(user);

        return user;
      }
    }

    const userService = new UserService(db);
    const createdUser = await userService.create();

    expect(db.ctx).toBeInstanceOf(Database);
    const user = await db.query(User).findOne();
    expect(user).toMatchObject(createdUser);
  });

  it('should add entity in transaction context', async () => {
    await DatabaseTransactionContext.create(async () => {
      expect(db.ctx).toBeInstanceOf(DatabaseSession);
      await db.add(new User('User 1'));
    });

    expect(db.ctx).toBeInstanceOf(Database);
    const user = await db.query(User).findOne();
    expect(user).toBeInstanceOf(User);
  });
});
