import { Character } from '@domain/entities/Character';
import { Inventory } from '@domain/entities/Inventory';
import { Item, ItemType, ItemRarity } from '@domain/entities/Item';
import { EventBus, GameEventType, ItemCraftedEvent, InventoryChangedEvent } from '@application/events/EventBus';

/**
 * Crafting recipe definition
 */
export interface ICraftingRecipe {
  id: string;
  name: string;
  description: string;
  resultItem: {
    id: string;
    name: string;
    type: ItemType;
    rarity: ItemRarity;
    effects?: Record<string, number>;
  };
  requiredMaterials: Map<string, number>;
  requiredSkillLevel?: number;
  craftingTime: number; // in seconds
}

/**
 * Result of a crafting attempt
 */
export interface ICraftingResult {
  success: boolean;
  item: Item | null;
  message: string;
  missingMaterials?: Array<{ itemId: string; needed: number; has: number }>;
}

/**
 * Use case for crafting items from materials
 */
export class CraftItemUseCase {
  private eventBus: EventBus | null;

  constructor(
    private character: Character,
    private inventory: Inventory,
    eventBus?: EventBus
  ) {
    this.eventBus = eventBus ?? null;
  }

  /**
   * Update character reference (since Character uses immutable updates)
   */
  setCharacter(character: Character): void {
    this.character = character;
  }

  /**
   * Attempt to craft an item using a recipe
   */
  execute(recipe: ICraftingRecipe): ICraftingResult {
    if (!this.character.isAlive) {
      return {
        success: false,
        item: null,
        message: 'Character is dead and cannot craft items',
      };
    }

    const staminaCost = recipe.craftingTime * 2;
    if (!this.character.canUseStamina(staminaCost)) {
      return {
        success: false,
        item: null,
        message: 'Not enough stamina to craft this item',
      };
    }

    const materialsCheck = this.checkMaterials(recipe.requiredMaterials);
    if (!materialsCheck.hasAll) {
      return {
        success: false,
        item: null,
        message: 'Missing required materials',
        missingMaterials: materialsCheck.missing,
      };
    }

    // Consume materials
    this.consumeMaterials(recipe.requiredMaterials);

    // Use stamina
    this.character.useStamina(staminaCost);

    // Create crafted item
    const craftedItem = this.createCraftedItem(recipe);

    // Add to inventory
    const addResult = this.inventory.addItem(craftedItem);
    if (!addResult.success) {
      return {
        success: false,
        item: null,
        message: 'Inventory full - cannot add crafted item',
      };
    }

    // Publish events
    if (this.eventBus) {
      this.eventBus.publish<ItemCraftedEvent>({
        type: GameEventType.ITEM_CRAFTED,
        itemId: recipe.resultItem.id,
        itemName: recipe.name,
      });
      this.eventBus.publish<InventoryChangedEvent>({
        type: GameEventType.INVENTORY_CHANGED,
      });
    }

    return {
      success: true,
      item: craftedItem,
      message: `Successfully crafted ${recipe.name}`,
    };
  }

  private checkMaterials(requiredMaterials: Map<string, number>): {
    hasAll: boolean;
    missing: Array<{ itemId: string; needed: number; has: number }>;
  } {
    const missing: Array<{ itemId: string; needed: number; has: number }> = [];

    for (const [itemId, needed] of requiredMaterials) {
      const has = this.inventory.countItem(itemId);
      if (has < needed) {
        missing.push({ itemId, needed, has });
      }
    }

    return {
      hasAll: missing.length === 0,
      missing,
    };
  }

  private consumeMaterials(requiredMaterials: Map<string, number>): void {
    for (const [itemId, quantity] of requiredMaterials) {
      let remaining = quantity;

      for (const slot of this.inventory.getAllSlots()) {
        if (slot.item && slot.item.id === itemId && remaining > 0) {
          const toRemove = Math.min(remaining, slot.item.quantity);
          this.inventory.removeItemAt(slot.slotIndex, toRemove);
          remaining -= toRemove;
        }

        if (remaining === 0) break;
      }
    }
  }

  private createCraftedItem(recipe: ICraftingRecipe): Item {
    return Item.create({
      id: recipe.resultItem.id,
      name: recipe.resultItem.name,
      description: recipe.description,
      type: recipe.resultItem.type,
      rarity: recipe.resultItem.rarity,
      maxStack: recipe.resultItem.type === ItemType.MATERIAL ? 20 : 1,
      weight: 1,
      isConsumable: recipe.resultItem.type === ItemType.FOOD,
      effects: recipe.resultItem.effects ?? null,
      quantity: 1,
    });
  }

  /**
   * Preview what would be crafted without actually crafting
   */
  preview(recipe: ICraftingRecipe): {
    canCraft: boolean;
    reason: string;
    missingMaterials?: Array<{ itemId: string; needed: number; has: number }>;
  } {
    if (!this.character.isAlive) {
      return { canCraft: false, reason: 'Character is dead' };
    }

    const staminaCost = recipe.craftingTime * 2;
    if (!this.character.canUseStamina(staminaCost)) {
      return { canCraft: false, reason: 'Not enough stamina' };
    }

    const materialsCheck = this.checkMaterials(recipe.requiredMaterials);
    if (!materialsCheck.hasAll) {
      return {
        canCraft: false,
        reason: 'Missing materials',
        missingMaterials: materialsCheck.missing,
      };
    }

    return { canCraft: true, reason: 'Can craft' };
  }
}

/**
 * Crafting recipes registry
 */
export class CraftingRecipes {
  private static recipes = new Map<string, ICraftingRecipe>([
    [
      'stone_axe',
      {
        id: 'stone_axe',
        name: 'Stone Axe',
        description: 'A basic axe made from stone and wood',
        resultItem: {
          id: 'stone_axe',
          name: 'Stone Axe',
          type: ItemType.TOOL,
          rarity: ItemRarity.COMMON,
        },
        requiredMaterials: new Map([
          ['wood', 3],
          ['stone', 2],
        ]),
        craftingTime: 5,
      },
    ],
    [
      'campfire',
      {
        id: 'campfire',
        name: 'Campfire',
        description: 'Provides warmth and light',
        resultItem: {
          id: 'campfire',
          name: 'Campfire',
          type: ItemType.MATERIAL,
          rarity: ItemRarity.COMMON,
        },
        requiredMaterials: new Map([
          ['wood', 5],
          ['stone', 3],
        ]),
        craftingTime: 10,
      },
    ],
    [
      'cooked_meat',
      {
        id: 'cooked_meat',
        name: 'Cooked Meat',
        description: 'Restores hunger',
        resultItem: {
          id: 'cooked_meat',
          name: 'Cooked Meat',
          type: ItemType.FOOD,
          rarity: ItemRarity.COMMON,
          effects: { hungerRestore: 40 },
        },
        requiredMaterials: new Map([['raw_meat', 1]]),
        craftingTime: 3,
      },
    ],
  ]);

  static getRecipe(id: string): ICraftingRecipe | undefined {
    return this.recipes.get(id);
  }

  static getAllRecipes(): ICraftingRecipe[] {
    return Array.from(this.recipes.values());
  }

  static getRecipesByType(type: ItemType): ICraftingRecipe[] {
    return Array.from(this.recipes.values()).filter((recipe) => recipe.resultItem.type === type);
  }
}
