import { InvokeParticipantStepBuilder } from '../invoke-participant-step-builder';
import { ConvoySagaDefinitionBuilder } from '../convoy-saga-definition-builder';
import { ConvoySaga } from '@convoy/saga';
import { saga } from '../saga.decorator';
import { command } from '@convoy/command';

describe('InvokeParticipantStepBuilder', () => {
  beforeEach(() => {});

  it('should work with x', () => {
    class TestSagaData {
      id: string;
    }

    class TestCommand {}

    // @saga.data(TestSagaData)
    class TestSaga extends ConvoySaga<TestSagaData>() {
      readonly sagaDefinition = this.step<TestSagaData>()
        .invokeParticipant(this.begin)
        .build();

      @command.destination('test')
      begin(data: TestSagaData): TestCommand {
        return new TestCommand();
      }
    }

    const sagaDefinitionBuilder = new ConvoySagaDefinitionBuilder(
      new TestSaga(),
    );
    // const invokeParticipantStepBuilder = new InvokeParticipantStepBuilder();
  });
});
