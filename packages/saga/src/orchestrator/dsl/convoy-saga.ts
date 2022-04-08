import { CommandWithDestinationBuilder } from '@convoy/command';
import type { ReceiveType, TypeClass } from '@deepkit/type';
import type { AbstractClassType } from '@deepkit/core';

import { Saga } from '../saga';
import { ConvoySagaDefinitionBuilder } from './convoy-saga-definition-builder';
import { StepBuilder } from './step-builder';
import { resolveReceiveType } from '@deepkit/type';

export abstract class InternalConvoySaga<D> extends Saga<D> {
  protected step(): StepBuilder<D> {
    return new StepBuilder<D>(new ConvoySagaDefinitionBuilder<D>(this));
  }

  protected send<C>(command: C): CommandWithDestinationBuilder<C> {
    return new CommandWithDestinationBuilder<C>(command);
  }
}

// TODO: Refactor when https://github.com/deepkit/deepkit-framework/issues/209 is supported
export function ConvoySaga<D>(
  sagaDataType?: ReceiveType<D>,
): AbstractClassType<InternalConvoySaga<D>> {
  const receivedType = resolveReceiveType(sagaDataType) as TypeClass;

  abstract class ConvoySaga extends InternalConvoySaga<D> {
    static readonly sagaDataType = receivedType;

    public constructor() {
      super(receivedType);
    }
  }

  return ConvoySaga;
}
