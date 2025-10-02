import { LazyLoader } from "@NextSkyTheme/lazy-load";
import * as NextSkyTheme from "@NextSkyTheme/global";
import { CustomElement } from "@NextSkyTheme/safari-element-patch";
import { eventModal } from "@NextSkyTheme/modal";

class FacetFiltersForm extends HTMLElement {
  constructor() {
    super();
    this.onActiveFilterClick = this.onActiveFilterClick.bind(this);
    this.debouncedOnSubmit = NextSkyTheme.debounce((event) => {
      this.onSubmitHandler(event);
    }, 500);

    const facetForm = this.querySelector("form");
    if (facetForm) {
      facetForm.addEventListener("input", this.debouncedOnSubmit.bind(this));
    }
  }

  static setListeners() {
    const onHistoryChange = (event) => {
      const searchParams = event.state
        ? event.state.searchParams
        : FacetFiltersForm.searchParamsInitial;
      if (searchParams === FacetFiltersForm.searchParamsPrev) return;
      FacetFiltersForm.renderPage(searchParams, null, false);
    };
    window.addEventListener("popstate", onHistoryChange);
  }

  static toggleActiveFacets(disable = true) {
    document.querySelectorAll(".js-facet-remove").forEach((element) => {
      element.classList.toggle("disabled", disable);
    });
  }

  static renderPage(searchParams, event, updateURLHash = true) {
    FacetFiltersForm.searchParamsPrev = searchParams;
    const sections = FacetFiltersForm.getSections();
    sections.forEach((section) => {
      const url = `${window.location.pathname}?section_id=${section.section}&${searchParams}`;
      const filterDataUrl = (element) => element.url === url;
      FacetFiltersForm.filterData.some(filterDataUrl)
        ? FacetFiltersForm.renderSectionFromCache(filterDataUrl, event)
        : FacetFiltersForm.renderSectionFromFetch(url, event);
    });

    if (updateURLHash) FacetFiltersForm.updateURLHash(searchParams);
  }

  static renderSectionFromFetch(url, event) {
    document.getElementById("ProductsGridContainer").classList.add("loading");
    NextSkyTheme.getBody().classList.add("loading");
    const scrollIntoView = document.querySelector("#ProductsGridContainer");
    let offsetHeight = 0;
    if (scrollIntoView.querySelector(".collection-steps")) {
      offsetHeight =
        scrollIntoView.querySelector(".collection-steps").offsetHeight + 150;
    }
    window.scrollTo({
      top:
        scrollIntoView.getBoundingClientRect().top +
        window.scrollY -
        110 +
        offsetHeight,
      behavior: "smooth",
    });
    fetch(url)
      .then((response) => response.text())
      .then((responseText) => {
        const html = responseText;
        FacetFiltersForm.filterData = [
          ...FacetFiltersForm.filterData,
          { html, url },
        ];
        const htmlRender = new DOMParser().parseFromString(html, "text/html");
        FacetFiltersForm.renderFilters(htmlRender, event);
        FacetFiltersForm.renderProductContainer(htmlRender);
        FacetFiltersForm.renderProductCount(htmlRender);
        new LazyLoader(".image-lazy-load");
      });
  }

  static renderSectionFromCache(filterDataUrl, event) {
    document.getElementById("ProductsGridContainer").classList.add("loading");
    NextSkyTheme.getBody().classList.remove("loading");
    const scrollIntoView = document.querySelector("#ProductsGridContainer");
    let offsetHeight = 0;
    if (scrollIntoView.querySelector(".collection-steps")) {
      offsetHeight =
        scrollIntoView.querySelector(".collection-steps").offsetHeight + 150;
    }
    window.scrollTo({
      top:
        scrollIntoView.getBoundingClientRect().top +
        window.scrollY -
        110 +
        offsetHeight,
      behavior: "smooth",
    });
    const html = FacetFiltersForm.filterData.find(filterDataUrl).html;
    const htmlRender = new DOMParser().parseFromString(html, "text/html");
    FacetFiltersForm.renderFilters(htmlRender, event);
    FacetFiltersForm.renderProductContainer(htmlRender);
    FacetFiltersForm.renderProductCount(htmlRender);
    new LazyLoader(".image-lazy-load");
  }

  static renderProductContainer(htmlRender) {
    const collectionEmpty = htmlRender.querySelector(
      ".collection__gird .collection--empty"
    );
    if (collectionEmpty) {
      document.getElementById("CollectionGird").innerHTML =
        htmlRender.getElementById("CollectionGird").innerHTML;
    } else {
      document.getElementById("CollectionGird").innerHTML =
        htmlRender.getElementById("CollectionGird").innerHTML;
    }
  }

  static renderProductCount(htmlRender) {
    const updateContent = (blockClass) => {
      if (blockClass == "facet-drawer") {
        if (
          window.innerWidth < 1025 ||
          !document.querySelector("#FacetFiltersForm")
        ) {
          return;
        }
      }
      const source = htmlRender.querySelector(`.${blockClass}`);
      const destination = document.querySelector(`.${blockClass}`);
      if (source && destination) {
        destination.innerHTML = source.innerHTML;
      }
    };

    const blocksToUpdate = [
      "collection-count",
      "facets-filters-active",
      "facets-filters-drawer-active",
      "select-sort.facet-filters",
      "drawer-sort.facet-filters",
      "pagination-load-more",
      "facet-drawer",
    ];
    blocksToUpdate.forEach(updateContent);
  }

  static renderFilters(htmlRender, event) {
    const facetDetailsElements = htmlRender.querySelectorAll(
      "#FacetFiltersForm .js-filter, #FacetFiltersFormDrawer .js-filter"
    );
    const matchesIndex = (element) => {
      const jsFilter = event ? event.target.closest(".js-filter") : undefined;
      return jsFilter
        ? element.dataset.index === jsFilter.dataset.index
        : false;
    };
    const facetsToRender = Array.from(facetDetailsElements).filter(
      (element) => !matchesIndex(element)
    );

    const countsToRender = Array.from(facetDetailsElements).find(matchesIndex);
    facetsToRender.forEach((element) => {
      if (
        document.querySelector(
          `.js-filter[data-index="${element.dataset.index}"]`
        )
      ) {
        document.querySelector(
          `.js-filter[data-index="${element.dataset.index}"]`
        ).innerHTML = element.innerHTML;
      }
    });

    if (
      htmlRender.querySelector(".js-filter-apply") &&
      document.querySelector(".js-filter-apply")
    ) {
      document.querySelector(".js-filter-apply").innerHTML =
        htmlRender.querySelector(".js-filter-apply").innerHTML;
    }

    if (
      htmlRender.querySelector(".js-filter-facet") &&
      document.querySelector(".js-filter-facet")
    ) {
      document.querySelector(".js-filter-facet").innerHTML =
        htmlRender.querySelector(".js-filter-facet").innerHTML;
    }

    FacetFiltersForm.renderActiveFacets(htmlRender);

    if (countsToRender)
      FacetFiltersForm.renderCounts(
        countsToRender,
        event.target.closest(".js-filter")
      );
    document
      .getElementById("ProductsGridContainer")
      .classList.remove("loading");
    NextSkyTheme.getBody().classList.remove("loading");
  }

  static renderActiveFacets(html) {
    FacetFiltersForm.toggleActiveFacets(false);
  }

  static renderCounts(source, target) {
    const targetElement = target.querySelector(".facets__selected");
    const sourceElement = source.querySelector(".facets__selected");

    const targetElementAccessibility = target.querySelector(".facets__summary");
    const sourceElementAccessibility = source.querySelector(".facets__summary");

    if (sourceElement && targetElement) {
      target.querySelector(".facets__selected").outerHTML =
        source.querySelector(".facets__selected").outerHTML;
    }

    if (targetElementAccessibility && sourceElementAccessibility) {
      target.querySelector(".facets__summary").outerHTML =
        source.querySelector(".facets__summary").outerHTML;
    }
  }

  static updateURLHash(searchParams) {
    history.pushState(
      { searchParams },
      "",
      `${window.location.pathname}${searchParams && "?".concat(searchParams)}`
    );
  }

  static getSections() {
    return [
      {
        section: document.getElementById("product-grid").dataset.id,
      },
    ];
  }

  createSearchParams(form) {
    const formData = new FormData(form);
    const filteredFormData = new FormData();
    for (let [key, value] of formData.entries()) {
      filteredFormData.append(key, value);
    }
    return new URLSearchParams(filteredFormData).toString();
  }

  onSubmitForm(searchParams, event) {
    FacetFiltersForm.renderPage(searchParams, event);
  }

  onSubmitHandler(event) {
    event.preventDefault();
    if (event.target.classList.contains("max-price")) {
      const minValue = Number(document.querySelector(".min-price").value);
      const maxValue = Number(event.target.value);
      const rangeMaxValue = Number(event.target.max);
      if (maxValue <= minValue || maxValue > rangeMaxValue) {
        return;
      }
    }
    const sortFilterForms = document.querySelectorAll(
      "facet-filters-form form"
    );
    const targetForm = event.target.closest("form");
    const forms = [];
    const isFiltersForm = targetForm.id === "FacetFiltersForm";
    sortFilterForms.forEach((form) => {
      if (isFiltersForm) {
        if (form.id === "FacetSortForm" || form.id === "FacetFiltersForm") {
          forms.push(this.createSearchParams(form));
        }
      } else {
        if (
          form.id === "FacetSortForm" ||
          form.id === "FacetFiltersFormDrawer"
        ) {
          forms.push(this.createSearchParams(form));
        }
      }
    });
    this.onSubmitForm(forms.join("&"), event);
  }

  facetApplyFilter(event) {
    event.preventDefault();
    const drawer = document.querySelector("facet-drawer");
    const forms = [];
    const sortFilterForms = document.querySelectorAll(
      "facet-filters-form form"
    );
    sortFilterForms.forEach((form) => {
      if (form.id === "FacetSortForm" || form.id === "FacetFiltersFormDrawer") {
        forms.push(this.createSearchParams(form));
      }
    });
    this.onSubmitForm(forms.join("&"), event);
    eventModal(drawer, "close");
  }

  onActiveFilterClick(event) {
    event.preventDefault();
    FacetFiltersForm.toggleActiveFacets();
    const url =
      event.currentTarget.href.indexOf("?") == -1
        ? ""
        : event.currentTarget.href.slice(
            event.currentTarget.href.indexOf("?") + 1
          );
    FacetFiltersForm.renderPage(url);
  }
}

FacetFiltersForm.filterData = [];
FacetFiltersForm.searchParamsInitial = window.location.search.slice(1);
FacetFiltersForm.searchParamsPrev = window.location.search.slice(1);
customElements.define("facet-filters-form", FacetFiltersForm);
FacetFiltersForm.setListeners();

class PriceRangeDrag extends HTMLElement {
  constructor() {
    super();
    this.adjustToValidValues();
  }
  countPercentMin(value) {
    const rangemax = this.dataset?.rangeMax;
    if (!rangemax || rangemax === 0) return;
    let from = 0;
    if (value || rangemax !== 0) {
      from = (value / rangemax) * 100;
    }
    this.style.setProperty("--range-from", from + "%");
    if (Number(from) > Number(this.getValue("--range-to", this))) {
      this.style.setProperty("--range-to", from + "%");
    }
  }
  countPercentMax(value) {
    const rangemax = this.dataset?.rangeMax;
    if (!rangemax || rangemax === 0) return;
    let to = 0;
    if (value || rangemax !== 0) {
      to = (value / rangemax) * 100;
    }
    this.style.setProperty("--range-to", to + "%");
    if (Number(this.getValue("--range-from", this)) > Number(to)) {
      this.style.setProperty("--range-from", to + "%");
    }
  }
  getValue(value, priceDrag) {
    var computedStyle = getComputedStyle(priceDrag);
    var fromValue = computedStyle.getPropertyValue(value);
    return fromValue.replace("%", "");
  }

  adjustToValidValues() {
    const _this = this;
    var inputRange = this.querySelectorAll("input");
    var inputNum =
      this.closest("action-filter")?.querySelectorAll("price-range input");
    var rangeInput = inputRange[0];
    var rangeInput2 = inputRange[1];
    var minInput = inputNum[0];
    var maxInput = inputNum[1];
    rangeInput.addEventListener("input", function () {
      maxInput.value =
        parseInt(rangeInput2.max) == rangeInput2.value
          ? Number(rangeInput2.max).toFixed(2)
          : rangeInput2.value;
      minInput.value =
        parseInt(rangeInput.max) == rangeInput.value
          ? Number(rangeInput.max).toFixed(2)
          : rangeInput.value;
      if (parseInt(minInput.value) > parseInt(maxInput.value)) {
        maxInput.value = Number(minInput.value);
        rangeInput2.value = Number(minInput.value);
      }
      _this.countPercentMin(Number(rangeInput.value));
    });

    rangeInput2.addEventListener("input", function () {
      maxInput.value =
        parseInt(rangeInput2.max) == rangeInput2.value
          ? Number(rangeInput2.max).toFixed(2)
          : rangeInput2.value;
      minInput.value =
        parseInt(rangeInput.max) == rangeInput.value
          ? Number(rangeInput.max).toFixed(2)
          : rangeInput.value;
      if (parseInt(maxInput.value) < parseInt(minInput.value)) {
        minInput.value = Number(maxInput.value);
        rangeInput.value = Number(maxInput.value);
      }
      if (parseInt(rangeInput2.max) == rangeInput2.value) {
        _this.countPercentMax(Number(rangeInput2.max));
      } else {
        _this.countPercentMax(Number(rangeInput2.value));
      }
    });
  }
}
customElements.define("price-range-drag", PriceRangeDrag);

class PriceRange extends PriceRangeDrag {
  constructor() {
    super();
    this.adjustToValidValues();
    this.priceDrag =
      this.closest("action-filter").querySelector("price-range-drag");
  }
  countPercentMin(value) {
    if (!this.priceDrag) return;
    const rangemax = this.priceDrag.dataset?.rangeMax;
    if (!rangemax || rangemax === 0) return;
    let from = 0;
    if (value || rangemax !== 0) {
      from = (value / rangemax) * 100;
    }
    this.priceDrag.style.setProperty("--range-from", from + "%");
    if (Number(from) > Number(this.getValue("--range-to", this.priceDrag))) {
      this.priceDrag.style.setProperty("--range-to", from + "%");
    }
  }
  countPercentMax(value) {
    if (!this.priceDrag) return;
    const rangemax = this.priceDrag.dataset?.rangeMax;
    if (!rangemax || rangemax === 0) return;
    let to = 0;
    if (value || rangemax !== 0) {
      to = (value / rangemax) * 100;
    }
    this.priceDrag.style.setProperty("--range-to", to + "%");
    if (Number(this.getValue("--range-from", this.priceDrag)) > Number(to)) {
      this.priceDrag.style.setProperty("--range-from", to + "%");
    }
  }
  adjustToValidValues() {
    const _this = this;
    var inputNum = this.querySelectorAll("input");
    var inputRange = this.closest("action-filter")?.querySelectorAll(
      "price-range-drag input"
    );
    var rangeInput = inputRange[0];
    var rangeInput2 = inputRange[1];
    var minInput = inputNum[0];
    var maxInput = inputNum[1];
    minInput.addEventListener("keydown", function (event) {
      if (event.key === "e" || event.key === "+" || event.key === "-")
        event.preventDefault();
    });
    minInput.addEventListener("input", function () {
      if (
        Number(minInput.value) < Number(minInput.min) ||
        minInput.value == ""
      ) {
        minInput.value = maxInput.min;
      }
      if (maxInput.value == "") {
        if (minInput.value > Number(maxInput.max)) {
          minInput.value = maxInput.max;
        }
      } else {
        if (minInput.value > Number(maxInput.value)) {
          minInput.value = maxInput.value;
        }
      }
      if (minInput.value != "") {
        rangeInput.value = Number(minInput.value);
        _this.countPercentMin(Number(minInput.value));
      }
    });
    maxInput.addEventListener("keydown", function (event) {
      if (event.key === "e" || event.key === "+" || event.key === "-")
        event.preventDefault();
    });
    maxInput.addEventListener("blur", function () {
      if (maxInput.value > Number(maxInput.max)) {
        maxInput.value = maxInput.max;
      } else if (maxInput.value <= Number(minInput.value)) {
        maxInput.value = Number(minInput.value) + 1;
      }
      if (maxInput.value != "") {
        rangeInput2.value =
          Number(maxInput.value) > Number(maxInput.max)
            ? Number(maxInput.max).toFixed(2)
            : Number(maxInput.value);
        _this.countPercentMax(Number(maxInput.value));
      } else {
        rangeInput2.value = Number(maxInput.max).toFixed(2);
        _this.countPercentMax(Number(maxInput.max));
      }
      maxInput.dispatchEvent(new Event("input", { bubbles: true }));
    });
  }
}
customElements.define("price-range", PriceRange);

class FacetRemove extends HTMLElement {
  constructor() {
    super();
    const facetLink = this.querySelector("a");
    facetLink.setAttribute("role", "button");
    facetLink.addEventListener("click", this.closeFilter.bind(this));
    facetLink.addEventListener("keyup", (event) => {
      event.preventDefault();
      if (event.code.toUpperCase() === "SPACE") this.closeFilter(event);
    });
  }

  closeFilter(event) {
    event.preventDefault();
    const form =
      this.closest("facet-filters-form") ||
      document.querySelector("facet-filters-form");
    form.onActiveFilterClick(event);
  }
}
customElements.define("facet-remove", FacetRemove);

class FacetApplyDrawer extends HTMLElement {
  constructor() {
    super();
    const _this = this;
    this.addEventListener("click", this.closeFilter.bind(this));
    this.addEventListener(
      "keypress",
      function (event) {
        if (event.key === "Enter") {
          _this.closeFilter.bind(_this)(event);
        }
      }.bind(_this),
      false
    );
  }

  closeFilter(event) {
    event.preventDefault();
    const drawer = this.closest("facet-drawer");
    if (drawer) {
      eventModal(drawer, "close");
    }
  }
}
customElements.define("facet-apply-drawer", FacetApplyDrawer);

class SelectSorter extends HTMLElement {
  constructor() {
    super();
    this.addEventListener("click", this.activeFilterSort.bind(this), false);
    document.addEventListener(
      "click",
      this.handleClickOutside.bind(this),
      false
    );
    this.addEventListener("keydown", this.handleKeydown.bind(this), false);
  }

  handleKeydown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      this.activeFilterSort();
    } else if (event.key === "Escape") {
      event.preventDefault();
      this.closeDropdown();
    }
  }

  closeDropdown() {
    const selectCustom = this.closest(".select-custom");
    if (selectCustom && selectCustom.classList.contains("active")) {
      selectCustom.classList.remove("active");
      this.updateFilterSortTabindex(false);
    }
  }

  activeFilterSort() {
    const selectCustom = this.closest(".select-custom");
    const isActive = selectCustom.classList.contains("active");
    selectCustom.classList.toggle("active");
    this.updateFilterSortTabindex(!isActive);
  }

  handleClickOutside(event) {
    if (!event.target.closest(".facets-vertical-form")) {
      document.querySelectorAll(".facets-vertical-form").forEach((element) => {
        element.querySelector(".select-custom").classList.remove("active");
        const selectCustom = element.querySelector(".select-custom");
        if (!selectCustom.classList.contains("active")) {
          this.updateFilterSortTabindex(false);
        }
      });
    }
  }

  updateFilterSortTabindex(isActive) {
    const filterSortElements = document.querySelectorAll("filter-sort");
    filterSortElements.forEach((element) => {
      if (isActive) {
        element.setAttribute("tabindex", "0");
      } else {
        element.removeAttribute("tabindex");
      }
    });
  }
}
customElements.define("select-sorter", SelectSorter);

class FilterSort extends FacetFiltersForm {
  constructor() {
    super();
    this.addEventListener("click", this.filterSort.bind(this), false);
    this.addEventListener("keydown", this.handleKeydown.bind(this), false);
  }

  handleKeydown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      this.filterSort(event);
    } else if (event.key === "Escape") {
      event.preventDefault();
      this.closeDropdownAndUpdateTabindex();
    }
  }

  filterSort(event) {
    event?.preventDefault();
    const select = document.querySelector("select.facet-filters__select");
    const value = this.getAttribute("value");
    if (select && value) {
      select.value = value;
      select.dispatchEvent(new Event("input", { bubbles: true }));
    }
    this.closeDropdownAndUpdateTabindex();
  }

  closeDropdownAndUpdateTabindex() {
    const facetFilters = this.closest(".facet-filters");
    if (facetFilters) {
      facetFilters.classList.remove("active");
    }

    this.updateFilterSortTabindex();
    this.focusSelectSorter();
  }

  updateFilterSortTabindex() {
    const filterSortElements = document.querySelectorAll("filter-sort");
    filterSortElements.forEach((element) => {
      element.removeAttribute("tabindex");
    });
  }

  focusSelectSorter() {
    setTimeout(() => {
      const selectSorter =
        this.closest(".facet-filters")?.querySelector("select-sorter");
      if (selectSorter) {
        selectSorter.focus();
      }
    }, 100);
  }
}
customElements.define("filter-sort", FilterSort);

class FacetDrawer extends HTMLElement {
  constructor() {
    super();
    this.FacetsDrawer = document.getElementById("FacetsDrawer");
    this.FacetsDrawer.addEventListener(
      "click",
      this.openDrawer.bind(this),
      false
    );
    this.init();
  }

  init() {
    const drawer = document.querySelector("facet-drawer");
    const layout = this.dataset.layout;
    if (layout == "vertical") {
      let width = window.innerWidth;
      window.addEventListener("resize", () => {
        const newWidth = window.innerWidth;
        if (newWidth > 1024 && width <= 1024) {
          eventModal(drawer, "close");
        }
        width = newWidth;
      });
    }
  }

  openDrawer() {
    NextSkyTheme.getBody().appendChild(this);
    setTimeout(() => {
      this.FacetsDrawer.classList.add("active");
      const drawer = document.querySelector("facet-drawer");
      eventModal(drawer, "open", true, null, false, false);
      NextSkyTheme.global.rootToFocus = this.FacetsDrawer;
    }, 100);
  }
}
customElements.define("facet-drawer", FacetDrawer);

class FacetApplyCanvas extends FacetFiltersForm {
  constructor() {
    super();
    this.addEventListener("click", this.facetApplyFilter.bind(this), false);
  }
}
customElements.define("facet-apply-canvas", FacetApplyCanvas);

class ShowMoreButton extends HTMLButtonElement {
  constructor() {
    super();
    this.init();
  }

  init() {
    this.addEventListener("click", this.ShowMoreFilter.bind(this));
  }

  ShowMoreFilter() {
    const button = this;
    const filterItemElements =
      this.closest(".filter-attribute").querySelectorAll(".hidden-load-more");
    if (button.classList.contains("show-more")) {
      button.classList.remove("show-more");
      button.classList.add("show-less");
      filterItemElements.forEach((element) => {
        element.classList.remove("hidden");
      });
    } else {
      button.classList.add("show-more");
      button.classList.remove("show-less");
      filterItemElements.forEach((element) => {
        element.classList.add("hidden");
      });
    }
  }
}
customElements.define("show-more-button", ShowMoreButton, {
  extends: "button",
});
CustomElement.observeAndPatchCustomElements({
  "show-more-button": {
    tagElement: "button",
    classElement: ShowMoreButton,
  },
});

class LoadMoreProduct extends HTMLElement {
  constructor() {
    super();
    this.addEventListener("click", this.fetchData.bind(this), false);
    this.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        this.fetchData(event);
      }
    });
  }

  connectedCallback() {
    if (this.dataset.pagination == "infinity") {
      Motion.inView(this, this.fetchData.bind(this), {
        margin: "100px 0px -10px 0px",
      });
    }
  }

  fetchData() {
    const currentUrl = window.location.href;
    const param = window.location.search;
    let url = this.dataset.url;
    if (!url) return;
    if (param.length > 0) {
      url = currentUrl + url.replaceAll("?", "&");
    }
    this.classList.add("loading");
    fetch(url)
      .then((response) => response.text())
      .then((html) => {
        const htmlRender = new DOMParser().parseFromString(html, "text/html");
        const resultNodesHtml = htmlRender.querySelectorAll(
          "#product-grid .product-item"
        );
        resultNodesHtml.forEach((prodNode) =>
          document.querySelector("#product-grid").appendChild(prodNode)
        );
        document.querySelector(".pagination-load-more").innerHTML =
          htmlRender.querySelector(".pagination-load-more").innerHTML;
        new LazyLoader(".image-lazy-load");
        document
          .querySelector("#CollectionGird")
          .querySelector("motion-items-effect")
          ?.reloadAnimationEffect();
      })
      .finally(() => {
        this.classList.remove("loading");
      })
      .catch((e) => {
        console.error(e);
      });
  }
}
if (!customElements.get("loadmore-button")) {
  customElements.define("loadmore-button", LoadMoreProduct);
}

class StickyToolbar extends HTMLElement {
  constructor() {
    super();
    this.isSticky = false;
    this.toolbarHeight = 0;
    this.triggerPosition = 0;

    this.init();
    this.bindEvents();
  }

  init() {
    if (window.innerWidth >= 1024.98) {
      return;
    }

    requestAnimationFrame(() => {
      this.toolbarHeight = this.offsetHeight;

      this.calculateTriggerPosition();

      NextSkyTheme.getBody().style.setProperty(
        "--sticky-toolbar-height",
        this.toolbarHeight + "px"
      );

      this.checkInitialStickyState();
    });
  }

  checkInitialStickyState() {
    const attemptCheck = (delay = 0, maxAttempts = 5, currentAttempt = 1) => {
      setTimeout(() => {
        this.calculateTriggerPosition();

        const currentScrollY = window.scrollY;
        if (currentScrollY > this.triggerPosition && !this.isSticky) {
          this.activateSticky();
        } else if (currentAttempt < maxAttempts) {
          attemptCheck(delay * 2 || 50, maxAttempts, currentAttempt + 1);
        }
      }, delay);
    };

    attemptCheck();
  }

  calculateTriggerPosition() {
    const allSections = document.querySelectorAll(".shopify-section");
    let totalHeight = 0;

    let toolbarSection = null;
    for (const section of allSections) {
      if (section.contains(this)) {
        toolbarSection = section;
        break;
      }
    }

    for (const section of allSections) {
      if (section === toolbarSection) {
        if (section.classList.contains("shopify-section-search")) {
          const titleWrapper = section.querySelector(
            ".title-wrapper-with-link"
          );
          if (titleWrapper) {
            totalHeight += titleWrapper.offsetHeight;
          }
        }
        const collectionSteps = section.querySelector(".collection-steps");
        if (collectionSteps) {
          totalHeight += collectionSteps.offsetHeight;
        }
        break;
      }

      const position = section.compareDocumentPosition(this);

      if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
        if (section.classList.contains("shopify-section-search")) {
          const titleWrapper = section.querySelector(
            ".title-wrapper-with-link"
          );
          if (titleWrapper) {
            totalHeight += titleWrapper.offsetHeight;
          }
        } else {
          totalHeight += section.offsetHeight;
        }
        const collectionSteps = section.querySelector(".collection-steps");
        if (collectionSteps) {
          totalHeight += collectionSteps.offsetHeight;
        }
      }
    }

    this.triggerPosition = totalHeight;
  }

  bindEvents() {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.onScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", () => {
      this.init();
    });
  }

  onScroll() {
    if (window.innerWidth >= 1024.98) {
      if (this.isSticky) {
        this.deactivateSticky();
      }
      return;
    }

    const currentScrollY = window.scrollY;
    const shouldBeSticky = currentScrollY > this.triggerPosition;

    if (shouldBeSticky && !this.isSticky) {
      this.activateSticky();
    } else if (!shouldBeSticky && this.isSticky) {
      this.deactivateSticky();
    }
  }

  activateSticky() {
    this.isSticky = true;
    NextSkyTheme.getBody().classList.add("has-sticky-toolbar");
    NextSkyTheme.getBody().style.setProperty(
      "--sticky-toolbar-height",
      this.toolbarHeight + "px"
    );
  }

  deactivateSticky() {
    this.isSticky = false;
    NextSkyTheme.getBody().classList.remove("has-sticky-toolbar");
  }
}

customElements.define("sticky-toolbar", StickyToolbar);
