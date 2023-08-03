import { decorateIcons } from '../lib-franklin.js';

export default function createModal(modalId, createContent, addEventListeners) {
  let dialogElement = document.getElementById(modalId);
  if (!dialogElement) {
    dialogElement = document.createElement('dialog');
    dialogElement.id = modalId;

    const contentHTML = createContent?.() || '';

    dialogElement.innerHTML = `
        ${contentHTML}
    `;

    decorateIcons(dialogElement);

    document.body.appendChild(dialogElement);

    addEventListeners?.(dialogElement);
  }

  return dialogElement;
}
