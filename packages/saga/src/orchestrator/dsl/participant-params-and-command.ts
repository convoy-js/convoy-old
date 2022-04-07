export class ParticipantParamsAndCommand<C> {
  constructor(readonly params: Map<string, string>, readonly command: C) {}
}
