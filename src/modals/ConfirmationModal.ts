import { Modal, App } from 'obsidian';

export class ConfirmationModal extends Modal {
  private resolve: (value: boolean) => void;
  private title: string;
  private message: string;
  private confirmText: string;
  private cancelText: string;

  constructor(
    app: App,
    title: string,
    message: string,
    confirmText: string = 'Yes',
    cancelText: string = 'Cancel'
  ) {
    super(app);
    this.title = title;
    this.message = message;
    this.confirmText = confirmText;
    this.cancelText = cancelText;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();

    // Title
    contentEl.createEl('h2', { text: this.title });

    // Message
    contentEl.createEl('p', { text: this.message });

    // Buttons container
    const buttonContainer = contentEl.createDiv('modal-button-container');

    // Cancel button
    const cancelButton = buttonContainer.createEl('button', {
      text: this.cancelText,
      cls: 'mod-cta'
    });
    cancelButton.addEventListener('click', () => {
      this.close();
      this.resolve(false);
    });

    // Confirm button
    const confirmButton = buttonContainer.createEl('button', {
      text: this.confirmText,
      cls: 'mod-cta confirm-button'
    });
    confirmButton.addEventListener('click', () => {
      this.close();
      this.resolve(true);
    });

    // Focus the confirm button
    confirmButton.focus();
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }

  // Static method to show the modal and return a promise
  static async show(
    app: App,
    title: string,
    message: string,
    confirmText: string = 'Yes',
    cancelText: string = 'Cancel'
  ): Promise<boolean> {
    return new Promise((resolve) => {
      const modal = new ConfirmationModal(app, title, message, confirmText, cancelText);
      modal.resolve = resolve;
      modal.open();
    });
  }
}
