import {
  commandDispatcherClass,
  commandDispatcher,
} from '../command-dispatcher';
import { ReceiveTypesStore } from '@convoy/common';

class Test {
  constructor(readonly id: string) {}
}

class CommandHandlers {
  @commandDispatcher.listen(Test)
  testHandler() {}
}

describe('@commandDispatcher.listen()', () => {
  it('should add type to CommandClass store', () => {
    expect(
      commandDispatcherClass._fetch(CommandHandlers).commands.get(Test.name)
        .type,
    ).toBe(Test);
  });

  it('should add type to ReceiveTypesStore', () => {
    expect(ReceiveTypesStore.get(Test.name)).toBe(Test);
  });
});
