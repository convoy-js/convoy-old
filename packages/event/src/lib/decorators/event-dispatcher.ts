import type { ClassType } from '@deepkit/core';
import {
  ClassDecoratorResult,
  createClassDecoratorContext,
  createPropertyDecoratorContext,
  PropertyDecoratorResult,
  ReceiveType,
} from '@deepkit/type';
import { Events } from './event';
import { getClassName } from '@deepkit/core';
import { ReceiveTypesStore } from '@convoy/common';

class EventStore<T> {
  type?: ReceiveType<T>;
}

export interface EventHandlerConfig<T> {
  readonly type: ReceiveType<T>;
  readonly methodName: string;
}

class EventClassHandlerStore {
  readonly events = new Map<string, EventHandlerConfig<any>>();
}

class EventClassApi {
  t = new EventClassHandlerStore();

  addListener<T>(type: ReceiveType<T>, methodName: string): void {
    const className = getClassName(type);
    this.t.events.set(className, { type, methodName });
    ReceiveTypesStore.set(className, type);
  }
}

export const eventClass: ClassDecoratorResult<typeof EventClassApi> =
  createClassDecoratorContext(EventClassApi);

class EventDispatcherApi {
  t = new EventStore();

  onDecorator(controller: ClassType, property?: string): void {
    if (!this.t.type)
      throw new Error(
        '@eventDispatcher.listen(eventType) is the correct syntax.',
      );
    if (!property)
      throw new Error(
        '@eventDispatcher.listen(eventType) works only on class properties.',
      );

    eventClass.addListener(this.t.type, property)(controller);
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
  listen<T>(eventType: ReceiveType<T>): void {
    if (!eventType) {
      new Error('@eventDispatcher.listen() No event given');
    }
    /*if (!Events.store.has(eventType)) {
      throw new Error(
        `You must add @event.name() decorator to ${eventType.name}`,
      );
    }*/

    this.t.type = eventType;
  }
}

export const eventDispatcher: PropertyDecoratorResult<
  typeof EventDispatcherApi
> = createPropertyDecoratorContext(EventDispatcherApi);
