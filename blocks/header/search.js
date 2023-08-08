import { getLanguage } from '../../scripts/scripts.js';

export function clearData() {
    const searchProducts = ["products", "recipes", "stories"];
    const searchContainer = document.querySelector("#search-dialog .search-results-container");
    searchProducts.forEach((item) => {     
        const productElem = `.${item} .product-list-results`;
        const productList = searchContainer.querySelector(productElem);   
        productList.innerHTML = "";
    });
}

const getListHTML = (name, item) => {
    const productHTML = (name === "stories")
    ? `<h6><a href="${item.path}">${item.title}</a></h6>`
    : `<a href="${item.path}">
            <picture>
                <img src="${item.image}">
            </picture>
        </a>
        <h6><a href="${item.path}">${item.title}</a></h6>`;    
    return `<div class="product-list-item">${productHTML}</div>`;
};

export function performSearch(value) {
    console.log('Searching for:', value);    
    if (value) {
        const searchProducts = ["products", "recipes", "stories"];
        searchProducts.map((item) => {
            return fetchData(item);
        });
    }
  }

async function loadData(path) {
    if (path && path.startsWith('/')) {
        const response = await fetch(path);
        return response ? JSON.parse(await response.text()) : null;
    }
    return null;
}

async function fetchData(name) {
    const apiNames = {
        products: "",
        recipes: "recipe",
        stories: "story"
    }
    const path = `/query-index-old.json?limit=4&offset=0&sheet=${getLanguage()}${apiNames[name] ? `-${apiNames[name]}` : ''}`;
    const list = await loadData(path);
    const searchContainer = document.querySelector("#search-dialog .search-results-container");
    const productElem = `.${name} .product-list-results`;
    const productList = searchContainer.querySelector(productElem);
    const products = list.data.map((item) => {
        return getListHTML(name, item);
    });            
    productList.innerHTML = products.join('');
}

export function createSearchModal(nav) {
    const headerLogo = nav.querySelector(".nav-brand").innerHTML;
    return `
      <div class="search-wrapper">
        <div class="search-header">
            ${headerLogo}
            <span class="close">Close</span>
        </div>
        <div class="search-results-container">
            <div class="search-results">
                <div class="search-input-box">
                    <div class="search-input-field">
                        <input type="text" name="search" placeholder="What are you looking for today?" title="Search" autocomplete="off">
                        <span class="icon icon-search"><svg xmlns="http://www.w3.org/2000/svg"><use href="#icons-sprite-search"></use></svg></span>
                    </div>
                </div>
                <div class="search-list">
                    <div class="product-list products">
                        <div class="product-list-title">
                            <h4>Products</h4>
                            <div class="more-products">
                                <span class="split-bar"></span>
                                <a href="">See All</a>
                            </div>
                        </div>
                        <div class="product-list-results"></div>
                        <div class="product-list-action">
                        <a class="button" href="">See All</a>
                        </div>
                    </div>
                    <div class="product-list recipes">
                        <div class="product-list-title">
                            <h4>Recipe</h4>
                            <div class="more-products">
                                <span class="split-bar"></span>
                                <a href="">See All</a>
                            </div>
                        </div>
                        <div class="product-list-results"></div>
                        <div class="product-list-action">
                            <a class="button" href="">See All</a>
                        </div>
                    </div>
                </div>
            </div>
            <div class="suggestion-list stories">
                <h4>Others</h4>
                <div class="product-list-results"></div>
                <div class="product-list-action">
                <a class="button" href="">See All</a>
                </div>
            </div>
        </div>
      </div>
    `;
}


