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
 * Manages keyboard and mouse input with edge detection.
 * Provides wasKeyJustPressed() for toggle-style keys (C, I, Tab).
 */
export class InputManager {
  private inputState: IInputState;
  private scene: Scene;
  private keyMap: Map<string, boolean>;
  private previousKeyMap: Map<string, boolean>;

  constructor(scene: Scene) {
    this.scene = scene;
    this.keyMap = new Map();
    this.previousKeyMap = new Map();
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
   * Check if a key was just pressed this frame (rising edge detection).
   * Returns true only on the frame the key goes from up to down.
   */
  wasKeyJustPressed(key: string): boolean {
    const k = key.toLowerCase();
    const current = this.keyMap.get(k) ?? false;
    const previous = this.previousKeyMap.get(k) ?? false;
    return current && !previous;
  }

  /**
   * Copy current key state to previous state.
   * Must be called at end of each frame after all input checks.
   */
  updatePreviousState(): void {
    this.previousKeyMap = new Map(this.keyMap);
  }

  /**
   * Get current input state
   */
  getInputState(): Readonly<IInputState> {
    return { ...this.inputState };
  }

  isMovingForward(): boolean {
    return this.inputState.forward;
  }

  isMovingBackward(): boolean {
    return this.inputState.backward;
  }

  isMovingLeft(): boolean {
    return this.inputState.left;
  }

  isMovingRight(): boolean {
    return this.inputState.right;
  }

  isJumping(): boolean {
    return this.inputState.jump;
  }

  isSprinting(): boolean {
    return this.inputState.sprint;
  }

  isInteracting(): boolean {
    return this.inputState.interact;
  }

  isMoving(): boolean {
    return (
      this.inputState.forward ||
      this.inputState.backward ||
      this.inputState.left ||
      this.inputState.right
    );
  }

  getMousePosition(): { x: number; y: number } {
    return {
      x: this.inputState.mouseX,
      y: this.inputState.mouseY,
    };
  }

  reset(): void {
    this.keyMap.clear();
    this.previousKeyMap.clear();
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

  dispose(): void {
    this.keyMap.clear();
    this.previousKeyMap.clear();
  }
}
