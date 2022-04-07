import type { ClassType } from '@deepkit/core';
import {
  ClassDecoratorResult,
  createClassDecoratorContext,
  createPropertyDecoratorContext,
  mergeDecorator,
  ReceiveType,
} from '@deepkit/type';

class CommandStore<T> {
  type?: ReceiveType<T>;
}

interface CommandOptions<T> {
  readonly type: ReceiveType<T>;
  readonly name: string;
}

class CommandsStore {
  readonly commands = new Set<CommandOptions<any>>();
}

class Command {
  name?: string;
  destination?: string;
}

class CommandClassApi {
  readonly t = new Command();

  constructor() {}

  name(value: string): void {
    this.t.name = value;
  }

  destination(value: string): void {
    this.t.destination = value;
  }
}

export const commandClass: ClassDecoratorResult<typeof CommandClassApi> =
  createClassDecoratorContext(CommandClassApi);

class CommandPropertyClassApi {
  t = new Command();

  onDecorator(controller: ClassType, property?: string): void {
    commandClass.destination(this.t.destination)(controller);
  }

  destination(value: string): void {
    this.t.destination = value;
  }
}

export const commandProperty = createPropertyDecoratorContext(
  CommandPropertyClassApi,
);

export const command = mergeDecorator(commandClass, commandProperty);
