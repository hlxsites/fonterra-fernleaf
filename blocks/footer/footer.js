import { readBlockConfig, decorateIcons } from '../../scripts/lib-franklin.js';
import { getLanguage, showLanguageSelector } from '../../scripts/scripts.js';

/**
 * Updates the footer icons to be accessible
 * @param {*} footer
 */

function decorateSocialIcons(footer) {
  const footerIcons = footer.querySelectorAll(':scope .icon');
  footerIcons.forEach((footerIcon) => {
    const socialTitle = footerIcon.parentElement.nextSibling.textContent;
    footerIcon.setAttribute('aria-label', socialTitle);
    footerIcon.setAttribute('role', 'img');

    // Remove the text from the Social Media links as aria-label is used instead on the icon
    footerIcon.parentElement.nextSibling.textContent = '';
  });
}

function setlanguageButton(parent, txt) {
  parent.innerHTML = '<button type="button" class="language-selector"></button>';
  const languageButton = parent.querySelector('button');
  languageButton.innerText = txt;
  languageButton.addEventListener('click', () => {
    showLanguageSelector();
  });
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const cfg = readBlockConfig(block);
  block.textContent = '';

  // fetch footer content
  const footerPath = cfg.footer || (getLanguage() === 'en' ? '/footer' : `/${getLanguage()}/footer`);
  const resp = await fetch(`${footerPath}.plain.html`, window.location.pathname.endsWith('/footer') ? { cache: 'reload' } : {});

  if (resp.ok) {
    const html = await resp.text();

    // decorate footer DOM
    const footer = document.createElement('div');
    footer.innerHTML = html;

    decorateIcons(footer);
    decorateSocialIcons(footer);

    // code for language selector
    const languageWrapper = document.createElement('div');
    languageWrapper.classList.add('language-wrapper');

    // language selector
    const text = footer.querySelector('div:nth-child(4) > p');
    const buttonText = text.textContent.trim();
    setlanguageButton(languageWrapper, buttonText);

    const language = footer.querySelector('div:nth-child(4) > p');
    language.innerHTML = '';
    language.appendChild(languageWrapper);

    block.append(footer);
  }
}
