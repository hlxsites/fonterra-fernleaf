import {
  getLanguage, adjustImageSize, fetchSearch, CATEGORY_STORIES, ProcessStoriesBgImage,
} from '../../scripts/scripts.js';
import { fetchPlaceholders } from '../../scripts/lib-franklin.js';

const bgConfigParams = {
  BG_TOP: 'storyListBgTop',
  BG_BOTTOM: 'storyListBgBottom',
  BG_TOP_CLASS: 'story-page-bg-top',
  BG_BOTTOM_CLASS: 'bottom-bg',
};

async function printList(list) {
  const placeholders = await fetchPlaceholders(`/${getLanguage()}`);
  const getListHTML = (row, index) => `<div class="story-image"><img alt="${row.shorttitle}" loading="${!index ? 'eager' : 'lazy'}" src="${row.image}" width="300" height="218"></div>
            <div class="story-content">
                <div class="story-title"><a href="${row.path}" title="${row.shorttitle}" aria-label="${row.shorttitle}">${row.shorttitle}</a></div>
                <p class="story-desc">${row.description}</p>
                <a href="${row.path}" title="${row.shorttitle}" aria-label="${row.shorttitle}" class="button primary"><span class="sr-only" >${row.shorttitle}</span>${placeholders.readmore}</a>
            </div>`;

  const ul = document.createElement('ul');
  list.forEach((row) => {
    row.image = adjustImageSize(row.image, 300);
    const li = document.createElement('li');
    li.classList.add('story');
    li.innerHTML = getListHTML(row);

    ul.append(li);
  });
  return ul;
}

export default async function decorate(block) {
  const list = await fetchSearch(CATEGORY_STORIES);
  block.textContent = '';
  if (list.length > 0) {
    const objects = await printList(list);
    block.append(objects);
  } else {
    block.append('no result found');
  }
  setTimeout(() => {
    const processStoriesBgImage = new ProcessStoriesBgImage();
    processStoriesBgImage.updateStoriesBgImage.bind(this, bgConfigParams).call();
  }, 3000);
}
