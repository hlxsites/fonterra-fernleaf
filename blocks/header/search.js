import { fetchSearch } from '../../scripts/scripts.js';
import { fetchPlaceholders } from '../../scripts/lib-franklin.js';

/**
 * Clear the category wise search results
 */
export function clearSearchResults() {
  const searchProducts = ['product', 'recipe', 'story'];
  const searchContainer = document.querySelector('#search-dialog .search-results-container');
  searchProducts.forEach((category) => {
    const productList = searchContainer.querySelector(`.${category}-category-list`);
    productList.innerHTML = '';
  });
}

/**
 * Get the Product List HTML Structure
 * @param {*}
 *   categoryName, item
 * @returns Returns the block of each product item
 */
const getProductListHTML = (categoryName, item) => {
  const productHTML = (categoryName.toLowerCase() === 'story')
    ? `<h6><a href='${item.path}'>${item.title}</a></h6>`
    : `<a href='${item.path}'>
        <picture>
            <img src='${item.image}'>
        </picture>
    </a>
    <h6><a href='${item.path}'>${item.title}</a></h6>`;
  return `<div class='product-list-item'>${productHTML}</div>`;
};

/**
 * Add the Product HTML Structure
 * @param {*}
 *   categoryName, productList, placeholders
 */
const addProductsHTML = (categoryName, productList, placeholders) => {
  const categoryElem = categoryName?.toLowerCase();
  const searchContainer = document.querySelector('#search-dialog .search-results-container');
  const productListElem = searchContainer.querySelector(`.${categoryElem}-category-list`);
  const productPlaceholder = {
    title: placeholders[`search${categoryName}Title`],
    viewText: placeholders[`search${categoryName}ViewText`],
    viewLink: placeholders[`search${categoryName}ViewLink`],
    noResultText: placeholders[`search${categoryName}NoResultText`],
    noResultLinkText: placeholders[`search${categoryName}NoResultLinkText`],
  };
  let productHTML = '';
  if (productList.length) {
    productHTML = `<div class='product-list-title'>
    <h4>${productPlaceholder.title}</h4>
        <div class='more-products'>
            <span class='split-bar'></span>
            <a href='${productPlaceholder.viewLink}'>${productPlaceholder.viewText}</a>
        </div>
    </div>
    <div class='product-list-results'>
        ${productList.map((item) =>
    getProductListHTML(categoryName, item)).join('')}
    </div>
    <div class='product-list-action'>
        <a class='button' href='${productPlaceholder.viewLink}'>${productPlaceholder.viewText}</a>
    </div>`;
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
export async function performSearch(value) {
  const searchValue = value.trim().toLowerCase();
  if (searchValue) {
    /* Product Categories used commonly to identify the element as well as placeholders */
    const productCategories = ['Product', 'Recipe', 'Story'];
    const productCount = 4;
    const spinner = document.querySelector("#search-dialog .overlay-loading");
    spinner.style.display = 'block';
    const placeholders = await fetchPlaceholders();    
    const searchData = await fetchSearch();
    spinner.style.display = 'none';
    if (placeholders && searchData) {
      productCategories.map((category) => {
        const filteredResults = searchData.filter((el) =>
          /* eslint max-len: ["error", { "code": 200 }] */
          /* eslint implicit-arrow-linebreak: ["error", "below"] */
          el.category.toLowerCase() === category.toLowerCase() && (el.title.toLowerCase().includes(searchValue) || el.description.toLowerCase().includes(searchValue))).slice(0, productCount);
        return addProductsHTML(category, filteredResults, placeholders);
      });
    }
  }
}

/**
 * Create the Seach Modal
 * @param {*}
 *   nav
 * @returns complete search wrapper
 */

export function createSearchModal(nav) {
  const headerLogo = nav.querySelector('.nav-brand').innerHTML;
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
                      <input type='text' name='search' placeholder='What are you looking for today?' title='Search' autocomplete='off'>
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
}
