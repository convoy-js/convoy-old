import { command, commandClass } from '@convoy/command';

describe('@command.destination()', () => {
  it('should work on class', () => {
    @command.destination('test')
    class TestCommand {}
  });

  it('should work on class property', () => {
    class Test {
      @command.destination('test')
      fn() {}
    }
  });
});
