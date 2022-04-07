import type { ReceiveType } from '@deepkit/type';
import {
  RuntimeException,
  UnsupportedOperationException,
} from '@convoy/common';
import { Message } from '@convoy/message';

import type { SagaActions } from '../saga-actions';
import { SagaActionsBuilder } from '../saga-actions';
import type { SagaDefinition } from '../saga-definition';
import { SagaExecutionState } from '../saga-execution-state';
import type { SagaStep, SagaStepReplyHandler } from './saga-step';
import { StepToExecute } from './step-to-execute';

export class ConvoySagaDefinition<D> implements SagaDefinition<D> {
  constructor(private readonly sagaSteps: readonly SagaStep<D>[]) {}

  private async nextStepToExecute(
    { compensating, currentlyExecuting }: SagaExecutionState,
    data: D,
  ): Promise<StepToExecute<D>> {
    const direction = compensating ? -1 : +1;
    let skipped = 0;

    for (
      let i = currentlyExecuting + direction;
      i >= 0 && i < this.sagaSteps.length;
      i = i + direction
    ) {
      const step = this.sagaSteps[i];
      if (
        compensating
          ? await step.hasCompensation(data)
          : await step.hasAction(data)
      ) {
        return new StepToExecute<D>(skipped, compensating, step);
      } else {
        skipped++;
      }
    }

    return new StepToExecute<D>(skipped, compensating);
  }

  private async executeNextStep(
    sagaData: D,
    currentState: SagaExecutionState,
  ): Promise<SagaActions<D>> {
    const stepToExecute = await this.nextStepToExecute(currentState, sagaData);

    return stepToExecute.isEmpty()
      ? this.makeEndStateSagaActions(currentState)
      : stepToExecute.executeStep(sagaData, currentState);
  }

  private makeEndStateSagaActions(state: SagaExecutionState): SagaActions<D> {
    return new SagaActionsBuilder<D>()
      .withUpdatedState(SagaExecutionState.makeEndState())
      .withIsEndState(true)
      .withIsCompensating(state.compensating)
      .build();
  }

  private async invokeReplyHandler<T>(
    message: Message<T>,
    data: D,
    replyType: ReceiveType<T>,
    handleReply: SagaStepReplyHandler<D>,
  ): Promise<void> {
    const reply = await message.decode();
    await handleReply(data, reply);
  }

  async start(sagaData: D): Promise<SagaActions<D>> {
    const currentState = new SagaExecutionState();
    return this.executeNextStep(sagaData, currentState);
  }

  async handleReply<T>(
    currentState: SagaExecutionState,
    sagaData: D,
    message: Message<T>,
  ): Promise<SagaActions<D>> {
    const currentStep = this.sagaSteps[currentState.currentlyExecuting];
    if (!currentStep) {
      throw new RuntimeException(
        `Saga step is missing for execution state ${currentState}`,
      );
    }

    const reply = currentStep.getReply(message, currentState.compensating);
    if (reply) {
      await this.invokeReplyHandler(
        message,
        sagaData,
        reply.type,
        reply.handler,
      );
    }

    if (currentStep.isSuccessfulReply(currentState.compensating, message)) {
      return this.executeNextStep(sagaData, currentState);
    } else if (currentState.compensating) {
      throw new UnsupportedOperationException('Failure when compensating');
    } else {
      return this.executeNextStep(sagaData, currentState.startCompensating());
    }
  }
}
