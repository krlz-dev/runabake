# Quick Start Guide

Get your Wild Survival Game running in 5 minutes!

## ⚡ Fast Track

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open browser (auto-opens to http://localhost:3000)
```

**That's it!** You should see:
- A 3D scene with a blue cube
- Stat bars in the top-left
- Controls info in the top-right

## 🎮 Controls

- **WASD** or **Arrow Keys** - Move
- **Shift** - Sprint (uses stamina)
- **Space** - Jump (not implemented yet)
- **E/F** - Interact (not implemented yet)

## 🧪 Testing It Works

### Watch Stats Deplete
Wait 30 seconds and you'll see:
- Hunger drops slowly
- Thirst drops faster
- Stamina regenerates when idle
- Stamina depletes when sprinting

### Try Movement
- Move around with WASD
- Hold Shift to sprint (faster, uses stamina)
- Watch the stamina bar deplete
- Stop moving to regenerate stamina

### Check Console
Open browser DevTools (F12) and check console:
- Should see initialization messages
- No errors
- Optional warnings about needs (when stats get low)

## ✅ Verify Installation

```bash
# Run tests
npm test
# Should show: 17 passed

# Check code quality
npm run lint
# Should show: No errors

# Build for production
npm run build
# Should complete without errors
```

## 📁 What You Got

```
Your Project Structure:
├── src/
│   ├── domain/           ← Game logic (character, items, inventory)
│   ├── application/      ← Use cases (crafting)
│   ├── infrastructure/   ← Babylon.js integration
│   ├── presentation/     ← Scenes and UI
│   └── main.ts           ← Entry point
│
├── public/
│   ├── index.html        ← Game UI
│   └── assets/           ← Put Kenney models here (empty for now)
│
├── tests/                ← Unit tests
└── docs/                 ← Documentation
    ├── README.md         ← Full user guide
    ├── ARCHITECTURE.md   ← How it's built
    ├── ROADMAP.md        ← What's next
    └── CONTRIBUTING.md   ← How to contribute
```

## 🎯 Next Steps

### Option 1: Explore the Code
```bash
# Read the main entry point
cat src/main.ts

# Check domain entities
cat src/domain/entities/Character.ts

# See the game scene
cat src/presentation/scenes/GameScene.ts
```

### Option 2: Add Kenney Assets
1. Download from: https://kenney.nl/assets/survival-kit
2. Create folder: `public/assets/models/kenney/`
3. Copy .glb files there
4. Use AssetLoader to load them (see ARCHITECTURE.md)

### Option 3: Start Phase 2 Development
Check `ROADMAP.md` and pick a feature:
- Day/night cycle
- Weather system
- Crafting UI
- Resource gathering

### Option 4: Read Documentation
- `README.md` - Complete user guide
- `ARCHITECTURE.md` - Deep dive into structure
- `PROJECT_SUMMARY.md` - What's already built

## 🐛 Troubleshooting

### "Module not found" errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### "Port 3000 already in use"
```bash
# Change port in vite.config.ts or use:
npm run dev -- --port 3001
```

### TypeScript errors in editor
```bash
# Restart TypeScript server in VS Code:
# Cmd+Shift+P → "TypeScript: Restart TS Server"
```

### Game doesn't load / black screen
- Check browser console (F12)
- Look for errors
- Try Chrome/Firefox if using Safari
- Check if WebGL is enabled

## 📚 Learning Path

### Day 1: Understand the Foundation
1. Run the game ✅
2. Read README.md
3. Explore src/domain/
4. Run tests: `npm test`

### Day 2: Explore Architecture
1. Read ARCHITECTURE.md
2. Study Character.ts
3. Look at CraftItemUseCase.ts
4. Understand the layer separation

### Day 3: Customize Something
1. Change stat depletion rates in GameConstants.ts
2. Add a new item type
3. Modify UI colors in index.html
4. Add a console.log to see input events

### Day 4: Add a Feature
1. Pick from ROADMAP.md
2. Start with something small
3. Follow clean architecture patterns
4. Write a test first

## 🎨 Quick Customizations

### Change Background Color
```typescript
// src/infrastructure/babylon/BabylonEngine.ts
scene.clearColor = new Color4(0.1, 0.1, 0.2, 1.0); // Dark blue
```

### Change Stat Depletion Speed
```typescript
// src/shared/constants/GameConstants.ts
export const GAME_CONFIG = {
  HUNGER_DEPLETION_RATE: 2, // Faster hunger (was 1)
  THIRST_DEPLETION_RATE: 3, // Faster thirst (was 1.5)
  // ...
};
```

### Add More Health
```typescript
// src/main.ts
Stats.create(
  200, // health (was 100)
  200, // maxHealth (was 100)
  // ...
)
```

### Change Movement Speed
```typescript
// src/shared/constants/GameConstants.ts
export const MOVEMENT_SPEEDS = {
  WALK: 5,   // Faster (was 3)
  RUN: 10,   // Faster (was 6)
  SPRINT: 15, // Faster (was 9)
} as const;
```

## 💻 Development Commands

```bash
# Development
npm run dev          # Start dev server with hot reload
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Check for errors
npm run lint:fix     # Auto-fix errors
npm run format       # Format code with Prettier

# Testing
npm test             # Run tests once
npm run test:ui      # Run tests with UI
npm test -- --watch  # Run tests in watch mode
```

## 🎓 Pro Tips

1. **Use the documentation** - Everything is explained in the markdown files
2. **Start small** - Modify existing code before adding new features
3. **Follow the architecture** - Keep domain pure, no Babylon.js in domain/
4. **Write tests** - Especially for domain logic
5. **Check the examples** - CraftItemUseCase.ts shows best practices
6. **Ask questions** - Open GitHub issues if stuck

## 🌟 Recommended IDE Setup

### VS Code Extensions
- ESLint
- Prettier
- TypeScript
- Error Lens
- Path Intellisense

### Settings
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

## 🚀 You're Ready!

The foundation is solid. Now it's time to build your survival game!

Choose your path:
- **Builder**: Add features from ROADMAP.md
- **Explorer**: Study the code and architecture
- **Creator**: Customize and make it your own
- **Tester**: Add more test coverage

**Happy coding!** 🎮

---

Need help? Check:
- README.md - Full documentation
- ARCHITECTURE.md - Technical details
- ROADMAP.md - Feature roadmap
- CONTRIBUTING.md - How to contribute
- PROJECT_SUMMARY.md - What's been built

---

_Generated: 2026-02-24_
