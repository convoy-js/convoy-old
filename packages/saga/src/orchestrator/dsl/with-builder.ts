import { CommandProvider, CommandWithDestination } from '@convoy/command';
import { AsyncLikeFn, Predicate } from '@convoy/common';

import type { CommandEndpoint } from './command-endpoint';

export type Compensation<
  T,
  C extends any | CommandWithDestination<C>,
> = AsyncLikeFn<[data: T], C>;

export type WithEndpointArgs<D, C> = [
  CommandEndpoint<C>,
  CommandProvider<D, C>,
  Predicate<D>?,
];

export type WithoutEndpointArgs<
  D,
  C extends any | CommandWithDestination<C>,
> = [CommandProvider<D, C>, Predicate<D>?];

export type WithDestinationArgs<D, C> = WithoutEndpointArgs<
  D,
  CommandWithDestination<C>
>;

export type WithArgs<D, C> = WithEndpointArgs<D, C> | WithoutEndpointArgs<D, C>;

export interface WithActionBuilder<D> {
  withAction<C>(
    action: CommandProvider<D, C>,
    participantInvocationPredicate?: Predicate<D>,
  ): unknown;
  withAction<C>(
    commandEndpoint: CommandEndpoint<C>,
    commandProvider: CommandProvider<D, C>,
    participantInvocationPredicate?: Predicate<D>,
  ): unknown;
  withAction<C>(...args: WithArgs<D, C>): unknown;
}

export interface WithCompensationBuilder<D> {
  withCompensation<C>(compensation: Compensation<D, C>): unknown;
  withCompensation<C>(
    compensation: Compensation<D, C>,
    compensationPredicate: Predicate<D>,
  ): unknown;
  withCompensation<C>(
    commandEndpoint: CommandEndpoint<C>,
    commandProvider: Compensation<D, C>,
  ): unknown;
  withCompensation<C>(
    commandEndpoint: CommandEndpoint<C>,
    commandProvider: Compensation<D, C>,
    compensationPredicate: Predicate<D>,
  ): unknown;
  withCompensation<C>(...args: WithArgs<D, C>): unknown;
}
