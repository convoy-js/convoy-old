import type { Consumer } from '@convoy/common';
import { CommandReplyOutcome, ReplyMessageHeaders } from '@convoy/command';
import { Message } from '@convoy/message';
import { LocalStepOutcome } from './step-outcome';
import type { SagaStep, SagaStepReply } from './saga-step';

export class LocalStep<D> implements SagaStep<D> {
  constructor(
    private readonly handler: Consumer<D>,
    private readonly compensation?: Consumer<D>,
  ) {}

  getReply<T>(
    message: Message<T>,
    compensating: boolean,
  ): SagaStepReply<D> | void {}

  hasAction(data: D): boolean {
    return true;
  }

  hasCompensation(data: D): boolean {
    return typeof this.compensation === 'function'
      ? this.compensation?.(data)
      : !!this.compensation;
  }

  isSuccessfulReply<T>(compensating: boolean, message: Message<T>): boolean {
    return (
      CommandReplyOutcome.SUCCESS ===
      message.getRequiredHeader(ReplyMessageHeaders.REPLY_OUTCOME)
    );
  }

  async createStepOutcome(
    data: D,
    compensating: boolean,
  ): Promise<LocalStepOutcome> {
    try {
      if (compensating) {
        await this.compensation?.(data);
      } else {
        await this.handler(data);
      }

      return new LocalStepOutcome();
    } catch (err) {
      return new LocalStepOutcome(err);
    }
  }
}
