import { Inventory, IInventorySlot } from '@domain/entities/Inventory';
import { Item, ItemType } from '@domain/entities/Item';
import { EventBus, GameEventType, InventoryChangedEvent } from '@application/events/EventBus';
import { ContextMenu, IContextMenuAction } from './ContextMenu';
import { Character } from '@domain/entities/Character';

/** Emoji icons for item types */
const ITEM_ICONS: Record<string, string> = {
  wood: '🪵',
  stone: '🪨',
  ore: '⛏️',
  berries: '🫐',
  stone_axe: '🪓',
  campfire: '🔥',
  cooked_meat: '🍖',
  raw_meat: '🥩',
};

function getItemIcon(itemId: string, type: ItemType): string {
  return ITEM_ICONS[itemId] ?? (type === ItemType.FOOD ? '🍽️' : '📦');
}

/**
 * HTML overlay inventory panel with drag-and-drop.
 * Toggled with I or Tab key.
 */
export class InventoryPanel {
  private inventory: Inventory;
  private character: Character;
  private eventBus: EventBus;
  private contextMenu: ContextMenu;

  private panelEl: HTMLElement | null;
  private gridEl: HTMLElement | null;
  private weightEl: HTMLElement | null;
  private tooltipEl: HTMLElement | null;
  private isOpen: boolean = false;
  private dragSourceSlot: number = -1;

  constructor(inventory: Inventory, character: Character, eventBus: EventBus) {
    this.inventory = inventory;
    this.character = character;
    this.eventBus = eventBus;
    this.contextMenu = new ContextMenu();

    this.panelEl = document.getElementById('inventory-panel');
    this.gridEl = document.getElementById('inventory-grid');
    this.weightEl = document.getElementById('inventory-weight');
    this.tooltipEl = document.getElementById('item-tooltip');

    // Subscribe to inventory changes
    eventBus.subscribe<InventoryChangedEvent>(GameEventType.INVENTORY_CHANGED, () => {
      if (this.isOpen) {
        this.render();
      }
    });
  }

  setCharacter(character: Character): void {
    this.character = character;
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
    if (this.panelEl) {
      this.panelEl.style.display = this.isOpen ? 'block' : 'none';
    }
    if (this.isOpen) {
      this.render();
    } else {
      this.contextMenu.hide();
      this.hideTooltip();
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
    this.contextMenu.hide();
    this.hideTooltip();
  }

  private render(): void {
    if (!this.gridEl) return;

    this.gridEl.innerHTML = '';
    const slots = this.inventory.getAllSlots();

    for (const slot of slots) {
      const slotEl = this.createSlotElement(slot);
      this.gridEl.appendChild(slotEl);
    }

    // Update weight display
    if (this.weightEl) {
      const current = this.inventory.getCurrentWeight().toFixed(1);
      const max = this.inventory.maxWeight;
      this.weightEl.textContent = `Weight: ${current} / ${max}`;
    }
  }

  private createSlotElement(slot: IInventorySlot): HTMLElement {
    const el = document.createElement('div');
    el.className = 'inventory-slot';
    el.dataset['slot'] = slot.slotIndex.toString();

    if (slot.item) {
      el.draggable = true;
      el.innerHTML = `
        <span class="slot-icon">${getItemIcon(slot.item.id, slot.item.type)}</span>
        ${slot.item.quantity > 1 ? `<span class="slot-quantity">${slot.item.quantity}</span>` : ''}
      `;

      // Drag events
      el.addEventListener('dragstart', (e) => {
        this.dragSourceSlot = slot.slotIndex;
        el.classList.add('dragging');
        e.dataTransfer?.setData('text/plain', slot.slotIndex.toString());
      });

      el.addEventListener('dragend', () => {
        el.classList.remove('dragging');
        this.dragSourceSlot = -1;
      });

      // Tooltip on hover
      el.addEventListener('mouseenter', (e) => {
        this.showTooltip(slot.item!, e.clientX, e.clientY);
      });
      el.addEventListener('mouseleave', () => {
        this.hideTooltip();
      });

      // Right-click context menu
      el.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        this.showContextMenu(slot, e.clientX, e.clientY);
      });
    }

    // Drop target events
    el.addEventListener('dragover', (e) => {
      e.preventDefault();
      el.classList.add('drag-over');
    });
    el.addEventListener('dragleave', () => {
      el.classList.remove('drag-over');
    });
    el.addEventListener('drop', (e) => {
      e.preventDefault();
      el.classList.remove('drag-over');
      if (this.dragSourceSlot >= 0 && this.dragSourceSlot !== slot.slotIndex) {
        this.inventory.moveItem(this.dragSourceSlot, slot.slotIndex);
        this.eventBus.publish<InventoryChangedEvent>({
          type: GameEventType.INVENTORY_CHANGED,
        });
        this.render();
      }
    });

    return el;
  }

  private showTooltip(item: Item, x: number, y: number): void {
    if (!this.tooltipEl) return;

    let effectsHtml = '';
    if (item.effects) {
      const effects: string[] = [];
      if (item.effects.healthRestore) effects.push(`Health +${item.effects.healthRestore}`);
      if (item.effects.hungerRestore) effects.push(`Hunger +${item.effects.hungerRestore}`);
      if (item.effects.thirstRestore) effects.push(`Thirst +${item.effects.thirstRestore}`);
      if (item.effects.staminaRestore) effects.push(`Stamina +${item.effects.staminaRestore}`);
      if (effects.length > 0) {
        effectsHtml = `<div class="tooltip-effects">${effects.join(', ')}</div>`;
      }
    }

    this.tooltipEl.innerHTML = `
      <div class="tooltip-name">${item.name}</div>
      <div class="tooltip-type">${item.type} - ${item.rarity}</div>
      <div class="tooltip-desc">${item.description}</div>
      ${effectsHtml}
      <div class="tooltip-weight">Weight: ${item.weight} (x${item.quantity} = ${item.getTotalWeight()})</div>
    `;

    this.tooltipEl.style.left = `${x + 15}px`;
    this.tooltipEl.style.top = `${y + 15}px`;
    this.tooltipEl.style.display = 'block';
  }

  private hideTooltip(): void {
    if (this.tooltipEl) {
      this.tooltipEl.style.display = 'none';
    }
  }

  private showContextMenu(slot: IInventorySlot, x: number, y: number): void {
    if (!slot.item) return;

    const actions: IContextMenuAction[] = [];

    // Use for consumables
    if (slot.item.isConsumable && slot.item.effects) {
      actions.push({
        label: 'Use',
        callback: () => {
          this.useItem(slot);
        },
      });
    }

    // Split stack
    if (slot.item.quantity > 1) {
      actions.push({
        label: 'Split',
        callback: () => {
          this.splitItem(slot);
        },
      });
    }

    // Drop
    actions.push({
      label: 'Drop',
      callback: () => {
        this.dropItem(slot);
      },
    });

    this.contextMenu.show(x, y, actions);
  }

  private useItem(slot: IInventorySlot): void {
    if (!slot.item || !slot.item.effects) return;

    const effects = slot.item.effects;
    if (effects.hungerRestore) this.character.eat(effects.hungerRestore);
    if (effects.thirstRestore) this.character.drink(effects.thirstRestore);
    if (effects.healthRestore) this.character.heal(effects.healthRestore);
    if (effects.staminaRestore) this.character.regenStamina(effects.staminaRestore);

    this.inventory.removeItemAt(slot.slotIndex, 1);
    this.eventBus.publish<InventoryChangedEvent>({ type: GameEventType.INVENTORY_CHANGED });
    this.render();
  }

  private splitItem(slot: IInventorySlot): void {
    if (!slot.item || slot.item.quantity <= 1) return;

    const splitAmount = Math.floor(slot.item.quantity / 2);
    const result = slot.item.split(splitAmount);
    if (result) {
      this.inventory.addItem(result.split);
      this.eventBus.publish<InventoryChangedEvent>({ type: GameEventType.INVENTORY_CHANGED });
      this.render();
    }
  }

  private dropItem(slot: IInventorySlot): void {
    this.inventory.removeItemAt(slot.slotIndex);
    this.eventBus.publish<InventoryChangedEvent>({ type: GameEventType.INVENTORY_CHANGED });
    this.render();
  }

  dispose(): void {
    this.contextMenu.dispose();
  }
}
