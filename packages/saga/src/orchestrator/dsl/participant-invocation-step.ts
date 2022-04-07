import { Message } from '@convoy/message';
import { ReplyMessageHeaders } from '@convoy/command';

import type { BaseParticipantInvocation } from './participant-invocation';
import type { SagaStep, SagaStepReply } from './saga-step';
import type { StepOutcome } from './step-outcome';
import { RemoteStepOutcome } from './step-outcome';

export type ReplyHandlers<D> = Map<string, SagaStepReply<D, any>>;

export class ParticipantInvocationStep<D> implements SagaStep<D> {
  constructor(
    private readonly actionReplyHandlers: ReplyHandlers<D>,
    private readonly compensationReplyHandlers: ReplyHandlers<D>,
    private readonly participantInvocation?: BaseParticipantInvocation<D, any>,
    private readonly compensation?: BaseParticipantInvocation<D, any>,
  ) {}

  private getParticipantInvocation(
    compensating: boolean,
  ): BaseParticipantInvocation<D, any> | undefined {
    return compensating ? this.compensation : this.participantInvocation;
  }

  async hasAction(data: D): Promise<boolean> {
    return (
      (await this.participantInvocation?.isInvocable?.(data)) ??
      !!this.participantInvocation
    );
  }

  async hasCompensation(data: D): Promise<boolean> {
    return (
      (await this.compensation?.isInvocable?.(data)) ?? !!this.compensation
    );
  }

  getReply<T>(
    message: Message<T>,
    compensating: boolean,
  ): SagaStepReply<D> | undefined {
    const replyType = message.getRequiredHeader(ReplyMessageHeaders.REPLY_TYPE);
    const replyHandlers = compensating
      ? this.compensationReplyHandlers
      : this.actionReplyHandlers;

    return replyHandlers.get(replyType);
  }

  isSuccessfulReply<T>(compensating: boolean, message: Message<T>): boolean {
    return !!this.getParticipantInvocation(compensating)?.isSuccessfulReply(
      message,
    );
  }

  async createStepOutcome(
    data: D,
    compensating: boolean,
  ): Promise<StepOutcome> {
    const invocation = this.getParticipantInvocation(compensating);
    if (!invocation) {
      throw new Error('Invocation missing');
    }
    const command = await invocation.createCommandToSend(data);

    return new RemoteStepOutcome([command]);
  }
}
