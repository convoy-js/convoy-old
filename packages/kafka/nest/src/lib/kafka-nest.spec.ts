import { kafkaNest } from './kafka-nest';

describe('kafkaNest', () => {
  it('should work', () => {
    expect(kafkaNest()).toEqual('kafka-nest');
  });
});
