import {
  fetchPlaceholders,
} from '../../scripts/lib-franklin.js';

const getHTML = (row) => `<a target="_blank" href="${row.link}" title="${row.brand}" aria-label="${row.brand}">
                <img alt="${row.brand}" src="${row.img}" width="100" height="42">
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

async function generateBlock() {
  const ul = document.createElement('ul');
  buyOptions.forEach((row) => {
    const li = document.createElement('li');
    li.classList.add('buyoption');
    li.innerHTML = getHTML(row);

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
