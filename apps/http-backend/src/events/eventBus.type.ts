export interface IEventBus {
  emit<T = any>(event: string, payload?: T): void;
  on<T = any>(event: string, listener: (payload: T) => void): void;
}
