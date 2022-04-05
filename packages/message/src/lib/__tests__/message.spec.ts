import {
  ValidationErrorItem,
  AutoIncrement,
  PrimaryKey,
  Unique,
  typedArrayToBuffer,
} from '@deepkit/type';

import { Message } from '../message';
import { MessageInvalidPayloadException } from '../exceptions';

describe('Message', () => {
  describe('decode', () => {
    it('should decode the payload by schema', () => {
      class User {
        readonly id: number & AutoIncrement & PrimaryKey = 0;
        readonly created: Date = new Date();
        readonly name: string & Unique;
      }

      const encoded = Buffer.from([
        46, 0, 0, 0, 16, 105, 100, 0, 0, 0, 0, 0, 9, 99, 114, 101, 97, 116, 101,
        100, 0, 67, 152, 142, 161, 123, 1, 0, 0, 2, 110, 97, 109, 101, 0, 6, 0,
        0, 0, 85, 115, 101, 114, 49, 0, 0,
      ]);

      const message2 = Message.from(User, encoded);

      expect(
        typedArrayToBuffer(message2.encode()).equals(encoded),
      ).toBeTruthy();
      expect(message2.decode()).toBeInstanceOf(User);
    });

    it('should throw InvalidPayloadException when payload is invalid', () => {
      const encoded = Buffer.from([
        22, 0, 0, 0, 2, 104, 101, 108, 108, 111, 0, 6, 0, 0, 0, 119, 111, 114,
        108, 100, 0, 0,
      ]);

      class World {
        world: string;
      }

      const message = new Message(World, encoded);

      expect(() => message.decode()).toThrowError(
        new MessageInvalidPayloadException(message, [
          new ValidationErrorItem(
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
      class Hello {
        readonly hello: string;
      }
      const message = new Message(Hello, {
        hello: 'world',
      });

      expect(message.encode()).toMatchInlineSnapshot(`
        Object {
          "data": Array [
            22,
            0,
            0,
            0,
            2,
            104,
            101,
            108,
            108,
            111,
            0,
            6,
            0,
            0,
            0,
            119,
            111,
            114,
            108,
            100,
            0,
            0,
          ],
          "type": "Buffer",
        }
      `);
    });

    it('should throw InvalidPayloadException when payload is invalid', () => {
      class Hello {
        constructor(readonly hello: string) {}
      }

      const message = new Message(Hello, {
        // @ts-expect-error
        world: 'hello',
      });

      expect(() => message.encode()).toThrowError(
        new MessageInvalidPayloadException(message, [
          new ValidationErrorItem(
            'hello',
            'required',
            'Required value is undefined',
          ),
        ]),
      );
    });
  });
});
