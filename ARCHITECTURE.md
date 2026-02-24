# Architecture Documentation

## Overview

This project follows **Clean Architecture** principles, ensuring that business logic is independent of frameworks, UI, and external dependencies.

## Architecture Layers

### 1. Domain Layer (`src/domain/`)

**The core of the application - completely framework-agnostic**

#### Entities
- `Character.ts` - Player character with survival stats
- `Item.ts` - Items that can be collected and used
- `Inventory.ts` - Container for managing items

#### Value Objects
- `Stats.ts` - Immutable survival statistics
- `Position.ts` - Immutable 3D position

**Key Principles:**
- Pure business logic only
- No external dependencies (no Babylon.js, no UI)
- Immutable value objects
- Rich domain models with behavior

**Example:**
```typescript
// ✅ GOOD: Pure domain logic
const character = Character.create(id, class, name, stats);
const updatedCharacter = character.takeDamage(10);

// ❌ BAD: Framework coupling in domain
const character = new Character(babylonMesh, scene);
```

---

### 2. Application Layer (`src/application/`)

**Orchestrates domain entities to perform use cases**

#### Use Cases
Game-specific operations that coordinate multiple entities:
- `CraftItemUseCase` - Crafting logic
- `BuildShelterUseCase` - Building mechanics
- `SurviveNightUseCase` - Night survival checks

#### Services
Stateful services managing game state:
- `GameStateService` - Global game state
- `SaveLoadService` - Persistence
- `TimeService` - Day/night cycle

#### Events
Decoupled communication between systems:
- `EventBus` - Publish/subscribe pattern
- Event types: `CharacterDied`, `ItemCrafted`, `NightFell`

**Example Use Case:**
```typescript
export class CraftItemUseCase {
  constructor(
    private character: Character,
    private inventory: Inventory
  ) {}

  execute(recipeId: string): { success: boolean; item: Item | null } {
    const recipe = CraftingRecipes.get(recipeId);
    if (!recipe) return { success: false, item: null };

    // Check materials
    const hasMaterials = this.checkMaterials(recipe.materials);
    if (!hasMaterials) return { success: false, item: null };

    // Consume materials
    this.consumeMaterials(recipe.materials);

    // Create item
    const item = Item.create(recipe.result);
    this.inventory.addItem(item);

    return { success: true, item };
  }

  private checkMaterials(materials: Map<string, number>): boolean {
    for (const [itemId, quantity] of materials) {
      if (!this.inventory.hasItem(itemId, quantity)) {
        return false;
      }
    }
    return true;
  }

  private consumeMaterials(materials: Map<string, number>): void {
    // Implementation
  }
}
```

---

### 3. Infrastructure Layer (`src/infrastructure/`)

**External implementations and framework integrations**

#### Babylon.js Integration
- `BabylonEngine.ts` - Engine wrapper
- `InputManager.ts` - Keyboard/mouse handling
- `AssetLoader.ts` - 3D model loading

#### Persistence
- `LocalStorageRepository.ts` - Browser storage
- `IndexedDBRepository.ts` - Large data storage
- `SQLiteRepository.ts` - Complex queries (sql.js)

#### Audio
- `SoundManager.ts` - Sound effects and music

**Key Principles:**
- Implements interfaces defined in domain/application
- Contains all framework-specific code
- Easily replaceable (e.g., swap Babylon.js for Three.js)

---

### 4. Presentation Layer (`src/presentation/`)

**UI and rendering concerns**

#### Scenes
- `GameScene.ts` - Main gameplay scene
- `MenuScene.ts` - Main menu
- `LoadingScene.ts` - Asset loading screen

#### UI Components
- `HUD.ts` - Heads-up display
- `InventoryPanel.ts` - Inventory interface
- `CraftingMenu.ts` - Crafting interface

#### Controllers
- `PlayerController.ts` - Player input handling
- `CameraController.ts` - Camera management

**Example Scene:**
```typescript
export class GameScene {
  private scene: Scene;
  private character: Character;
  private inputManager: InputManager;

  constructor(scene: Scene) {
    this.scene = scene;
    this.inputManager = new InputManager(scene);
    this.setupEnvironment();
  }

  update(deltaTime: number): void {
    // Update domain entities based on input
    if (this.inputManager.isMoving()) {
      const movement = this.calculateMovement(deltaTime);
      this.character = this.character.moveTo(movement);
    }

    // Update Babylon.js scene to reflect domain state
    this.syncMeshWithCharacter();
  }

  private syncMeshWithCharacter(): void {
    const mesh = this.scene.getMeshByName('player');
    if (mesh) {
      mesh.position = new Vector3(
        this.character.position.x,
        this.character.position.y,
        this.character.position.z
      );
    }
  }
}
```

---

### 5. Shared Layer (`src/shared/`)

**Cross-cutting concerns used by all layers**

- `constants/` - Game constants
- `utils/` - Pure utility functions
- `config/` - Configuration

---

## Dependency Rule

**Dependencies flow inward:**

```
Presentation → Application → Domain
     ↓              ↓
Infrastructure → Application
```

- **Domain** depends on nothing
- **Application** depends only on domain
- **Infrastructure** implements application interfaces
- **Presentation** uses application and infrastructure

---

## Data Flow

### 1. Input → Domain → Rendering

```
User Input
    ↓
InputManager (Infrastructure)
    ↓
PlayerController (Presentation)
    ↓
Use Case (Application)
    ↓
Domain Entities (Domain)
    ↓
Scene Update (Presentation)
    ↓
Babylon.js Render (Infrastructure)
```

### 2. Survival Mechanics Update

```
Timer Tick
    ↓
GameStateService (Application)
    ↓
Character.updateStats() (Domain)
    ↓
Event: StatsChanged (Application)
    ↓
HUD.update() (Presentation)
```

---

## Testing Strategy

### Domain Layer (70%+ coverage required)
```typescript
describe('Character', () => {
  it('should take damage correctly', () => {
    const stats = Stats.create(100, 100);
    const character = Character.create('1', CharacterClass.SURVIVOR, 'Test', stats);

    const damaged = character.takeDamage(30);

    expect(damaged.stats.health).toBe(70);
  });
});
```

### Application Layer (50%+ coverage)
```typescript
describe('CraftItemUseCase', () => {
  it('should craft item when materials available', () => {
    // Test use case logic
  });
});
```

### Integration Tests
```typescript
describe('Survival System Integration', () => {
  it('should deplete hunger over time', async () => {
    // Test full flow from timer to character update
  });
});
```

---

## Design Patterns Used

### 1. Repository Pattern
```typescript
interface ICharacterRepository {
  save(character: Character): Promise<void>;
  load(id: string): Promise<Character | null>;
}

class LocalStorageCharacterRepository implements ICharacterRepository {
  async save(character: Character): Promise<void> {
    localStorage.setItem(`character_${character.id}`, JSON.stringify(character.toJSON()));
  }
}
```

### 2. Event Bus Pattern
```typescript
class EventBus {
  private listeners = new Map<string, Array<(data: unknown) => void>>();

  subscribe(event: string, callback: (data: unknown) => void): void {
    // Implementation
  }

  publish(event: string, data: unknown): void {
    // Implementation
  }
}
```

### 3. State Pattern (for AI)
```typescript
abstract class EnemyState {
  abstract update(enemy: Enemy, deltaTime: number): void;
}

class IdleState extends EnemyState {
  update(enemy: Enemy, deltaTime: number): void {
    // Idle behavior
  }
}

class ChaseState extends EnemyState {
  update(enemy: Enemy, deltaTime: number): void {
    // Chase behavior
  }
}
```

### 4. Factory Pattern
```typescript
class ItemFactory {
  static createFood(name: string, hungerRestore: number): Item {
    return Item.create({
      id: generateId(),
      name,
      type: ItemType.FOOD,
      effects: { hungerRestore },
    });
  }
}
```

---

## Extension Points

### Adding New Character Classes

1. Update enum in `GameConstants.ts`
2. Add class-specific stats in domain
3. Create character in application layer
4. Add UI selection in presentation

### Adding New Item Types

1. Extend `ItemType` enum
2. Add type-specific logic to `Item` entity
3. Create use cases for new item interactions
4. Add UI representation

### Adding New Game Systems

1. Create domain entities if needed
2. Implement use cases in application layer
3. Add infrastructure support (rendering, audio)
4. Wire up in presentation layer

---

## Performance Considerations

### Object Pooling
```typescript
class MeshPool {
  private pool: AbstractMesh[] = [];

  acquire(): AbstractMesh {
    return this.pool.pop() ?? this.createNew();
  }

  release(mesh: AbstractMesh): void {
    mesh.setEnabled(false);
    this.pool.push(mesh);
  }
}
```

### Lazy Loading
```typescript
class AssetLoader {
  private cache = new Map<string, AbstractMesh>();

  async loadOnDemand(assetId: string): Promise<AbstractMesh> {
    if (this.cache.has(assetId)) {
      return this.cache.get(assetId)!;
    }
    // Load and cache
  }
}
```

---

## Best Practices

1. **Keep domain pure**: No framework imports in `src/domain/`
2. **Immutable value objects**: Always return new instances
3. **Small files**: Max 300 lines, prefer composition
4. **Interface segregation**: Small, focused interfaces
5. **Dependency injection**: Pass dependencies to constructors
6. **Test domain first**: Easiest to test, most critical
7. **Event-driven updates**: Use EventBus for decoupling
8. **Type everything**: Strict TypeScript mode enabled

---

## Common Mistakes to Avoid

❌ **DON'T: Put Babylon.js code in domain**
```typescript
class Character {
  mesh: AbstractMesh; // ❌ Framework coupling
}
```

✅ **DO: Keep domain pure**
```typescript
class Character {
  position: Position; // ✅ Value object
}
```

❌ **DON'T: Mutate value objects**
```typescript
stats.health = 50; // ❌ Mutation
```

✅ **DO: Return new instances**
```typescript
const newStats = stats.withHealth(50); // ✅ Immutable
```

---

## Further Reading

- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [TypeScript Best Practices](https://github.com/labs42io/clean-code-typescript)
