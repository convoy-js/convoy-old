import type { IMessage } from './message';
import type { AsyncLikeFn, Handler } from './types';

export class Handlers<H extends Handler<AsyncLikeFn>> extends Set<H> {
  get handlers(): readonly H[] {
    return [...this.values()];
  }

  findTargetMethod(message: IMessage): H | undefined {
    return this.handlers.find(handler => handler.handles(message));
  }
}
