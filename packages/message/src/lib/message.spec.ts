import { entity, t } from '@deepkit/type';
import { ValidationFailedItem } from '@deepkit/type/dist/cjs/src/jit-validation';

import { Message } from './message';
import { MessageInvalidPayloadException } from './exceptions';

describe('Message', () => {
  describe('decode', () => {
    it('should decode the payload by schema', () => {
      @(entity.name('user').collectionName('users'))
      class User {
        @t.primary.autoIncrement readonly id: number = 0;
        @t readonly created: Date = new Date();

        constructor(@t public name: string) {}
      }

      const encoded = Buffer.from([
        46, 0, 0, 0, 16, 105, 100, 0, 0, 0, 0, 0, 9, 99, 114, 101, 97, 116, 101,
        100, 0, 67, 152, 142, 161, 123, 1, 0, 0, 2, 110, 97, 109, 101, 0, 6, 0,
        0, 0, 85, 115, 101, 114, 49, 0, 0,
      ]);

      const message2 = Message.from(User, encoded);
      expect(message2.payload.decoded).toBeInstanceOf(User);
    });

    it('should throw InvalidBufferPayloadException when payload is not a Buffer', () => {
      const message = new Message(
        t.schema({ world: t.string }),
        { world: 'hello' },
      );

      expect(() => message.payload.decoded).toThrowError(
        'Expected [object Object] to be an instance of Buffer',
      );
    });

    it('should throw InvalidPayloadException when payload is invalid', () => {
      const encoded = Buffer.from([
        22, 0, 0, 0, 2, 104, 101, 108, 108, 111, 0, 6, 0, 0, 0, 119, 111, 114,
        108, 100, 0, 0,
      ]);

      const message = new Message(t.schema({ world: t.string }), encoded);

      expect(() => message.payload.decoded).toThrowError(
        new MessageInvalidPayloadException(message, [
          new ValidationFailedItem(
            'world',
            'required',
            'Required value is undefined',
          ),
        ]),
      );
    });
  });

  describe('encode', () => {
    it('should encode the payload by schema', () => {
      const message = new Message(
        t.schema({ hello: t.string }),
        { hello: 'world' },
      );

      expect(message.payload.encoded).toEqual(
        Buffer.from([
          22, 0, 0, 0, 2, 104, 101, 108, 108, 111, 0, 6, 0, 0, 0, 119, 111, 114,
          108, 100, 0, 0,
        ]),
      );
    });

    it('should throw InvalidPayloadException when payload is invalid', () => {
      const message = new Message(
        t.schema({ hello: t.string }),
        { world: 'hello' },
      );

      expect(() => message.payload.encoded).toThrowError(
        new MessageInvalidPayloadException(message, [
          new ValidationFailedItem(
            'hello',
            'required',
            'Required value is undefined',
          ),
        ]),
      );
    });
  });
});
