import type { Consumer, Predicate } from '@convoy/common';
import type { CommandProvider } from '@convoy/command';

import type { SagaDefinition } from '../saga-definition';
import type { CommandEndpoint } from './command-endpoint';
import { InvokeParticipantStepBuilder } from './invoke-participant-step-builder';
import { LocalStepBuilder } from './local-step-builder';
import type { ConvoySagaDefinitionBuilder } from './convoy-saga-definition-builder';
import type {
  Compensation,
  WithArgs,
  WithCompensationBuilder,
} from './with-builder';

export interface BaseStepBuilder<D> {
  step(): StepBuilder<D>;
  build(): SagaDefinition<D>;
}

export class StepBuilder<D> implements WithCompensationBuilder<D> {
  constructor(private readonly parent: ConvoySagaDefinitionBuilder<D>) {}

  /**
   * Invokes a local action
   */
  invokeLocal(handler: Consumer<D>): LocalStepBuilder<D> {
    return new LocalStepBuilder<D>(this.parent, handler);
  }

  /**
   * Invoke participant
   */
  invokeParticipant<C>(
    action: CommandProvider<D, C>,
    participantInvocationPredicate?: Predicate<D>,
  ): InvokeParticipantStepBuilder<D>;
  invokeParticipant<C>(
    commandEndpoint: CommandEndpoint<C>,
    commandProvider: CommandProvider<D, C>,
    participantInvocationPredicate?: Predicate<D>,
  ): InvokeParticipantStepBuilder<D>;
  invokeParticipant<C>(
    ...args: WithArgs<D, C>
  ): InvokeParticipantStepBuilder<D> {
    return new InvokeParticipantStepBuilder<D>(this.parent).withAction(...args);
  }

  /**
   * With compensation
   */
  withCompensation<C>(
    compensation: Compensation<D, C>,
  ): InvokeParticipantStepBuilder<D>;
  withCompensation<C>(
    compensation: Compensation<D, C>,
    compensationPredicate: Predicate<D>,
  ): InvokeParticipantStepBuilder<D>;
  withCompensation<C>(
    commandEndpoint: CommandEndpoint<C>,
    commandProvider: Compensation<D, C>,
  ): InvokeParticipantStepBuilder<D>;
  withCompensation<C>(
    commandEndpoint: CommandEndpoint<C>,
    commandProvider: Compensation<D, C>,
    compensationPredicate: Predicate<D>,
  ): InvokeParticipantStepBuilder<D>;
  withCompensation<C>(
    ...args: WithArgs<D, C>
  ): InvokeParticipantStepBuilder<D> {
    return new InvokeParticipantStepBuilder<D>(this.parent).withCompensation(
      // @ts-ignore
      ...args,
    );
  }
}
