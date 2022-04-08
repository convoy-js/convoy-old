import type { AsyncLike } from '@convoy/common';

export abstract class AggregateRoot {
  protected applyEvent?<E>(event: E): AsyncLike<this>;
}
