import {
  Consumer,
  ConsumerGroupJoinEvent,
  Kafka as KafkaClient,
  KafkaConfig,
  Producer,
} from 'kafkajs';

import { KafkaClientLogger, KafkaLogger } from './logger';

export type ConsumerAssignments = Readonly<Record<string, number>>;
export const GROUP_ID = 'convoy';

export class Kafka {
  private readonly kafka = new KafkaClient({
    ...this.config,
    logCreator: KafkaClientLogger.bind(null, KafkaLogger),
  });
  private consumerAssignments: ConsumerAssignments = {};

  readonly producer: Producer = this.kafka.producer({
    idempotent: true,
    allowAutoTopicCreation: true,
  });
  readonly consumer: Consumer = this.kafka.consumer({
    groupId: this.config.clientId || GROUP_ID,
    allowAutoTopicCreation: true,
  });

  constructor(private readonly config: KafkaConfig) {
    // set member assignments on join and rebalance
    // this.consumer.on(
    //   this.consumer.events.GROUP_JOIN,
    //   this.setConsumerAssignments.bind(this),
    // );
  }

  private setConsumerAssignments(data: ConsumerGroupJoinEvent): void {
    // only need to set the minimum
    this.consumerAssignments = Object.keys(
      data.payload.memberAssignment
    ).reduce((consumerAssignments, memberId) => {
      const minimumPartition = Math.min(
        ...data.payload.memberAssignment[memberId]
      );

      return {
        [memberId]: minimumPartition,
        ...consumerAssignments,
      };
    }, {} as ConsumerAssignments);
  }

  getPreviousAssignments(): ConsumerAssignments {
    return this.consumerAssignments;
  }
}
