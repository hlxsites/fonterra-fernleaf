import {
  fetchPlaceholders, getMetadata,
} from '../../scripts/lib-franklin.js';

import {
  pushToGTM,
  adjustImageSize,
} from '../../scripts/scripts.js';

const getHTML = (row) => `<a target="_blank" href="${row.link}" title="${row.brand}" aria-label="${row.brand}">
                <img alt="${row.brand}" src="${adjustImageSize(row.img, 250)}">
            </a>`;

const buyOptions = [];

async function preProcess(block, placeholder) {
  [...block.children].forEach((row) => {
    if (row.children && row.children.length === 2) {
      const data = {};
      data.brand = row.children[0].innerText;
      data.link = row.children[1].innerText;
      data.img = placeholder[`product${data.brand}`];

      buyOptions.push(data);
    }
  });
}

/**
 * Push click actions to Google Tag manager
 */
async function trackAction(linkContainer) {
  linkContainer.querySelector('a').addEventListener('click', (e) => {
    const link = e.currentTarget;
    const label = link.title;
    const linkUrl = link.href;
    const productTitle = getMetadata('shorttitle');
    const productCategory = getMetadata('category');

    pushToGTM({
      event: 'trackEvent',
      'eventDetails.category': 'purchase intent',
      'eventDetails.action': 'click',
      'eventDetails.label': label.toLowerCase(),
      clickUrl: linkUrl,
      clickElementType: 'image',
      sectionName: 'content block',
      productName: productTitle.toLowerCase(),
      productCategory: productCategory.toLowerCase().trim(),
      ecommercePlatform: label.toLowerCase(),
    });
  });
}

async function generateBlock() {
  const ul = document.createElement('ul');
  buyOptions.forEach((row) => {
    const li = document.createElement('li');
    li.classList.add('buyoption');
    li.innerHTML = getHTML(row);
    trackAction(li);

    ul.append(li);
  });
  return ul;
}

export default async function decorate(block) {
  const placeholder = await fetchPlaceholders();
  preProcess(block, placeholder);
  block.innerHTML = '';

  if (buyOptions.length > 0) {
    const objects = await generateBlock();
    block.append(objects);
  }
}
