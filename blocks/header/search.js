import { fetchSearch, removeImageProps } from '../../scripts/scripts.js';
import { sampleRUM } from '../../scripts/lib-franklin.js';

const isDesktop = window.matchMedia('(min-width: 900px)');

function Animation(dialogElem) {
  this.dialogElem = dialogElem;
  this.resultsWrapper = this.dialogElem.querySelector('.story-results');
  this.resultsWrapperHeight = this.resultsWrapper?.offsetHeight || 460;
  this.searchResults = this.dialogElem.querySelector('.suggestion-list .product-list-results');
  this.searchResultsHeight = this.searchResults.offsetHeight + 70;
  this.searchResultItems = this.searchResults.querySelectorAll('.product-list-item');
  this.speed = 0.5;
  this.scroll = -(this.searchResultsHeight);

  this.bindEvents = () => {
    this.searchResults.addEventListener('mouseenter', this.stopAnimation);
    this.searchResults.addEventListener('mouseleave', this.startAnimation);
  };

  this.removeEvents = () => {
    this.searchResults.removeEventListener('mouseenter', this.stopAnimation);
    this.searchResults.removeEventListener('mouseleave', this.startAnimation);
  };

  this.marquee = () => {
    const range = {
      top: -100,
      middle: 80,
      bottom: 350,
    };
    this.scroll += this.speed;
    if (this.scroll > this.resultsWrapperHeight) {
      this.scroll = -(this.searchResultsHeight);
    }

    this.searchResults.style.transform = `translateY(${this.scroll}px)`;

    this.searchResultItems.forEach((item) => {
      const itemPosition = this.scroll + item.offsetTop;
      if (itemPosition < range.top
            || (itemPosition > range.middle && itemPosition < range.bottom)) {
        item.style.opacity = 1;
        item.style.transform = 'scale(1)';
      } else {
        item.style.opacity = 0.3;
        item.style.transform = 'scale(0.98)';
      }
      item.style.transition = 'opacity 3s ease, transform 1s ease';
    });
  };

  this.stopAnimation = () => {
    cancelAnimationFrame(this.requestAnimationFrame);
  };

  this.onAnimate = () => {
    this.marquee();
    this.requestAnimationFrame = requestAnimationFrame(this.onAnimate.bind(this));
  };

  this.startAnimation = () => {
    this.stopAnimation();
    this.onAnimate();
  };

  this.init = () => {
    this.resizeObserver.observe(this.resultsWrapper);
  };

  this.resizeObserver = new ResizeObserver(() => {
    if (isDesktop.matches) {
      this.bindEvents();
      this.startAnimation();
    } else {
      this.searchResults.removeAttribute('style');
      this.searchResultItems.forEach((item) => item.removeAttribute('style'));
      this.removeEvents();
      this.stopAnimation();
    }
  });
}

export default function Search() {
  this.categories = ['Product', 'Recipe', 'Story'];
  this.searchCategories = ['title', 'shorttitle', 'description', 'tags'];
  this.productCount = 4;

  /**
   * Clear the category wise search results
   */
  this.clearSearchResults = () => {
    this.categories.forEach((category) => {
      this.dialogElem.querySelector(`.search-results-container .${category.toLowerCase()}-category-list`).innerHTML = '';
    });
  };

  /**
   * Get the Product List HTML Structure
   * @param {*}
   *   categoryName, item
   * @returns Returns the block of each product item
   */
  this.getProductListHTML = (categoryName, item) => {
    const productHTML = (categoryName.toLowerCase() === this.categories[2].toLowerCase())
      ? `<h6><a href='${item.path}'>${item.title}</a></h6>`
      : `<span class='item-img'><a href='${item.path}'>
          <picture>
              <img src='${removeImageProps(item.image)}' alt='${item.title}' />
          </picture>
      </a></span>
      <h6><a href='${item.path}'>${item.title}</a></h6>`;
    return `<div class='product-list-item'>${productHTML}</div>`;
  };

  /**
 * Add the Product HTML Structure
 * @param {*}
 *   categoryName, productList
 */
  this.addProductsHTML = (categoryName, productList) => {
    const categoryElem = categoryName?.toLowerCase();
    const searchContainer = this.dialogElem.querySelector('.search-results-container');
    const productListElem = searchContainer.querySelector(`.${categoryElem}-category-list`);
    const productPlaceholder = {
      title: this.placeholders[`search${categoryName}Title`],
      viewText: this.placeholders[`search${categoryName}ViewText`],
      viewLink: this.placeholders[`search${categoryName}ViewLink`],
      noResultText: this.placeholders[`search${categoryName}NoResultText`],
      noResultLinkText: this.placeholders[`search${categoryName}NoResultLinkText`],
    };
    let productHTML = '';
    if (productList.length) {
      productHTML = `
      <div class='product-list-title'>
        <h4>${productPlaceholder.title}</h4>
        <div class='more-products'>
          <span class='split-bar'></span>
          <a href='${productPlaceholder.viewLink}'>${productPlaceholder.viewText}</a>
        </div>
      </div>
      <div class='product-list-results'>
        ${productList.map((item) => this.getProductListHTML(categoryName, item)).join('')}
      </div>
      ${categoryName.toLowerCase() !== this.categories[2].toLowerCase() ? `
      <div class='product-list-action'>
        <a class='button' href='${productPlaceholder.viewLink}'>${productPlaceholder.viewText}</a>
      </div>` : ''}
      `;
    } else {
      productHTML = `<div class='product-list-title'>
      <h4>${productPlaceholder.title}</h4>
      </div>
      <div class='no-product-list'>
          <p><span>${productPlaceholder.noResultText}</span> | 
          <a href='${productPlaceholder.viewLink}'>${productPlaceholder.noResultLinkText}</a></p>
      </div>`;
    }
    productListElem.innerHTML = productHTML;
  };

  /**
 * Perform the Search and add the products to the relevant category
 * @param {*}
 *   value
 */
  this.performSearch = async (value) => {
    const searchValue = value.trim().toLowerCase();
    if (searchValue) {
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('search', searchValue);
      /* eslint-disable no-restricted-globals */
      history.pushState(null, null, currentUrl.toString());
      const spinner = this.dialogElem.querySelector('.overlay-loading');
      spinner.style.display = 'block';
      const searchData = await fetchSearch();
      spinner.style.display = 'none';
      if (searchData && searchData?.length) {
        const filteredResults = searchData.filter((el) => this.searchCategories
          .some((prop) => el[prop]
            .toLowerCase()
            .includes(searchValue.toLowerCase())));
        const categorizedItems = filteredResults.reduce((result, el) => {
          if (el.category === this.categories[0].toLowerCase()
            && result.product.length < this.productCount) {
            result.product.push(el);
          } else if (el.category === this.categories[1].toLowerCase()
            && result.recipe.length < this.productCount) {
            result.recipe.push(el);
          } else {
            result.story.push(el);
          }
          return result;
        }, { product: [], recipe: [], story: [] });
        this.categories.map((category) => this.addProductsHTML(
          category,
          categorizedItems[category.toLowerCase()],
        ));

        if (categorizedItems.story.length) {
          new Animation(this.dialogElem).init();
        }

        if (filteredResults.length > 0) {
          sampleRUM('search', { source: '.search-input-field > input', target: searchValue });
        } else {
          sampleRUM('nullsearch', { source: '.search-input-field > input', target: searchValue });
        }
      }
    }
  };

  /**
   * Create the Search Modal
   * @param {*}
   *   nav
   * @returns complete search wrapper
   */
  this.createSearchModal = (nav, placeholders) => {
    const headerLogo = nav.querySelector('.nav-brand').innerHTML;
    const searchTitle = 'Search';
    this.placeholders = placeholders;

    return `
      <div class="overlay-loading">
        <div class="loading-wrapper">
          <div class="loading"></div>
        </div>
      </div>
      <div class='search-wrapper'>
        <div class='search-header'>
            ${headerLogo}
            <button class='close'>
                <span class='icon-close'></span>
            </button>
        </div>
        <div class='search-results-container'>
            <div class='search-results'>
                <div class='search-input-box'>
                    <div class='search-input-field'>
                        <input type='text' name='search' autofocus placeholder='${this.placeholders?.searchPlaceholderText}' title=${searchTitle} autocomplete='off'>
                        <span class='icon icon-search'></span>
                    </div>
                </div>
                <div class='search-list'>
                    <div class='product-list product-category-list'></div>
                    <div class='product-list recipe-category-list'></div>
                </div>
            </div>
            <div class='story-results'>
                <div class='suggestion-list story-category-list'></div>
            </div>
        </div>
      </div>
  `;
  };

  this.initSearchModal = (dialogElem) => {
    this.dialogElem = dialogElem;
    this.clearSearchResults();
  };
}
