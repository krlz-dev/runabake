import { Engine, Scene, HemisphericLight, Vector3, ArcRotateCamera, Color4 } from '@babylonjs/core';

/**
 * Wrapper for Babylon.js Engine
 * Abstracts engine initialization and basic scene setup
 */
export class BabylonEngine {
  private engine: Engine | null = null;
  private canvas: HTMLCanvasElement | null = null;

  /**
   * Initialize Babylon.js engine with a canvas
   */
  initialize(canvas: HTMLCanvasElement): Engine {
    this.canvas = canvas;
    this.engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      antialias: true,
    });

    // Handle window resize
    window.addEventListener('resize', () => {
      this.engine?.resize();
    });

    return this.engine;
  }

  /**
   * Create a basic scene with default lighting and camera
   */
  createScene(): Scene {
    if (!this.engine) {
      throw new Error('Engine not initialized. Call initialize() first.');
    }

    const scene = new Scene(this.engine);
    scene.clearColor = new Color4(0.5, 0.7, 0.9, 1.0); // Sky blue

    // Add default lighting
    const light = new HemisphericLight('defaultLight', new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    // Add default camera (positioned to view from above/behind)
    const camera = new ArcRotateCamera(
      'defaultCamera',
      -Math.PI / 2,
      Math.PI / 4,
      15,
      Vector3.Zero(),
      scene
    );
    // Don't attach controls - we'll handle input manually
    camera.attachControl(this.canvas, false);

    // Remove keyboard input from camera (we handle it manually)
    if (camera.inputs.attached['keyboard']) {
      camera.inputs.remove(camera.inputs.attached['keyboard']);
    }

    return scene;
  }

  /**
   * Start the render loop
   */
  startRenderLoop(scene: Scene, onUpdate?: (deltaTime: number) => void): void {
    if (!this.engine) {
      throw new Error('Engine not initialized.');
    }

    let lastTime = performance.now();

    this.engine.runRenderLoop(() => {
      const currentTime = performance.now();
      const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
      lastTime = currentTime;

      if (onUpdate) {
        onUpdate(deltaTime);
      }

      scene.render();
    });
  }

  /**
   * Get the current engine instance
   */
  getEngine(): Engine | null {
    return this.engine;
  }

  /**
   * Get the canvas element
   */
  getCanvas(): HTMLCanvasElement | null {
    return this.canvas;
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.engine?.dispose();
    this.engine = null;
    this.canvas = null;
  }
}
