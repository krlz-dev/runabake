import {
  Scene,
  Vector3,
  MeshBuilder,
  StandardMaterial,
  Color3,
  DirectionalLight,
  ShadowGenerator,
  AbstractMesh,
} from '@babylonjs/core';
import { InputManager } from '@infrastructure/babylon/InputManager';
import { EventBus } from '@application/events/EventBus';
import { DayNightLighting } from '@infrastructure/babylon/DayNightLighting';
import { WeatherEffects } from '@infrastructure/babylon/WeatherEffects';
import { ResourceManager } from '@infrastructure/babylon/ResourceManager';

/**
 * Main game scene that sets up the 3D environment
 */
export class GameScene {
  private scene: Scene;
  private inputManager: InputManager;
  private sunLight!: DirectionalLight;
  private shadowGenerator!: ShadowGenerator;
  private player!: AbstractMesh;
  private weatherEffects: WeatherEffects | null = null;
  private resourceManager: ResourceManager;
  private movementModifier: number = 1.0;

  constructor(scene: Scene, eventBus?: EventBus) {
    this.scene = scene;
    this.inputManager = new InputManager(scene);
    this.resourceManager = new ResourceManager(scene);

    this.setupEnvironment();

    if (eventBus) {
      // DayNightLighting stays alive via EventBus subscription
      new DayNightLighting(scene, this.sunLight, eventBus);
      this.weatherEffects = new WeatherEffects(scene, eventBus);
      this.weatherEffects.setPlayerRef(this.player);
    }

    // Spawn world resources
    this.resourceManager.spawnResources();
  }

  private setupEnvironment(): void {
    this.createGround();
    this.createLighting();
    this.createPlaceholderPlayer();
  }

  private createGround(): void {
    const ground = MeshBuilder.CreateGround(
      'ground',
      { width: 100, height: 100, subdivisions: 10 },
      this.scene
    );

    const groundMaterial = new StandardMaterial('groundMaterial', this.scene);
    groundMaterial.diffuseColor = new Color3(0.8, 0.9, 0.8);
    groundMaterial.specularColor = new Color3(0.2, 0.2, 0.2);

    ground.material = groundMaterial;
    ground.receiveShadows = true;
  }

  private createLighting(): void {
    this.sunLight = new DirectionalLight('sunLight', new Vector3(-1, -2, -1), this.scene);
    this.sunLight.position = new Vector3(20, 40, 20);
    this.sunLight.intensity = 1.0;

    this.shadowGenerator = new ShadowGenerator(1024, this.sunLight);
    this.shadowGenerator.useBlurExponentialShadowMap = true;
    this.shadowGenerator.blurKernel = 32;

    // Store on scene for ResourceManager and other systems to access
    (this.scene as Scene & { shadowGenerator?: ShadowGenerator }).shadowGenerator = this.shadowGenerator;
  }

  private createPlaceholderPlayer(): void {
    this.player = MeshBuilder.CreateBox('player', { size: 2 }, this.scene);
    this.player.position = new Vector3(0, 1, 0);

    const playerMaterial = new StandardMaterial('playerMaterial', this.scene);
    playerMaterial.diffuseColor = new Color3(0.2, 0.4, 0.8);
    this.player.material = playerMaterial;

    this.shadowGenerator.addShadowCaster(this.player);

    // Store player reference on scene for compatibility
    (this.scene as Scene & { player?: AbstractMesh }).player = this.player;
  }

  /**
   * Set weather movement speed modifier
   */
  setMovementModifier(modifier: number): void {
    this.movementModifier = modifier;
  }

  update(deltaTime: number): void {
    this.handlePlayerMovement(deltaTime);
    this.weatherEffects?.update();
    this.resourceManager.update(deltaTime);
  }

  private handlePlayerMovement(deltaTime: number): void {
    if (!this.player) return;

    const baseSpeed = this.inputManager.isSprinting() ? 6 : 3;
    const speed = baseSpeed * this.movementModifier;
    const moveDistance = speed * deltaTime;

    const direction = new Vector3(0, 0, 0);

    if (this.inputManager.isMovingForward()) direction.z += 1;
    if (this.inputManager.isMovingBackward()) direction.z -= 1;
    if (this.inputManager.isMovingLeft()) direction.x -= 1;
    if (this.inputManager.isMovingRight()) direction.x += 1;

    if (direction.length() > 0) {
      direction.normalize();
      this.player.position.addInPlace(direction.scaleInPlace(moveDistance));

      if (this.player.rotation) {
        this.player.rotation.y = Math.atan2(direction.x, direction.z);
      }

      const bounceAmount = Math.sin(Date.now() * 0.01) * 0.1;
      this.player.position.y = 1 + Math.abs(bounceAmount);
    }

    // Smooth camera follow
    if (this.scene.activeCamera) {
      const camera = this.scene.activeCamera as { target?: Vector3 };
      if (camera.target) {
        camera.target = Vector3.Lerp(camera.target, this.player.position, 0.1);
      }
    }
  }

  getInputManager(): InputManager {
    return this.inputManager;
  }

  getScene(): Scene {
    return this.scene;
  }

  getPlayer(): AbstractMesh {
    return this.player;
  }

  getResourceManager(): ResourceManager {
    return this.resourceManager;
  }

  dispose(): void {
    this.weatherEffects?.dispose();
    this.inputManager.dispose();
  }
}
