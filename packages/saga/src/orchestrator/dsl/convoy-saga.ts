import { CommandWithDestinationBuilder } from '@convoy/command';

import { Saga } from '../saga';
import { ConvoySagaDefinitionBuilder } from './convoy-saga-definition-builder';
import { StepBuilder } from './step-builder';
import type { ReceiveType } from '@deepkit/type';
import { resolveReceiveType } from '@deepkit/type';
import { Class } from 'type-fest';
import type { AbstractClassType, ClassType } from '@deepkit/core';
import { Abstract } from '@nestjs/common';

export abstract class _ConvoySaga<D> extends Saga<D> {
  constructor(sagaDataType?: ReceiveType<D>) {
    super();
    console.log(sagaDataType);
  }

  protected step<T>(sagaDataType?: ReceiveType<T>): StepBuilder<D> {
    return new StepBuilder<D>(new ConvoySagaDefinitionBuilder<D>(this));
  }

  protected send<C>(command: C): CommandWithDestinationBuilder<C> {
    return new CommandWithDestinationBuilder<C>(command);
  }
}

interface ConvoySagaInterface<D> extends Saga<D> {
  step<T>(): StepBuilder<D>;
}

export function ConvoySaga<D>(
  sagaDataType?: ReceiveType<D>,
): AbstractClassType<Saga<D>> {
  abstract class TestSaga extends Saga<D> {
    public constructor(sagaDataType?: ReceiveType<D>) {
      super();
    }

    protected step(): StepBuilder<D> {
      console.log(resolveReceiveType(sagaDataType));
      return new StepBuilder<D>(new ConvoySagaDefinitionBuilder<D>(this));
    }

    protected send<C>(command: C): CommandWithDestinationBuilder<C> {
      return new CommandWithDestinationBuilder<C>(command);
    }
  }

  return TestSaga;
}
