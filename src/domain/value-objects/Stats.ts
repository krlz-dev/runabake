/**
 * Immutable value object representing survival statistics
 */
export class Stats {
  private constructor(
    public readonly health: number,
    public readonly maxHealth: number,
    public readonly hunger: number,
    public readonly maxHunger: number,
    public readonly thirst: number,
    public readonly maxThirst: number,
    public readonly temperature: number,
    public readonly stamina: number,
    public readonly maxStamina: number
  ) {
    this.validateStats();
  }

  private validateStats(): void {
    if (this.health < 0 || this.health > this.maxHealth) {
      throw new Error('Health must be between 0 and maxHealth');
    }
    if (this.hunger < 0 || this.hunger > this.maxHunger) {
      throw new Error('Hunger must be between 0 and maxHunger');
    }
    if (this.thirst < 0 || this.thirst > this.maxThirst) {
      throw new Error('Thirst must be between 0 and maxThirst');
    }
    if (this.stamina < 0 || this.stamina > this.maxStamina) {
      throw new Error('Stamina must be between 0 and maxStamina');
    }
  }

  static create(
    health: number,
    maxHealth: number,
    hunger: number = 100,
    maxHunger: number = 100,
    thirst: number = 100,
    maxThirst: number = 100,
    temperature: number = 37,
    stamina: number = 100,
    maxStamina: number = 100
  ): Stats {
    return new Stats(
      health,
      maxHealth,
      hunger,
      maxHunger,
      thirst,
      maxThirst,
      temperature,
      stamina,
      maxStamina
    );
  }

  /**
   * Returns a new Stats instance with updated health
   */
  withHealth(health: number): Stats {
    return new Stats(
      Math.max(0, Math.min(health, this.maxHealth)),
      this.maxHealth,
      this.hunger,
      this.maxHunger,
      this.thirst,
      this.maxThirst,
      this.temperature,
      this.stamina,
      this.maxStamina
    );
  }

  /**
   * Returns a new Stats instance with updated hunger
   */
  withHunger(hunger: number): Stats {
    return new Stats(
      this.health,
      this.maxHealth,
      Math.max(0, Math.min(hunger, this.maxHunger)),
      this.maxHunger,
      this.thirst,
      this.maxThirst,
      this.temperature,
      this.stamina,
      this.maxStamina
    );
  }

  /**
   * Returns a new Stats instance with updated thirst
   */
  withThirst(thirst: number): Stats {
    return new Stats(
      this.health,
      this.maxHealth,
      this.hunger,
      this.maxHunger,
      Math.max(0, Math.min(thirst, this.maxThirst)),
      this.maxThirst,
      this.temperature,
      this.stamina,
      this.maxStamina
    );
  }

  /**
   * Returns a new Stats instance with updated temperature
   */
  withTemperature(temperature: number): Stats {
    return new Stats(
      this.health,
      this.maxHealth,
      this.hunger,
      this.maxHunger,
      this.thirst,
      this.maxThirst,
      temperature,
      this.stamina,
      this.maxStamina
    );
  }

  /**
   * Returns a new Stats instance with updated stamina
   */
  withStamina(stamina: number): Stats {
    return new Stats(
      this.health,
      this.maxHealth,
      this.hunger,
      this.maxHunger,
      this.thirst,
      this.maxThirst,
      this.temperature,
      Math.max(0, Math.min(stamina, this.maxStamina)),
      this.maxStamina
    );
  }

  /**
   * Check if character is alive
   */
  isAlive(): boolean {
    return this.health > 0;
  }

  /**
   * Check if character is critically cold (hypothermia risk)
   */
  isCriticallyHot(): boolean {
    return this.temperature < 35 || this.temperature > 40;
  }

  /**
   * Check if character is starving
   */
  isStarving(): boolean {
    return this.hunger <= 20;
  }

  /**
   * Check if character is dehydrated
   */
  isDehydrated(): boolean {
    return this.thirst <= 20;
  }
}
