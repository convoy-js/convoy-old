import type { Primitive } from 'type-fest';

import type { Handlers } from './handlers';
import type { IMessage } from './message';

export type ID = string | number;

export type Consumer<T, S = any, A extends unknown[] = unknown[]> = AsyncLikeFn<
  [data: T, ...args: A],
  S
>;

export type ObjectLiteral = Readonly<Record<string, any>>;

export type DataObject = {
  readonly [key: string]:
    | Primitive
    | DataObject
    | readonly Primitive[]
    | readonly DataObject[];
};

export type RecordLiteral = Record<string, any>;

export type AsyncLikeFn<T extends any[] = any[], R = unknown> = (
  ...args: T
) => AsyncLike<R>;

export type AsyncLike<R> = Promise<R> | R;

export type Predicate<T extends any> = AsyncLikeFn<[T], boolean>;

export interface Reply {}

export interface Instance {}

// export interface Instance<T extends Function = Function> extends Object {
//   constructor:
// }

export interface Builder<T> {
  build(): T;
}

export interface Dispatcher {
  subscribe(): Promise<void>;
  handleMessage(message: IMessage): Promise<void>;
}

export interface Handler<H extends AsyncLikeFn> {
  handles(message: IMessage): boolean;
  readonly invoke: H;
}

export interface DispatcherFactory<D, H extends Handlers<any>> {
  create(id: string, handlers: H): D;
}
