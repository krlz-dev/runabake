import {
  Scene,
  Vector3,
  MeshBuilder,
  StandardMaterial,
  Color3,
  DirectionalLight,
  ShadowGenerator,
} from '@babylonjs/core';
import { InputManager } from '@infrastructure/babylon/InputManager';

/**
 * Main game scene that sets up the 3D environment
 */
export class GameScene {
  private scene: Scene;
  private inputManager: InputManager;

  constructor(scene: Scene) {
    this.scene = scene;
    this.inputManager = new InputManager(scene);
    this.setupEnvironment();
  }

  /**
   * Set up the game environment
   */
  private setupEnvironment(): void {
    this.createGround();
    this.createLighting();
    this.createPlaceholderPlayer();
  }

  /**
   * Create ground plane
   */
  private createGround(): void {
    const ground = MeshBuilder.CreateGround(
      'ground',
      { width: 100, height: 100, subdivisions: 10 },
      this.scene
    );

    const groundMaterial = new StandardMaterial('groundMaterial', this.scene);
    groundMaterial.diffuseColor = new Color3(0.8, 0.9, 0.8); // Light green
    groundMaterial.specularColor = new Color3(0.2, 0.2, 0.2);

    ground.material = groundMaterial;
    ground.receiveShadows = true;
  }

  /**
   * Create lighting and shadows
   */
  private createLighting(): void {
    // Directional light for sun
    const sunLight = new DirectionalLight('sunLight', new Vector3(-1, -2, -1), this.scene);
    sunLight.position = new Vector3(20, 40, 20);
    sunLight.intensity = 1.0;

    // Shadow generator
    const shadowGenerator = new ShadowGenerator(1024, sunLight);
    shadowGenerator.useBlurExponentialShadowMap = true;
    shadowGenerator.blurKernel = 32;

    // Store shadow generator for later use
    (this.scene as Scene & { shadowGenerator?: ShadowGenerator }).shadowGenerator = shadowGenerator;
  }

  /**
   * Create placeholder player (cube)
   * This will be replaced with a proper character model
   */
  private createPlaceholderPlayer(): void {
    const player = MeshBuilder.CreateBox('player', { size: 2 }, this.scene);
    player.position = new Vector3(0, 1, 0);

    const playerMaterial = new StandardMaterial('playerMaterial', this.scene);
    playerMaterial.diffuseColor = new Color3(0.2, 0.4, 0.8); // Blue
    player.material = playerMaterial;

    // Add to shadow casters
    const shadowGenerator = (this.scene as Scene & { shadowGenerator?: ShadowGenerator })
      .shadowGenerator;
    if (shadowGenerator) {
      shadowGenerator.addShadowCaster(player);
    }

    // Store player reference
    (this.scene as Scene & { player?: typeof player }).player = player;
  }

  /**
   * Update scene (called every frame)
   */
  update(deltaTime: number): void {
    this.handlePlayerMovement(deltaTime);
  }

  /**
   * Handle player movement based on input
   */
  private handlePlayerMovement(deltaTime: number): void {
    const player = (this.scene as Scene & { player?: { position: Vector3; rotation?: Vector3 } })
      .player;
    if (!player) return;

    const speed = this.inputManager.isSprinting() ? 6 : 3;
    const moveDistance = speed * deltaTime;

    const direction = new Vector3(0, 0, 0);

    if (this.inputManager.isMovingForward()) {
      direction.z += 1;
    }
    if (this.inputManager.isMovingBackward()) {
      direction.z -= 1;
    }
    if (this.inputManager.isMovingLeft()) {
      direction.x -= 1;
    }
    if (this.inputManager.isMovingRight()) {
      direction.x += 1;
    }

    // Normalize and apply movement
    if (direction.length() > 0) {
      direction.normalize();
      player.position.addInPlace(direction.scaleInPlace(moveDistance));

      // Rotate player to face movement direction
      if (player.rotation) {
        player.rotation.y = Math.atan2(direction.x, direction.z);
      }

      // Add a small bounce effect to show movement
      const bounceAmount = Math.sin(Date.now() * 0.01) * 0.1;
      player.position.y = 1 + Math.abs(bounceAmount);
    }

    // Keep camera focused on player (smooth follow)
    if (this.scene.activeCamera) {
      const camera = this.scene.activeCamera as { target?: Vector3 };
      if (camera.target) {
        // Smooth camera follow using linear interpolation
        camera.target = Vector3.Lerp(camera.target, player.position, 0.1);
      }
    }
  }

  /**
   * Get input manager
   */
  getInputManager(): InputManager {
    return this.inputManager;
  }

  /**
   * Get the scene
   */
  getScene(): Scene {
    return this.scene;
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.inputManager.dispose();
  }
}
