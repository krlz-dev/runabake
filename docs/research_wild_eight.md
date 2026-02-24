# Winter Survival Game - Complete Research Reference

## 1. Survival Game Mechanics (The Wild Eight & Similar)

### Core Survival Stats
| Stat | Mechanic | Reference Games |
|------|----------|-----------------|
| **Cold/Temperature** | Primary killer; clothing warmth, campfires, shelter | The Wild Eight, The Long Dark |
| **Hunger** | Depletes over time; affects stamina below 50% | Don't Starve (75 cal/day drain) |
| **Health** | Lost from combat, cold, starvation | All survival games |
| **Stamina** | Sprinting, melee, tool use | Valheim, Project Zomboid |
| **Sanity** (optional) | Night/darkness drain, shadow creatures | Don't Starve (-0.833/sec at night) |

### Gameplay Loop
```
Gather Resources → Craft Tools → Build Shelter → Fight/Survive → Explore → [repeat]
```

### Progression System (The Wild Eight model)
- **Workshop** (10 levels): Wood → Ore → Iron → Tendon → Crystal → Dark Crystal
- **Shelter** (8 levels): Unlocks skill tiers + storage
- **Crafting**: Stick → Stone Axe → Bone Spear → Iron Sword → Crystal weapons

### The Wild Eight Structures System
| Structure | Function |
|-----------|----------|
| **Campfire** | Warmth, cooking food, creating torches |
| **Workshop** | All crafting (weapons, clothing, healing items) |
| **Shelter** | Skill upgrades, sleeping (eliminates cold and hunger) |
| **Furnace** | Converts Ore into Iron over time |
| **Chest** | Shared storage accessible by all players |
| **Sign** | Leave messages for other players |

### Workshop Progression (10 Levels)
| Level | Storage | Key Resources |
|-------|---------|---------------|
| I | 5 slots | 20 Wood, 10 Ore |
| II | 6 slots | 40 Wood, 40 Ore, 1 Iron |
| III | 7 slots | 65 Wood, 65 Ore, 1 Iron, 2 Tendon |
| VIII | 12 slots | 160 Wood, 160 Ore, 6 Bone, 8 Tendon, 10 Crystal |
| IX-X | 12 slots | Crystal and Dark Crystal focus |

### Shelter Progression (8 Levels)
| Level | Skill Tier | Storage | Cost |
|-------|-----------|---------|------|
| I | 1 | 0 | Free |
| II | 2 | 1 slot | 20 Wood, 20 Stone |
| III | 3 | 2 slots | 45 Wood, 45 Stone |
| IV | 4 | 3 slots | 60 Wood, 60 Stone, 2 Leather |
| V | 5 | 4 slots | 85 Wood, 85 Stone, 1 Iron, 4 Leather |
| VIII | 8 | 7 slots | 140 Wood, 140 Stone, 6 Leather, 4 Iron |

### Crafting System
**Weapon Progression:**
- Levels 1-2: Stick (5 Wood), Stone Axe (5 Ore + 5 Wood)
- Level 3-4: Bone Spear (15 Wood + 2 Bone + 2 Tendon)
- Level 5: Iron Sword (25 Wood + 3 Iron + 1 Tendon), Bow (15 Wood + 2 Tendon)
- Level 6-8: Steel weapons, Circular Saw (15 Scrap + 1 Battery + 5 Electronic Components)
- Level 9-10: Crystal weapons -- Crystal Sword (30 Wood + 4 Steel + 15 Dark Crystal)

**Armor Progression:**
- Defense scales from 0 to 40+
- Cold Resistance ranges from 2 to 20
- Materials progress: Wood → Leather → Fur → Steel → Crystal

**Trap System:**
- Damage escalates from 25 (simple) to 80 (endgame)
- Status effects: Slowdown → Bleeding → Stun → Holographic decoys

### Enemies
- **Wolves** -- hunt in packs, aggressive
- **Bears** -- stronger than wolves, chase players
- **Werewolves** -- rare, extremely tough encounters
- **Mutants** -- aggressive enemies near laboratories and anomalies
- **Tameable animals** -- wolves and deer can be tamed with bait items

### Multiplayer Design
- Supports 1-8 players online co-op
- Loot balanced for 2-3 players; more players = more competition
- Chests provide shared storage
- Death mechanic: respawn with skills intact; recover items from corpse

---

## 2. Reference Games - Mechanical Analysis

### Don't Starve / Don't Starve Together
Source: [DST Game Scripts](https://github.com/taichunmin/dont-starve-together-game-scripts/blob/master/tuning.lua)

**Game Constants from tuning.lua:**
| Constant | Value |
|----------|-------|
| `total_day_time` | 480 seconds (8 minutes real time) |
| `day_time` | 300 seconds (10 segments x 30s) |
| `dusk_time` | 120 seconds (4 segments) |
| `night_time` | 60 seconds (2 segments) |
| `calories_per_day` | 75 |
| Hunger drain rate | 0.15625 per second (75/480) |
| Wilson base health | 150 |
| Wilson base hunger | 150 |
| Wilson base sanity | 200 |

**Food Calorie Values:**
- CALORIES_TINY: 9.375
- CALORIES_SMALL: 12.5
- CALORIES_MED: 25
- CALORIES_LARGE: 37.5
- CALORIES_HUGE: 75

**Temperature System:**
- Freezing below 0 degrees: 1.25 damage/second
- Overheating above 70 degrees: 1.25 damage/second
- Starting temp: 35 degrees
- Insulation: every 30 points adds ~1 second before temperature drops 1 degree

**Sanity System:**
- Night darkness drain: -0.833/second
- Shadow creatures become physical and attack below 15% sanity
- Restored by: eating cooked food, picking flowers, wearing hats, sleeping

### Valheim
**Food System:**
- Base health: 25 (without food)
- Can eat 3 different food items simultaneously
- Foods categorized: yellow (stamina), red (health), silver (balanced)
- Food duration: 10-40 minutes depending on tier

**Rested Bonus:**
- Minimum duration: 8 minutes (Comfort 1)
- Each comfort level adds 1 minute (up to 24-26 minutes)
- Provides health regeneration bonus

**Boss Progression:**
- 8 biome bosses, each requiring specific summoning offerings
- Each boss drops a trophy granting a reusable power-up
- Only one power-up active at a time, with cooldown

### The Long Dark
**Calorie System:**
- Full hunger bar = 2,500 calories
- Starvation drain: 1% condition/hour when calorie store is empty
- Sleep costs: 75 calories/hour
- Walking: 270 calories/hour

**Design Philosophy:**
- Exploration is the primary loop, not combat
- Temperature communicated through breath vapor density, not UI thermometer
- "No hand-holding" -- player must interpret environmental cues
- Human error drives failure, not randomness

### DayZ
**Health/Blood System:**
- Blood range: 0-5000
- Health regeneration: 0.005-0.03/sec based on blood level

**Movement Speed Penalties (by health color):**
- Yellow: -14% jog, -7% sprint
- Red: -30% jog, -30% sprint
- Flashing Red: -56% jog, -70% sprint

### Project Zomboid
**Temperature System:**
- Hypothermia: triggers below 36.5C core body temp; reduces movement/attack speed
- Hyperthermia: triggers at high body temp; increases dehydration and fatigue
- Factors: weather, clothing, wetness, physical activity

**Infection System:**
- Knox Infection (zombie bite): 100% fatal over 3-4 days
- Food poisoning, tainted water: reversible with rest

---

## 3. Character Types & Stat Systems

### The Wild Eight's 8 Characters
| Character | Background | Unique Abilities |
|-----------|-----------|-----------------|
| **Anna** | Pharmacology student | All crafted medical supplies are 2x as effective |
| **Robin** | Biathlon athlete | +5% speed, +5% attack speed, +5% ranged attack power, +10% stamina recovery |
| **Cole** | Strong laborer | +10% melee attack power, +5% stamina recovery speed |
| **William** | Beginner-friendly | +10% Defense, +5% Protection from the cold |
| **Chang** | Intellectual | -10% to the cost of learning new skills |
| **Vivian** | Lucky scavenger | +5% Crit chance (10% from behind), +40% more Wood, +40% more Ore |
| **Jeffrey** | Handyman | +25% durability on all crafted items (shareable with team) |
| **Oliver** | Entrepreneur | -10% construction costs, -10% crafting costs |

### Survival-Specific Archetypes
| Archetype | Role | Examples |
|-----------|------|----------|
| **Medic/Healer** | Crafts better medical supplies | Anna (Wild Eight), Wortox (DST) |
| **Fighter/Warrior** | Melee specialist, high damage | Cole (Wild Eight), Wolfgang (DST) |
| **Scout/Ranger** | Speed, ranged attacks, mobility | Robin (Wild Eight) |
| **Tank/Defender** | Absorbs damage, cold resistance | William (Wild Eight) |
| **Scholar/Engineer** | Learns faster, skill cost reduction | Chang (Wild Eight), WX-78 (DST) |
| **Gatherer/Scavenger** | Better resource yields | Vivian (Wild Eight) |
| **Craftsman/Builder** | Durable items, better equipment | Jeffrey (Wild Eight) |
| **Economist/Optimizer** | Reduced costs, efficient use | Oliver (Wild Eight) |

### Skill System (5 Categories, 40 Skills)
**Hunting** (XP from animal kills):
- Bone/Tendon/Leather/Fat Extraction (Max Rank 2 each)
- Master versions (Max Rank 5 each)

**Mobility** (XP from movement):
- Sprint (Rank 1), Speed (Rank 4), Stamina Recovery (Rank 4)
- Athletics (Rank 4), Sprint Time (Rank 6)

**Offense** (XP from dealing damage):
- Melee/Ranged Attack Damage (Rank 6), Attack Speed (Rank 4)
- Critical Damage (Rank 4), Critical Chance (Rank 3)
- Cutting Attack (bleeding), Stunning Attack

**Defense** (XP from taking damage):
- Defense (Rank 4), Thick Skin/max health (Rank 4)
- Bleeding/Stun Resistance (Rank 5), Evasion (Rank 2)
- Equipment Maintenance (Rank 5), Fury (Rank 1)

**Gathering** (XP from harvesting):
- Upgraded Backpack (Rank 8 -- extra inventory slots)
- Axe/Pickaxe Mastery (Rank 4 -- more resources per harvest)
- Storage Skills (Rank 1-4 -- increased stack sizes)

### Recommended Character Architecture
```
Character
  |-- Identity (name, backstory, portrait)
  |-- Archetype (defines unique passive ability + stat bonuses)
  |-- Base Stats
  |     |-- Health, Hunger, Warmth, Stamina (survival stats)
  |     |-- Strength, Agility, Intelligence (attribute stats)
  |-- Derived Stats
  |     |-- Melee Damage = f(Strength, Weapon)
  |     |-- Move Speed = f(Agility, Encumbrance)
  |     |-- Craft Quality = f(Intelligence, Tools)
  |     |-- Cold Resistance = f(Warmth, Clothing)
  |-- Modifiers[] (from equipment, buffs, environment)
  |-- Skill Trees (5 categories, activity-based XP)
  |     |-- Hunting (animal resources)
  |     |-- Mobility (speed, stamina)
  |     |-- Offense (melee, ranged, crits)
  |     |-- Defense (resistances, evasion)
  |     |-- Gathering (yields, storage)
  |-- Inventory
  |-- Equipment Slots
```

### Open Source Stat/RPG Frameworks
| Repo | Language | Description |
|------|----------|-------------|
| [openrpg/OpenRpg](https://github.com/openrpg/OpenRpg) | C# | Full RPG framework (stats, classes, items, combat) |
| [1sra3l/rpg-stat](https://github.com/1sra3l/rpg-stat) | Rust | Three-tier stat lib (Basic/Normal/Advanced) |
| [Zennyth/EnhancedStat](https://github.com/Zennyth/EnhancedStat) | Godot 4.1 | Reactive stats, modifiers, status effects addon |
| [SeldonHh/Godot_skill_tree_maker](https://github.com/SeldonHh/Godot_skill_tree_maker) | Godot 4.4 | Skill tree builder tool |
| [willnationsdev/godot-skills](https://github.com/willnationsdev/godot-skills) | Godot | Compositional skill/ability system |
| [digital-synapse/rpg-stats](https://github.com/digital-synapse/rpg-stats) | C# | Character stat system with battle system |
| [gdquest-demos/godot-open-rpg](https://github.com/gdquest-demos/godot-open-rpg) | Godot | Full open RPG demo with combat, inventory |

---

## 4. Open Source Survival Implementations

### Survival Mechanics Engines
| Repo | Language | Features |
|------|----------|----------|
| [vagrod/zara](https://github.com/vagrod/zara) | C# (MIT) | Body temp, blood pressure, heart rate, stamina, fatigue, diseases, injuries, inventory, crafting |
| [vagrod/zara-rust](https://github.com/vagrod/zara-rust) | Rust (MIT) | Same as above, Rust port. Works with Godot, Unity, Flax |
| [CleverRaven/Cataclysm-DDA](https://github.com/CleverRaven/Cataclysm-DDA) | C++ (CC BY-SA) | Per-body-part temperature, metabolism, massive open-source survival |
| [tomlooman/EpicSurvivalGame](https://github.com/tomlooman/EpicSurvivalGame) | C++ (UE) | Third-person survival, hunger, inventory, multiplayer, AI bots |
| [DanialKama/SurvivalMechanics](https://github.com/DanialKama/SurvivalMechanics) | UE5 | Health, hydration, hunger systems, inventory |
| [mwbryant/bevy_survival_crafting_game](https://github.com/mwbryant/bevy_survival_crafting_game) | Rust/Bevy | Don't Starve-inspired gathering/crafting |
| [etopuz/Survival-Game](https://github.com/etopuz/Survival-Game) | Unity | Health/hunger/stamina, gathering, inventory |

### Procedural Generation
| Repo | Description |
|------|-------------|
| [mxgmn/WaveFunctionCollapse](https://github.com/mxgmn/WaveFunctionCollapse) | Tilemap/bitmap generation from single example |
| [RyanCross/godot-wave-function-collapse](https://github.com/RyanCross/godot-wave-function-collapse) | WFC for Godot 4 TileMaps |
| [wdcqc/WaveFunctionDiffusion](https://github.com/wdcqc/WaveFunctionDiffusion) | Hybrid WFC + Stable Diffusion for tile maps |
| [Jaysmito101/TerraForge3D](https://github.com/Jaysmito101/TerraForge3D) | Procedural terrain (40+ nodes, GPU-accelerated, Linux) |
| [dimitrivlachos/Procedural-Terrain-Heightmap-Generator](https://github.com/dimitrivlachos/Procedural-Terrain-Heightmap-Generator) | Cellular automata + Perlin noise terrain |
| [Red Blob Games: Terrain from Noise](https://www.redblobgames.com/maps/terrain-from-noise/) | Essential reference for procedural terrain |

---

## 5. Game Engines for Linux → Mobile + Desktop

### Recommended: Godot 4 (GDScript)
| Feature | Details |
|---------|---------|
| **License** | MIT (fully free/open source) |
| **Linux** | First-class native support |
| **Targets** | Windows, Linux, macOS, Android, iOS, Web |
| **2D Tilemap** | Built-in editor with isometric modes |
| **Networking** | Built-in high-level multiplayer API |
| **GitHub** | [godotengine/godot](https://github.com/godotengine/godot) (90k+ stars) |
| **Android** | Full export from Linux with SDK/NDK |
| **iOS from Linux** | [Documented cross-compilation](https://docs.godotengine.org/en/4.4/contributing/development/compiling/cross-compiling_for_ios_on_linux.html) |

### Engine Comparison
| Engine | Best For | APK Size | Mobile Perf | Visual Editor | License |
|--------|----------|----------|-------------|---------------|---------|
| **Godot 4** | Best overall survival games | 15-25MB | Good | Yes | MIT |
| **Defold** | Mobile-first 2D | 4-6MB | Excellent | Yes | Custom (free) |
| **LibGDX** | Java/Kotlin devs | <3MB | Good | No | Apache 2.0 |
| **Bevy** | Rust devs, ECS architecture | Variable | Needs tuning | No | MIT/Apache |
| **Cocos 4** | Mobile optimization | Small | Excellent | Yes | MIT (Jan 2026) |
| **Flax** | High-quality 3D | Variable | Good | Yes | Custom |

### Detailed Comparison for Survival Games
| Criteria | Godot | Defold | LibGDX | Bevy | Cocos |
|---|---|---|---|---|---|
| **2D Tilemap Support** | Built-in editor | Good (manual) | Manual via Tiled | Plugins available | Built-in |
| **Isometric Support** | Native tilemap modes | Manual setup | Tiled integration | Community plugins | Supported |
| **Ease of Use** | High | Medium | Medium | Low | Medium |
| **Community Size** | Very Large | Medium | Medium | Growing | Large (Asia) |
| **Networking** | Built-in high-level API | Via Colyseus/Nakama | Manual/Kryonet | matchbox/ggrs libs | Built-in |

### Android SDK/NDK Setup on Linux
```bash
# Install Android command-line tools
wget https://dl.google.com/android/repository/commandlinetools-linux-latest.zip
unzip commandlinetools-linux-latest.zip -d ~/android-sdk/cmdline-tools/latest

# Set environment variables
export ANDROID_HOME=~/android-sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools

# Accept licenses
yes | sdkmanager --licenses

# Install required components
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0" "ndk;26.1.10909125"
```

### iOS Cross-Compilation from Linux
- **Godot**: [Official docs](https://docs.godotengine.org/en/4.4/contributing/development/compiling/cross-compiling_for_ios_on_linux.html) using cctools-port
- **xtool**: Swift cross-platform Xcode replacement, builds iOS apps on Linux
- **Limitation**: No iOS simulator on Linux; need physical device for testing

### CI/CD for Game Builds
| Tool | URL | Description |
|------|-----|-------------|
| **godot-ci** | [abarichello/godot-ci](https://github.com/abarichello/godot-ci) | Docker + GitHub Actions for all platforms + itch.io deploy |
| **Godot Export** | [marketplace/actions/godot-export](https://github.com/marketplace/actions/godot-export) | Auto-reads export_presets.cfg |
| **godot-exporter** | [vini-guerrero/godot-exporter](https://github.com/vini-guerrero/godot-exporter) | Full pipeline: Android, iOS, Linux, macOS, Windows, HTML5 |

### Open Source Survival Games (Godot)
| Project | URL | Description |
|---------|-----|-------------|
| **GDScript survival topic** | [github.com/topics/survival-game?l=gdscript](https://github.com/topics/survival-game?l=gdscript) | All GDScript survival games |
| **all_alone** | [thelastflapjack/all_alone](https://github.com/thelastflapjack/all_alone) | Zombie survival (Godot 3.5, C#) |
| **godot-open-rpg** | [gdquest-demos/godot-open-rpg](https://github.com/gdquest-demos/godot-open-rpg) | RPG with inventory/combat |
| **awesome-godot** | [godotengine/awesome-godot](https://github.com/godotengine/awesome-godot) | Curated plugins and addons |

### Godot Survival Game Tutorials
| Resource | URL | Format |
|----------|-----|--------|
| **How to Code Survival Games in Godot** | [gamedevacademy.org](https://gamedevacademy.org/how-to-code-survival-games-in-godot/) | Free guide |
| **GDQuest 3D FPS Arena Survival** | [gdquest.com](https://www.gdquest.com/library/first_3d_game_godot4_arena_fps/) | Free course |
| **2D Survivors Style Game** | [Udemy](https://www.udemy.com/course/create-a-complete-2d-arena-survival-roguelike-game-in-godot-4/) | Paid |
| **3D Survival Game in Godot 4** | [Udemy](https://www.udemy.com/course/godot-survival-game/) | Paid |
| **Godot Sci-Fi Survival** | [Zenva](https://academy.zenva.com/product/godot-sci-fi-survival-game/) | Paid |

---

## 6. Art & Environment Tools (Linux-Native)

### 2D Art Tools

#### Pixel Art Editors Comparison
| Feature | Aseprite | Pixelorama | LibreSprite |
|---|---|---|---|
| **Cost** | $20 (or compile free) | Free (MIT) | Free (GPLv2) |
| **Linux native** | Compile from source | Yes | Yes |
| **Animation** | Excellent | Very Good | Good |
| **Onion skinning** | Yes | Yes | Yes |
| **Tiling mode** | Yes | Yes | Limited |
| **Sprite sheet export** | Yes | Yes | Yes |
| **Active development** | Yes | Yes (fast) | Yes (slower) |
| **Indexed color** | Yes | Yes | Yes |

- **Krita** ([krita.org](https://krita.org)): GPL, concept art, digital painting, wrap-around tiling mode for seamless textures
- **GIMP** ([gimp.org](https://www.gimp.org)): GPL, image manipulation, texture editing, batch processing
- **Aseprite** ([github.com/aseprite/aseprite](https://github.com/aseprite/aseprite)): Industry-standard pixel art, compile from source on Linux
- **Pixelorama** ([github.com/Orama-Interactive/Pixelorama](https://github.com/Orama-Interactive/Pixelorama)): MIT, built in Godot, 16+ tools, 3D layer support
- **LibreSprite** ([github.com/LibreSprite/LibreSprite](https://github.com/LibreSprite/LibreSprite)): GPLv2, fork of old Aseprite

### 3D Modeling
- **Blender** ([blender.org](https://www.blender.org)): GPL, full 3D pipeline, terrain sculpting, particle snow, procedural materials
- **Goxel** ([github.com/guillaumechereau/goxel](https://github.com/guillaumechereau/goxel)): GPL, voxel editor (MagicaVoxel alternative for Linux)
- **Blockbench** ([blockbench.net](https://www.blockbench.net)): GPL, low-poly 3D with pixel art textures, AppImage for Linux

### Tilemap / Level Editors
- **Tiled** ([github.com/mapeditor/tiled](https://github.com/mapeditor/tiled)): GPL, orthogonal/isometric/hex, automapping, TMX/JSON export
- **LDtk** ([github.com/deepnight/ldtk](https://github.com/deepnight/ldtk)): MIT, by Dead Cells dev, auto-tiling, world system, modern UI

| Feature | Tiled | LDtk |
|---|---|---|
| **Auto-tiling** | Via automapping rules (complex) | Built-in, intuitive |
| **UI/UX** | Functional, dated | Modern, polished |
| **World/multi-map** | Limited | Native "Worlds" system |
| **Entity support** | Object layers | Full Entity/Enum system |
| **Engine support** | Extremely broad | Growing (JSON parsable) |

### Terrain Generation
- **TerraForge3D** ([github.com/Jaysmito101/TerraForge3D](https://github.com/Jaysmito101/TerraForge3D)): MIT, 40+ nodes, GPU-accelerated, only high-end terrain gen on Linux
- **Height Map Editor** ([hme.sourceforge.net](https://hme.sourceforge.net/)): GPL, maps up to 10000x10000

### 2D Animation
- **Synfig** ([github.com/synfig/synfig](https://github.com/synfig/synfig)): GPL, vector/bitmap 2D animation, bone rigging, IK
- **LoongBones** ([loongbones.app](https://www.loongbones.app)): Free, web-based skeletal animation, Spine JSON compatible
- **Blender Grease Pencil**: Built-in 2D animation in 3D space

### Recommended Pipeline
```
Phase 1: CONCEPT & PLANNING
  Krita (concept art, mood boards, color palettes)

Phase 2: ENVIRONMENT ART
  Pixelorama OR Aseprite (tile sprites, 16x16 or 32x32)
  Krita (seamless textures via wrap-around mode)
  LDtk OR Tiled (level assembly with auto-tiling)

Phase 3: CHARACTER & ITEM SPRITES
  Pixelorama OR Aseprite (character sprites, item icons)
  Synfig OR LoongBones (skeletal animation)
    OR Pixelorama/Aseprite (frame-by-frame animation)

Phase 4: TERRAIN & WORLD
  TerraForge3D (procedural heightmap generation)
    OR Python + Perlin noise scripts (2D top-down)
  LDtk (world-level map linking, biome zones)

Phase 5: 3D ASSETS (if needed)
  Blender (environment props, 3D-to-2D rendering)
  Goxel OR Blockbench (voxel/low-poly items)

Phase 6: INTEGRATION
  Godot Engine (import tilesets, configure TileMap nodes)
  GIMP (batch processing, format conversion, atlas optimization)
```

### Winter/Snow Asset Packs (Free)
| Resource | URL | Description |
|----------|-----|-------------|
| **Kenney Survival Kit** | [kenney.nl/assets/survival-kit](https://kenney.nl/assets/survival-kit) | 80 3D models (CC0) |
| **Seliel Winter Forest** | [seliel-the-shaper.itch.io/winter-forest](https://seliel-the-shaper.itch.io/winter-forest) | 16x16 SNES-style with auto-tiling |
| **OpenGameArt Tiled Terrains** | [opengameart.org/content/tiled-terrains](https://opengameart.org/content/tiled-terrains) | Snow terrain atlas with TMX |
| **CraftPix Snow Tileset** | [craftpix.net](https://craftpix.net/product/snow-2d-game-tileset-pixel-art/) | Snow 2D pixel art tileset |
| **itch.io free snow** | [itch.io/game-assets/free/tag-snow](https://itch.io/game-assets/free/tag-snow) | Various free snow assets |
| **FreeStylized Snow PBR** | [freestylized.com/material/snow_01](https://freestylized.com/material/snow_01/) | Stylized snow PBR texture |
| **OpenGameArt Nature Sprites** | [opengameart.org](https://opengameart.org/content/assets-free-nature-sprites-trees-shrubs) | 27 PNG tree/shrub sprites |
| **itch.io winter tilesets** | [itch.io/game-assets/tag-tileset/tag-winter](https://itch.io/game-assets/tag-tileset/tag-winter) | Winter-themed tilesets |

### Art Style References
- **Pixel Art Tutorials**: [SLYNYRD Top-Down Characters](https://www.slynyrd.com/blog/2019/10/21/pixelblog-22-top-down-character-sprites)
- **Sprite Sheet Generator**: [Universal LPC Spritesheet Generator](https://liberatedpixelcup.github.io/Universal-LPC-Spritesheet-Character-Generator/)
- **Low Poly Guide**: [retrostylegames.com](https://retrostylegames.com/blog/low-poly-game-art-an-ultimate-guide/)
- **Synty POLYGON Snow Kit**: [syntystore.com](https://syntystore.com/products/polygon-snow-kit) (commercial)

---

## 7. AI-Assisted Tools (All Linux-Compatible)

### Art Generation
| Tool | Use Case | Link |
|------|----------|------|
| **ComfyUI** | Node-based AI image workflow | [Comfy-Org/ComfyUI](https://github.com/Comfy-Org/ComfyUI) |
| **FLUX.1 / FLUX.2** | Best open-source image gen (Apache 2.0) | [black-forest-labs/flux](https://github.com/black-forest-labs/flux) |
| **AUTOMATIC1111** | Classic Stable Diffusion web UI | [AUTOMATIC1111/stable-diffusion-webui](https://github.com/AUTOMATIC1111/stable-diffusion-webui) |
| **Retro Diffusion** | AI pixel art inside Aseprite | [astropulse.itch.io/retrodiffusion](https://astropulse.itch.io/retrodiffusion) |
| **pixel-art-xl LoRA** | Pixel art generation | [huggingface.co/nerijs/pixel-art-xl](https://huggingface.co/nerijs/pixel-art-xl) |
| **SD PixelArt SpriteSheet Gen** | Sprite sheet generation | [huggingface.co/Onodofthenorth/SD_PixelArt_SpriteSheet_Generator](https://huggingface.co/Onodofthenorth/SD_PixelArt_SpriteSheet_Generator) |

### Procedural Generation
| Tool | Use Case | Link |
|------|----------|------|
| **WaveFunctionCollapse** | Tilemap generation from examples | [mxgmn/WaveFunctionCollapse](https://github.com/mxgmn/WaveFunctionCollapse) |
| **Godot WFC** | WFC for Godot 4 TileMaps | [RyanCross/godot-wave-function-collapse](https://github.com/RyanCross/godot-wave-function-collapse) |
| **WaveFunctionDiffusion** | Hybrid WFC + Stable Diffusion | [wdcqc/WaveFunctionDiffusion](https://github.com/wdcqc/WaveFunctionDiffusion) |
| **TerraForge3D** | Procedural terrain (40+ nodes, GPU) | [Jaysmito101/TerraForge3D](https://github.com/Jaysmito101/TerraForge3D) |
| **Promethean AI** | NLP-driven 3D environment creation | [prometheanai.com](https://prometheanai.com/) |

### PBR Textures
| Tool | Use Case | Link |
|------|----------|------|
| **CHORD (Ubisoft)** | AI PBR material estimation (open source) | [ubisoft-laforge.github.io/world/chord](https://ubisoft-laforge.github.io/world/chord/) |
| **PBRify_Remix** | Upscale + generate PBR maps | [Kim2091/PBRify_Remix](https://github.com/Kim2091/PBRify_Remix) |
| **NeuralPBR** | Neural network PBR generation | [vkk800/NeuralPBR](https://github.com/vkk800/NeuralPBR) |
| **Tessellating PBR Gen** | Text prompt → full PBR set | [jjohare/tessellating-pbr-generator](https://github.com/jjohare/tessellating-pbr-generator) |
| **NormalMapOnline** | Browser-based normal/AO/specular maps | [crazytoolsteam/NormalMapOnline](https://github.com/crazytoolsteam/NormalMapOnline) |
| **GenPBR** | Free unlimited PBR maps (browser) | [genpbr.com](https://genpbr.com/) |

### Sound/Music
| Tool | Use Case | Link |
|------|----------|------|
| **AudioCraft (MusicGen)** | AI music from text prompts | [facebookresearch/audiocraft](https://github.com/facebookresearch/audiocraft) |
| **Bark** | Speech + SFX generation | [suno-ai/bark](https://github.com/suno-ai/bark) |
| **AudioLDM** | Latent diffusion text-to-audio | [haoheliu/AudioLDM](https://github.com/haoheliu/AudioLDM) |
| **FoleyCrafter** | Video-to-audio SFX sync | [open-mmlab/FoleyCrafter](https://github.com/open-mmlab/FoleyCrafter) |
| **rFXGen** | Retro game SFX generator | [raysan5/rfxgen](https://github.com/raysan5/rfxgen) |
| **sfxr** | Classic retro SFX generator | [grimfang4/sfxr](https://github.com/grimfang4/sfxr) |

### NPC AI
| Tool | Use Case | Link |
|------|----------|------|
| **NPC-Engine** | NLP-based NPC dialogue + behavior | [npc-engine/npc-engine](https://github.com/npc-engine/npc-engine) |
| **Rasa** | Dialogue management framework | [RasaHQ/rasa](https://github.com/RasaHQ/rasa) |
| **Interactive LLM NPCs** | LLM-powered NPC dialogue + actions | [AkshitIreddy/Interactive-LLM-Powered-NPCs](https://github.com/AkshitIreddy/Interactive-LLM-Powered-NPCs) |
| **Unity ML-Agents** | Reinforcement learning for NPC behavior | [Unity-Technologies/ml-agents](https://github.com/Unity-Technologies/ml-agents) |
| **Convai** | Multimodal NPC AI platform | [convai.com](https://www.convai.com/) |

**Best Practice (2025-2026):** Combine traditional behavior trees (pathfinding, animation, physical actions) with LLMs (cognitive reasoning, dialogue, emotional responses).

### Animation
| Tool | Use Case | Link |
|------|----------|------|
| **Cascadeur** | AI-assisted 3D animation (free tier, Linux) | [cascadeur.com](https://cascadeur.com/) |
| **FreeMocap** | Free markerless motion capture | [freemocap/freemocap](https://github.com/freemocap/freemocap) |
| **EasyMocap** | Simplified human motion capture | [zju3dv/EasyMocap](https://github.com/zju3dv/EasyMocap) |
| **DeepMotion** | AI mocap from video (cloud) | [deepmotion.com](https://www.deepmotion.com/) |

---

## 8. Day/Night Cycles and Weather

### Implementation Pattern
- World tick system (e.g., 1 tick/second)
- 1 game day = configurable real-time duration (DST: 8 minutes, common range: 20-60 minutes)
- Day broken into segments: Dawn, Day, Dusk, Night
- Each segment triggers different events, spawn rules, temperature changes

### Weather Effects on Gameplay
- **Rain**: water collection, wetness debuff, fire prevention, reduced visibility
- **Snow/Blizzard**: forced shelter-seeking, temperature penalties, movement reduction
- **Cold**: clothing warmth requirements, calorie burn increase, hypothermia risk
- **Heat**: dehydration acceleration, overheating damage

---

## 9. Enemy AI and Combat Design

### Pack Behavior Pattern
- Introduce lone enemies first (teach player the mechanic)
- Scale to packs as player power increases
- Coordinate group attacks with flanking

### AI Sophistication Spectrum
- **Basic**: patrol routes, aggro radius, chase-attack loops (The Wild Eight wolves)
- **Medium**: environmental awareness, line-of-sight, retreat behavior (The Forest cannibals)
- **Advanced**: coordinated flanking, sound reaction, adaptive tactics (Rust scientists)

---

## 10. Design Documents & Academic Resources

- [Survival Game Design Principles](https://gamedesignskills.com/game-design/survival/) - GDD guidance
- [Template Concept Document for Survival Games](https://medium.com/gaming-industry-documents-for-every-game-genre/template-concept-document-for-survival-games-05a502ae8a40) - Medium GDD template
- [A Blueprint to Survival Game Design (Thesis)](https://www.theseus.fi/bitstream/10024/872026/3/Richard_Ned.pdf) - Academic thesis
- [Survival Mechanics and Emergent Narrative (Thesis)](https://uu.diva-portal.org/smash/get/diva2:1563875/FULLTEXT01.pdf) - Uppsala University
- [7 Crafting Systems to Study](https://www.gamedeveloper.com/design/7-crafting-systems-game-designers-should-study)
- [How We Unbroke Our Crafting System](https://www.gamedeveloper.com/design/how-we-unbroke-our-crafting-system) - Postmortem
- [The Long Dark Design Philosophy](https://www.gamedeveloper.com/design/what-survival-game-design-means-to-the-studio-behind-i-the-long-dark-i-)
- [Multiplayer Survival Architecture](https://80.lv/articles/working-out-multiplayer-survival-genre) - Data table approach

---

## Key Design Takeaways

1. **Interconnected systems** make survival work - cold → hunger → stamina → exploration range
2. **Activity-based XP** (learn by doing) keeps players engaged with all systems
3. **Horizontal progression** (explore to find recipes) works better than vertical for survival
4. **Zara Engine** is the most complete open-source survival mechanics framework
5. **Godot 4** is the strongest choice for Linux → mobile + desktop development
6. **Defold** wins if mobile performance is top priority (4-6MB APK, 60fps on low-end devices)
7. **WaveFunctionCollapse + LDtk auto-tiling** can generate winter biome maps procedurally
8. **ComfyUI + FLUX.2** on Linux can generate concept art and textures locally
9. **The Long Dark's** approach of environmental storytelling over HUD elements is worth studying
10. **Don't Starve's tuning.lua** is the gold standard for studying survival balance constants
