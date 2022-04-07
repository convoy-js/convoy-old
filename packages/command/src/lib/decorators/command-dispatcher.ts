import type { ClassType } from '@deepkit/core';
import { getClassName } from '@deepkit/core';
import {
  ClassDecoratorResult,
  createClassDecoratorContext,
  createPropertyDecoratorContext,
  mergeDecorator,
  PropertyDecoratorResult,
  ReceiveType,
} from '@deepkit/type';
import { ReceiveTypesStore } from '@convoy/common';

import type { CommandMessageHandlerOptions } from '../command-handler';
import type { CommandHandlerPreLock } from '../reply-lock';

class CommandStore<T> {
  type?: ReceiveType<T>;
}

export interface CommandHandlerConfig<T> {
  readonly type: ReceiveType<T>;
  readonly methodName: string;
  readonly options: CommandMessageHandlerOptions;
}

class CommandClassHandlerStore {
  readonly commands = new Map<string, CommandHandlerConfig<any>>();
}

class CommandClassApi {
  t = new CommandClassHandlerStore();

  addListener<T>(
    type: ReceiveType<T>,
    methodName: string,
    withLock: boolean,
    preLock?: CommandHandlerPreLock,
  ): void {
    const options: CommandMessageHandlerOptions = { withLock, preLock };
    const className = getClassName(type);
    this.t.commands.set(className, { type, methodName, options });
    ReceiveTypesStore.set(className, type);
  }
}

export const commandDispatcherClass: ClassDecoratorResult<
  typeof CommandClassApi
> = createClassDecoratorContext(CommandClassApi);

class CommandDispatcherApi {
  preLockFn?: CommandHandlerPreLock;
  withLockValue = false;

  t = new CommandStore();

  onDecorator(controller: ClassType, property?: string): void {
    if (!this.t.type)
      throw new Error(
        '@commandDispatcher.listen(commandType) is the correct syntax.',
      );
    if (!property)
      throw new Error(
        '@commandDispatcher.listen(commandType) works only on class properties.',
      );

    commandDispatcherClass.addListener(
      this.t.type,
      property,
      this.withLockValue,
      this.preLockFn,
    )(controller);
  }

  /*preLock(fn: CommandHandlerPreLock) {
    this.preLockFn = fn;
    return this;
  }

  // Register a lock target for the given commandType
  withLock(): this {
    this.withLockValue = true;
    return this;
  }*/

  // Register a new commandType listener for given commandType type
  listen<T>(commandType: ReceiveType<T>): void {
    if (!commandType) {
      new Error('@commandDispatcher.listen() No commandType given');
    }
    this.t.type = commandType;
  }
}

export const commandDispatcher: PropertyDecoratorResult<
  typeof CommandDispatcherApi
> = createPropertyDecoratorContext(CommandDispatcherApi);
