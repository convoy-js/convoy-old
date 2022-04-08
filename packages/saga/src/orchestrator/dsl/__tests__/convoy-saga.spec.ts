import { ConvoySaga } from '../convoy-saga';
import { SagaDefinition } from '../../saga-definition';

describe('ConvoySaga', () => {
  it('should resolve receive type for saga data type', () => {
    class TestSagaData {
      id: string;
    }

    class TestSaga extends ConvoySaga<TestSagaData>() {
      readonly sagaDefinition: SagaDefinition<TestSagaData>;
    }

    const testSaga = new TestSaga();

    expect(testSaga.sagaDataType.classType).toBe(TestSagaData);
    expect(testSaga.sagaDataType).toMatchInlineSnapshot(`
      Object {
        "classType": [Function],
        "kind": 20,
        "typeArguments": undefined,
        "types": Array [
          Object {
            "kind": 15,
            "name": "id",
            "parent": [Circular],
            "type": Object {
              "kind": 5,
              "parent": [Circular],
            },
            "visibility": 0,
          },
        ],
      }
    `);
  });
});
