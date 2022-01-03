import type { ClassType } from '@deepkit/core';
import { rpc } from '@deepkit/rpc';
import {
  createClassDecoratorContext,
  createPropertyDecoratorContext,
  mergeDecorator,
} from '@deepkit/type';

import type { CommandMessageHandlerOptions } from '@convoy/commands/command-handler';
import { CommandHandlerPreLock } from '@convoy/commands/reply-lock';

interface Command {}

class CommandStore {
  type?: ClassType<Command>;
}

export interface CommandHandlerConfig {
  readonly type: ClassType;
  readonly methodName: string;
  readonly options: CommandMessageHandlerOptions;
}

class CommandClassHandlerStore {
  readonly commands = new Set<CommandHandlerConfig>();
}

export const commandClass = createClassDecoratorContext(
  class {
    t = new CommandClassHandlerStore();

    addListener(
      type: ClassType,
      methodName: string,
      withLock: boolean,
      preLock?: CommandHandlerPreLock
    ): void {
      const options: CommandMessageHandlerOptions = { withLock, preLock };
      this.t.commands.add({ type, methodName, options });
    }
  }
);

export const commandDispatcher = createPropertyDecoratorContext(
  class {
    preLockFn?: CommandHandlerPreLock;
    withLockValue = false;

    t = new CommandStore();

    onDecorator(controller: ClassType, property?: string): void {
      if (!this.t.type)
        throw new Error(
          '@commandDispatcher.listen(commandType) is the correct syntax.'
        );
      if (!property)
        throw new Error(
          '@commandDispatcher.listen(commandType) works only on class properties.'
        );

      commandClass.addListener(
        this.t.type,
        property,
        this.withLockValue,
        this.preLockFn
      )(controller);
    }

    /*preLock(fn: CommandHandlerPreLock) {
      this.preLockFn = fn;
      return this;
    }

    // Register a lock target for the given command
    withLock(): this {
      this.withLockValue = true;
      return this;
    }*/

    // Register a new command listener for given command type
    listen<T>(commandType: ClassType<T>): void {
      if (!commandType) {
        new Error('@commandDispatcher.listen() No command given');
      }
      this.t.type = commandType;
    }
  }
);

interface CommandOptions {
  readonly type: ClassType<Command>;
  readonly name: string;
}

class CommandsStore {
  readonly commands = new Set<CommandOptions>();
}

export const command = mergeDecorator(commandDispatcher);
