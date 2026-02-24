# Wild Survival Game Framework

A modular, TypeScript-based survival game framework inspired by **The Wild Eight**, built with **Babylon.js** and clean architecture principles.

## 🎮 Features

- **Clean Architecture**: Domain-driven design with clear separation of concerns
- **Survival Mechanics**: Health, hunger, thirst, temperature, and stamina systems
- **Character System**: 8 playable character classes with unique attributes
- **Inventory Management**: Stackable items, drag-and-drop, weight limits
- **Low-Poly Graphics**: Optimized for performance with Kenney asset support
- **TypeScript**: Full type safety with strict mode
- **Modular Design**: Easy to extend and customize

## 🏗️ Architecture

```
src/
├── domain/              # Core business logic (framework-agnostic)
│   ├── entities/        # Character, Item, Inventory
│   ├── value-objects/   # Stats, Position
│   └── interfaces/      # Repository contracts
│
├── application/         # Use cases & game logic
│   ├── use-cases/       # Game actions
│   ├── services/        # Game state management
│   └── events/          # Event bus
│
├── infrastructure/      # External implementations
│   ├── babylon/         # Babylon.js integration
│   ├── persistence/     # Save/load system
│   └── audio/           # Sound management
│
├── presentation/        # UI & rendering
│   ├── scenes/          # Game scenes
│   ├── ui/              # HUD components
│   └── controllers/     # Input controllers
│
└── shared/              # Constants, utilities
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm, yarn, or pnpm

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd runabake

# Install dependencies
npm install

# Start development server
npm run dev
```

The game will open at `http://localhost:3000`

### Build for Production

```bash
npm run build
npm run preview
```

## 🎯 Core Systems

### 1. Survival Stats

Characters have five core survival stats:

- **Health**: Damage from enemies, cold, starvation
- **Hunger**: Depletes over time, restored by eating
- **Thirst**: Depletes faster than hunger, restored by drinking
- **Temperature**: Affected by weather and time of day
- **Stamina**: Used for sprinting, regenerates when idle

```typescript
import { Stats } from '@domain/value-objects/Stats';

const stats = Stats.create(
  100, // health
  100, // maxHealth
  100, // hunger
  100, // maxHunger
  100, // thirst
  100, // maxThirst
  37,  // temperature (°C)
  100, // stamina
  100  // maxStamina
);
```

### 2. Character System

```typescript
import { Character } from '@domain/entities/Character';
import { CharacterClass } from '@shared/constants/GameConstants';

const character = Character.create(
  'player_1',
  CharacterClass.SURVIVOR,
  'Player Name',
  stats,
  Position.zero()
);

// Update stats
character.takeDamage(10);
character.eat(20);
character.drink(30);
```

### 3. Inventory System

```typescript
import { Inventory } from '@domain/entities/Inventory';
import { Item, ItemType } from '@domain/entities/Item';

const inventory = Inventory.create('inv_1', 20, 100); // 20 slots, 100kg max

const apple = Item.create({
  id: 'apple',
  name: 'Apple',
  description: 'A juicy red apple',
  type: ItemType.FOOD,
  maxStack: 10,
  effects: { hungerRestore: 15 },
});

inventory.addItem(apple);
```

## 🎨 Asset Integration

### Using Kenney Survival Kit

1. Download the [Kenney Survival Kit](https://kenney.nl/assets/survival-kit) (CC0 License)
2. Place GLB/GLTF files in `public/assets/models/kenney/`
3. Update paths in `AssetLoader.ts`:

```typescript
import { AssetLoader, KENNEY_ASSETS } from '@infrastructure/babylon/AssetLoader';

const loader = new AssetLoader(scene);
await loader.loadModel(
  KENNEY_ASSETS.TENT.id,
  KENNEY_ASSETS.TENT.path,
  KENNEY_ASSETS.TENT.file
);
```

## 🎮 Controls

- **WASD** / **Arrow Keys** - Move character
- **Shift** - Sprint (uses stamina)
- **Space** - Jump
- **E** / **F** - Interact with objects
- **Mouse** - Camera control

## 📋 Game Systems To Implement

### Phase 1: Foundation ✅
- [x] Project setup with TypeScript + Vite
- [x] Clean architecture structure
- [x] Domain entities (Character, Item, Inventory)
- [x] Basic scene with input manager
- [x] Survival stats system

### Phase 2: Core Gameplay
- [ ] Day/night cycle with lighting
- [ ] Weather system (clear, snow, blizzard)
- [ ] Resource gathering mechanics
- [ ] Crafting system
- [ ] Inventory UI with drag-and-drop

### Phase 3: Environment
- [ ] Procedural terrain generation
- [ ] Biomes (forest, frozen lake, mountains)
- [ ] Resource spawning (trees, rocks, animals)
- [ ] Points of interest generation

### Phase 4: Combat & AI
- [ ] Enemy AI state machine
- [ ] Combat system with weapons
- [ ] Health/damage system
- [ ] Death/respawn mechanic

### Phase 5: Building & Progression
- [ ] Shelter building system
- [ ] Character selection screen
- [ ] Skill progression
- [ ] Equipment system

### Phase 6: Polish
- [ ] Save/load system (SQL.js)
- [ ] Sound effects
- [ ] Tutorial system
- [ ] Performance optimization

## 🔧 Development

### Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Run tests
npm run test
```

### Adding New Features

1. **Domain Layer**: Create entities/value objects
2. **Application Layer**: Implement use cases
3. **Infrastructure Layer**: Add Babylon.js integration
4. **Presentation Layer**: Create UI components

### Example: Adding a New Item Type

```typescript
// 1. Define in domain
export class Weapon extends Item {
  constructor(
    id: string,
    name: string,
    private damage: number,
    private range: number
  ) {
    super(id, name, ItemType.WEAPON);
  }
}

// 2. Create use case
export class EquipWeaponUseCase {
  execute(character: Character, weapon: Weapon): void {
    // Implementation
  }
}

// 3. Add to scene
const sword = new Weapon('sword_1', 'Iron Sword', 25, 2);
```

## 📚 Resources

### Babylon.js
- [Official Documentation](https://doc.babylonjs.com/)
- [Playground](https://playground.babylonjs.com/)
- [Forum](https://forum.babylonjs.com/)

### Character Controller
- [BabylonJS-CharacterController](https://github.com/ssatguru/BabylonJS-CharacterController)
- [npm package](https://www.npmjs.com/package/babylonjs-charactercontroller)

### Assets
- [Kenney Survival Kit](https://kenney.nl/assets/survival-kit) - 80 free low-poly models
- [Quaternius](https://quaternius.com/) - Free low-poly characters
- [OpenGameArt](https://opengameart.org/) - Community assets

### Inspiration
- [T5C Multiplayer RPG](https://github.com/orion3dgames/t5c) - Babylon.js RPG example
- [The Wild Eight](https://store.steampowered.com/app/526160/The_Wild_Eight/) - Original game

## 🛠️ Tech Stack

- **Babylon.js 7.x** - 3D rendering engine
- **TypeScript 5.x** - Type-safe development
- **Vite 6.x** - Fast build tool
- **Vitest** - Unit testing
- **ESLint + Prettier** - Code quality

## 📝 Clean Code Principles

This project follows SOLID principles and clean code practices:

- **Single Responsibility**: Each class has one reason to change
- **Open/Closed**: Open for extension, closed for modification
- **Dependency Inversion**: Depend on abstractions, not concretions
- **Pure Functions**: Immutable value objects
- **Small Modules**: Max 300 lines per file
- **Type Safety**: Strict TypeScript mode

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

MIT License - feel free to use this framework for your own projects!

## 🙏 Acknowledgments

- **Babylon.js Team** - Amazing 3D engine
- **Kenney** - Free high-quality game assets
- **The Wild Eight** - Game design inspiration
- **T5C Project** - Implementation reference

## 📞 Support

For issues and questions:
- Open a [GitHub Issue](../../issues)
- Check existing issues first
- Provide minimal reproduction examples

---

**Built with ❤️ and Babylon.js**
