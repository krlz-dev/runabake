import { EventBus, GameEventType, WeatherChangedEvent } from '@application/events/EventBus';
import { WeatherType, WEATHER_CONFIG } from '@shared/constants/GameConstants';

/**
 * Weather state machine with weighted random transitions.
 * Manages weather changes, transition interpolation, and environment modifiers.
 */
export class WeatherService {
  private currentWeather: WeatherType = WeatherType.CLEAR;
  private targetWeather: WeatherType = WeatherType.CLEAR;
  private intensity: number = 0; // 0 = none, 1 = full
  private transitionProgress: number = 1; // 1 = fully transitioned
  private timeUntilChange: number;
  private isNight: boolean = false;
  private eventBus: EventBus;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.timeUntilChange = this.randomDuration();
  }

  update(deltaTime: number): void {
    // Handle weather transition interpolation
    if (this.transitionProgress < 1) {
      this.transitionProgress = Math.min(
        1,
        this.transitionProgress + deltaTime / WEATHER_CONFIG.TRANSITION_DURATION
      );
      this.intensity = this.transitionProgress;

      if (this.transitionProgress >= 1) {
        this.currentWeather = this.targetWeather;
      }
    }

    // Count down to next weather change
    this.timeUntilChange -= deltaTime;
    if (this.timeUntilChange <= 0) {
      this.changeWeather();
      this.timeUntilChange = this.randomDuration();
    }

    this.publishEvent();
  }

  /**
   * Set night flag (affects blizzard probability)
   */
  setNight(isNight: boolean): void {
    this.isNight = isNight;
  }

  getWeather(): WeatherType {
    return this.transitionProgress >= 1 ? this.currentWeather : this.targetWeather;
  }

  getIntensity(): number {
    return this.intensity;
  }

  getTemperatureModifier(): number {
    const currentMod = this.getModifiers(this.currentWeather).temperature;
    const targetMod = this.getModifiers(this.targetWeather).temperature;
    return currentMod + (targetMod - currentMod) * this.transitionProgress;
  }

  getMovementModifier(): number {
    const currentMod = this.getModifiers(this.currentWeather).movement;
    const targetMod = this.getModifiers(this.targetWeather).movement;
    return currentMod + (targetMod - currentMod) * this.transitionProgress;
  }

  getVisibility(): number {
    const currentVis = this.getModifiers(this.currentWeather).visibility;
    const targetVis = this.getModifiers(this.targetWeather).visibility;
    return currentVis + (targetVis - currentVis) * this.transitionProgress;
  }

  private changeWeather(): void {
    const weights = this.getTransitionWeights(this.currentWeather);
    this.targetWeather = this.weightedRandom(weights);
    this.transitionProgress = 0;
    this.intensity = 0;
  }

  private getTransitionWeights(from: WeatherType): Map<WeatherType, number> {
    const weatherOrder = [WeatherType.CLEAR, WeatherType.CLOUDY, WeatherType.SNOWING, WeatherType.BLIZZARD];
    const key = from.toUpperCase() as keyof typeof WEATHER_CONFIG.TRANSITION_WEIGHTS;
    const rawWeights = WEATHER_CONFIG.TRANSITION_WEIGHTS[key];

    const weights = new Map<WeatherType, number>();
    weatherOrder.forEach((w, i) => {
      let weight = rawWeights[i] ?? 0;
      // Increase blizzard chance at night
      if (w === WeatherType.BLIZZARD && this.isNight) {
        weight += WEATHER_CONFIG.NIGHT_BLIZZARD_BONUS;
      }
      weights.set(w, weight);
    });

    return weights;
  }

  private weightedRandom(weights: Map<WeatherType, number>): WeatherType {
    let total = 0;
    for (const w of weights.values()) total += w;

    let random = Math.random() * total;
    for (const [weather, weight] of weights) {
      random -= weight;
      if (random <= 0) return weather;
    }

    return WeatherType.CLEAR;
  }

  private getModifiers(weather: WeatherType): { temperature: number; movement: number; visibility: number } {
    const key = weather.toUpperCase() as keyof typeof WEATHER_CONFIG.MODIFIERS;
    return WEATHER_CONFIG.MODIFIERS[key];
  }

  private randomDuration(): number {
    return WEATHER_CONFIG.MIN_DURATION +
      Math.random() * (WEATHER_CONFIG.MAX_DURATION - WEATHER_CONFIG.MIN_DURATION);
  }

  private publishEvent(): void {
    const event: WeatherChangedEvent = {
      type: GameEventType.WEATHER_CHANGED,
      weather: this.getWeather(),
      intensity: this.intensity,
      temperatureModifier: this.getTemperatureModifier(),
      movementModifier: this.getMovementModifier(),
      visibility: this.getVisibility(),
    };
    this.eventBus.publish(event);
  }
}
