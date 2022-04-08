export class TopicPartitionOffset {
  constructor(
    readonly topic: string,
    readonly partition: number,
    // Offsets are represented as strings in kafkajs
    // but the actual representation is int64, which V8 doesn't support
    // so we just convert them into bigint
    readonly offset: bigint,
  ) {}
}
