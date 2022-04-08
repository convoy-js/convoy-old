export class TopicPartitionOffsets {
  private unprocessed: readonly bigint[] = [];
  private processed: readonly bigint[] = [];

  noteUnprocessed(offset: bigint): void {
    this.unprocessed = [...this.unprocessed, offset];
  }

  noteProcessed(offset: bigint): void {
    this.processed = [...this.processed, offset];
  }

  toCommit(): bigint | undefined {
    return this.unprocessed.find(x => this.processed.includes(x));
  }

  noteCommitted(offset: bigint): void {
    this.unprocessed = this.unprocessed.filter(x => x >= offset);
    this.processed = this.processed.filter(x => x >= offset);
  }

  getPending(): readonly bigint[] {
    return this.unprocessed.filter(x => this.processed.includes(x));
  }
}
