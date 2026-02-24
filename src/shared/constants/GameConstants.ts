/**
 * Core game constants and configuration values
 */

export const GAME_CONFIG = {
  // Time settings (in seconds)
  DAY_CYCLE_DURATION: 600, // 10 minutes per full day
  DAY_DURATION: 420, // 7 minutes of daylight
  NIGHT_DURATION: 180, // 3 minutes of night

  // Survival settings
  HUNGER_DEPLETION_RATE: 1, // Points per minute
  THIRST_DEPLETION_RATE: 1.5, // Points per minute
  STAMINA_REGEN_RATE: 10, // Points per second when idle
  STAMINA_SPRINT_COST: 20, // Points per second when sprinting

  // Temperature settings
  NORMAL_BODY_TEMP: 37, // Celsius
  HYPOTHERMIA_THRESHOLD: 35,
  HYPERTHERMIA_THRESHOLD: 40,
  BASE_COOLING_RATE: 0.5, // Degrees per minute in cold
  BASE_WARMING_RATE: 1, // Degrees per minute near fire

  // Environment
  DAY_TEMPERATURE: -5, // Celsius during day
  NIGHT_TEMPERATURE: -20, // Celsius during night
  BLIZZARD_TEMPERATURE: -30, // Celsius during blizzard
} as const;

/**
 * Time configuration with normalized segment boundaries
 * Normalized time: 0 = midnight, 0.5 = noon, 1 = next midnight
 */
export const TIME_CONFIG = {
  SEGMENTS: {
    DAWN_START: 0.25, // 6:00 AM
    DAY_START: 0.333, // 8:00 AM
    DUSK_START: 0.75, // 6:00 PM
    NIGHT_START: 0.833, // 8:00 PM
  },
  TEMPERATURES: {
    NIGHT: -15,
    DAWN: -5,
    DAY: 0,
    DUSK: -5,
  },
} as const;

/**
 * Weather system configuration
 */
export const WEATHER_CONFIG = {
  MIN_DURATION: 60, // Minimum seconds before weather change
  MAX_DURATION: 180, // Maximum seconds before weather change
  TRANSITION_DURATION: 30, // Seconds to transition between weather states
  MODIFIERS: {
    CLEAR: { temperature: 0, movement: 1.0, visibility: 1.0 },
    CLOUDY: { temperature: -2, movement: 1.0, visibility: 0.9 },
    SNOWING: { temperature: -5, movement: 0.85, visibility: 0.6 },
    BLIZZARD: { temperature: -15, movement: 0.6, visibility: 0.3 },
  },
  // Transition weights: [CLEAR, CLOUDY, SNOWING, BLIZZARD]
  TRANSITION_WEIGHTS: {
    CLEAR: [0, 0.6, 0.3, 0.1],
    CLOUDY: [0.3, 0, 0.5, 0.2],
    SNOWING: [0.2, 0.3, 0, 0.5],
    BLIZZARD: [0.3, 0.3, 0.4, 0],
  },
  NIGHT_BLIZZARD_BONUS: 0.15, // Extra probability for blizzard at night
} as const;

export const CHARACTER_STATS = {
  BASE_HEALTH: 100,
  BASE_HUNGER: 100,
  BASE_THIRST: 100,
  BASE_STAMINA: 100,
} as const;

export const MOVEMENT_SPEEDS = {
  WALK: 3,
  RUN: 6,
  SPRINT: 9,
} as const;

export const ITEM_TYPES = {
  TOOL: 'tool',
  WEAPON: 'weapon',
  FOOD: 'food',
  MATERIAL: 'material',
  CLOTHING: 'clothing',
} as const;

export const RESOURCE_TYPES = {
  WOOD: 'wood',
  STONE: 'stone',
  FOOD: 'food',
  WATER: 'water',
} as const;

export enum CharacterClass {
  SURVIVOR = 'survivor',
  HUNTER = 'hunter',
  ENGINEER = 'engineer',
  MEDIC = 'medic',
  SCOUT = 'scout',
  SOLDIER = 'soldier',
  COOK = 'cook',
  SCIENTIST = 'scientist',
}

export enum WeatherType {
  CLEAR = 'clear',
  CLOUDY = 'cloudy',
  SNOWING = 'snowing',
  BLIZZARD = 'blizzard',
}

export enum TimeOfDay {
  DAWN = 'dawn',
  DAY = 'day',
  DUSK = 'dusk',
  NIGHT = 'night',
}
