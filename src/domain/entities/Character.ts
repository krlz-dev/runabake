import { Stats } from '../value-objects/Stats';
import { Position } from '../value-objects/Position';
import { CharacterClass } from '@shared/constants/GameConstants';

/**
 * Unique identifier for game entities
 */
export type EntityId = string;

/**
 * Character entity representing a playable survivor
 * Pure domain logic - no framework dependencies
 */
export class Character {
  private constructor(
    public readonly id: EntityId,
    public readonly characterClass: CharacterClass,
    public readonly name: string,
    private _stats: Stats,
    private _position: Position,
    private _isAlive: boolean = true
  ) {}

  static create(
    id: EntityId,
    characterClass: CharacterClass,
    name: string,
    stats: Stats,
    position: Position = Position.zero()
  ): Character {
    return new Character(id, characterClass, name, stats, position);
  }

  // Getters
  get stats(): Stats {
    return this._stats;
  }

  get position(): Position {
    return this._position;
  }

  get isAlive(): boolean {
    return this._isAlive;
  }

  /**
   * Update character stats
   */
  updateStats(newStats: Stats): Character {
    this._stats = newStats;
    this._isAlive = newStats.isAlive();
    return this;
  }

  /**
   * Move character to new position
   */
  moveTo(newPosition: Position): Character {
    this._position = newPosition;
    return this;
  }

  /**
   * Apply damage to character
   */
  takeDamage(amount: number): Character {
    const newStats = this._stats.withHealth(this._stats.health - amount);
    return this.updateStats(newStats);
  }

  /**
   * Heal character
   */
  heal(amount: number): Character {
    const newStats = this._stats.withHealth(this._stats.health + amount);
    return this.updateStats(newStats);
  }

  /**
   * Consume food to restore hunger
   */
  eat(amount: number): Character {
    const newStats = this._stats.withHunger(this._stats.hunger + amount);
    return this.updateStats(newStats);
  }

  /**
   * Drink to restore thirst
   */
  drink(amount: number): Character {
    const newStats = this._stats.withThirst(this._stats.thirst + amount);
    return this.updateStats(newStats);
  }

  /**
   * Update body temperature
   */
  updateTemperature(newTemp: number): Character {
    const newStats = this._stats.withTemperature(newTemp);
    return this.updateStats(newStats);
  }

  /**
   * Use stamina (e.g., for sprinting)
   */
  useStamina(amount: number): Character {
    const newStats = this._stats.withStamina(this._stats.stamina - amount);
    return this.updateStats(newStats);
  }

  /**
   * Regenerate stamina
   */
  regenStamina(amount: number): Character {
    const newStats = this._stats.withStamina(this._stats.stamina + amount);
    return this.updateStats(newStats);
  }

  /**
   * Check if character can perform an action requiring stamina
   */
  canUseStamina(amount: number): boolean {
    return this._stats.stamina >= amount;
  }

  /**
   * Get character status summary
   */
  getStatusSummary(): {
    isAlive: boolean;
    isCritical: boolean;
    needsFood: boolean;
    needsWater: boolean;
    needsWarmth: boolean;
  } {
    return {
      isAlive: this._isAlive,
      isCritical: this._stats.health <= 20,
      needsFood: this._stats.isStarving(),
      needsWater: this._stats.isDehydrated(),
      needsWarmth: this._stats.isCriticallyHot(),
    };
  }

  /**
   * Serialize character for persistence
   */
  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      characterClass: this.characterClass,
      name: this.name,
      stats: {
        health: this._stats.health,
        maxHealth: this._stats.maxHealth,
        hunger: this._stats.hunger,
        maxHunger: this._stats.maxHunger,
        thirst: this._stats.thirst,
        maxThirst: this._stats.maxThirst,
        temperature: this._stats.temperature,
        stamina: this._stats.stamina,
        maxStamina: this._stats.maxStamina,
      },
      position: {
        x: this._position.x,
        y: this._position.y,
        z: this._position.z,
      },
      isAlive: this._isAlive,
    };
  }

  /**
   * Deserialize character from saved data
   */
  static fromJSON(data: Record<string, unknown>): Character {
    const statsData = data['stats'] as Record<string, number>;
    const posData = data['position'] as Record<string, number>;

    const stats = Stats.create(
      statsData['health'] ?? 100,
      statsData['maxHealth'] ?? 100,
      statsData['hunger'] ?? 100,
      statsData['maxHunger'] ?? 100,
      statsData['thirst'] ?? 100,
      statsData['maxThirst'] ?? 100,
      statsData['temperature'] ?? 37,
      statsData['stamina'] ?? 100,
      statsData['maxStamina'] ?? 100
    );

    const position = Position.create(
      posData['x'] ?? 0,
      posData['y'] ?? 0,
      posData['z'] ?? 0
    );

    return new Character(
      data['id'] as EntityId,
      data['characterClass'] as CharacterClass,
      data['name'] as string,
      stats,
      position,
      (data['isAlive'] as boolean) ?? true
    );
  }
}
