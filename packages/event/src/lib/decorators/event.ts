import type { ClassType } from '@deepkit/core';
import { createClassDecoratorContext } from '@deepkit/type';

import { AggregateRoot } from '@convoy/domain';

export class Events {
  static readonly store = new Set<Event>();
}

class Event {
  name?: string;
  aggregate?: ClassType<AggregateRoot>;
}

export const event = createClassDecoratorContext(
  class {
    readonly t = new Event();

    constructor() {
      Events.store.add(this.t);
    }

    name(value: string): void {
      this.t.name = value;
    }

    forAggregate(type: ClassType<AggregateRoot>) {
      this.t.aggregate = type;
    }
  },
);
