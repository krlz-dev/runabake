import { BabylonEngine } from '@infrastructure/babylon/BabylonEngine';
import { GameScene } from '@presentation/scenes/GameScene';
import { Character } from '@domain/entities/Character';
import { Inventory } from '@domain/entities/Inventory';
import { Stats } from '@domain/value-objects/Stats';
import { CharacterClass, CHARACTER_STATS, GAME_CONFIG } from '@shared/constants/GameConstants';
import { EventBus } from '@application/events/EventBus';
import { TimeService } from '@application/services/TimeService';
import { WeatherService } from '@application/services/WeatherService';
import { GatherResourceUseCase } from '@application/use-cases/GatherResourceUseCase';
import { CraftItemUseCase } from '@application/use-cases/CraftItemUseCase';
import { InteractionController } from '@presentation/controllers/InteractionController';
import { InventoryPanel } from '@presentation/ui/InventoryPanel';
import { CraftingPanel } from '@presentation/ui/CraftingPanel';

/**
 * Main application entry point
 */
class Application {
  private engine: BabylonEngine;
  private gameScene: GameScene | null = null;
  private character: Character | null = null;
  private inventory: Inventory | null = null;
  private updateInterval: number | null = null;

  // Phase 2 systems
  private eventBus: EventBus;
  private timeService: TimeService;
  private weatherService: WeatherService;
  private gatherUseCase: GatherResourceUseCase | null = null;
  private craftUseCase: CraftItemUseCase | null = null;
  private interactionController: InteractionController | null = null;
  private inventoryPanel: InventoryPanel | null = null;
  private craftingPanel: CraftingPanel | null = null;

  // HUD elements
  private timeDisplayEl: HTMLElement | null = null;
  private tempDisplayEl: HTMLElement | null = null;
  private weatherDisplayEl: HTMLElement | null = null;

  constructor() {
    this.engine = new BabylonEngine();
    this.eventBus = new EventBus();
    this.timeService = new TimeService(this.eventBus);
    this.weatherService = new WeatherService(this.eventBus);
  }

  async initialize(): Promise<void> {
    console.log('Initializing Wild Survival Game...');

    const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
    if (!canvas) {
      throw new Error('Canvas element not found');
    }

    // Initialize Babylon.js engine
    this.engine.initialize(canvas);
    console.log('Engine initialized');

    // Create scene
    const scene = this.engine.createScene();
    console.log('Scene created');

    // Initialize game scene with EventBus
    this.gameScene = new GameScene(scene, this.eventBus);
    console.log('Game scene initialized');

    // Create player character
    this.character = Character.create(
      'player_1',
      CharacterClass.SURVIVOR,
      'Player',
      Stats.create(
        CHARACTER_STATS.BASE_HEALTH,
        CHARACTER_STATS.BASE_HEALTH,
        CHARACTER_STATS.BASE_HUNGER,
        CHARACTER_STATS.BASE_HUNGER,
        CHARACTER_STATS.BASE_THIRST,
        CHARACTER_STATS.BASE_THIRST,
        37,
        CHARACTER_STATS.BASE_STAMINA,
        CHARACTER_STATS.BASE_STAMINA
      )
    );

    // Create inventory
    this.inventory = Inventory.create('player_inventory', 20, 100);

    // Initialize use cases
    this.gatherUseCase = new GatherResourceUseCase(this.character, this.inventory, this.eventBus);
    this.craftUseCase = new CraftItemUseCase(this.character, this.inventory, this.eventBus);

    // Initialize controllers
    this.interactionController = new InteractionController(
      this.gameScene.getInputManager(),
      this.gameScene.getResourceManager(),
      this.gatherUseCase
    );

    // Initialize UI panels
    this.inventoryPanel = new InventoryPanel(this.inventory, this.character, this.eventBus);
    this.craftingPanel = new CraftingPanel(
      this.inventory,
      this.character,
      this.craftUseCase,
      this.eventBus
    );

    // Cache HUD elements
    this.timeDisplayEl = document.getElementById('time-display');
    this.tempDisplayEl = document.getElementById('temp-display');
    this.weatherDisplayEl = document.getElementById('weather-display');

    console.log('Character created:', this.character.name);

    // Start render loop
    this.engine.startRenderLoop(scene, (deltaTime) => {
      this.update(deltaTime);
    });

    // Start survival mechanics update (every second)
    this.updateInterval = window.setInterval(() => {
      this.updateSurvivalMechanics();
    }, 1000);

    // Hide loading screen
    this.hideLoadingScreen();

    console.log('Application initialized successfully');
  }

  private update(deltaTime: number): void {
    // Update time and weather services
    this.timeService.update(deltaTime);
    this.weatherService.setNight(this.timeService.isNight());
    this.weatherService.update(deltaTime);

    // Apply weather movement modifier to game scene
    if (this.gameScene) {
      this.gameScene.setMovementModifier(this.weatherService.getMovementModifier());
      this.gameScene.update(deltaTime);
    }

    // Update interaction controller
    if (this.interactionController && this.gameScene) {
      const playerPos = this.gameScene.getPlayer().position;
      this.interactionController.update(deltaTime, playerPos);
    }

    // Handle UI toggle keys
    this.handleUIToggles();

    // Update HUD
    this.updateUI();
    this.updateHUD();

    // Update previous input state (for edge detection)
    this.gameScene?.getInputManager().updatePreviousState();
  }

  private handleUIToggles(): void {
    if (!this.gameScene) return;
    const input = this.gameScene.getInputManager();

    // Toggle inventory (I or Tab)
    if (input.wasKeyJustPressed('i') || input.wasKeyJustPressed('tab')) {
      this.inventoryPanel?.toggle();
    }

    // Toggle crafting (C)
    if (input.wasKeyJustPressed('c')) {
      this.craftingPanel?.toggle();
    }

    // Escape closes panels
    if (input.wasKeyJustPressed('escape')) {
      if (this.inventoryPanel?.isVisible()) this.inventoryPanel.close();
      if (this.craftingPanel?.isVisible()) this.craftingPanel.close();
    }
  }

  private updateSurvivalMechanics(): void {
    if (!this.character || !this.character.isAlive) {
      return;
    }

    // Deplete hunger
    const newHunger = this.character.stats.hunger - GAME_CONFIG.HUNGER_DEPLETION_RATE / 60;
    this.character = this.character.updateStats(this.character.stats.withHunger(newHunger));

    // Deplete thirst
    const newThirst = this.character.stats.thirst - GAME_CONFIG.THIRST_DEPLETION_RATE / 60;
    this.character = this.character.updateStats(this.character.stats.withThirst(newThirst));

    // Regenerate stamina if not moving
    const inputManager = this.gameScene?.getInputManager();
    if (inputManager && !inputManager.isMoving() && !inputManager.isSprinting()) {
      const newStamina = Math.min(
        this.character.stats.stamina + GAME_CONFIG.STAMINA_REGEN_RATE / 60,
        this.character.stats.maxStamina
      );
      this.character = this.character.updateStats(this.character.stats.withStamina(newStamina));
    }

    // Temperature: body temp drifts toward effective environment temp
    const envTemp = this.timeService.getEnvironmentTemperature() + this.weatherService.getTemperatureModifier();
    const bodyTemp = this.character.stats.temperature;
    const tempDiff = envTemp - bodyTemp;
    // Drift rate: move 0.5 degree per second toward environment temp
    const drift = Math.sign(tempDiff) * Math.min(Math.abs(tempDiff), GAME_CONFIG.BASE_COOLING_RATE / 60);
    const newTemp = bodyTemp + drift;
    this.character = this.character.updateTemperature(newTemp);

    // Hypothermia damage
    if (this.character.stats.temperature < GAME_CONFIG.HYPOTHERMIA_THRESHOLD) {
      this.character = this.character.takeDamage(1);
    }

    // Starvation / dehydration damage
    if (this.character.stats.isStarving()) {
      this.character = this.character.takeDamage(0.5);
    }
    if (this.character.stats.isDehydrated()) {
      this.character = this.character.takeDamage(0.5);
    }

    // Update character references in use cases and panels
    this.gatherUseCase?.setCharacter(this.character);
    this.craftUseCase?.setCharacter(this.character);
    this.inventoryPanel?.setCharacter(this.character);
    this.craftingPanel?.setCharacter(this.character);

    // Log status changes
    const status = this.character.getStatusSummary();
    if (status.needsFood || status.needsWater || status.needsWarmth) {
      console.warn('Character needs:', {
        food: status.needsFood,
        water: status.needsWater,
        warmth: status.needsWarmth,
      });
    }
  }

  private updateUI(): void {
    if (!this.character) return;

    const stats = this.character.stats;
    this.updateStatBar('health', stats.health, stats.maxHealth);
    this.updateStatBar('hunger', stats.hunger, stats.maxHunger);
    this.updateStatBar('thirst', stats.thirst, stats.maxThirst);
    this.updateStatBar('stamina', stats.stamina, stats.maxStamina);
  }

  private updateHUD(): void {
    // Time display
    if (this.timeDisplayEl) {
      this.timeDisplayEl.textContent = `${this.timeService.getFormattedTime()} (${this.timeService.getTimeOfDay()})`;
    }

    // Temperature display
    if (this.tempDisplayEl) {
      const bodyTemp = this.character?.stats.temperature ?? 37;
      const envTemp = this.timeService.getEnvironmentTemperature() + this.weatherService.getTemperatureModifier();
      this.tempDisplayEl.textContent = `Body: ${bodyTemp.toFixed(1)}°C | Env: ${envTemp.toFixed(0)}°C`;

      // Color coding for danger
      if (bodyTemp < GAME_CONFIG.HYPOTHERMIA_THRESHOLD) {
        this.tempDisplayEl.style.color = '#66bbff';
      } else if (bodyTemp > GAME_CONFIG.HYPERTHERMIA_THRESHOLD) {
        this.tempDisplayEl.style.color = '#ff6644';
      } else {
        this.tempDisplayEl.style.color = '#ffffff';
      }
    }

    // Weather display
    if (this.weatherDisplayEl) {
      const weather = this.weatherService.getWeather();
      const weatherIcons: Record<string, string> = {
        clear: 'Clear',
        cloudy: 'Cloudy',
        snowing: 'Snowing',
        blizzard: 'BLIZZARD',
      };
      this.weatherDisplayEl.textContent = weatherIcons[weather] ?? weather;
    }
  }

  private updateStatBar(statName: string, current: number, max: number): void {
    const valueElement = document.getElementById(`${statName}-value`);
    const barElement = document.getElementById(`${statName}-bar`);

    if (valueElement) {
      valueElement.textContent = Math.round(current).toString();
    }

    if (barElement) {
      const percentage = (current / max) * 100;
      barElement.style.width = `${Math.max(0, Math.min(100, percentage))}%`;
    }
  }

  private hideLoadingScreen(): void {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
      loadingElement.classList.add('hidden');
      setTimeout(() => {
        loadingElement.style.display = 'none';
      }, 500);
    }
  }

  dispose(): void {
    if (this.updateInterval !== null) {
      clearInterval(this.updateInterval);
    }
    this.inventoryPanel?.dispose();
    this.craftingPanel?.dispose();
    this.gameScene?.dispose();
    this.eventBus.clear();
    this.engine.dispose();
  }
}

// Initialize application when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  const app = new Application();
  app
    .initialize()
    .catch((error) => {
      console.error('Failed to initialize application:', error);
    });

  window.addEventListener('beforeunload', () => {
    app.dispose();
  });
});
