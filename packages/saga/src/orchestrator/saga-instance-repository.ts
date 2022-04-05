import { SagaInstance } from './saga-instance';
import { SagaInstance, SagaInstanceParticipant } from './entities';
import { DestinationAndResource } from './destination-and-resource';
import { DatabaseWrapper } from '@convoy/database';
import { cast } from '@deepkit/type';

export class SagaInstanceRepository {
  private readonly store = new Map<string, SagaInstance<any>>();

  async find<T>(sagaType: string, sagaId: string): Promise<SagaInstance<T>> {
    return this.store.get(`${sagaType}-${sagaId}`)!;
  }

  async save<T>(sagaInstance: SagaInstance<T>): Promise<SagaInstance<T>> {
    this.store.set(
      `${sagaInstance.sagaType}-${sagaInstance.sagaId}`,
      sagaInstance,
    );

    return sagaInstance;
  }

  async update<T>(sagaInstance: SagaInstance<T>): Promise<void> {
    await this.save(sagaInstance);
  }
}

export class SagaDatabaseInstanceRepository extends SagaInstanceRepository {
  constructor(private readonly db: DatabaseWrapper<any>) {
    super();
  }

  private async createParticipants<D>({
    destinationsAndResources,
    sagaId,
    sagaType,
  }: SagaInstance<D>): Promise<void> {
    await Promise.all(
      destinationsAndResources.map(async dr => {
        await this.db.add(
          cast<SagaInstanceParticipant>({
            sagaId,
            sagaType,
            ...dr,
          }),
        );
      }),
    );
  }

  private async findDestinationsAndResources(
    sagaType: string,
    sagaId: string,
  ): Promise<readonly DestinationAndResource[]> {
    const sagaInstanceParticipants = await this.db
      .query(SagaInstanceParticipant)
      .filter({
        sagaType,
        sagaId,
      })
      .select('destination', 'resource')
      .find();

    return sagaInstanceParticipants.map(
      ({ destination, resource }) =>
        new DestinationAndResource(destination, resource),
    );
  }

  async find<D>(sagaType: string, sagaId: string): Promise<SagaInstance<D>> {
    const destinationAndResources = await this.findDestinationsAndResources(
      sagaType,
      sagaId,
    );

    const entity = await this.db
      .query<SagaInstance<any>>(SagaInstance)
      .filter({
        sagaType,
        sagaId,
      })
      .findOne();

    return new SagaInstance(
      sagaType,
      sagaId,
      entity.stateName,
      entity.lastRequestId,
      entity.sagaDataType,
      entity.data,
      destinationAndResources,
      entity.compensating,
      entity.endState,
    );
  }

  async save<D>(sagaInstance: SagaInstance<D>): Promise<SagaInstance<D>> {
    const entity = await this.db.persist(cast<SagaInstance<D>>(sagaInstance));
    await this.createParticipants(sagaInstance);
    return Object.assign(sagaInstance, entity);
  }

  async update<D>({
    sagaType,
    sagaId,
    destinationsAndResources,
    ...sagaInstance
  }: NonNullable<SagaInstance<D>>): Promise<void> {
    const patchResult = await this.db
      .query(SagaInstance)
      .filter({
        sagaType,
        sagaId,
      })
      .patchOne(cast<SagaInstance<D>>(sagaInstance));
    console.log({ patchResult });

    // eslint-disable-next-line prefer-rest-params
    await this.createParticipants(arguments[0] as SagaInstance<D>);
  }
}
