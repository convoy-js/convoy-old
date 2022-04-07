import type { ReceiveType } from '@deepkit/type';

export class CommandEndpoint<C> {
  constructor(
    readonly channel: string,
    readonly commandType: ReceiveType<C>,
    readonly replies: readonly ReceiveType<unknown>[],
  ) {}
}
