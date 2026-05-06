import { EventEmitter } from "events";
import { IEventBus } from "./eventBus.type.js";

export class EventBus implements IEventBus {
  private emitter = new EventEmitter();

  emit(event: string, payload?: any) {
    this.emitter.emit(event, payload);
  }

  on(event: string, listener: (...args: any[]) => void) {
    this.emitter.on(event, listener);
  }
}

export const eventBus = new EventBus();
