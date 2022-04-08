import { ReceiveType } from '@deepkit/type';
import { getClassName, getClassTypeFromInstance } from '@deepkit/core';
import { Predicate } from '@convoy/common';
import {
  commandClass,
  commandProperty,
  CommandProvider,
  CommandWithDestination,
} from '@convoy/command';

import type { SagaDefinition } from '../saga-definition';
import { CommandEndpoint } from './command-endpoint';
import type { ConvoySagaDefinitionBuilder } from './convoy-saga-definition-builder';
import type { BaseParticipantInvocation } from './participant-invocation';
import {
  ParticipantEndpointInvocation,
  ParticipantInvocation,
} from './participant-invocation';
import { ParticipantInvocationStep } from './participant-invocation-step';
import type { ReplyHandlers } from './participant-invocation-step';
import type { SagaStepReplyHandler } from './saga-step';
import type { BaseStepBuilder } from './step-builder';
import { StepBuilder } from './step-builder';
import type {
  WithActionBuilder,
  WithCompensationBuilder,
  WithArgs,
  WithEndpointArgs,
  WithoutEndpointArgs,
  WithDestinationArgs,
  Compensation,
} from './with-builder';

function isEndpoint<D, C>(
  args: WithArgs<D, C>,
): args is WithEndpointArgs<D, C> {
  return args[0] instanceof CommandEndpoint;
}

function isNotEndpoint<D, C>(
  args: WithArgs<D, C>,
): args is WithoutEndpointArgs<D, C> {
  return !(args[0] instanceof CommandEndpoint);
}

export class InvokeParticipantStepBuilder<D>
  implements
    BaseStepBuilder<D>,
    WithCompensationBuilder<D>,
    WithActionBuilder<D>
{
  private readonly actionReplyHandlers: ReplyHandlers<D> = new Map();
  private readonly compensationReplyHandlers: ReplyHandlers<D> = new Map();
  private action?: BaseParticipantInvocation<D, any>;
  private compensation?: BaseParticipantInvocation<D, any>;

  constructor(private readonly parent: ConvoySagaDefinitionBuilder<D>) {}

  // TODO
  private wrapCommandProvider<C>(
    args: WithoutEndpointArgs<D, C>,
  ): WithDestinationArgs<D, C> {
    const action = args.shift()!;
    const method = action.bind(this.parent.saga);
    const sagaType = getClassTypeFromInstance(this.parent.saga);
    let destination = commandProperty._fetch(
      sagaType,
      action.name,
    )?.destination;

    return [
      async function withDestination(
        data: D,
      ): Promise<CommandWithDestination<C>> {
        const cmd: C | CommandWithDestination<C> = await method(data);
        if (cmd instanceof CommandWithDestination) return cmd;

        if (!destination) {
          destination = commandClass._fetch(
            getClassTypeFromInstance(cmd),
          )?.destination;
        }

        if (!destination) {
          throw new Error(
            'Missing @command.destination(value) for ' + getClassName(cmd),
          );
        }

        return new CommandWithDestination<C>(destination, cmd);
      },
      ...args,
    ] as unknown as WithDestinationArgs<D, C>;
  }

  private addStep(): void {
    this.parent.addStep(
      new ParticipantInvocationStep<D>(
        this.actionReplyHandlers,
        this.compensationReplyHandlers,
        this.action,
        this.compensation,
      ),
    );
  }

  private with<C>(
    args: WithArgs<D, C>,
  ): ParticipantEndpointInvocation<D, C> | ParticipantInvocation<D, C> {
    if (isEndpoint(args)) {
      return new ParticipantEndpointInvocation<D, C>(
        args[0] as CommandEndpoint<C>,
        args[1].bind(this.parent.saga),
        args[2]?.bind(this.parent.saga),
      );
    } else if (isNotEndpoint(args)) {
      const destArgs = this.wrapCommandProvider(args);
      return new ParticipantInvocation<D, C>(
        destArgs[0].bind(this.parent.saga),
        destArgs[1]?.bind(this.parent.saga),
      );
    } else {
      // TODO
      throw new Error(args[0]);
    }
  }

  withAction<C>(...args: WithArgs<D, C>): this {
    this.action = this.with(args);
    return this;
  }

  /**
   * With compensation
   */
  withCompensation<C>(compensation: Compensation<D, C>): this;
  withCompensation<C>(
    compensation: Compensation<D, C>,
    compensationPredicate: Predicate<D>,
  ): this;
  withCompensation<C>(
    commandEndpoint: CommandEndpoint<C>,
    commandProvider: Compensation<D, C>,
  ): this;
  withCompensation<C>(
    commandEndpoint: CommandEndpoint<C>,
    commandProvider: Compensation<D, C>,
    compensationPredicate: Predicate<D>,
  ): this;
  withCompensation<C>(...args: WithArgs<D, C>): this {
    this.compensation = this.with(args);
    return this;
  }

  /**
   * On reply
   */
  onReply<T, R>(
    type: ReceiveType<T>,
    handler: SagaStepReplyHandler<D, R>,
  ): this {
    handler = handler.bind(this.parent.saga);

    const typeName = getClassName(type);
    if (this.compensation) {
      this.compensationReplyHandlers.set(typeName, { type, handler });
    } else {
      this.actionReplyHandlers.set(typeName, { type, handler });
    }

    return this;
  }

  /**
   * Step
   */
  step(): StepBuilder<D> {
    this.addStep();
    return new StepBuilder<D>(this.parent);
  }

  build(): SagaDefinition<D> {
    this.addStep();
    return this.parent.build();
  }
}
