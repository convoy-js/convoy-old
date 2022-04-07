import { Message } from '@convoy/message';
import { CommandMessageHeaders, LockTarget } from '@convoy/command';

import { SagaReplyMessage } from './saga-reply-message';
import {
  SagaReplyHeaders,
  SagaUnlockCommand,
  SagaCommandHeaders,
} from '../common';

export function isUnlockMessage(message: Message<SagaUnlockCommand>): boolean {
  return (
    message.getRequiredHeader(CommandMessageHeaders.COMMAND_TYPE) ===
    SagaUnlockCommand.name
  );
}

export function getSagaType<T>(message: Message<T>): string {
  return message.getRequiredHeader(SagaCommandHeaders.SAGA_TYPE);
}

export function getSagaId<T>(message: Message<T>): string {
  return message.getRequiredHeader(SagaCommandHeaders.SAGA_ID);
}

export function getCommandTarget<T>(message: Message<T>): string {
  return message.getRequiredHeader(CommandMessageHeaders.COMMAND_TYPE);
  // return message.getRequiredHeader(CommandMessageHeaders.RESOURCE);
}

export function addLockedHeader<T>(
  messages: readonly Message<T>[],
  lockedTarget: string,
): readonly Message<T>[] {
  return messages.map(message =>
    message.clone().setHeader(SagaReplyHeaders.REPLY_LOCKED, lockedTarget),
  );
}

export function getLock<T>(
  messages: readonly Message<any>[],
): LockTarget | undefined {
  return (
    messages.find(
      message => message instanceof SagaReplyMessage && !!message.lockTarget,
    ) as SagaReplyMessage<T> | undefined
  )?.lockTarget;
}
