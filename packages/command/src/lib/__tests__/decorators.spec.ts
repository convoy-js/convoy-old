import { commandClass, commandDispatcher } from '../decorators';
import { getClassName } from '@deepkit/core';
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
      commandClass._fetch(CommandHandlers).commands.get(Test.name).type,
    ).toBe(Test);
  });

  it('should add type to ReceiveTypesStore', () => {
    expect(ReceiveTypesStore.get(Test.name)).toBe(Test);
  });
});
