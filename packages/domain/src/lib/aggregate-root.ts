import type { AsyncLike, DataObject } from '@convoy/common';

interface Event {}

export abstract class AggregateRoot<T = DataObject> {
  protected constructor(values: DataObject) {
    Object.assign(this, values);
  }

  protected applyEvent?<E extends Event>(event: E): AsyncLike<this>;
}
