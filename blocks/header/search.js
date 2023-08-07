export default function createSearchModal(nav) {
    const headerLogo = nav.querySelector(".nav-brand").innerHTML;
    return `
      <div class="search-wrapper">
        <div class="search-header">
            ${headerLogo}
            <span class="close">Close</span>
        </div>
        <div>
            <div class="search-results">
                <div class="search-input">
                    <input type="search" name="search" placeholder="What are you looking for today?" title="Search" autocomplete="off">
                </div>
                <div class="search-list">
                    <div class="product-list">
                        <div class="product-list-title">
                            <h4>Products</h4>
                            <div class="more">
                                <span>|</span>
                                <span>See All</span>
                            </div>
                        </div>
                        <div class="product-list-results">
                            <div class="product-list-item">
                                <picture>
                                    <img src="https://www.fernleaf.com.my/content/dam/anchor/anchor_consumer_brands/anchor_global_/asset_library/website_assets/new_website/my/english/products/product_detail_pages/550-product-thumbnail_calciyum-milk-powder.png">
                                </picture>
                                <p>Flavoured Milk Powder for Children | Fernleaf - MY</p>
                            </div>
                            <div class="product-list-item">
                                <picture>
                                    <img src="https://www.fernleaf.com.my/content/dam/anchor/anchor_consumer_brands/anchor_global_/asset_library/website_assets/new_website/my/english/products/product_detail_pages/550-product-thumbnail_calciyum-milk-powder.png">
                                </picture>
                                <p>Flavoured Milk Powder for Children | Fernleaf - MY</p>
                            </div>
                            <div class="product-list-item">
                                <picture>
                                    <img src="https://www.fernleaf.com.my/content/dam/anchor/anchor_consumer_brands/anchor_global_/asset_library/website_assets/new_website/my/english/products/product_detail_pages/550-product-thumbnail_calciyum-milk-powder.png">
                                </picture>
                                <p>Flavoured Milk Powder for Children | Fernleaf - MY</p>
                            </div>
                            <div class="product-list-item">
                                <picture>
                                    <img src="https://www.fernleaf.com.my/content/dam/anchor/anchor_consumer_brands/anchor_global_/asset_library/website_assets/new_website/my/english/products/product_detail_pages/550-product-thumbnail_calciyum-milk-powder.png">
                                </picture>
                                <p>Flavoured Milk Powder for Children | Fernleaf - MY</p>
                            </div>
                        </div>
                        <div class="product-list-action">
                            <button>See All</button>
                        </div>
                    </div>
                    <div class="product-list">
                        <div class="product-list-title">
                            <h4>Recipe</h4>
                            <div class="more">
                                <span>|</span>
                                <span>See All</span>
                            </div>
                        </div>
                        <div class="product-list-results">
                            <div class="product-list-item">
                                <picture>
                                    <img src="https://www.fernleaf.com.my/content/dam/anchor/anchor_consumer_brands/anchor_global_/asset_library/website_assets/new_website/my/english/products/product_detail_pages/550-product-thumbnail_calciyum-milk-powder.png">
                                </picture>
                                <p>Flavoured Milk Powder for Children | Fernleaf - MY</p>
                            </div>
                            <div class="product-list-item">
                                <picture>
                                    <img src="https://www.fernleaf.com.my/content/dam/anchor/anchor_consumer_brands/anchor_global_/asset_library/website_assets/new_website/my/english/products/product_detail_pages/550-product-thumbnail_calciyum-milk-powder.png">
                                </picture>
                                <p>Flavoured Milk Powder for Children | Fernleaf - MY</p>
                            </div>
                            <div class="product-list-item">
                                <picture>
                                    <img src="https://www.fernleaf.com.my/content/dam/anchor/anchor_consumer_brands/anchor_global_/asset_library/website_assets/new_website/my/english/products/product_detail_pages/550-product-thumbnail_calciyum-milk-powder.png">
                                </picture>
                                <p>Flavoured Milk Powder for Children | Fernleaf - MY</p>
                            </div>
                            <div class="product-list-item">
                                <picture>
                                    <img src="https://www.fernleaf.com.my/content/dam/anchor/anchor_consumer_brands/anchor_global_/asset_library/website_assets/new_website/my/english/products/product_detail_pages/550-product-thumbnail_calciyum-milk-powder.png">
                                </picture>
                                <p>Flavoured Milk Powder for Children | Fernleaf - MY</p>
                            </div>
                        </div>
                        <div class="product-list-action">
                            <button>See All</button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="suggestion-list">
                <h4>Others</h4>
                <div class="product-list-results">
                    <div class="product-list-item">
                        <p>Flavoured Milk Powder for Children | Fernleaf - MY</p>
                    </div>
                    <div class="product-list-item">
                        <p>Flavoured Milk Powder for Children | Fernleaf - MY</p>
                    </div>
                    <div class="product-list-item">
                        <p>Flavoured Milk Powder for Children | Fernleaf - MY</p>
                    </div>
                    <div class="product-list-item">
                        <p>Flavoured Milk Powder for Children | Fernleaf - MY</p>
                    </div>
                </div>
                <div class="product-list-action">
                    <button>See All</button>
                </div>
            </div>
        </div>
      </div>
    `;
  }