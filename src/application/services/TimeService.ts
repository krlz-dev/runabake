import { EventBus, GameEventType, TimeChangedEvent } from '@application/events/EventBus';
import { GAME_CONFIG, TIME_CONFIG, TimeOfDay } from '@shared/constants/GameConstants';

/**
 * Manages the day/night cycle with normalized time tracking.
 * Pure application logic - no rendering dependencies.
 */
export class TimeService {
  private normalizedTime: number = 0.333; // Start at morning (8 AM)
  private eventBus: EventBus;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  /**
   * Advance time by deltaTime seconds
   */
  update(deltaTime: number): void {
    const timeIncrement = deltaTime / GAME_CONFIG.DAY_CYCLE_DURATION;
    this.normalizedTime = (this.normalizedTime + timeIncrement) % 1.0;

    const event: TimeChangedEvent = {
      type: GameEventType.TIME_CHANGED,
      normalizedTime: this.normalizedTime,
      timeOfDay: this.getTimeOfDay(),
      hours: this.getHours(),
      environmentTemperature: this.getEnvironmentTemperature(),
    };

    this.eventBus.publish(event);
  }

  /**
   * Get current time of day segment
   */
  getTimeOfDay(): TimeOfDay {
    const t = this.normalizedTime;
    const s = TIME_CONFIG.SEGMENTS;

    if (t >= s.DAWN_START && t < s.DAY_START) return TimeOfDay.DAWN;
    if (t >= s.DAY_START && t < s.DUSK_START) return TimeOfDay.DAY;
    if (t >= s.DUSK_START && t < s.NIGHT_START) return TimeOfDay.DUSK;
    return TimeOfDay.NIGHT;
  }

  /**
   * Get environment base temperature for current time segment
   */
  getEnvironmentTemperature(): number {
    const timeOfDay = this.getTimeOfDay();
    switch (timeOfDay) {
      case TimeOfDay.DAWN:
        return TIME_CONFIG.TEMPERATURES.DAWN;
      case TimeOfDay.DAY:
        return TIME_CONFIG.TEMPERATURES.DAY;
      case TimeOfDay.DUSK:
        return TIME_CONFIG.TEMPERATURES.DUSK;
      case TimeOfDay.NIGHT:
        return TIME_CONFIG.TEMPERATURES.NIGHT;
    }
  }

  /**
   * Get current hour (0-24 format)
   */
  getHours(): number {
    return this.normalizedTime * 24;
  }

  /**
   * Get raw normalized time (0-1)
   */
  getNormalizedTime(): number {
    return this.normalizedTime;
  }

  /**
   * Check if it's currently nighttime
   */
  isNight(): boolean {
    const tod = this.getTimeOfDay();
    return tod === TimeOfDay.NIGHT;
  }

  /**
   * Format time as HH:MM string
   */
  getFormattedTime(): string {
    const totalHours = this.normalizedTime * 24;
    const hours = Math.floor(totalHours);
    const minutes = Math.floor((totalHours - hours) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
}
