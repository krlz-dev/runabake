/**
 * Types of gatherable resources in the world
 */
export enum ResourceType {
  TREE = 'tree',
  ROCK = 'rock',
  BUSH = 'bush',
}

/**
 * A single drop from a resource
 */
export interface IResourceDrop {
  itemId: string;
  itemName: string;
  minQuantity: number;
  maxQuantity: number;
  dropChance: number; // 0-1
}

/**
 * Configuration for a resource type
 */
export interface IResourceConfig {
  type: ResourceType;
  name: string;
  health: number;
  drops: IResourceDrop[];
  requiredTool: string | null; // null = can gather by hand
  gatherTime: number; // seconds per hit
  staminaCost: number;
  respawnTime: number; // seconds
}

/**
 * A gatherable resource instance in the world
 */
export class Resource {
  readonly id: string;
  readonly config: IResourceConfig;
  private _health: number;
  private _isDepleted: boolean = false;
  private _respawnTimer: number = 0;

  constructor(id: string, config: IResourceConfig) {
    this.id = id;
    this.config = config;
    this._health = config.health;
  }

  get health(): number {
    return this._health;
  }

  get isDepleted(): boolean {
    return this._isDepleted;
  }

  get respawnTimer(): number {
    return this._respawnTimer;
  }

  /**
   * Hit the resource. Returns drops if resource is depleted, empty array otherwise.
   */
  hit(toolId: string | null): IResourceDrop[] {
    if (this._isDepleted) return [];

    // Check tool requirement
    if (this.config.requiredTool && toolId !== this.config.requiredTool) {
      // Can still gather without tool, just slower (handled by caller)
    }

    this._health -= 1;

    if (this._health <= 0) {
      this._isDepleted = true;
      this._respawnTimer = this.config.respawnTime;
      return this.rollDrops();
    }

    return [];
  }

  /**
   * Update respawn timer
   */
  updateRespawn(deltaTime: number): boolean {
    if (!this._isDepleted) return false;

    this._respawnTimer -= deltaTime;
    if (this._respawnTimer <= 0) {
      this.respawn();
      return true;
    }
    return false;
  }

  /**
   * Reset resource to full health
   */
  respawn(): void {
    this._health = this.config.health;
    this._isDepleted = false;
    this._respawnTimer = 0;
  }

  private rollDrops(): IResourceDrop[] {
    const drops: IResourceDrop[] = [];
    for (const drop of this.config.drops) {
      if (Math.random() <= drop.dropChance) {
        drops.push({
          ...drop,
          // Roll actual quantity within range
          minQuantity: Math.floor(
            drop.minQuantity + Math.random() * (drop.maxQuantity - drop.minQuantity + 1)
          ),
          maxQuantity: Math.floor(
            drop.minQuantity + Math.random() * (drop.maxQuantity - drop.minQuantity + 1)
          ),
        });
      }
    }
    return drops;
  }
}
