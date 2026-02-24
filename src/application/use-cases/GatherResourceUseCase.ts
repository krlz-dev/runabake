import { Character } from '@domain/entities/Character';
import { Inventory } from '@domain/entities/Inventory';
import { Resource, IResourceDrop } from '@domain/entities/Resource';
import { Item, ItemType, ItemRarity } from '@domain/entities/Item';
import { EventBus, GameEventType, ItemCollectedEvent, InventoryChangedEvent } from '@application/events/EventBus';

export interface IGatherResult {
  success: boolean;
  message: string;
  drops: Array<{ itemName: string; quantity: number }>;
  resourceDepleted: boolean;
}

/**
 * Use case for gathering resources from the world.
 * Coordinates character stamina, resource health, item creation, and inventory.
 */
export class GatherResourceUseCase {
  constructor(
    private character: Character,
    private inventory: Inventory,
    private eventBus: EventBus
  ) {}

  /**
   * Update character reference (since Character uses immutable updates)
   */
  setCharacter(character: Character): void {
    this.character = character;
  }

  /**
   * Attempt to gather from a resource
   */
  execute(resource: Resource, toolId: string | null = null): IGatherResult {
    // Check alive
    if (!this.character.isAlive) {
      return { success: false, message: 'Character is dead', drops: [], resourceDepleted: false };
    }

    // Check depleted
    if (resource.isDepleted) {
      return { success: false, message: 'Resource is depleted', drops: [], resourceDepleted: true };
    }

    // Check stamina
    if (!this.character.canUseStamina(resource.config.staminaCost)) {
      return { success: false, message: 'Not enough stamina', drops: [], resourceDepleted: false };
    }

    // Use stamina
    this.character.useStamina(resource.config.staminaCost);

    // Hit resource
    const rawDrops = resource.hit(toolId);
    const collectedDrops: Array<{ itemName: string; quantity: number }> = [];

    if (rawDrops.length > 0) {
      // Resource was depleted - create items from drops
      for (const drop of rawDrops) {
        const quantity = drop.minQuantity; // Already rolled in Resource.rollDrops
        const item = this.createItemFromDrop(drop, quantity);
        const addResult = this.inventory.addItem(item);

        if (addResult.success) {
          collectedDrops.push({ itemName: drop.itemName, quantity });

          // Publish item collected event
          const event: ItemCollectedEvent = {
            type: GameEventType.ITEM_COLLECTED,
            itemId: drop.itemId,
            itemName: drop.itemName,
            quantity,
          };
          this.eventBus.publish(event);
        }
      }

      // Publish inventory changed
      const invEvent: InventoryChangedEvent = {
        type: GameEventType.INVENTORY_CHANGED,
      };
      this.eventBus.publish(invEvent);
    }

    const depleted = resource.isDepleted;
    const message = depleted
      ? `Gathered from ${resource.config.name}!`
      : `Hitting ${resource.config.name} (${resource.health}/${resource.config.health})`;

    return {
      success: true,
      message,
      drops: collectedDrops,
      resourceDepleted: depleted,
    };
  }

  private createItemFromDrop(drop: IResourceDrop, quantity: number): Item {
    // Determine item type from id
    let itemType = ItemType.MATERIAL;
    if (drop.itemId === 'berries') {
      itemType = ItemType.FOOD;
    }

    return Item.create({
      id: drop.itemId,
      name: drop.itemName,
      description: `Gathered ${drop.itemName}`,
      type: itemType,
      rarity: ItemRarity.COMMON,
      maxStack: 20,
      weight: 0.5,
      isConsumable: itemType === ItemType.FOOD,
      effects: itemType === ItemType.FOOD ? { hungerRestore: 5 } : null,
      quantity,
    });
  }
}
