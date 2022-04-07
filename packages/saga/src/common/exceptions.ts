import { entity } from '@deepkit/type';
import { ClassType, getClassName } from '@deepkit/core';
import { CommandMessage } from '@convoy/command';

@entity.name('@error/saga-stash-message-required')
export class StashMessageRequiredException<C> extends Error {
  constructor(commandMessage: CommandMessage<C>, readonly target: string) {
    super(`Stash message required for ${getClassName(commandMessage.command)}`);
  }
}

@entity.name('@error/saga-state-machine-empty')
export class StateMachineEmptyException<T> extends Error {
  constructor(saga: T) {
    super(`State machine cannot be empty for ${getClassName(saga)}`);
  }
}

@entity.name('@error/saga-cannot-claim-lock')
export class CannotClaimLockException extends Error {
  constructor(sagaType: string, sagaId: string, target: string) {
    super(
      `Cannot claim lock for target ${target}, saga ${sagaType} with ID ${sagaId}`,
    );
  }
}

@entity.name('@error/saga-cannot-claim-resource-lock')
export class CannotClaimResourceLockException extends Error {
  constructor(resource?: string) {
    super(`Cannot claim lock for resource "${resource}"`);
  }
}

@entity.name('@error/saga-missing-manager')
export class MissingSagaManagerException<T> extends Error {
  constructor(sagaType: ClassType<T>) {
    super(`Missing manager for saga ${getClassName(sagaType)}`);
  }
}
