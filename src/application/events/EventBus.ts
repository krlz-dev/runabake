/**
 * Game event types
 */
export enum GameEventType {
  TIME_CHANGED = 'TIME_CHANGED',
  WEATHER_CHANGED = 'WEATHER_CHANGED',
  ITEM_COLLECTED = 'ITEM_COLLECTED',
  INVENTORY_CHANGED = 'INVENTORY_CHANGED',
  ITEM_CRAFTED = 'ITEM_CRAFTED',
}

export interface TimeChangedEvent {
  type: GameEventType.TIME_CHANGED;
  normalizedTime: number; // 0-1 (0=midnight, 0.5=noon)
  timeOfDay: string;
  hours: number;
  environmentTemperature: number;
}

export interface WeatherChangedEvent {
  type: GameEventType.WEATHER_CHANGED;
  weather: string;
  intensity: number; // 0-1
  temperatureModifier: number;
  movementModifier: number;
  visibility: number;
}

export interface ItemCollectedEvent {
  type: GameEventType.ITEM_COLLECTED;
  itemId: string;
  itemName: string;
  quantity: number;
}

export interface InventoryChangedEvent {
  type: GameEventType.INVENTORY_CHANGED;
}

export interface ItemCraftedEvent {
  type: GameEventType.ITEM_CRAFTED;
  itemId: string;
  itemName: string;
}

export type GameEvent =
  | TimeChangedEvent
  | WeatherChangedEvent
  | ItemCollectedEvent
  | InventoryChangedEvent
  | ItemCraftedEvent;

type EventCallback<T extends GameEvent> = (event: T) => void;

/**
 * Typed pub/sub event bus for loose coupling between game systems
 */
export class EventBus {
  private listeners = new Map<GameEventType, Set<EventCallback<GameEvent>>>();

  subscribe<T extends GameEvent>(
    type: T['type'],
    callback: EventCallback<T>
  ): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }

    const callbacks = this.listeners.get(type)!;
    const wrappedCallback = callback as EventCallback<GameEvent>;
    callbacks.add(wrappedCallback);

    // Return unsubscribe function
    return () => {
      callbacks.delete(wrappedCallback);
    };
  }

  publish<T extends GameEvent>(event: T): void {
    const callbacks = this.listeners.get(event.type);
    if (callbacks) {
      for (const callback of callbacks) {
        callback(event);
      }
    }
  }

  clear(): void {
    this.listeners.clear();
  }
}
