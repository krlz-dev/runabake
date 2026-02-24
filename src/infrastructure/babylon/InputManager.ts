import { Scene } from '@babylonjs/core';

/**
 * Input state for keyboard and mouse
 */
export interface IInputState {
  // Movement keys
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;

  // Actions
  jump: boolean;
  sprint: boolean;
  interact: boolean;

  // Mouse
  mouseX: number;
  mouseY: number;
  mouseLeftClick: boolean;
  mouseRightClick: boolean;
}

/**
 * Manages keyboard and mouse input
 * Provides a clean interface for checking input state
 */
export class InputManager {
  private inputState: IInputState;
  private scene: Scene;
  private keyMap: Map<string, boolean>;

  constructor(scene: Scene) {
    this.scene = scene;
    this.keyMap = new Map();
    this.inputState = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      jump: false,
      sprint: false,
      interact: false,
      mouseX: 0,
      mouseY: 0,
      mouseLeftClick: false,
      mouseRightClick: false,
    };

    this.initializeListeners();
  }

  /**
   * Initialize keyboard and mouse event listeners
   */
  private initializeListeners(): void {
    // Keyboard events
    this.scene.onKeyboardObservable.add((kbInfo) => {
      const key = kbInfo.event.key.toLowerCase();
      const isPressed = kbInfo.type === 1; // 1 = KEYDOWN, 2 = KEYUP

      this.keyMap.set(key, isPressed);
      this.updateInputState();
    });

    // Mouse events
    this.scene.onPointerObservable.add((pointerInfo) => {
      switch (pointerInfo.type) {
        case 1: // POINTERDOWN
          if (pointerInfo.event.button === 0) {
            this.inputState.mouseLeftClick = true;
          } else if (pointerInfo.event.button === 2) {
            this.inputState.mouseRightClick = true;
          }
          break;
        case 2: // POINTERUP
          if (pointerInfo.event.button === 0) {
            this.inputState.mouseLeftClick = false;
          } else if (pointerInfo.event.button === 2) {
            this.inputState.mouseRightClick = false;
          }
          break;
        case 4: // POINTERMOVE
          this.inputState.mouseX = pointerInfo.event.clientX;
          this.inputState.mouseY = pointerInfo.event.clientY;
          break;
      }
    });
  }

  /**
   * Update input state based on key map
   */
  private updateInputState(): void {
    // Movement (WASD + Arrow keys)
    this.inputState.forward = this.isKeyPressed('w') || this.isKeyPressed('arrowup');
    this.inputState.backward = this.isKeyPressed('s') || this.isKeyPressed('arrowdown');
    this.inputState.left = this.isKeyPressed('a') || this.isKeyPressed('arrowleft');
    this.inputState.right = this.isKeyPressed('d') || this.isKeyPressed('arrowright');

    // Actions
    this.inputState.jump = this.isKeyPressed(' ') || this.isKeyPressed('space');
    this.inputState.sprint = this.isKeyPressed('shift');
    this.inputState.interact = this.isKeyPressed('e') || this.isKeyPressed('f');
  }

  /**
   * Check if a key is currently pressed
   */
  private isKeyPressed(key: string): boolean {
    return this.keyMap.get(key.toLowerCase()) ?? false;
  }

  /**
   * Get current input state
   */
  getInputState(): Readonly<IInputState> {
    return { ...this.inputState };
  }

  /**
   * Check if forward movement is requested
   */
  isMovingForward(): boolean {
    return this.inputState.forward;
  }

  /**
   * Check if backward movement is requested
   */
  isMovingBackward(): boolean {
    return this.inputState.backward;
  }

  /**
   * Check if left movement is requested
   */
  isMovingLeft(): boolean {
    return this.inputState.left;
  }

  /**
   * Check if right movement is requested
   */
  isMovingRight(): boolean {
    return this.inputState.right;
  }

  /**
   * Check if jump is requested
   */
  isJumping(): boolean {
    return this.inputState.jump;
  }

  /**
   * Check if sprint is requested
   */
  isSprinting(): boolean {
    return this.inputState.sprint;
  }

  /**
   * Check if interact is requested
   */
  isInteracting(): boolean {
    return this.inputState.interact;
  }

  /**
   * Check if any movement input is active
   */
  isMoving(): boolean {
    return (
      this.inputState.forward ||
      this.inputState.backward ||
      this.inputState.left ||
      this.inputState.right
    );
  }

  /**
   * Get mouse position
   */
  getMousePosition(): { x: number; y: number } {
    return {
      x: this.inputState.mouseX,
      y: this.inputState.mouseY,
    };
  }

  /**
   * Reset all input states
   */
  reset(): void {
    this.keyMap.clear();
    this.inputState = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      jump: false,
      sprint: false,
      interact: false,
      mouseX: 0,
      mouseY: 0,
      mouseLeftClick: false,
      mouseRightClick: false,
    };
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.keyMap.clear();
  }
}
