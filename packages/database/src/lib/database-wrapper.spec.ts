import { Database, DatabaseSession } from '@deepkit/orm';
import { SQLiteDatabaseAdapter } from '@deepkit/sqlite';
import { AutoIncrement, cast, entity, PrimaryKey } from '@deepkit/type';

import { DatabaseTransactionContext } from './database-transaction-context';
import { DatabaseWrapper } from './database-wrapper';
import { Transactional } from './decorators';

@entity.name('user')
class User {
  readonly id: number & PrimaryKey & AutoIncrement = 0;
  readonly created: Date = new Date();
  readonly name: string;
}

describe('DatabaseWrapper', () => {
  let db: DatabaseWrapper<SQLiteDatabaseAdapter>;
  let ctx: DatabaseTransactionContext;

  beforeEach(async () => {
    db = new DatabaseWrapper(new SQLiteDatabaseAdapter(':memory:'), [User]);
    await db.migrate();

    ctx = new DatabaseTransactionContext(db);
  });

  it('should add entity in transaction context using @Transactional() decorator', async () => {
    class UserService {
      constructor(
        private readonly db: DatabaseWrapper<SQLiteDatabaseAdapter>,
      ) {}

      @Transactional()
      async create(): Promise<User> {
        expect(this.db.ctx).toBeInstanceOf(DatabaseSession);

        const user = cast<User>({
          name: 'Test',
        });
        this.db.add(user);

        return user;
      }
    }

    const userService = new UserService(db);
    const createdUser = await userService.create();

    expect(db.ctx).toBeInstanceOf(Database);
    const user = await db.query(User).findOne();
    expect(user).toEqual(expect.objectContaining(createdUser));
  });

  it('should add entity in transaction context', async () => {
    await DatabaseTransactionContext.create(() => {
      expect(db.ctx).toBeInstanceOf(DatabaseSession);
      db.add(
        cast<User>({
          name: 'Test',
        }),
      );
    });

    expect(db.ctx).toBeInstanceOf(Database);
    const user = await db.query(User).findOne();
    expect(user).toBeInstanceOf(User);
  });
});
