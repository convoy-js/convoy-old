import 'reflect-metadata';
import { event } from './event';
import { eventDispatcher } from './event-dispatcher';

describe('@eventDispatcher', () => {
  it('should listen', () => {
    @event.name('test')
    class TestEvent {}

    class EventHandler {
      @eventDispatcher.listen(TestEvent)
      handle() {}
    }

    expect(eventDispatcher.t).toMatchInlineSnapshot();
  });
});
