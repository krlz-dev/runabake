# Project Roadmap

This document outlines the development plan for the Wild Survival Game Framework.

## ✅ Phase 1: Foundation (COMPLETED)

**Status**: 100% Complete

### Completed Items
- [x] Project setup with Vite + TypeScript + Babylon.js
- [x] Clean architecture folder structure
- [x] Domain entities (Character, Item, Inventory)
- [x] Value objects (Stats, Position)
- [x] Basic Babylon.js scene with lighting
- [x] Input manager system (keyboard/mouse)
- [x] Asset loading pipeline
- [x] Survival stats system (health, hunger, thirst, stamina, temperature)
- [x] Unit tests for domain layer
- [x] Comprehensive documentation

### Deliverables
- Runnable demo with player cube
- Moving character with WASD controls
- Real-time stat depletion
- UI overlay with stat bars
- Test coverage for core entities

---

## 🚧 Phase 2: Core Gameplay (4-6 weeks)

**Status**: Ready to start

### Day/Night Cycle System
- [ ] Time service managing game time
- [ ] Dynamic lighting based on time of day
- [ ] Skybox with day/night transitions
- [ ] Temperature changes based on time
- [ ] Survival difficulty increases at night

**Implementation:**
```typescript
class TimeService {
  private currentTime: number = 0; // 0-24 hours
  private dayDuration: number = 600; // 10 minutes

  update(deltaTime: number): void {
    this.currentTime += (deltaTime / this.dayDuration) * 24;
    if (this.currentTime >= 24) this.currentTime = 0;
  }

  getTimeOfDay(): TimeOfDay {
    if (this.currentTime < 6) return TimeOfDay.NIGHT;
    if (this.currentTime < 8) return TimeOfDay.DAWN;
    if (this.currentTime < 18) return TimeOfDay.DAY;
    if (this.currentTime < 20) return TimeOfDay.DUSK;
    return TimeOfDay.NIGHT;
  }
}
```

### Weather System
- [ ] Weather state machine (Clear → Cloudy → Snowing → Blizzard)
- [ ] Particle effects for snow
- [ ] Wind simulation
- [ ] Temperature impact on character
- [ ] Visibility reduction during blizzards

### Resource Gathering
- [ ] Tree entities with collision
- [ ] Rock entities with collision
- [ ] Gathering animation and feedback
- [ ] Tool requirements (axe for trees, pickaxe for rocks)
- [ ] Resource drops and collection
- [ ] Resource respawning system

### Crafting System
- [ ] Crafting UI panel
- [ ] Recipe discovery system
- [ ] Material requirement checking
- [ ] Crafting progress bar
- [ ] Skill requirements
- [ ] Quality system (normal, good, excellent)

### Inventory UI
- [ ] Draggable inventory slots
- [ ] Item tooltips
- [ ] Stack splitting
- [ ] Quick slots / hotbar
- [ ] Weight indicator
- [ ] Context menu (use, drop, split)

---

## 🌲 Phase 3: Environment (4-6 weeks)

### Procedural Terrain
- [ ] Perlin noise height map generation
- [ ] Multiple biomes (forest, frozen lake, mountains)
- [ ] Terrain texturing based on biome
- [ ] Level of detail (LOD) for performance
- [ ] Minimap generation

**Biome System:**
```typescript
enum BiomeType {
  FOREST = 'forest',
  FROZEN_LAKE = 'frozen_lake',
  MOUNTAINS = 'mountains',
  CLEARING = 'clearing',
}

class BiomeGenerator {
  generateBiome(x: number, z: number): BiomeType {
    const noise = simplexNoise.noise2D(x * 0.01, z * 0.01);
    if (noise < -0.3) return BiomeType.FROZEN_LAKE;
    if (noise > 0.4) return BiomeType.MOUNTAINS;
    if (Math.abs(noise) < 0.1) return BiomeType.CLEARING;
    return BiomeType.FOREST;
  }
}
```

### Resource Spawning
- [ ] Procedural tree placement
- [ ] Rock formations
- [ ] Berry bushes
- [ ] Animal spawning points
- [ ] Resource clustering by biome

### Points of Interest
- [ ] Plane crash site (starting location)
- [ ] Abandoned cabins
- [ ] Cave systems
- [ ] Frozen rivers
- [ ] Hidden caches

### Environmental Hazards
- [ ] Thin ice (breaks if you walk on it)
- [ ] Avalanche zones
- [ ] Cliffs with fall damage
- [ ] Poison berries
- [ ] Dangerous wildlife territories

---

## ⚔️ Phase 4: Combat & AI (4-6 weeks)

### Enemy AI System
- [ ] State machine (Idle, Patrol, Chase, Attack, Flee, Dead)
- [ ] Pathfinding with navmesh
- [ ] Aggro range and detection
- [ ] Pack behavior for wolves
- [ ] Boss creatures

**AI State Machine:**
```typescript
abstract class EnemyState {
  abstract enter(enemy: Enemy): void;
  abstract update(enemy: Enemy, deltaTime: number): EnemyState | null;
  abstract exit(enemy: Enemy): void;
}

class ChaseState extends EnemyState {
  enter(enemy: Enemy): void {
    enemy.setSpeed(CHASE_SPEED);
  }

  update(enemy: Enemy, deltaTime: number): EnemyState | null {
    const distance = enemy.distanceToTarget();

    if (distance > CHASE_RANGE) {
      return new PatrolState();
    }

    if (distance < ATTACK_RANGE) {
      return new AttackState();
    }

    enemy.moveTowardTarget(deltaTime);
    return null;
  }

  exit(enemy: Enemy): void {
    // Cleanup
  }
}
```

### Combat System
- [ ] Melee combat (axe, spear)
- [ ] Ranged combat (bow, crafted gun)
- [ ] Damage calculation
- [ ] Hit detection
- [ ] Combat animations
- [ ] Weapon durability

### Enemy Types
- [ ] Regular wolves (pack hunters)
- [ ] Mutated wolves (tougher, solo)
- [ ] Bears (territorial, high damage)
- [ ] Fantasy creatures (late game)

### Death & Respawn
- [ ] Death screen
- [ ] Corpse marker on map
- [ ] Equipment drop at death location
- [ ] Skill/XP retention
- [ ] Respawn at camp location

---

## 🏗️ Phase 5: Building & Progression (4-6 weeks)

### Shelter Building
- [ ] Campfire (warmth, cooking)
- [ ] Tent (basic shelter)
- [ ] Wooden cabin (permanent shelter)
- [ ] Workbenches (crafting upgrades)
- [ ] Storage containers

### Placement System
- [ ] Ghost preview of structure
- [ ] Collision detection
- [ ] Terrain validation
- [ ] Snap-to-grid option
- [ ] Structure health/durability

### Character Selection
- [ ] Character selection screen
- [ ] 8 unique characters with stats:
  - **Survivor**: Balanced stats
  - **Hunter**: Better combat, tracking
  - **Engineer**: Faster crafting, better tools
  - **Medic**: Health regeneration, healing bonuses
  - **Scout**: Faster movement, better stamina
  - **Soldier**: Combat specialist
  - **Cook**: Better food effects
  - **Scientist**: Research bonuses

### Skill System
- [ ] Skill trees (Survival, Combat, Crafting)
- [ ] Experience gain from actions
- [ ] Level up system
- [ ] Skill point allocation
- [ ] Passive bonuses

### Equipment System
- [ ] Equipment slots (head, chest, legs, feet, hands)
- [ ] Visual equipment on character model
- [ ] Warmth rating system
- [ ] Armor rating
- [ ] Set bonuses

---

## ✨ Phase 6: Polish & Persistence (4-6 weeks)

### Save/Load System
- [ ] SQL.js integration for browser storage
- [ ] Save game slots (multiple saves)
- [ ] Auto-save every 5 minutes
- [ ] Save game metadata (playtime, character, location)
- [ ] Cloud save support (optional)

**Database Schema:**
```sql
CREATE TABLE characters (
  id TEXT PRIMARY KEY,
  name TEXT,
  class TEXT,
  stats JSON,
  position JSON,
  created_at INTEGER
);

CREATE TABLE inventories (
  character_id TEXT,
  slot_index INTEGER,
  item_data JSON,
  FOREIGN KEY (character_id) REFERENCES characters(id)
);

CREATE TABLE world_state (
  key TEXT PRIMARY KEY,
  value JSON
);
```

### UI/UX Polish
- [ ] Main menu with settings
- [ ] Pause menu
- [ ] Options screen (graphics, audio, controls)
- [ ] Keybinding customization
- [ ] Gamepad support
- [ ] Accessibility options

### Audio System
- [ ] Background music (day/night variations)
- [ ] Ambient sounds (wind, wildlife)
- [ ] Footstep sounds (varies by terrain)
- [ ] Crafting sounds
- [ ] Combat sounds
- [ ] UI sound effects

### Tutorial System
- [ ] First-time player tutorial
- [ ] Context-sensitive hints
- [ ] Objective markers
- [ ] Achievement/milestone system
- [ ] Tips on loading screens

### Performance Optimization
- [ ] Object pooling for frequently spawned items
- [ ] Occlusion culling
- [ ] Texture atlasing
- [ ] Level of detail (LOD) for models
- [ ] Lazy loading of assets
- [ ] Web Worker for terrain generation

### Visual Effects
- [ ] Bloom and post-processing
- [ ] God rays during day
- [ ] Northern lights at night
- [ ] Campfire glow
- [ ] Breathing vapor in cold
- [ ] Footprints in snow

---

## 🚀 Phase 7: Multiplayer (Optional, 8-12 weeks)

**Note**: This is an optional extension for co-op gameplay like The Wild Eight.

### Networking
- [ ] WebRTC or WebSocket integration
- [ ] Player synchronization
- [ ] Lag compensation
- [ ] Client-side prediction
- [ ] Server reconciliation

### Multiplayer Features
- [ ] Host/join system
- [ ] Lobby system (up to 8 players)
- [ ] Shared resources
- [ ] Team building projects
- [ ] Player markers on map
- [ ] Text chat

### Using Colyseus (like T5C project)
```typescript
import { Client, Room } from 'colyseus.js';

class GameRoom extends Room {
  onJoin() {
    console.log('Joined room');
  }

  onStateChange(state: GameState) {
    // Sync game state
  }
}
```

---

## 📊 Success Metrics

### Performance Targets
- 60 FPS on mid-range hardware
- < 3 second load time
- < 100MB initial download
- < 500MB total with assets

### Gameplay Targets
- 15-30 minute play sessions
- 2-4 hours to complete tutorial
- 20+ hours of gameplay content
- 50+ craftable items
- 10+ enemy types

### Code Quality Targets
- 70%+ test coverage (domain layer)
- Zero ESLint errors
- < 300 lines per file
- Documented public APIs

---

## 🛠️ Technical Debt to Address

1. **Character Controller Integration**
   - Replace placeholder cube with proper character model
   - Integrate `babylonjs-charactercontroller` package
   - Add animations (idle, walk, run, jump, attack)

2. **Asset Pipeline**
   - Download and integrate Kenney Survival Kit
   - Create asset manifest system
   - Implement asset preloading

3. **State Management**
   - Implement EventBus for decoupled communication
   - Create GameStateService
   - Add Redux/Zustand for complex state (optional)

4. **UI Framework**
   - Evaluate Babylon.js GUI vs HTML overlay
   - Implement responsive design
   - Add mobile touch controls

---

## 🤝 Community Features (Future)

- [ ] Mod support (custom items, recipes)
- [ ] Steam Workshop integration
- [ ] Map editor
- [ ] Custom character skins
- [ ] Player-created scenarios

---

## 📅 Timeline Summary

| Phase | Duration | Status |
|-------|----------|--------|
| Phase 1: Foundation | 2 weeks | ✅ Complete |
| Phase 2: Core Gameplay | 4-6 weeks | 🟡 Ready |
| Phase 3: Environment | 4-6 weeks | ⏳ Pending |
| Phase 4: Combat & AI | 4-6 weeks | ⏳ Pending |
| Phase 5: Building | 4-6 weeks | ⏳ Pending |
| Phase 6: Polish | 4-6 weeks | ⏳ Pending |
| Phase 7: Multiplayer | 8-12 weeks | 🔵 Optional |

**Total Estimated Time**: 6-9 months for single-player version

---

## 🎯 Next Immediate Steps

1. **Install Kenney Assets**
   ```bash
   mkdir -p public/assets/models/kenney
   # Download from https://kenney.nl/assets/survival-kit
   # Place .glb files in the above directory
   ```

2. **Replace Placeholder Player**
   ```bash
   npm install babylonjs-charactercontroller
   ```

3. **Implement Day/Night Cycle**
   - Create TimeService
   - Update lighting dynamically
   - Test temperature effects

4. **Start Crafting System**
   - Implement CraftItemUseCase
   - Create basic UI
   - Add 5-10 starter recipes

---

**Last Updated**: 2026-02-24
