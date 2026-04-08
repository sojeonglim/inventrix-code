import { EventEmitter } from 'events';
import { DomainEvent, EventType } from './events.js';
import { logger } from '../logger/logger.js';

class EventBus {
  private emitter = new EventEmitter();

  emit<T extends DomainEvent>(event: T): void {
    logger.info({ eventType: event.type, eventData: event }, 'Event emitted');
    this.emitter.emit(event.type, event);
  }

  on<T extends DomainEvent>(eventType: EventType, handler: (event: T) => Promise<void>): void {
    this.emitter.on(eventType, (event: T) => {
      handler(event).catch((err) => {
        logger.error({ err, eventType }, 'Event handler failed');
      });
    });
  }

  off(eventType: EventType, handler: (...args: unknown[]) => void): void {
    this.emitter.off(eventType, handler);
  }
}

export const eventBus = new EventBus();
