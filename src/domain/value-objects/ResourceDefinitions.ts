import { ResourceType, IResourceConfig } from '@domain/entities/Resource';

/**
 * Predefined resource configurations for world generation.
 * Balancing references from Don't Starve, The Wild Eight, and The Long Dark.
 */
export const RESOURCE_DEFINITIONS: Record<string, IResourceConfig> = {
  pine_tree: {
    type: ResourceType.TREE,
    name: 'Pine Tree',
    health: 5,
    drops: [
      {
        itemId: 'wood',
        itemName: 'Wood',
        minQuantity: 2,
        maxQuantity: 4,
        dropChance: 1.0,
      },
    ],
    requiredTool: null, // Can chop by hand
    gatherTime: 2,
    staminaCost: 5,
    respawnTime: 120,
  },

  rock_formation: {
    type: ResourceType.ROCK,
    name: 'Rock Formation',
    health: 4,
    drops: [
      {
        itemId: 'stone',
        itemName: 'Stone',
        minQuantity: 2,
        maxQuantity: 3,
        dropChance: 1.0,
      },
      {
        itemId: 'ore',
        itemName: 'Iron Ore',
        minQuantity: 1,
        maxQuantity: 1,
        dropChance: 0.3,
      },
    ],
    requiredTool: null,
    gatherTime: 2.5,
    staminaCost: 8,
    respawnTime: 180,
  },

  berry_bush: {
    type: ResourceType.BUSH,
    name: 'Berry Bush',
    health: 1,
    drops: [
      {
        itemId: 'berries',
        itemName: 'Berries',
        minQuantity: 1,
        maxQuantity: 3,
        dropChance: 1.0,
      },
    ],
    requiredTool: null,
    gatherTime: 1,
    staminaCost: 2,
    respawnTime: 300,
  },
};
