import type { ClassType } from '@deepkit/core';
import {
  createClassDecoratorContext,
  getClassSchema,
  mergeDecorator,
  PropertySchema,
} from '@deepkit/type';

import { AggregateRoot } from '@convoy/domain';

class EventStore {
  type?: ClassType;
}

interface EventOptions {
  readonly type: ClassType;
  readonly name: string;
}

export class EventAction {
  name: string;
  classType: ClassType;
}

class EventsStore {
  readonly commands = new Set<EventOptions>();
}

class Event {
  name?: string;
  aggregate?: ClassType<AggregateRoot>;
}

class EventClass {
  readonly t = new Event();

  name(value: string): void {
    this.t.name = value;
  }

  forAggregate(type: ClassType<AggregateRoot>) {
    this.t.aggregate = type;
  }
}

export const eventClass = createClassDecoratorContext(EventClass);

export const event = mergeDecorator(eventClass);

export function getActionParameters<T>(
  target: ClassType<T>,
  method: string
): PropertySchema[] {
  return getClassSchema(target).getMethodProperties(method);
}

export function getActions<T>(target: ClassType<T>): Map<string, EventAction> {
  const parent = Object.getPrototypeOf(target);
  const results = parent ? getActions(parent) : new Map<string, EventAction>();

  /*const data = rpcClass._fetch(target);
  if (!data) return results;

  for (const action of data.actions.values()) {
    const existing = results.get(action.name)!;
    if (existing) {
      existing.groups.push(...action.groups);
      Object.assign(existing.data, action.data);
    } else {
      results.set(action.name, action);
    }
  }*/

  return results;
}
