import { readBlockConfig, decorateIcons } from '../../scripts/lib-franklin.js';
import { getLanguage } from '../../scripts/scripts.js';

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

    block.append(footer);
  }
}
