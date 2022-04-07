import {
  ClassDecoratorResult,
  createClassDecoratorContext,
  ReceiveType,
} from '@deepkit/type';

class Saga<D> {
  dataType: ReceiveType<D>;
}

class SagaClassApi {
  readonly t = new Saga();

  constructor() {}

  data<D>(type: ReceiveType<D>): void {
    this.t.dataType = type;
  }
}

export const saga: ClassDecoratorResult<typeof SagaClassApi> =
  createClassDecoratorContext(SagaClassApi);
