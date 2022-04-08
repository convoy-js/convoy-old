import { InvokeParticipantStepBuilder } from '../invoke-participant-step-builder';
import { ConvoySagaDefinitionBuilder } from '../convoy-saga-definition-builder';
import { ConvoySaga } from '@convoy/saga';
import { saga } from '../saga.decorator';
import { command } from '@convoy/command';
import { ParticipantInvocation } from '../participant-invocation';
import { SagaDefinition } from '../../saga-definition';

describe('InvokeParticipantStepBuilder', () => {
  beforeEach(() => {});

  it('should throw error trying to create command with destination when no @command.destination() was provided', async () => {
    class TestSagaData {
      id: string;
    }

    class TestCommand {}

    class TestSaga extends ConvoySaga<TestSagaData>() {
      readonly sagaDefinition: SagaDefinition<TestSagaData>;

      begin(): TestCommand {
        return new TestCommand();
      }
    }

    const testSaga = new TestSaga();
    const testSagaData = new TestSagaData();

    const sagaDefinitionBuilder = new ConvoySagaDefinitionBuilder(testSaga);
    const invokeParticipantStepBuilder = new InvokeParticipantStepBuilder(
      sagaDefinitionBuilder,
    );
    invokeParticipantStepBuilder.withAction(testSaga.begin);

    await expect(async () => {
      await (
        (invokeParticipantStepBuilder as any).action as ParticipantInvocation<
          TestSagaData,
          TestCommand
        >
      ).createCommandToSend(testSagaData);
    }).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Missing @command.destination(value) for TestCommand"`,
    );
  });

  it('should create command with destination when @command.destination() is used on command class', async () => {
    class TestSagaData {
      id: string;
    }

    @command.destination('test')
    class TestCommand {}

    class TestSaga extends ConvoySaga<TestSagaData>() {
      readonly sagaDefinition: SagaDefinition<TestSagaData>;

      begin(): TestCommand {
        return new TestCommand();
      }
    }

    const testSaga = new TestSaga();
    const testSagaData = new TestSagaData();

    const sagaDefinitionBuilder = new ConvoySagaDefinitionBuilder(testSaga);
    const invokeParticipantStepBuilder = new InvokeParticipantStepBuilder(
      sagaDefinitionBuilder,
    );
    invokeParticipantStepBuilder.withAction(testSaga.begin);

    const commandWithDestination = await (
      (invokeParticipantStepBuilder as any).action as ParticipantInvocation<
        TestSagaData,
        TestCommand
      >
    ).createCommandToSend(testSagaData);

    expect(commandWithDestination.channel).toEqual('test');
    expect(commandWithDestination.command).toBeInstanceOf(TestCommand);
  });

  it('should create command with destination when @command.destination() is used on saga action', async () => {
    class TestSagaData {
      id: string;
    }

    class TestCommand {}

    class TestSaga extends ConvoySaga<TestSagaData>() {
      readonly sagaDefinition: SagaDefinition<TestSagaData>;

      @command.destination('test')
      begin(): TestCommand {
        return new TestCommand();
      }
    }

    const testSaga = new TestSaga();
    const testSagaData = new TestSagaData();

    const sagaDefinitionBuilder = new ConvoySagaDefinitionBuilder(testSaga);
    const invokeParticipantStepBuilder = new InvokeParticipantStepBuilder(
      sagaDefinitionBuilder,
    );
    invokeParticipantStepBuilder.withAction(testSaga.begin);

    const commandWithDestination = await (
      (invokeParticipantStepBuilder as any).action as ParticipantInvocation<
        TestSagaData,
        TestCommand
      >
    ).createCommandToSend(testSagaData);

    expect(commandWithDestination.channel).toEqual('test');
    expect(commandWithDestination.command).toBeInstanceOf(TestCommand);
  });
});
