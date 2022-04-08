import { createClassDecoratorContext, ReceiveType } from '@deepkit/type';

import { AggregateRoot } from '@convoy/domain';

class Event<T extends AggregateRoot> {
  name?: string;
  aggregateType?: ReceiveType<T>;
}

export const event = createClassDecoratorContext(
  class {
    readonly t = new Event();

    name(value: string): void {
      this.t.name = value;
    }

    forAggregate<T extends AggregateRoot>(aggregateType: ReceiveType<T>) {
      this.t.aggregateType = aggregateType;
    }
  },
);
