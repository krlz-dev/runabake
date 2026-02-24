import { Vector3 } from '@babylonjs/core';
import { InputManager } from '@infrastructure/babylon/InputManager';
import { ResourceManager } from '@infrastructure/babylon/ResourceManager';
import { GatherResourceUseCase, IGatherResult } from '@application/use-cases/GatherResourceUseCase';
import { Resource } from '@domain/entities/Resource';

const INTERACTION_DISTANCE = 5;

/**
 * Handles player interaction with world resources.
 * Shows interaction prompts, manages gather progress bar, and floating feedback text.
 */
export class InteractionController {
  private inputManager: InputManager;
  private resourceManager: ResourceManager;
  private gatherUseCase: GatherResourceUseCase;

  private nearbyResource: { resource: Resource; name: string } | null = null;
  private isGathering: boolean = false;
  private gatherProgress: number = 0;
  private gatherTime: number = 0;
  private currentGatherResource: Resource | null = null;

  // DOM elements
  private promptEl: HTMLElement | null;
  private progressBarEl: HTMLElement | null;
  private progressFillEl: HTMLElement | null;
  private feedbackEl: HTMLElement | null;

  constructor(
    inputManager: InputManager,
    resourceManager: ResourceManager,
    gatherUseCase: GatherResourceUseCase
  ) {
    this.inputManager = inputManager;
    this.resourceManager = resourceManager;
    this.gatherUseCase = gatherUseCase;

    this.promptEl = document.getElementById('interaction-prompt');
    this.progressBarEl = document.getElementById('gather-progress');
    this.progressFillEl = document.getElementById('gather-progress-fill');
    this.feedbackEl = document.getElementById('gather-feedback');
  }

  /**
   * Update interaction state each frame
   */
  update(deltaTime: number, playerPosition: Vector3): void {
    // Find nearest resource
    const nearest = this.resourceManager.findNearestResource(playerPosition, INTERACTION_DISTANCE);

    if (nearest) {
      const resource = this.resourceManager.getResource(nearest);
      this.nearbyResource = { resource, name: resource.config.name };
      this.showPrompt(resource.config.name);
    } else {
      this.nearbyResource = null;
      this.hidePrompt();

      // Cancel gathering if moved away
      if (this.isGathering) {
        this.cancelGather();
      }
    }

    // Handle gather input (hold E/F)
    if (this.inputManager.isInteracting() && this.nearbyResource && !this.nearbyResource.resource.isDepleted) {
      if (!this.isGathering) {
        this.startGather(this.nearbyResource.resource);
      }
      this.updateGather(deltaTime);
    } else if (this.isGathering) {
      this.cancelGather();
    }
  }

  private startGather(resource: Resource): void {
    this.isGathering = true;
    this.gatherProgress = 0;
    this.gatherTime = resource.config.gatherTime;
    this.currentGatherResource = resource;
    this.showProgressBar();
  }

  private updateGather(deltaTime: number): void {
    if (!this.currentGatherResource || !this.isGathering) return;

    this.gatherProgress += deltaTime;
    const progress = Math.min(this.gatherProgress / this.gatherTime, 1);
    this.updateProgressBar(progress);

    if (this.gatherProgress >= this.gatherTime) {
      // Execute gather
      const result = this.gatherUseCase.execute(this.currentGatherResource);
      this.onGatherComplete(result);

      // Reset progress for next hit (if resource still alive)
      this.gatherProgress = 0;

      if (result.resourceDepleted) {
        this.cancelGather();
      }
    }
  }

  private cancelGather(): void {
    this.isGathering = false;
    this.gatherProgress = 0;
    this.currentGatherResource = null;
    this.hideProgressBar();
  }

  private onGatherComplete(result: IGatherResult): void {
    if (result.drops.length > 0) {
      const text = result.drops.map((d) => `+${d.quantity} ${d.itemName}`).join(', ');
      this.showFeedback(text);
    }
  }

  // UI helpers
  private showPrompt(name: string): void {
    if (this.promptEl) {
      this.promptEl.textContent = `Press E to gather ${name}`;
      this.promptEl.style.display = 'block';
    }
  }

  private hidePrompt(): void {
    if (this.promptEl) {
      this.promptEl.style.display = 'none';
    }
  }

  private showProgressBar(): void {
    if (this.progressBarEl) {
      this.progressBarEl.style.display = 'block';
    }
  }

  private hideProgressBar(): void {
    if (this.progressBarEl) {
      this.progressBarEl.style.display = 'none';
    }
    if (this.progressFillEl) {
      this.progressFillEl.style.width = '0%';
    }
  }

  private updateProgressBar(progress: number): void {
    if (this.progressFillEl) {
      this.progressFillEl.style.width = `${progress * 100}%`;
    }
  }

  private showFeedback(text: string): void {
    if (this.feedbackEl) {
      this.feedbackEl.textContent = text;
      this.feedbackEl.style.display = 'block';
      this.feedbackEl.style.opacity = '1';

      // Fade out after 2 seconds
      setTimeout(() => {
        if (this.feedbackEl) {
          this.feedbackEl.style.opacity = '0';
          setTimeout(() => {
            if (this.feedbackEl) {
              this.feedbackEl.style.display = 'none';
            }
          }, 500);
        }
      }, 2000);
    }
  }
}
