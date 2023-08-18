import { getLanguage, fetchSearch } from '../../scripts/scripts.js';
import { fetchPlaceholders } from '../../scripts/lib-franklin.js';

let current = 1;
let numItems = 0;
let category;
let noOfBullets = 0;
let bulletCurrent = 1;
let interval;

function next(event) {
  const isRight = event === undefined || event.target.className === 'scroll-right';
  const sliderList = document.querySelector('.slider-container');
  if (isRight) {
    sliderList.classList.add('slide-transition-right');
    sliderList.style.transform = 'translate3d(-25%, 0px,0px)';
  } else {
    sliderList.classList.add('slide-transition-left');
    sliderList.style.transform = 'translate3d(25%, 0px,0px)';
  }
}

function changeOrder() {
  const sliderList = document.querySelector('.slider-container');
  const isRight = sliderList.classList.contains('slide-transition-right');
  if (isRight) {
    current = (current === numItems) ? 1 : current + 1;
    bulletCurrent = (bulletCurrent === noOfBullets) ? 1 : bulletCurrent + 1;
  } else {
    current = (current === 1) ? numItems : current - 1;
    bulletCurrent = (bulletCurrent === 1) ? noOfBullets : bulletCurrent - 1;
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

  const e1 = document.querySelector('.bullet-active');
  e1.classList.remove('bullet-active');
  const ele = document.getElementById((((bulletCurrent - 1) % (noOfBullets)) + 1));
  ele.classList.add('bullet-active');

  sliderList.classList.remove('slide-transition-right');
  sliderList.classList.remove('slide-transition-left');
  sliderList.style.transform = 'translate3d(0px, 0px, 0px)';
}

function fetchItemsInCarousel() {
  const screenWidth = window.innerWidth;
  let itemsInCarousel = 0;
  if (category === 'recipe') {
    itemsInCarousel = screenWidth < 900 ? 2 : 3;
  } else if (screenWidth < 600) {
    itemsInCarousel = 2;
  } else if (screenWidth < 900) {
    itemsInCarousel = 3;
  } else {
    itemsInCarousel = 4;
  }
  return itemsInCarousel;
}

function fetchNumberOfBullets() {
  return (numItems - fetchItemsInCarousel() + 1);
}

function showStaticCarousel() {
  if (numItems === fetchItemsInCarousel()) {
    return true;
  }
  return false;
}

function createBullets() {
  const bulletsContainer = document.getElementById('bullets');
  // Clear existing bullets before re-creating them
  bulletsContainer.innerHTML = '';

  noOfBullets = fetchNumberOfBullets();
  for (let i = 1; i <= noOfBullets; i += 1) {
    const bullet = document.createElement('span');
    if (i === 1) {
      bullet.classList.add('bullet-active');
    }
    bullet.classList.add('bullet');
    bullet.id = i;
    bulletsContainer.appendChild(bullet);
  }
  const sliderList = document.getElementById(`id-${category}-slider-list`);
  sliderList.append(bulletsContainer);
}

function showHideCarousel() {
  const bulletsContainer = document.getElementById('bullets');
  const leftButton = document.getElementById('id-scroll-left');
  const rightButton = document.getElementById('id-scroll-right');
  if (showStaticCarousel()) {
    leftButton.style.display = 'none';
    rightButton.style.display = 'none';
    bulletsContainer.style.display = 'none';
  } else {
    leftButton.style.display = '';
    rightButton.style.display = '';
    bulletsContainer.style.display = '';
  }
}

async function addCarouselHeader() {
  const placeholders = await fetchPlaceholders(`/${getLanguage()}`);
  const parentElement = document.querySelector('.carousel-container');
  const section = document.createElement('div');
  section.classList.add('carousel-header');
  const headerText = category === 'recipe' ? placeholders.recipecarouselheading : placeholders.productscarouselheading;
  section.innerHTML = `<h3>${headerText}</h3>`;
  parentElement.insertBefore(section, parentElement.firstChild);
}

function autoScrollCarousel() {
  const carouselWrapper = document.querySelector('.carousel-wrapper');
  if (!showStaticCarousel() && interval === undefined) {
    interval = setInterval(next, 3000);

    // Stop the interval when the user interacts with the carousel
    carouselWrapper.addEventListener('mouseenter', () => clearInterval(interval));
    carouselWrapper.addEventListener('mouseleave', () => {
      interval = setInterval(next, 3000); // Restart the interval when the user leaves
    });
  } else if (showStaticCarousel()) {
    clearInterval(interval);
    interval = undefined;
  }
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
        <a href="${item.path}" title='${item.shorttitle}'>
          <img src='${item.image}' alt='${item.image}'>
        </a>
        <h3>
          <a href="${item.path}" title='${item.shorttitle}'>${item.shorttitle}</a>
        </h3>
      `;

      categoryContainer.appendChild(categoryElement);
    });

    const sliderList = document.createElement('div');
    sliderList.classList.add(`${category}-slider-list`);
    sliderList.id = `id-${category}-slider-list`;

    const noOfItems = categoryContainer.children.length;
    numItems = noOfItems;

    const buttonl = document.createElement('button');
    buttonl.classList.add('scroll-left');
    buttonl.id = 'id-scroll-left';
    buttonl.setAttribute('aria-label', 'Scroll Left');
    buttonl.addEventListener('click', next, this);
    block.append(buttonl);

    const sliderContainer = document.createElement('div');
    sliderContainer.classList.add('slider-container');
    [...categoryContainer.children].forEach((row) => {
      const sliderItem = document.createElement('div');
      sliderItem.classList.add(`${category}-slider-item`);
      sliderItem.innerHTML = row.innerHTML;
      sliderItem.style.order = current;
      sliderItem.dataset.position = current;
      current += 1;
      sliderContainer.append(sliderItem);
    });
    sliderList.append(sliderContainer);
    block.append(sliderList);

    current = 1;
    const bulletsContainer = document.createElement('div');
    bulletsContainer.id = 'bullets';
    const carouselList = document.getElementById(`id-${category}-slider-list`);
    carouselList.append(bulletsContainer);

    const carouselContainer = document.querySelector('.carousel-container');
    const resizeObserver = new ResizeObserver(() => {
      createBullets();
    });
    resizeObserver.observe(carouselContainer);

    const button = document.createElement('button');
    button.classList.add('scroll-right');
    button.id = 'id-scroll-right';
    button.setAttribute('aria-label', 'Scroll Right');
    button.addEventListener('click', next, this);
    block.append(button);

    block.querySelector(`.${category}-slider-list`).addEventListener('transitionend', changeOrder);

    const resizeObserverToShowOrHideCarousel = new ResizeObserver(() => {
      showHideCarousel();
      autoScrollCarousel();
    });
    resizeObserverToShowOrHideCarousel.observe(carouselContainer);
  } else {
    block.append('no result found');
  }
}
