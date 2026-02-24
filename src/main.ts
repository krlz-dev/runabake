import { BabylonEngine } from '@infrastructure/babylon/BabylonEngine';
import { GameScene } from '@presentation/scenes/GameScene';
import { Character } from '@domain/entities/Character';
import { Stats } from '@domain/value-objects/Stats';
import { CharacterClass, CHARACTER_STATS } from '@shared/constants/GameConstants';

/**
 * Main application entry point
 */
class Application {
  private engine: BabylonEngine;
  private gameScene: GameScene | null = null;
  private character: Character | null = null;
  private updateInterval: number | null = null;

  constructor() {
    this.engine = new BabylonEngine();
  }

  /**
   * Initialize the application
   */
  async initialize(): Promise<void> {
    console.log('Initializing Wild Survival Game...');

    // Get canvas
    const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
    if (!canvas) {
      throw new Error('Canvas element not found');
    }

    // Initialize Babylon.js engine
    const engineInstance = this.engine.initialize(canvas);
    console.log('Engine initialized');

    // Create scene
    const scene = this.engine.createScene();
    console.log('Scene created');

    // Initialize game scene
    this.gameScene = new GameScene(scene);
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
        37, // Normal body temperature
        CHARACTER_STATS.BASE_STAMINA,
        CHARACTER_STATS.BASE_STAMINA
      )
    );
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

  /**
   * Update game state (called every frame)
   */
  private update(deltaTime: number): void {
    if (this.gameScene) {
      this.gameScene.update(deltaTime);
    }

    // Update UI
    this.updateUI();
  }

  /**
   * Update survival mechanics (called every second)
   */
  private updateSurvivalMechanics(): void {
    if (!this.character || !this.character.isAlive) {
      return;
    }

    // Deplete hunger (1 point per minute = 1/60 per second)
    const newHunger = this.character.stats.hunger - 1 / 60;
    this.character = this.character.updateStats(this.character.stats.withHunger(newHunger));

    // Deplete thirst (1.5 points per minute = 1.5/60 per second)
    const newThirst = this.character.stats.thirst - 1.5 / 60;
    this.character = this.character.updateStats(this.character.stats.withThirst(newThirst));

    // Regenerate stamina if not moving
    const inputManager = this.gameScene?.getInputManager();
    if (inputManager && !inputManager.isMoving() && !inputManager.isSprinting()) {
      const newStamina = Math.min(
        this.character.stats.stamina + 10 / 60,
        this.character.stats.maxStamina
      );
      this.character = this.character.updateStats(this.character.stats.withStamina(newStamina));
    }

    // Check for starvation/dehydration damage
    if (this.character.stats.isStarving()) {
      this.character = this.character.takeDamage(0.5);
    }

    if (this.character.stats.isDehydrated()) {
      this.character = this.character.takeDamage(0.5);
    }

    // Log status changes
    const status = this.character.getStatusSummary();
    if (status.needsFood || status.needsWater) {
      console.warn('Character needs:', {
        food: status.needsFood,
        water: status.needsWater,
      });
    }
  }

  /**
   * Update UI elements
   */
  private updateUI(): void {
    if (!this.character) return;

    const stats = this.character.stats;

    // Update health
    this.updateStatBar('health', stats.health, stats.maxHealth);

    // Update hunger
    this.updateStatBar('hunger', stats.hunger, stats.maxHunger);

    // Update thirst
    this.updateStatBar('thirst', stats.thirst, stats.maxThirst);

    // Update stamina
    this.updateStatBar('stamina', stats.stamina, stats.maxStamina);
  }

  /**
   * Update a stat bar in the UI
   */
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

  /**
   * Hide loading screen
   */
  private hideLoadingScreen(): void {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
      loadingElement.classList.add('hidden');
      setTimeout(() => {
        loadingElement.style.display = 'none';
      }, 500);
    }
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    if (this.updateInterval !== null) {
      clearInterval(this.updateInterval);
    }
    this.gameScene?.dispose();
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

  // Clean up on page unload
  window.addEventListener('beforeunload', () => {
    app.dispose();
  });
});
