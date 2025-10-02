import { LazyLoader } from "@NextSkyTheme/lazy-load";
import * as NextSkyTheme from "@NextSkyTheme/global";
import { eventModal } from "@NextSkyTheme/modal";

const delegate = new NextSkyTheme.eventDelegate();
class VariantInput extends HTMLElement {
  constructor() {
    super(),
      (this.showMore = this.querySelector(".number-showmore")),
      (this.sizeChart = this.querySelector(".open-size-chart")),
      (this.eventTarget = null),
      (this.swatch = this.querySelector(
        ".product-card-swatch-js .variant-input"
      )),
      delegate.on(
        "click",
        '.product-card-swatch-js .variant-input [type="radio"]',
        this.onSwatchClick.bind(this)
      ),
      delegate.on(
        "keydown",
        '.product-card-swatch-js .variant-input [type="radio"]',
        function (event) {
          if (event.key === "Enter") {
            this.onSwatchClick(event);
          }
        }.bind(this)
      );
  }

  get sectionId() {
    return this.hasAttribute("data-section-id")
      ? this.getAttribute("data-section-id")
      : this.getAttribute("data-section-id");
  }

  get blockId() {
    return this.hasAttribute("data-block-id")
      ? this.getAttribute("data-block-id")
      : this.getAttribute("data-block-id");
  }

  get productUrl() {
    return this.hasAttribute("data-product-url")
      ? this.getAttribute("data-product-url")
      : this.getAttribute("data-product-url");
  }

  connectedCallback() {
    if (this.showMore) {
      this.showMore.addEventListener(
        "click",
        this.onShowMoreClicked.bind(this)
      );
    }
    if (this.sizeChart) {
      this.sizeChart.addEventListener(
        "click",
        this.onShowSizeChartClicked.bind(this)
      );
    }
    this.querySelectorAll('.product-card-swatch-js [type="radio"]').forEach(
      (input) => {
        input.addEventListener("change", this.onSwatchChanged.bind(this));
      }
    );

    this.querySelectorAll('.product-card-variant-js [type="radio"]').forEach(
      (input) => {
        input.addEventListener("change", this.onVariantChange.bind(this));
      }
    );
  }

  async onSwatchChanged(event) {
    event.preventDefault();
    const target = event.target;
    if (target.hasAttribute("value")) {
      this.querySelectorAll("li.variant-input").forEach((variant) => {
        variant.classList.remove("active");
      });
      target.closest(".variant-input").classList.add("active");
      this.querySelectorAll(".product-variants-option").forEach((v) => {
        v.classList.remove("active");
      });
      if (target.hasAttribute("data-href")) {
        const currentProduct = this.closest(".product__item-js");
        if (target.hasAttribute("value")) {
          currentProduct
            .querySelectorAll(
              `a[href^="/products/${this.getAttribute("handle")}"`
            )
            .forEach((link) => {
              const url = new URL(link.href);
              url.searchParams.set("variant", target.getAttribute("value"));
              link.href = `${url.pathname}${url.search}${url.hash}`;
            });
        }
        const productUrl = target.getAttribute("data-href");

        this.createResponsiveProduct(productUrl, currentProduct);
      }
    }
  }

  async onVariantChange(event) {
    event.preventDefault();
    this.eventTarget = event.target;
    const option_dropdown = this.eventTarget.closest(
      ".product-variants-option"
    );
    if (option_dropdown) {
      option_dropdown.classList.remove("active");
    }
    const selectedValues = Array.from(
      this.querySelectorAll('input[type="radio"]:checked')
    ).map((radio) => radio.value);
    const requestUrl = this.createRequestUrl(this.productUrl, selectedValues);
    this.fetchProductInfo({
      requestUrl,
      onSuccess: this.updateProductInfo,
    });
  }

  createRequestUrl(baseUrl, optionValues) {
    const queryParams = [`section_id=${this.sectionId}`];
    if (optionValues.length > 0) {
      queryParams.push(`option_values=${optionValues.join(",")}`);
    }
    return `${baseUrl}?${queryParams.join("&")}`;
  }

  fetchProductInfo({ requestUrl, onSuccess }) {
    const _this = this;
    fetch(requestUrl)
      .then((response) => response.text())
      .then((responseText) => {
        const parsedHTML = new DOMParser().parseFromString(
          responseText,
          "text/html"
        );
        onSuccess(
          parsedHTML,
          this.sectionId,
          this.eventTarget,
          this.blockId,
          _this
        );
      })
      .catch((error) => console.error("Error:", error));
  }

  updateProductInfo(parsedHTML, sectionId, eventTarget, blockId, _this) {
    const template = parsedHTML.querySelector(".template");
    let queryParsed, queryDocument;
    if (template && blockId) {
      const content = document.createElement("div");
      content.appendChild(template.content.firstElementChild.cloneNode(true));
      queryParsed = content.querySelector(`#Product-${blockId}`);
      queryDocument = document.querySelector(`#Product-${blockId}`);
    } else {
      queryParsed = parsedHTML.getElementById(`Product-${sectionId}`);
      queryDocument = document.getElementById(`Product-${sectionId}`);
      const selectedVariant = queryParsed.querySelector(
        ".productVariantSelected"
      )?.textContent;
      if (selectedVariant) {
        const variant = JSON.parse(selectedVariant);
        const variantId = variant && variant.id ? variant.id : "";
        const newUrl = new URL(window.location.href);
        if (variantId) {
          newUrl.searchParams.set("variant", variantId);
        } else {
          newUrl.searchParams.delete("variant");
        }
        if (_this.closest(".sec__main-product")) {
          window.history.replaceState(
            { path: newUrl.toString() },
            "",
            newUrl.toString()
          );
        }
        const stickyAddCart = queryDocument.querySelector("sticky-add-cart");
        if (stickyAddCart) {
          _this.updateStickyAddCart(stickyAddCart, queryParsed, variantId);
        }

        const bought_together = document.querySelector(
          `.bought-together-products-list`
        );

        if (bought_together && variantId) {
          const current_product =
            bought_together.querySelector(`.current-product`);
          current_product.querySelector(`input[name="items[][id]"]`).value =
            variantId;
        }

        const modalEdit = document.querySelector("main-cart-edit-popup");
        if (modalEdit) {
          const variantInput = modalEdit.querySelector("variant-input");
          const productUrl = variantInput.getAttribute("data-product-url");
          const requestUrl = productUrl + "?variant=" + variantId;
          _this.createResponsiveProduct(requestUrl, modalEdit);
        }
      }
    }
    const updateContent = async (blockClass) => {
      const source = queryParsed.querySelector(`.${blockClass}`);
      const destination = queryDocument.querySelector(`.${blockClass}`);
      if (source && destination) {
        if (blockClass == "block__media-gallery") {
          destination.classList.add("insert");
          await Motion.animate(
            destination,
            { opacity: [1, 0] },
            { duration: 0.2, easing: "ease-in", fill: "forwards" }
          ).finished;
          destination.innerHTML = source.innerHTML;
          Motion.animate(
            destination,
            { opacity: [0, 1] },
            { duration: 0.4, easing: "ease-in" }
          );
          new LazyLoader(".image-lazy-load");
        } else {
          await (destination.innerHTML = source.innerHTML);
          if (blockClass == "block-product__variant-picker") {
            if (
              eventTarget &&
              destination.querySelector(
                `input[value="${eventTarget.value}"]:checked`
              )
            ) {
              destination
                .querySelector(`input[value="${eventTarget.value}"]:checked`)
                .focus({ focusVisible: true });
            }
          }
        }
      }
    };

    const blocksToUpdate = [
      "block__media-gallery",
      "block-product__variant-picker",
      "block-product__badges",
      "block-product__price",
      "block-product__inventory",
      "block-product__buttons",
      "block-product__pickup",
      "sticky-sticky__buy-buttons",
    ];
    blocksToUpdate.forEach(updateContent);
    new LazyLoader(".image-lazy-load");
  }

  createResponsiveProduct(productUrl, currentProduct) {
    const url = `${productUrl}&section_id=card-product`;
    fetch(url)
      .then((response) => response.text())
      .then(async (responseText) => {
        const html = new DOMParser().parseFromString(responseText, "text/html");
        const currentImage = currentProduct.querySelector(".featured-image");
        const newImage = html.querySelector(".featured-image");
        const secondaryImage = currentProduct.querySelector(
          ".product__hover-img"
        );
        if (secondaryImage) {
          secondaryImage.classList.remove("hidden");
        }
        const currentPrice = currentProduct.querySelector(".product__price");
        const newPrice = html.querySelector(".product__price");
        if (currentPrice && newPrice) {
          currentPrice.replaceWith(newPrice);
        }

        const currentBadges = currentProduct.querySelector(".product__badges");
        const newBadges = html.querySelector(".product__badges");
        if (currentBadges && newBadges) {
          currentBadges.replaceWith(newBadges);
        }

        if (currentImage && newImage && currentImage.src !== newImage.src) {
          await Motion.animate(
            currentImage,
            { opacity: [1, 0] },
            { duration: 0.1, easing: "ease-in", fill: "forwards" }
          ).finished;
          await new Promise((resolve) =>
            newImage.complete ? resolve() : (newImage.onload = resolve)
          );
          currentImage.replaceWith(newImage);
          Motion.animate(
            newImage,
            { opacity: [0, 1] },
            { duration: 0.1, easing: "ease-in" }
          );
        }
      })
      .catch((e) => {
        console.error("Error updating price:", e);
      });
  }

  async updateStickyAddCart(stickyAddCart, queryParsed, variantId = null) {
    if (stickyAddCart.querySelector("select") && variantId) {
      stickyAddCart.querySelector("select").value = variantId;
    }
    const newStickyAddCart = queryParsed.querySelector("sticky-add-cart");
    const currentPrice = stickyAddCart.querySelector(".product__price");
    const newPrice = newStickyAddCart.querySelector(".product__price");
    if (currentPrice && newPrice) {
      currentPrice.replaceWith(newPrice);
    }

    const currentBadges = stickyAddCart.querySelector(".product__badges");
    const newBadges = newStickyAddCart.querySelector(".product__badges");
    if (currentBadges && newBadges) {
      currentBadges.replaceWith(newBadges);
    }

    const currentImage = stickyAddCart.querySelector(".featured-image");
    const newImage = newStickyAddCart.querySelector(".featured-image");
    if (currentImage && newImage && currentImage.src !== newImage.src) {
      await Motion.animate(
        currentImage,
        { opacity: [1, 0] },
        { duration: 0.1, easing: "ease-in", fill: "forwards" }
      ).finished;
      await new Promise((resolve) =>
        newImage.complete ? resolve() : (newImage.onload = resolve)
      );
      currentImage.replaceWith(newImage);
      Motion.animate(
        newImage,
        { opacity: [0, 1] },
        { duration: 0.1, easing: "ease-in" }
      );
    }
  }

  updateBoughtTogether(currentSection) {
    let total_price = 0,
      total_price_compare = 0,
      checked_items_count = 0;
    const count = currentSection.querySelectorAll(".count-product");
    const btnCount = currentSection.querySelectorAll(".btn-count-js");
    currentSection
      .querySelectorAll(".bought-together-checkbox[type='checkbox']")
      .forEach((item) => {
        const product = item.closest(".product__item-js");
        const variant_select = product.querySelector(
          "variant-swatch-select select"
        );
        const valueNoVariant = Number(
          product.getAttribute("data-compare-price")
        );
        const productId = item.value;
        let value_option = "";
        if (variant_select) {
          value_option = variant_select.value;
        }
        let price = Number(item.getAttribute("data-price"));
        let compare_at_price = Number(item.getAttribute("data-price-compare"));
        if (valueNoVariant) {
          compare_at_price = Number(valueNoVariant);
        }
        if (variant_select) {
          price = Number(
            variant_select.options[variant_select.selectedIndex].getAttribute(
              "data-price"
            )
          );
          compare_at_price = Number(
            variant_select.options[variant_select.selectedIndex].getAttribute(
              "data-price-compare"
            )
          );
          if (compare_at_price === 0) {
            compare_at_price = price;
          }
        }
        const variant = currentSection.querySelector(
          `[product-id="${productId}"]`
        );
        if (item.checked) {
          checked_items_count++;
          total_price = total_price + price;
          total_price_compare = total_price_compare + compare_at_price;
          if (value_option) {
            variant.querySelector(`input[name="items[][id]"]`).value =
              value_option;
          }
          variant.querySelectorAll("input").forEach((input) => {
            input.disabled = false;
          });
        } else {
          variant.querySelectorAll("input").forEach((input) => {
            input.disabled = true;
          });
        }
      });

    const countProductMobile = document.querySelector(
      "button-bought-together-mobile .count-product"
    );
    count.forEach((element) => {
      if (checked_items_count > 0) {
        element.innerHTML = checked_items_count;
      } else {
        element.innerHTML = 0;
      }
    });

    if (checked_items_count > 0) {
      countProductMobile.innerHTML = checked_items_count;
      btnCount.forEach((btn) => {
        btn.removeAttribute("disabled");
      });
    } else {
      countProductMobile.innerHTML = 0;
      btnCount.forEach((btn) => {
        btn.setAttribute("disabled", true);
      });
    }

    currentSection
      .querySelectorAll(".bought-together-products-form .total-price .price")
      .forEach((element) => {
        element.innerHTML = NextSkyTheme.formatMoney(
          total_price,
          cartStrings.money_format
        );
      });

    const comparePriceElement = currentSection.querySelector(
      ".bought-together-products-form .total-price .compare-price"
    );
    const savingPrice = currentSection.querySelector(
      ".bought-together-products-form .total-price .saving-price-js"
    );
    if (comparePriceElement) {
      comparePriceElement.innerHTML = NextSkyTheme.formatMoney(
        total_price_compare,
        cartStrings.money_format
      );
      if (total_price_compare > 0 && total_price_compare !== total_price) {
        comparePriceElement.classList.remove("hidden");
        savingPrice.classList.remove("hidden");
        comparePriceElement
          .closest(".total-price")
          .querySelector(".price")
          .classList.add("sale-color");
      } else {
        comparePriceElement.classList.add("hidden");
        savingPrice.classList.add("hidden");
        comparePriceElement
          .closest(".total-price")
          .querySelector(".price")
          .classList.remove("sale-color");
      }
      this.updateSavingPrice(currentSection, total_price, total_price_compare);
    }

    const totalElementMobile = document.querySelector(
      "button-bought-together-mobile .total-price .price"
    );
    if (totalElementMobile) {
      totalElementMobile.innerHTML = NextSkyTheme.formatMoney(
        total_price,
        cartStrings.money_format
      );
    }
  }

  updateSavingPrice(currentSection, totalPrice, totalPriceCompare) {
    const savingPriceElement = currentSection.querySelector(
      ".bought-together-products-form .total-price .saving-price-js .price-saving"
    );
    if (savingPriceElement) {
      const savingPrice = totalPriceCompare - totalPrice;
      const savingPercent = Math.round((savingPrice / totalPriceCompare) * 100);
      const savingPercentCompare = savingPercent * 100;
      if (savingPercentCompare > savingPrice) {
        savingPriceElement.innerHTML = window.cartStrings?.save_price + savingPercent + "%";
      } else {
        savingPriceElement.innerHTML = window.cartStrings?.save_price + NextSkyTheme.formatMoney(savingPrice, cartStrings.money_format);
      }
    }
  }

  onSwatchClick(event) {
    const variant = event.target.closest(".variant-input");
    if (
      variant.querySelector('[type="radio"]').checked &&
      variant.classList.contains("active")
    ) {
      window.location.href = variant
        .querySelector('[type="radio"]')
        .getAttribute("data-href");
    }
  }

  onShowMoreClicked(event) {
    const swatch_hidden = event.target
      .closest(".swatch-color")
      .querySelectorAll("li.hidden");
    swatch_hidden.forEach((swatch) => {
      swatch.classList.remove("hidden");
    });
    this.showMore.closest("li").remove();
  }

  onShowSizeChartClicked(event) {
    event.preventDefault();
    const sizeChart = event.target
      .closest(".product-variants-info")
      .querySelector("template");
    if (sizeChart) {
      const content = document.createElement("div");
      content.appendChild(sizeChart.content.firstElementChild.cloneNode(true));
      NextSkyTheme.getBody().appendChild(content.querySelector("size-chart-popup"));
    }
    setTimeout(
      () =>
        eventModal(
          document.querySelector("size-chart-popup"),
          "open",
          true,
          null,
          false
        ),
      100
    );
    NextSkyTheme.global.rootToFocus = this.sizeChart;
  }
}
customElements.define("variant-input", VariantInput);

class VariantsDropdown extends HTMLElement {
  constructor() {
    super(),
      (this.variants = this.closest(".product-variants-option")),
      this.init();
  }

  init() {
    if (this.variants) {
      this.variants
        .querySelector(".variants__option-dropdown")
        .addEventListener("click", this.onShowDropdownClicked.bind(this));
    }
    document.addEventListener("click", this.handleClickOutside.bind(this));
  }

  onShowDropdownClicked(event) {
    if (this.closest(".product-variants-option").classList.contains("active")) {
      this.closest(".product-variants-option").classList.remove("active");
    } else {
      this.closest(".product-variants-js")
        .querySelectorAll(".product-variants-option.active")
        .forEach((element) => {
          element.classList.remove("active");
        });
      this.closest(".product-variants-option").classList.add("active");
    }
  }

  handleClickOutside(event) {
    if (!event.target.closest(".product-variants-option")) {
      document
        .querySelectorAll(".product-variants-option.active")
        .forEach((element) => {
          element.classList.remove("active");
        });
    }
  }
}
customElements.define("variants-dropdown", VariantsDropdown);

class VariantSwatchSelect extends VariantInput {
  constructor() {
    super();
  }

  get sectionId() {
    return this.hasAttribute("section-id")
      ? this.getAttribute("section-id")
      : this.getAttribute("section-id");
  }

  connectedCallback() {
    this.querySelector("select").addEventListener(
      "change",
      this.onSwatchChanged.bind(this)
    );
  }

  onSwatchChanged(e) {
    e.preventDefault();
    const currentTarget = e.currentTarget;
    if (currentTarget.value) {
      const productUrl =
        currentTarget.options[currentTarget.selectedIndex].getAttribute(
          "data-product-url"
        );
      let currentProduct = this.closest(".product__item-js");
      if (this.closest("sticky-add-cart")) {
        this.onVariantChange(productUrl);
        return;
      }
      currentProduct
        .querySelectorAll(`a[href^="/products/${this.getAttribute("handle")}"`)
        .forEach((link) => {
          const url = new URL(link.href);
          url.searchParams.set("variant", currentTarget.value);
          link.href = `${url.pathname}${url.search}${url.hash}`;
        });
      this.createResponsiveProduct(productUrl, currentProduct);
      if (currentProduct.closest(".bought-together-products__wrapper")) {
        this.boughtTogetherProducts(
          currentProduct,
          currentProduct.closest(".bought-together-products__wrapper")
        );
      }
      this.updateProductFormBundleRoutine(currentProduct, currentTarget.value);
      this.updateProductFormBundleSection(currentProduct, currentTarget.value);
      this.updateTotalPriceCompactProductBundle(e);
    }
  }

  createRequestUrl(baseUrl) {
    const queryParams = [`section_id=${this.sectionId}`];
    return `${baseUrl}&${queryParams.join("&")}`;
  }

  onVariantChange(productUrl) {
    const requestUrl = this.createRequestUrl(productUrl);
    this.fetchProductInfo({
      requestUrl,
      onSuccess: this.updateProductInfo,
    });
  }

  boughtTogetherProducts(currentProduct, currentSection) {
    const checkbox = currentProduct.querySelector(".bought-together-checkbox");
    if (!checkbox.checked) {
      return;
    }
    this.updateBoughtTogether(currentSection);
  }

  updateProductFormBundleRoutine(currentProduct, value) {
    const productFormBundle = currentProduct.querySelector(
      "product-form-bundle"
    );
    if (productFormBundle) {
      const id = productFormBundle.querySelector("input[name=id]");
      if (id) {
        id.value = value;
      }
    }
  }

  updateProductFormBundleSection(currentProduct, value) {
    const productFormBundle = currentProduct.querySelector("product-form");
    const currentSection = currentProduct.closest("bundle-products");
    if (productFormBundle) {
      const id = productFormBundle.querySelector("input[name=id]");
      if (id) {
        id.value = value;
      }
    }
    if (currentSection) {
      const productId = currentProduct.getAttribute("data-product-id");
      const variant = currentSection.querySelector(
        `[product-id="${productId}"]`
      );
      if (variant) {
        variant.querySelector(`input[name="items[][id]"]`).value = value;
      }
    }
  }

  updateTotalPriceCompactProductBundle(event) {
    const currentTarget = event.currentTarget;
    const currentSection = currentTarget.closest("section");

    const bundleProducts = currentSection?.querySelector("bundle-products");
    if (!bundleProducts) return;

    const productForm = bundleProducts.querySelector(".bundle-products-form");
    if (!productForm) return;

    let totalPrice = 0;

    const bundleItems = bundleProducts.querySelectorAll("bundle-item");
    bundleItems.forEach((item) => {
      const select = item.querySelector("select");
      if (select && select.value) {
        const selectedOption = select.options[select.selectedIndex];
        const price = selectedOption.getAttribute("data-price");
        if (price) {
          totalPrice += parseFloat(price);
        }
      }
    });

    const totalPriceElement = productForm.querySelector(".total-price");
    if (totalPriceElement && totalPrice > 0) {
      const formattedPrice = NextSkyTheme.formatMoney(
        totalPrice,
        cartStrings.money_format
      );
      totalPriceElement.textContent = formattedPrice;
    }
  }
}
customElements.define("variant-swatch-select", VariantSwatchSelect);

class CardBoughtTogether extends VariantSwatchSelect {
  constructor() {
    super();
  }

  connectedCallback() {
    this.querySelectorAll('[type="checkbox"]').forEach((input) => {
      input.addEventListener("change", this.onSelectBoughtTogether.bind(this));
    });
  }

  onSelectBoughtTogether(e) {
    const currentTarget = e.currentTarget;
    if (currentTarget.value) {
      const currentProduct = this.closest(".product__item-js");
      if (currentProduct.closest(".bought-together-products__wrapper")) {
        this.updateBoughtTogether(
          currentProduct.closest(".bought-together-products__wrapper")
        );
      }
    }
  }
}
customElements.define("card-bought-together", CardBoughtTogether);
