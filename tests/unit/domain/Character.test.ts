import { describe, it, expect, beforeEach } from 'vitest';
import { Character } from '@domain/entities/Character';
import { Stats } from '@domain/value-objects/Stats';
import { Position } from '@domain/value-objects/Position';
import { CharacterClass } from '@shared/constants/GameConstants';

describe('Character Entity', () => {
  let character: Character;
  let stats: Stats;

  beforeEach(() => {
    stats = Stats.create(100, 100, 100, 100, 100, 100, 37, 100, 100);
    character = Character.create('test_1', CharacterClass.SURVIVOR, 'Test Character', stats);
  });

  describe('Creation', () => {
    it('should create a character with correct properties', () => {
      expect(character.id).toBe('test_1');
      expect(character.name).toBe('Test Character');
      expect(character.characterClass).toBe(CharacterClass.SURVIVOR);
      expect(character.isAlive).toBe(true);
      expect(character.stats.health).toBe(100);
    });

    it('should start at zero position by default', () => {
      expect(character.position.equals(Position.zero())).toBe(true);
    });
  });

  describe('Health Management', () => {
    it('should take damage correctly', () => {
      const damaged = character.takeDamage(30);

      expect(damaged.stats.health).toBe(70);
      expect(damaged.isAlive).toBe(true);
    });

    it('should die when health reaches zero', () => {
      const dead = character.takeDamage(150);

      expect(dead.stats.health).toBe(0);
      expect(dead.isAlive).toBe(false);
    });

    it('should heal correctly', () => {
      const damaged = character.takeDamage(40);
      const healed = damaged.heal(20);

      expect(healed.stats.health).toBe(80);
    });

    it('should not heal above max health', () => {
      const healed = character.heal(50);

      expect(healed.stats.health).toBe(100);
    });
  });

  describe('Hunger and Thirst', () => {
    it('should eat to restore hunger', () => {
      const hungry = character.updateStats(stats.withHunger(50));
      const fed = hungry.eat(30);

      expect(fed.stats.hunger).toBe(80);
    });

    it('should drink to restore thirst', () => {
      const thirsty = character.updateStats(stats.withThirst(40));
      const hydrated = thirsty.drink(40);

      expect(hydrated.stats.thirst).toBe(80);
    });

    it('should detect starvation', () => {
      const starving = character.updateStats(stats.withHunger(15));
      expect(starving.stats.isStarving()).toBe(true);
    });

    it('should detect dehydration', () => {
      const dehydrated = character.updateStats(stats.withThirst(10));
      expect(dehydrated.stats.isDehydrated()).toBe(true);
    });
  });

  describe('Stamina', () => {
    it('should use stamina', () => {
      const tired = character.useStamina(30);

      expect(tired.stats.stamina).toBe(70);
    });

    it('should regenerate stamina', () => {
      const tired = character.useStamina(40);
      const rested = tired.regenStamina(20);

      expect(rested.stats.stamina).toBe(80);
    });

    it('should check if can use stamina', () => {
      expect(character.canUseStamina(50)).toBe(true);
      expect(character.canUseStamina(150)).toBe(false);
    });

    it('should not regenerate above max stamina', () => {
      const rested = character.regenStamina(50);

      expect(rested.stats.stamina).toBe(100);
    });
  });

  describe('Temperature', () => {
    it('should update temperature', () => {
      const cold = character.updateTemperature(30);

      expect(cold.stats.temperature).toBe(30);
    });

    it('should detect critical temperature', () => {
      const hypothermic = character.updateTemperature(34);
      expect(hypothermic.stats.isCriticallyHot()).toBe(true);

      const hyperthermic = character.updateTemperature(41);
      expect(hyperthermic.stats.isCriticallyHot()).toBe(true);
    });
  });

  describe('Position', () => {
    it('should move to new position', () => {
      const newPosition = Position.create(10, 5, 15);
      const moved = character.moveTo(newPosition);

      expect(moved.position.x).toBe(10);
      expect(moved.position.y).toBe(5);
      expect(moved.position.z).toBe(15);
    });
  });

  describe('Status Summary', () => {
    it('should provide accurate status summary', () => {
      const status = character.getStatusSummary();

      expect(status.isAlive).toBe(true);
      expect(status.isCritical).toBe(false);
      expect(status.needsFood).toBe(false);
      expect(status.needsWater).toBe(false);
      expect(status.needsWarmth).toBe(false);
    });

    it('should detect critical health', () => {
      const critical = character.takeDamage(85);
      const status = critical.getStatusSummary();

      expect(status.isCritical).toBe(true);
    });

    it('should detect multiple needs', () => {
      const needy = character
        .updateStats(stats.withHunger(10))
        .updateStats(stats.withThirst(15))
        .updateTemperature(30);

      const status = needy.getStatusSummary();

      expect(status.needsFood).toBe(true);
      expect(status.needsWater).toBe(true);
      expect(status.needsWarmth).toBe(true);
    });
  });

  describe('Serialization', () => {
    it('should serialize to JSON', () => {
      const json = character.toJSON();

      expect(json['id']).toBe('test_1');
      expect(json['name']).toBe('Test Character');
      expect(json['characterClass']).toBe(CharacterClass.SURVIVOR);
      expect(json['isAlive']).toBe(true);
    });

    it('should deserialize from JSON', () => {
      const json = character.toJSON();
      const restored = Character.fromJSON(json);

      expect(restored.id).toBe(character.id);
      expect(restored.name).toBe(character.name);
      expect(restored.characterClass).toBe(character.characterClass);
      expect(restored.stats.health).toBe(character.stats.health);
      expect(restored.isAlive).toBe(character.isAlive);
    });

    it('should maintain state through serialization round-trip', () => {
      const damaged = character.takeDamage(25).eat(30).useStamina(40);
      const json = damaged.toJSON();
      const restored = Character.fromJSON(json);

      expect(restored.stats.health).toBe(damaged.stats.health);
      expect(restored.stats.hunger).toBe(damaged.stats.hunger);
      expect(restored.stats.stamina).toBe(damaged.stats.stamina);
    });
  });
});
