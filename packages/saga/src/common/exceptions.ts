import { entity, ReceiveType } from '@deepkit/type';
import { getClassName } from '@deepkit/core';

@entity.name('@error/saga-stash-message-required')
export class StashMessageRequiredException extends Error {
  constructor(readonly target: string) {
    super();
  }
}

@entity.name('@error/saga-state-machine-empty')
export class StateMachineEmptyException<T> extends Error {
  constructor(/*sagaType: ReceiveType<T>*/) {
    super('State machine cannot be empty');
  }
}

@entity.name('@error/saga-cannot-claim-lock')
export class CannotClaimLockException extends Error {
  constructor(sagaType: string, sagaId: string, target: string) {
    super('Cannot claim lock');
  }
}

@entity.name('@error/saga-cannot-claim-resource-lock')
export class CannotClaimResourceLockException extends Error {
  constructor(resource?: string) {
    super('Cannot claim lock for resource');
  }
}

@entity.name('@error/saga-missing-manager')
export class MissingSagaManagerException<T> extends Error {
  constructor(sagaType: ReceiveType<T>) {
    super(`Missing manager for saga ${getClassName(sagaType)}`);
  }
}
