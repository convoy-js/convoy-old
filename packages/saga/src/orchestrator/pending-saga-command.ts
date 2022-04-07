export class PendingSagaCommand<C> {
  constructor(
    readonly destination: string,
    readonly resource: string,
    readonly command: C,
  ) {}
}
