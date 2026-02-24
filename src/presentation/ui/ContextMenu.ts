/**
 * Action in a context menu
 */
export interface IContextMenuAction {
  label: string;
  callback: () => void;
}

/**
 * Reusable positioned context menu with action buttons.
 * Closes on outside click.
 */
export class ContextMenu {
  private container: HTMLElement;
  private outsideClickHandler: (e: MouseEvent) => void;

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'context-menu';
    this.container.style.display = 'none';
    document.body.appendChild(this.container);

    this.outsideClickHandler = (e: MouseEvent) => {
      if (!this.container.contains(e.target as Node)) {
        this.hide();
      }
    };
  }

  show(x: number, y: number, actions: IContextMenuAction[]): void {
    this.container.innerHTML = '';

    for (const action of actions) {
      const btn = document.createElement('button');
      btn.className = 'context-menu-item';
      btn.textContent = action.label;
      btn.addEventListener('click', () => {
        action.callback();
        this.hide();
      });
      this.container.appendChild(btn);
    }

    // Position within viewport bounds
    this.container.style.left = `${Math.min(x, window.innerWidth - 150)}px`;
    this.container.style.top = `${Math.min(y, window.innerHeight - actions.length * 36)}px`;
    this.container.style.display = 'block';

    // Add outside click handler on next tick to avoid immediate trigger
    setTimeout(() => {
      document.addEventListener('click', this.outsideClickHandler);
    }, 0);
  }

  hide(): void {
    this.container.style.display = 'none';
    document.removeEventListener('click', this.outsideClickHandler);
  }

  dispose(): void {
    this.hide();
    this.container.remove();
  }
}
