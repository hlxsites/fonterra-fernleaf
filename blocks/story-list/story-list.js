import { getLanguage, adjustImageSize } from '../../scripts/scripts.js';

const getListHTML = (row) => `<div class="story-image"><img alt="${row.shorttitle}" src="${row.image}" width="300" height="218"></div>
            <div class="story-content">
                <div class="story-title"><a href="${row.path}" title="${row.shorttitle}">${row.shorttitle}</a></div>
                <p class="story-desc">${row.description}</p>
                <a href="${row.path}" title="${row.shorttitle}" class="button primary">Read More</a>
            </div>`;

async function loadData(path) {
  if (path && path.startsWith('/')) {
    const resp = await fetch(path);
    const listData = JSON.parse(await resp.text());
    return listData;
  }
  return null;
}

async function printList(list) {
  const ul = document.createElement('ul');
  list.data.forEach((row) => {
    row.image = adjustImageSize(row.image, 300);
    const li = document.createElement('li');
    li.classList.add('story');
    li.innerHTML = getListHTML(row);

    ul.append(li);
  });
  return ul;
}

export default async function decorate(block) {
  const path = `/query-index.json?limit=500&offset=0&sheet=${getLanguage()}-story`;
  const list = await loadData(path);

  block.textContent = '';
  if (list.data.length > 0) {
    const objects = await printList(list);
    block.append(objects);
  } else {
    block.append('no result found');
  }
}
