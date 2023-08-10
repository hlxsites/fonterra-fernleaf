import { getLanguage, fetchSearch } from '../../scripts/scripts.js';
import { fetchPlaceholders } from '../../scripts/lib-franklin.js';

let current = 1;
let numItems = 0;
let category;

function next(event) {
  const isRight = event.target.className === 'scroll-right';
  const sliderList = event.target.parentElement.parentElement.getElementsByClassName(`${category}-slider-list`)[0];
  if (isRight) {
    sliderList.classList.add('slide-transition-right');
    sliderList.style.transform = 'translate3d(-25%, 0px,0px)';
  } else {
    sliderList.classList.add('slide-transition-left');
    sliderList.style.transform = 'translate3d(25%, 0px,0px)';
  }
}

function changeOrder(event) {
  const sliderList = event.target.parentElement.parentElement.getElementsByClassName(`${category}-slider-list`)[0];
  const isRight = sliderList.classList.contains('slide-transition-right');
  if (isRight) {
    current = (current === numItems) ? 1 : current + 1;
  } else {
    current = (current === 1) ? numItems : current - 1;
  }

  let order = 1;
  for (let i = current; i <= numItems; i += 1) {
    sliderList.querySelector(`.${category}-slider-item[data-position='${i}']`).style.order = order;
    order += 1;
  }

  for (let i = 1; i < current; i += 1) {
    sliderList.querySelector(`.${category}-slider-item[data-position='${i}']`).style.order = order;
    order += 1;
  }

  /* const e1 = document.querySelector('.bullet-active');
  e1.classList.remove('bullet-active');
  const ele = document.getElementById(''+current);
  ele.classList.add('bullet-active'); */

  sliderList.classList.remove('slide-transition-right');
  sliderList.classList.remove('slide-transition-left');
  sliderList.style.transform = 'translate3d(0px, 0px,0px)';
}

/*
function createBullets() {
  const screenWidth = window.innerWidth;
  console.log(`New Screen Width: ${screenWidth}px`);
}

const itemsInCarousel = screenWidth < 600 ? 2 : 3;
for (let i = 1; i <= numItems - itemsInCarousel + 1; i += 1) {
  const bullet = document.createElement('span');
  if (i === 1) {
    bullet.classList.add('bullet-active');
  } else {
    bullet.classList.add('bullet');
  }
  bullet.id = i;
  // block.append(bullet);
}

function createBullets() {
  const screenWidth = window.innerWidth;
  console.log(`Screen Width: ${screenWidth}px`);
  const itemsInCarousel = screenWidth < 600 ? 2 : 3;

  // Clear existing bullets before re-creating them
  const bulletsContainer = document.getElementById('bullets');
  bulletsContainer.innerHTML = '';

  for (let i = 1; i <= numItems - itemsInCarousel + 1; i += 1) {
    const bullet = document.createElement('span');
    if (i === 1) {
      bullet.classList.add('bullet-active');
    } else {
      bullet.classList.add('bullet');
    }
    bullet.id = i;
    bulletsContainer.appendChild(bullet);
  }

  const sliderList = document.querySelector(`.${category}-slider-list`);
  sliderList.append(bulletsContainer);
} */

async function addCarouselHeader() {
  const placeholders = await fetchPlaceholders(`/${getLanguage()}`);
  const parentElement = document.querySelector('.carousel-container');
  const section = document.createElement('div');
  section.classList.add('carousel-header');
  const headerText = category === 'recipe' ? placeholders.recipecarouselheading : placeholders.productscarouselheading;
  section.innerHTML = `<h3>${headerText}</h3>`;
  parentElement.insertBefore(section, parentElement.firstChild);
}

export default async function decorate(block) {
  category = block.innerText;
  const filteredItems = (await fetchSearch(category)).filter(
    (c) => c.path !== window.location.pathname,
  );

  const placeholders = await fetchPlaceholders();
  let maxItemsInCarousel;
  if (category === 'recipe') {
    maxItemsInCarousel = placeholders.maxitemsinrecipecarousel;
  } else {
    maxItemsInCarousel = placeholders.maxitemsinproductcarousel;
  }

  const randomItems = [];
  const availableItems = [...filteredItems];

  while (randomItems.length < maxItemsInCarousel && availableItems.length > 0) {
    const randomIndex = Math.floor(Math.random() * availableItems.length);
    const randomItem = availableItems.splice(randomIndex, 1)[0];
    randomItems.push(randomItem);
  }
  block.textContent = '';
  addCarouselHeader(category);

  if (randomItems.length > 0) {
    const categoryContainer = document.createElement('div');

    randomItems.forEach((item) => {
      const categoryElement = document.createElement('div');

      categoryElement.innerHTML = `
        <a href="${item.path}" title='${item.title}'>
          <img src='${item.image}' alt='${item.image}'>
        </a>
        <h3>
          <a href="${item.path}" title='${item.title}'>${item.title}</a>
        </h3>
      `;

      categoryContainer.appendChild(categoryElement);
    });

    // -----------------
    const sliderList = document.createElement('div');
    sliderList.classList.add(`${category}-slider-list`);

    const buttonl = document.createElement('button');
    buttonl.classList.add('scroll-left');
    buttonl.addEventListener('click', next, this);
    block.append(buttonl);

    const noOfItems = categoryContainer.children.length;
    numItems = noOfItems;

    [...categoryContainer.children].forEach((row) => {
      const sliderItem = document.createElement('div');
      sliderItem.classList.add(`${category}-slider-item`);
      sliderItem.innerHTML = row.innerHTML;
      sliderItem.style.order = current;
      sliderItem.dataset.position = current;
      current += 1;
      sliderList.append(sliderItem);
    });
    block.append(sliderList);
    current = 1;

    /*
    window.addEventListener('resize', createBullets);
    // number of bullets = numItems - itemInCarousel + 1
    // Initial call to create bullets
    const bulletsContainer = document.createElement('div');
    bulletsContainer.id = 'bullets';
    const outerdiv = document.querySelector('.outerdiv');
    outerdiv.append(bulletsContainer);
    // block.append(bulletsContainer);
    createBullets();

    // Listen for window resize
    window.addEventListener('resize', createBullets); */

    const button = document.createElement('button');
    button.classList.add('scroll-right');
    button.addEventListener('click', next, this);
    block.append(button);

    block.querySelector(`.${category}-slider-list`).addEventListener('transitionend', (event) => {
      changeOrder(event);
    });
  } else {
    block.append('no result found');
  }
}
