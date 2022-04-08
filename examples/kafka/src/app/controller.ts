import {
  commandDispatcher,
  commandDispatcherClass,
  CommandMessage,
} from '@convoy/command';

export class TestCommand {}

@commandDispatcherClass.channel('test')
export class Controller {
  @commandDispatcher.listen(TestCommand)
  handle({ command }: CommandMessage<TestCommand>) {}
}
