import type { ClassType } from '@deepkit/core';
import { createClassDecoratorContext } from '@deepkit/type';

class CommandStore {
  type?: ClassType;
}

interface CommandOptions {
  readonly type: ClassType;
  readonly name: string;
}

class CommandsStore {
  readonly commands = new Set<CommandOptions>();
}

class Command {
  name?: string;
}

class CommandClass {
  readonly t = new Command();

  name(value: string): void {
    this.t.name = value;
  }
}

export const commandClass = createClassDecoratorContext(CommandClass);
