import { Inventory } from '@domain/entities/Inventory';
import { Character } from '@domain/entities/Character';
import { CraftItemUseCase, CraftingRecipes, ICraftingRecipe } from '@application/use-cases/CraftItemUseCase';
import { EventBus, GameEventType, InventoryChangedEvent, ItemCraftedEvent } from '@application/events/EventBus';

/**
 * HTML overlay crafting panel, toggled with C key.
 * Lists all recipes and allows crafting when materials are available.
 */
export class CraftingPanel {
  private inventory: Inventory;
  private craftUseCase: CraftItemUseCase;
  private eventBus: EventBus;

  private panelEl: HTMLElement | null;
  private recipeListEl: HTMLElement | null;
  private statusEl: HTMLElement | null;
  private isOpen: boolean = false;

  constructor(
    inventory: Inventory,
    _character: Character,
    craftUseCase: CraftItemUseCase,
    eventBus: EventBus
  ) {
    this.inventory = inventory;
    this.craftUseCase = craftUseCase;
    this.eventBus = eventBus;

    this.panelEl = document.getElementById('crafting-panel');
    this.recipeListEl = document.getElementById('crafting-recipes');
    this.statusEl = document.getElementById('crafting-status');

    // Refresh when inventory changes
    eventBus.subscribe<InventoryChangedEvent>(GameEventType.INVENTORY_CHANGED, () => {
      if (this.isOpen) {
        this.render();
      }
    });
  }

  setCharacter(character: Character): void {
    // Character is updated on the CraftItemUseCase directly
    this.craftUseCase.setCharacter(character);
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
    if (this.panelEl) {
      this.panelEl.style.display = this.isOpen ? 'block' : 'none';
    }
    if (this.isOpen) {
      this.render();
    }
  }

  isVisible(): boolean {
    return this.isOpen;
  }

  close(): void {
    this.isOpen = false;
    if (this.panelEl) {
      this.panelEl.style.display = 'none';
    }
  }

  private render(): void {
    if (!this.recipeListEl) return;

    this.recipeListEl.innerHTML = '';
    const recipes = CraftingRecipes.getAllRecipes();

    for (const recipe of recipes) {
      const el = this.createRecipeElement(recipe);
      this.recipeListEl.appendChild(el);
    }
  }

  private createRecipeElement(recipe: ICraftingRecipe): HTMLElement {
    const el = document.createElement('div');
    el.className = 'crafting-recipe';

    const preview = this.craftUseCase.preview(recipe);

    // Materials list
    let materialsHtml = '';
    for (const [matId, needed] of recipe.requiredMaterials) {
      const has = this.inventory.countItem(matId);
      const enough = has >= needed;
      materialsHtml += `<span class="craft-material ${enough ? 'has-enough' : 'not-enough'}">${matId}: ${has}/${needed}</span>`;
    }

    el.innerHTML = `
      <div class="recipe-header">
        <span class="recipe-name">${recipe.name}</span>
        <span class="recipe-time">${recipe.craftingTime}s</span>
      </div>
      <div class="recipe-desc">${recipe.description}</div>
      <div class="recipe-materials">${materialsHtml}</div>
      <button class="craft-button" ${preview.canCraft ? '' : 'disabled'}>${preview.canCraft ? 'Craft' : preview.reason}</button>
    `;

    // Craft button handler
    const craftBtn = el.querySelector('.craft-button') as HTMLButtonElement;
    if (craftBtn && preview.canCraft) {
      craftBtn.addEventListener('click', () => {
        this.craft(recipe);
      });
    }

    return el;
  }

  private craft(recipe: ICraftingRecipe): void {
    const result = this.craftUseCase.execute(recipe);

    if (result.success) {
      // Publish events
      this.eventBus.publish<ItemCraftedEvent>({
        type: GameEventType.ITEM_CRAFTED,
        itemId: recipe.resultItem.id,
        itemName: recipe.name,
      });
      this.eventBus.publish<InventoryChangedEvent>({
        type: GameEventType.INVENTORY_CHANGED,
      });

      if (this.statusEl) {
        this.statusEl.textContent = result.message;
        this.statusEl.className = 'craft-status success';
      }
    } else {
      if (this.statusEl) {
        this.statusEl.textContent = result.message;
        this.statusEl.className = 'craft-status error';
      }
    }

    this.render();
  }

  dispose(): void {
    // Nothing to clean up
  }
}
