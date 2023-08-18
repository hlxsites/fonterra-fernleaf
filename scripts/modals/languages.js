import {
  fetchPlaceholders,
} from '../lib-franklin.js';

import createModal from './modal.js';
import { getLanguage, BASE_URL } from '../scripts.js';

const LANGUAGES = new Set(['en', 'ms']);
const language = getLanguage();

function createModalContent(languages, placeholders) {
  const languageMap = new Map();
  languageMap.set('en', 'English');
  languageMap.set('ms', 'Bahasa');
  return `
    <div class="container">
      <h3 class="title-inline-large title-popup">
        ${placeholders.dialogcontainertext}
      </h3>
    </div>
    <div class="country-wrapper">
      <div class="country-list">
        <div class="country-item">
          ${[...languages].map((lang) => `
            <a href="/${lang}" target="_blank" title="Malaysia (${languageMap.get(lang)})">
            <img class="flag-icon" src='${BASE_URL}/styles/images/flag-malaysia.png' alt="Malaysia (${languageMap.get(lang)})" height="30" width="25">
            <span class="flag-name">Malaysia <br>(${languageMap.get(lang)})</span>
            </a>            
        `).join('')}
        </div>
      </div>
    </div>
    <div class="bottom-popup">
      <button class="back-to-country" data-close-popup="">
        <img class="flag-icon" src='${BASE_URL}/styles/images/flag-malaysia.png' alt="Malaysia (${languageMap.get(language)})" data-flag="" height="30" width="25">
        <span class="flag-name" data-title-country="">${placeholders.dialogbacktocountrytext} Malaysia (${languageMap.get(language)})</span>
      </button>
    </div>
  `;
}

function applyStylesOnDialogOpenAndClose() {
  document.body.classList.toggle('disable-scroll');
}

function isClickOutsidePadding(event) {
  const dialog = document.getElementById('language-dialog');
  const elementRect = dialog.getBoundingClientRect();
  const clickX = event.clientX;
  const clickY = event.clientY;

  // Check if the click coordinates are outside the padding area
  if (
    clickX < elementRect.left
      || clickX > elementRect.right
      || clickY < elementRect.top
      || clickY > elementRect.bottom
  ) {
    return true;
  }
  return false;
}

export default async function showLanguageSelector() {
  const placeholders = await fetchPlaceholders(`/${getLanguage()}`);
  const dialogElement = createModal(
    'language-dialog',
    () => createModalContent(LANGUAGES, placeholders),
    () => {
      document.querySelector('.back-to-country').addEventListener('click', () => {
        dialogElement.close();
        applyStylesOnDialogOpenAndClose();
      });

      document.addEventListener('keydown', (event) => {
        if (dialogElement.open && event.key === 'Escape') {
          dialogElement.close();
          applyStylesOnDialogOpenAndClose();
        }
      });
    },
  );

  document.addEventListener('click', (event) => {
    const isButtonClick = event.target.closest('button') !== null;

    if (dialogElement.open && !isButtonClick) {
      if (isClickOutsidePadding(event)) {
        dialogElement.close();
        applyStylesOnDialogOpenAndClose();
      }
    }
  });

  dialogElement.showModal();
  applyStylesOnDialogOpenAndClose();
}
