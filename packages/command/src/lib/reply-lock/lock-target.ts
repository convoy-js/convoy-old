import { getClassName } from '@deepkit/core';

export class LockTarget {
  readonly target: string;

  constructor(target: InstanceType<any>, id?: string) {
    this.target = `${getClassName(target)}/${id}`;
  }
}
