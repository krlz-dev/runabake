# Contributing to Wild Survival Game Framework

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Architecture Guidelines](#architecture-guidelines)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- Git
- A code editor (VS Code recommended)

### Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/runabake.git
   cd runabake
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Create a branch** for your feature:
   ```bash
   git checkout -b feature/my-awesome-feature
   ```

5. **Start development server**:
   ```bash
   npm run dev
   ```

## 🔄 Development Workflow

### Branch Naming Convention

- `feature/` - New features (e.g., `feature/crafting-system`)
- `fix/` - Bug fixes (e.g., `fix/inventory-duplication`)
- `refactor/` - Code refactoring (e.g., `refactor/character-stats`)
- `docs/` - Documentation updates (e.g., `docs/api-reference`)
- `test/` - Test additions (e.g., `test/character-entity`)

### Commit Message Format

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Build process or tooling changes

**Examples:**
```
feat(crafting): add stone axe recipe

Implement crafting recipe for stone axe using wood and stone materials.
Requires 3 wood and 2 stone to craft.

Closes #42
```

```
fix(inventory): prevent item duplication on drag

Fixed bug where dragging items between slots could duplicate them
if the operation was interrupted.
```

## 📏 Code Standards

### TypeScript Guidelines

1. **Enable strict mode** - Already configured in `tsconfig.json`
2. **No `any` types** - Use proper typing or `unknown`
3. **Explicit return types** for public methods
4. **Interface names** start with `I` (e.g., `IInventorySlot`)
5. **Class names** use PascalCase
6. **Constants** use UPPER_SNAKE_CASE

**Example:**
```typescript
// ✅ GOOD
export class CharacterController {
  constructor(
    private character: Character,
    private inputManager: IInputManager
  ) {}

  public update(deltaTime: number): void {
    // Implementation
  }

  private calculateMovement(input: IInputState): Vector3 {
    // Implementation
  }
}

// ❌ BAD
export class charactercontroller {
  update(deltaTime) {  // Missing return type
    let data: any = {};  // Using any
  }
}
```

### File Organization

```
src/
├── domain/              # Pure business logic
│   ├── entities/        # Mutable domain objects
│   ├── value-objects/   # Immutable values
│   └── interfaces/      # Contracts
├── application/         # Use cases and services
│   ├── use-cases/       # Single-purpose operations
│   ├── services/        # Stateful managers
│   └── events/          # Event system
├── infrastructure/      # External implementations
│   ├── babylon/         # Babylon.js specific
│   ├── persistence/     # Storage
│   └── audio/           # Sound
└── presentation/        # UI and scenes
    ├── scenes/          # Game scenes
    ├── ui/              # UI components
    └── controllers/     # Input handling
```

### Code Style

Run these before committing:

```bash
# Check linting
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Format code
npm run format
```

## 🏗️ Architecture Guidelines

### Domain Layer Rules

1. **No framework dependencies** in `src/domain/`
2. **Immutable value objects** - Always return new instances
3. **Rich domain models** - Behavior belongs with data
4. **Pure functions** preferred

```typescript
// ✅ GOOD: Pure domain logic
export class Stats {
  withHealth(newHealth: number): Stats {
    return new Stats(/* new instance */);
  }
}

// ❌ BAD: Mutation
export class Stats {
  setHealth(newHealth: number): void {
    this.health = newHealth;  // Mutation!
  }
}
```

### Application Layer Rules

1. **Use cases** coordinate domain entities
2. **Services** manage global state
3. **Events** for decoupled communication
4. **DTOs** for data transfer

```typescript
// ✅ GOOD: Clear use case
export class CraftItemUseCase {
  execute(recipe: ICraftingRecipe): ICraftingResult {
    // 1. Validate
    // 2. Execute domain logic
    // 3. Return result
  }
}
```

### Infrastructure Layer Rules

1. **Implement** interfaces from domain/application
2. **Wrap** external libraries
3. **Isolate** framework-specific code

```typescript
// ✅ GOOD: Framework isolation
export class BabylonInputManager implements IInputManager {
  constructor(private scene: Scene) {}
  // Babylon.js specifics hidden
}
```

## 🧪 Testing

### Writing Tests

We use **Vitest** for testing:

```typescript
// tests/unit/domain/Character.test.ts
import { describe, it, expect } from 'vitest';
import { Character } from '@domain/entities/Character';
import { Stats } from '@domain/value-objects/Stats';
import { CharacterClass } from '@shared/constants/GameConstants';

describe('Character', () => {
  it('should take damage correctly', () => {
    const stats = Stats.create(100, 100);
    const character = Character.create('1', CharacterClass.SURVIVOR, 'Test', stats);

    const damaged = character.takeDamage(30);

    expect(damaged.stats.health).toBe(70);
    expect(damaged.isAlive).toBe(true);
  });

  it('should die when health reaches zero', () => {
    const stats = Stats.create(10, 100);
    const character = Character.create('1', CharacterClass.SURVIVOR, 'Test', stats);

    const dead = character.takeDamage(15);

    expect(dead.stats.health).toBe(0);
    expect(dead.isAlive).toBe(false);
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run with UI
npm run test:ui

# Run specific test file
npm test Character.test.ts

# Run in watch mode
npm test -- --watch
```

### Coverage Requirements

- **Domain Layer**: 70%+ coverage required
- **Application Layer**: 50%+ coverage
- **Infrastructure/Presentation**: 30%+ coverage

## 🔍 Pull Request Process

### Before Submitting

1. **Update your branch** with main:
   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. **Run all checks**:
   ```bash
   npm run lint
   npm run format
   npm test
   npm run build
   ```

3. **Update documentation** if needed
4. **Add tests** for new features

### PR Checklist

- [ ] Code follows style guidelines
- [ ] Tests added/updated and passing
- [ ] Documentation updated
- [ ] Commit messages follow convention
- [ ] No linting errors
- [ ] Build succeeds
- [ ] Architecture principles followed

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Refactoring
- [ ] Documentation

## Testing
How was this tested?

## Screenshots (if applicable)

## Related Issues
Closes #<issue_number>
```

### Review Process

1. **Automated checks** must pass (linting, tests, build)
2. **Code review** by at least one maintainer
3. **Architecture review** for significant changes
4. **Discussion** of design decisions if needed
5. **Approval** and merge

## 🎨 Adding New Features

### Example: Adding a Weather System

1. **Domain Layer** - Create weather entity:
   ```typescript
   // src/domain/entities/Weather.ts
   export class Weather {
     constructor(
       public readonly type: WeatherType,
       public readonly temperature: number,
       public readonly windSpeed: number
     ) {}
   }
   ```

2. **Application Layer** - Create service:
   ```typescript
   // src/application/services/WeatherService.ts
   export class WeatherService {
     updateWeather(deltaTime: number): Weather {
       // Update weather logic
     }
   }
   ```

3. **Infrastructure Layer** - Add visuals:
   ```typescript
   // src/infrastructure/babylon/WeatherRenderer.ts
   export class WeatherRenderer {
     renderSnow(scene: Scene): void {
       // Particle effects
     }
   }
   ```

4. **Presentation Layer** - Wire up:
   ```typescript
   // src/presentation/scenes/GameScene.ts
   export class GameScene {
     private weatherService: WeatherService;
     private weatherRenderer: WeatherRenderer;

     update(deltaTime: number): void {
       const weather = this.weatherService.updateWeather(deltaTime);
       this.weatherRenderer.update(weather);
     }
   }
   ```

5. **Add tests**:
   ```typescript
   // tests/unit/domain/Weather.test.ts
   describe('Weather', () => {
     it('should affect temperature', () => {
       // Tests
     });
   });
   ```

6. **Update documentation**:
   - Add to README features list
   - Document API in ARCHITECTURE.md
   - Add usage examples

## 📚 Resources

- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Babylon.js Documentation](https://doc.babylonjs.com/)
- [Vitest Documentation](https://vitest.dev/)

## 💡 Getting Help

- **Questions**: Open a GitHub Discussion
- **Bugs**: Create an Issue with reproduction steps
- **Feature Requests**: Open an Issue with detailed description
- **Chat**: Join our community (if available)

## 🙏 Recognition

Contributors will be recognized in:
- README.md Contributors section
- Release notes for significant contributions
- Project documentation

Thank you for contributing! 🎮
