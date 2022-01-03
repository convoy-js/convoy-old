export class RuntimeException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RuntimeException';
  }
}

export class InvalidOperationException extends RuntimeException {}

export class UnsupportedOperationException extends RuntimeException {}
