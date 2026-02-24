import { EntityId } from './Character';

/**
 * Item types available in the game
 */
export enum ItemType {
  TOOL = 'tool',
  WEAPON = 'weapon',
  FOOD = 'food',
  MATERIAL = 'material',
  CLOTHING = 'clothing',
  CONSUMABLE = 'consumable',
}

/**
 * Item rarity levels
 */
export enum ItemRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
}

/**
 * Effects that items can have when used
 */
export interface IItemEffect {
  healthRestore?: number;
  hungerRestore?: number;
  thirstRestore?: number;
  temperatureChange?: number;
  staminaRestore?: number;
}

/**
 * Item entity representing any collectible object in the game
 */
export class Item {
  private constructor(
    public readonly id: EntityId,
    public readonly name: string,
    public readonly description: string,
    public readonly type: ItemType,
    public readonly rarity: ItemRarity,
    public readonly maxStack: number,
    public readonly weight: number,
    public readonly modelPath: string,
    public readonly iconPath: string,
    public readonly isConsumable: boolean,
    public readonly effects: IItemEffect | null,
    public readonly craftingMaterials: Map<string, number> | null,
    private _quantity: number = 1
  ) {
    if (_quantity < 0 || _quantity > maxStack) {
      throw new Error(`Invalid quantity: ${_quantity}. Must be between 0 and ${maxStack}`);
    }
  }

  static create(params: {
    id: EntityId;
    name: string;
    description: string;
    type: ItemType;
    rarity?: ItemRarity;
    maxStack?: number;
    weight?: number;
    modelPath?: string;
    iconPath?: string;
    isConsumable?: boolean;
    effects?: IItemEffect | null;
    craftingMaterials?: Map<string, number> | null;
    quantity?: number;
  }): Item {
    return new Item(
      params.id,
      params.name,
      params.description,
      params.type,
      params.rarity ?? ItemRarity.COMMON,
      params.maxStack ?? 1,
      params.weight ?? 1,
      params.modelPath ?? '',
      params.iconPath ?? '',
      params.isConsumable ?? false,
      params.effects ?? null,
      params.craftingMaterials ?? null,
      params.quantity ?? 1
    );
  }

  get quantity(): number {
    return this._quantity;
  }

  /**
   * Check if item can be stacked
   */
  isStackable(): boolean {
    return this.maxStack > 1;
  }

  /**
   * Check if stack is full
   */
  isStackFull(): boolean {
    return this._quantity >= this.maxStack;
  }

  /**
   * Add to stack
   */
  addToStack(amount: number): Item {
    const newQuantity = Math.min(this._quantity + amount, this.maxStack);
    this._quantity = newQuantity;
    return this;
  }

  /**
   * Remove from stack
   */
  removeFromStack(amount: number): Item {
    const newQuantity = Math.max(this._quantity - amount, 0);
    this._quantity = newQuantity;
    return this;
  }

  /**
   * Split stack into two items
   */
  split(amount: number): { original: Item; split: Item } | null {
    if (amount <= 0 || amount >= this._quantity) {
      return null;
    }

    this._quantity -= amount;

    const splitItem = Item.create({
      id: `${this.id}_split_${Date.now()}`,
      name: this.name,
      description: this.description,
      type: this.type,
      rarity: this.rarity,
      maxStack: this.maxStack,
      weight: this.weight,
      modelPath: this.modelPath,
      iconPath: this.iconPath,
      isConsumable: this.isConsumable,
      effects: this.effects,
      craftingMaterials: this.craftingMaterials,
      quantity: amount,
    });

    return { original: this, split: splitItem };
  }

  /**
   * Check if two items can be stacked together
   */
  canStackWith(other: Item): boolean {
    return (
      this.id === other.id &&
      this.name === other.name &&
      this.type === other.type &&
      this.isStackable() &&
      !this.isStackFull()
    );
  }

  /**
   * Get total weight of item stack
   */
  getTotalWeight(): number {
    return this.weight * this._quantity;
  }

  /**
   * Serialize item for persistence
   */
  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      type: this.type,
      rarity: this.rarity,
      maxStack: this.maxStack,
      weight: this.weight,
      modelPath: this.modelPath,
      iconPath: this.iconPath,
      isConsumable: this.isConsumable,
      effects: this.effects,
      craftingMaterials: this.craftingMaterials
        ? Array.from(this.craftingMaterials.entries())
        : null,
      quantity: this._quantity,
    };
  }

  /**
   * Deserialize item from saved data
   */
  static fromJSON(data: Record<string, unknown>): Item {
    const craftingMaterials = data['craftingMaterials']
      ? new Map(data['craftingMaterials'] as Array<[string, number]>)
      : null;

    return Item.create({
      id: data['id'] as EntityId,
      name: data['name'] as string,
      description: data['description'] as string,
      type: data['type'] as ItemType,
      rarity: (data['rarity'] as ItemRarity) ?? ItemRarity.COMMON,
      maxStack: (data['maxStack'] as number) ?? 1,
      weight: (data['weight'] as number) ?? 1,
      modelPath: (data['modelPath'] as string) ?? '',
      iconPath: (data['iconPath'] as string) ?? '',
      isConsumable: (data['isConsumable'] as boolean) ?? false,
      effects: (data['effects'] as IItemEffect) ?? null,
      craftingMaterials,
      quantity: (data['quantity'] as number) ?? 1,
    });
  }
}
