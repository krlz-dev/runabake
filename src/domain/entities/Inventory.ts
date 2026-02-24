import { Item } from './Item';
import { EntityId } from './Character';

/**
 * Inventory slot structure
 */
export interface IInventorySlot {
  item: Item | null;
  slotIndex: number;
}

/**
 * Inventory entity managing character items
 */
export class Inventory {
  private slots: Map<number, Item | null>;

  private constructor(
    public readonly id: EntityId,
    public readonly maxSlots: number,
    public readonly maxWeight: number,
    initialItems: Map<number, Item> = new Map()
  ) {
    this.slots = new Map();
    for (let i = 0; i < maxSlots; i++) {
      this.slots.set(i, initialItems.get(i) ?? null);
    }
  }

  static create(id: EntityId, maxSlots: number = 20, maxWeight: number = 100): Inventory {
    return new Inventory(id, maxSlots, maxWeight);
  }

  /**
   * Get item at specific slot
   */
  getItemAt(slotIndex: number): Item | null {
    if (slotIndex < 0 || slotIndex >= this.maxSlots) {
      throw new Error(`Invalid slot index: ${slotIndex}`);
    }
    return this.slots.get(slotIndex) ?? null;
  }

  /**
   * Get all items in inventory
   */
  getAllItems(): Item[] {
    return Array.from(this.slots.values()).filter((item): item is Item => item !== null);
  }

  /**
   * Get all inventory slots
   */
  getAllSlots(): IInventorySlot[] {
    return Array.from(this.slots.entries()).map(([slotIndex, item]) => ({
      item,
      slotIndex,
    }));
  }

  /**
   * Get current total weight
   */
  getCurrentWeight(): number {
    return this.getAllItems().reduce((total, item) => total + item.getTotalWeight(), 0);
  }

  /**
   * Check if inventory has space for an item
   */
  hasSpaceFor(item: Item): boolean {
    // Check if there's an existing stack we can add to
    const existingSlot = this.findStackableSlot(item);
    if (existingSlot !== null) {
      return true;
    }

    // Check if there's an empty slot
    if (this.getEmptySlotIndex() !== null) {
      // Check weight constraint
      return this.getCurrentWeight() + item.getTotalWeight() <= this.maxWeight;
    }

    return false;
  }

  /**
   * Add item to inventory
   */
  addItem(item: Item): { success: boolean; remainingItem: Item | null } {
    if (!this.hasSpaceFor(item)) {
      return { success: false, remainingItem: item };
    }

    // Try to stack with existing items
    const stackableSlot = this.findStackableSlot(item);
    if (stackableSlot !== null) {
      const existingItem = this.slots.get(stackableSlot);
      if (existingItem && existingItem.canStackWith(item)) {
        const spaceInStack = existingItem.maxStack - existingItem.quantity;
        const amountToAdd = Math.min(item.quantity, spaceInStack);

        existingItem.addToStack(amountToAdd);
        const remaining = item.quantity - amountToAdd;

        if (remaining > 0) {
          item.removeFromStack(amountToAdd);
          return this.addItem(item); // Recursive call for remaining items
        }

        return { success: true, remainingItem: null };
      }
    }

    // Add to empty slot
    const emptySlot = this.getEmptySlotIndex();
    if (emptySlot !== null) {
      this.slots.set(emptySlot, item);
      return { success: true, remainingItem: null };
    }

    return { success: false, remainingItem: item };
  }

  /**
   * Remove item from specific slot
   */
  removeItemAt(slotIndex: number, amount: number = 1): Item | null {
    const item = this.getItemAt(slotIndex);
    if (!item) {
      return null;
    }

    if (amount >= item.quantity) {
      this.slots.set(slotIndex, null);
      return item;
    }

    const removedItem = Item.create({
      id: `${item.id}_removed_${Date.now()}`,
      name: item.name,
      description: item.description,
      type: item.type,
      rarity: item.rarity,
      maxStack: item.maxStack,
      weight: item.weight,
      modelPath: item.modelPath,
      iconPath: item.iconPath,
      isConsumable: item.isConsumable,
      effects: item.effects,
      craftingMaterials: item.craftingMaterials,
      quantity: amount,
    });

    item.removeFromStack(amount);
    return removedItem;
  }

  /**
   * Move item from one slot to another
   */
  moveItem(fromSlot: number, toSlot: number): boolean {
    const fromItem = this.getItemAt(fromSlot);
    const toItem = this.getItemAt(toSlot);

    if (!fromItem) {
      return false;
    }

    // If target slot is empty, simple move
    if (!toItem) {
      this.slots.set(toSlot, fromItem);
      this.slots.set(fromSlot, null);
      return true;
    }

    // If items can stack, merge them
    if (fromItem.canStackWith(toItem)) {
      const spaceInStack = toItem.maxStack - toItem.quantity;
      const amountToMove = Math.min(fromItem.quantity, spaceInStack);

      toItem.addToStack(amountToMove);
      fromItem.removeFromStack(amountToMove);

      if (fromItem.quantity === 0) {
        this.slots.set(fromSlot, null);
      }
      return true;
    }

    // Otherwise, swap items
    this.slots.set(fromSlot, toItem);
    this.slots.set(toSlot, fromItem);
    return true;
  }

  /**
   * Find first slot with stackable item
   */
  private findStackableSlot(item: Item): number | null {
    for (const [slotIndex, existingItem] of this.slots.entries()) {
      if (existingItem && existingItem.canStackWith(item)) {
        return slotIndex;
      }
    }
    return null;
  }

  /**
   * Find first empty slot
   */
  private getEmptySlotIndex(): number | null {
    for (const [slotIndex, item] of this.slots.entries()) {
      if (item === null) {
        return slotIndex;
      }
    }
    return null;
  }

  /**
   * Check if inventory contains specific item
   */
  hasItem(itemId: string, minQuantity: number = 1): boolean {
    const totalQuantity = this.getAllItems()
      .filter((item) => item.id === itemId)
      .reduce((sum, item) => sum + item.quantity, 0);

    return totalQuantity >= minQuantity;
  }

  /**
   * Count total quantity of specific item
   */
  countItem(itemId: string): number {
    return this.getAllItems()
      .filter((item) => item.id === itemId)
      .reduce((sum, item) => sum + item.quantity, 0);
  }

  /**
   * Serialize inventory for persistence
   */
  toJSON(): Record<string, unknown> {
    const itemsArray = Array.from(this.slots.entries())
      .filter(([_, item]) => item !== null)
      .map(([slotIndex, item]) => ({
        slotIndex,
        item: item?.toJSON(),
      }));

    return {
      id: this.id,
      maxSlots: this.maxSlots,
      maxWeight: this.maxWeight,
      items: itemsArray,
    };
  }

  /**
   * Deserialize inventory from saved data
   */
  static fromJSON(data: Record<string, unknown>): Inventory {
    const itemsArray = data['items'] as Array<{ slotIndex: number; item: Record<string, unknown> }>;
    const itemsMap = new Map<number, Item>();

    itemsArray.forEach(({ slotIndex, item }) => {
      itemsMap.set(slotIndex, Item.fromJSON(item));
    });

    return new Inventory(
      data['id'] as EntityId,
      (data['maxSlots'] as number) ?? 20,
      (data['maxWeight'] as number) ?? 100,
      itemsMap
    );
  }
}
