import type { ReceiveType } from '@deepkit/type';

export const ReceiveTypesStore = new Map<string, ReceiveType<any>>();

export const EventTypesStore = new Map<string, ReceiveType<any>>();

export const CommandTypesStore = new Map<string, ReceiveType<any>>();

export class AllReceiveTypesStore
  implements Pick<Map<string, ReceiveType<any>>, 'get'>
{
  get<T>(key: string): ReceiveType<T> | undefined {
    const eventType = EventTypesStore.get(key);
    const commandType = CommandTypesStore.get(key);
    return eventType || commandType;
  }
}
