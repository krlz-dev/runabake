import {
  Scene,
  ParticleSystem,
  Texture,
  Vector3,
  Color4,
  AbstractMesh,
} from '@babylonjs/core';
import { EventBus, GameEventType, WeatherChangedEvent } from '@application/events/EventBus';
import { WeatherType } from '@shared/constants/GameConstants';

/**
 * Manages visual weather effects: snow particles and fog.
 * Subscribes to WEATHER_CHANGED events.
 */
export class WeatherEffects {
  private scene: Scene;
  private snowSystem: ParticleSystem | null = null;
  private playerRef: AbstractMesh | null = null;

  constructor(scene: Scene, eventBus: EventBus) {
    this.scene = scene;

    this.createSnowSystem();

    eventBus.subscribe<WeatherChangedEvent>(GameEventType.WEATHER_CHANGED, (event) => {
      this.onWeatherChanged(event);
    });
  }

  /**
   * Set player mesh reference so particles follow the player
   */
  setPlayerRef(player: AbstractMesh): void {
    this.playerRef = player;
  }

  /**
   * Update particle emitter position to follow player (call each frame)
   */
  update(): void {
    if (this.snowSystem && this.playerRef) {
      const pos = this.playerRef.position;
      this.snowSystem.emitter = new Vector3(pos.x, pos.y + 30, pos.z);
    }
  }

  private createSnowSystem(): void {
    this.snowSystem = new ParticleSystem('snow', 5000, this.scene);

    // Use a simple white circle texture generated on the fly
    this.snowSystem.createPointEmitter(new Vector3(-20, 0, -20), new Vector3(20, 0, 20));

    // Particle appearance
    this.snowSystem.color1 = new Color4(1, 1, 1, 0.8);
    this.snowSystem.color2 = new Color4(0.9, 0.9, 1, 0.6);
    this.snowSystem.colorDead = new Color4(0.8, 0.8, 0.9, 0);

    this.snowSystem.minSize = 0.05;
    this.snowSystem.maxSize = 0.15;

    this.snowSystem.minLifeTime = 3;
    this.snowSystem.maxLifeTime = 6;

    this.snowSystem.emitRate = 0; // Start with no snow

    // Gravity pulls particles down
    this.snowSystem.gravity = new Vector3(0, -2, 0);

    // Slight wind
    this.snowSystem.direction1 = new Vector3(-0.5, -1, -0.5);
    this.snowSystem.direction2 = new Vector3(0.5, -0.8, 0.5);

    this.snowSystem.minEmitPower = 0.5;
    this.snowSystem.maxEmitPower = 1.5;

    // Emitter position (will be updated to follow player)
    this.snowSystem.emitter = new Vector3(0, 30, 0);

    // Try to create a default particle texture
    try {
      const texturePath = 'https://assets.babylonjs.com/textures/flare.png';
      this.snowSystem.particleTexture = new Texture(texturePath, this.scene);
    } catch {
      // If texture load fails, particles will render as white squares - acceptable
    }

    this.snowSystem.start();
  }

  private onWeatherChanged(event: WeatherChangedEvent): void {
    this.updateSnow(event);
    this.updateFog(event);
  }

  private updateSnow(event: WeatherChangedEvent): void {
    if (!this.snowSystem) return;

    switch (event.weather) {
      case WeatherType.SNOWING:
        this.snowSystem.emitRate = 500 * event.intensity;
        this.snowSystem.minSize = 0.05;
        this.snowSystem.maxSize = 0.12;
        break;
      case WeatherType.BLIZZARD:
        this.snowSystem.emitRate = 2000 * event.intensity;
        this.snowSystem.minSize = 0.08;
        this.snowSystem.maxSize = 0.2;
        // Stronger wind in blizzard
        this.snowSystem.direction1 = new Vector3(-2, -1, -2);
        this.snowSystem.direction2 = new Vector3(2, -0.5, 2);
        this.snowSystem.minEmitPower = 1;
        this.snowSystem.maxEmitPower = 3;
        break;
      case WeatherType.CLOUDY:
        // Light flurries
        this.snowSystem.emitRate = 50 * event.intensity;
        this.snowSystem.direction1 = new Vector3(-0.5, -1, -0.5);
        this.snowSystem.direction2 = new Vector3(0.5, -0.8, 0.5);
        this.snowSystem.minEmitPower = 0.5;
        this.snowSystem.maxEmitPower = 1.5;
        break;
      default:
        this.snowSystem.emitRate = 0;
        this.snowSystem.direction1 = new Vector3(-0.5, -1, -0.5);
        this.snowSystem.direction2 = new Vector3(0.5, -0.8, 0.5);
        this.snowSystem.minEmitPower = 0.5;
        this.snowSystem.maxEmitPower = 1.5;
        break;
    }
  }

  private updateFog(event: WeatherChangedEvent): void {
    switch (event.weather) {
      case WeatherType.SNOWING:
        this.scene.fogMode = Scene.FOGMODE_EXP;
        this.scene.fogDensity = 0.01 * event.intensity;
        this.scene.fogColor.r = 0.8;
        this.scene.fogColor.g = 0.8;
        this.scene.fogColor.b = 0.85;
        break;
      case WeatherType.BLIZZARD:
        this.scene.fogMode = Scene.FOGMODE_EXP2;
        this.scene.fogDensity = 0.02 * event.intensity;
        this.scene.fogColor.r = 0.9;
        this.scene.fogColor.g = 0.9;
        this.scene.fogColor.b = 0.95;
        break;
      case WeatherType.CLOUDY:
        this.scene.fogMode = Scene.FOGMODE_EXP;
        this.scene.fogDensity = 0.003 * event.intensity;
        this.scene.fogColor.r = 0.7;
        this.scene.fogColor.g = 0.7;
        this.scene.fogColor.b = 0.75;
        break;
      default:
        this.scene.fogMode = Scene.FOGMODE_NONE;
        break;
    }
  }

  dispose(): void {
    this.snowSystem?.dispose();
  }
}
