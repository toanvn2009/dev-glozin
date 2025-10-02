import { SlideSection } from "@NextSkyTheme/slide";
import { LazyLoader } from "@NextSkyTheme/lazy-load";
import * as NextSkyTheme from "@NextSkyTheme/global";
import { eventModal } from "@NextSkyTheme/modal";

class ActionSearch extends HTMLElement {
  constructor() {
    super();
    this.sectionId = this.dataset.sectionId;
    this.input = this.querySelector('input[type="search"]');
    this.form = this.querySelector("form#search_mini_form");
    this.templateRecommendedDefault = this.querySelector(
      ".template-recommended-default"
    );
    this.templateRecommendedPopup = this.querySelector(
      ".template-recommended-popup"
    );
    this.predictiveSearchResults = this.querySelector(".predictive-search");
    this.searchKeyword = this.querySelector(".search-keyword");
    this.recommendSearch = this.querySelector(".recommend-search");
    this.input?.addEventListener(
      "input",
      NextSkyTheme.debounce((event) => {
        this.onInput(event);
      }, 300).bind(this)
    );
    this.input.addEventListener("click", this.hideAnimationText.bind(this));
    window.Shopify.designMode &&
      (document.addEventListener("shopify:section:select", (event) => {
        const currentTarget = event.target;
        if (
          JSON.parse(currentTarget.dataset.shopifyEditorSection).id ===
          this.sectionId
        ) {
          eventModal(this, "open", false);
          if (this.querySelector(".search-animation") && this.querySelector(".search-animation").classList.contains("hidden-important")) {
            setTimeout(() => this.input.focus(), 10);
          }
        }
      }),
      document.addEventListener("shopify:section:deselect", () => {
        const searchSection = document.querySelector("action-search");
        if (searchSection) {
          eventModal(searchSection, "close", false);
        }
      }));
  }

  get actionSearch() {
    return document.querySelector("#search-icon-bubble") || null;
  }

  get type() {
    return this.getAttribute("data-type");
  }

  connectedCallback() {
    if (this.actionSearch) {
      this.actionSearch.addEventListener("click", (event) => {
        event.preventDefault();
        if (
          this.recommendSearch &&
          this.recommendSearch.querySelector("template") &&
          this.templateRecommendedDefault
        ) {
          this.updateProductRecommended();
        }
        eventModal(this, "open", false);
        setTimeout(() => this.input.focus(), 10);
        NextSkyTheme.global.rootToFocus = this.actionSearch;
      });
    }
    if (this.type == "popup") {
      this.innerWidth();
    }
  }

  innerWidth() {
    let width = window.innerWidth;
    window.addEventListener("resize", () => {
      const newWidth = window.innerWidth;
      if (newWidth <= 1024 && width > 1024) {
        this.actionSearchMobile();
      }
      if (newWidth > 1024 && width <= 1024) {
        this.actionSearchDesktop();
      }
      width = newWidth;
    });
    if (width <= 1024) {
      this.actionSearchMobile();
    } else {
      this.actionSearchDesktop();
    }
  }

  updateProductRecommended() {
    if (
      this.classList.contains("search-type-popup") &&
      this.templateRecommendedPopup
    ) {
      const content = document.createElement("div");
      content.appendChild(
        this.templateRecommendedPopup.content.firstElementChild.cloneNode(true)
      );
      this.recommendSearch.innerHTML = content.innerHTML;
    } else {
      const content = document.createElement("div");
      content.appendChild(
        this.templateRecommendedDefault.content.firstElementChild.cloneNode(
          true
        )
      );
      this.recommendSearch.innerHTML = content.innerHTML;
    }
    this.recommendSearch.classList.add("update-recommended");
    new LazyLoader(".image-lazy-load");
  }

  actionSearchMobile() {
    this.classList.remove("search-type-popup");
    this.classList.add("search-type-drawer");
    this.onInput();
    if (
      this.templateRecommendedDefault &&
      this.recommendSearch.classList.contains("update-recommended")
    ) {
      this.updateProductRecommended();
    }
  }

  actionSearchDesktop() {
    this.classList.remove("search-type-drawer");
    this.classList.add("search-type-popup");
    this.onInput();
    if (
      this.templateRecommendedDefault &&
      this.recommendSearch.classList.contains("update-recommended")
    ) {
      this.updateProductRecommended();
    }
  }

  onInput() {
    this.hideAnimationText();
    const searchTerm = this.input.value.trim();
    if (!searchTerm.length) {
      this.form.classList.remove("results", "on-input", "loading");
      NextSkyTheme.trapFocus(this);
      return;
    }
    let predictiveSearch = "predictive-search-drawer";
    if (this.classList.contains("search-type-popup")) {
      predictiveSearch = "predictive-search-popup";
    }
    this.form.classList.add("loading", "on-input");
    if (this.predictiveSearchResults) {
      this.getSearchResults(searchTerm, predictiveSearch); 
      return;
    }
    NextSkyTheme.trapFocus(this);
  }

  getSearchResults(searchTerm, predictiveSearch) {
    const query = `${routes.predictive_search_url}?q=${encodeURIComponent(
      searchTerm
    )}&section_id=${predictiveSearch}&resources[limit]=10&resources[limit_scope]=each`;
    fetch(query)
      .then((response) => {
        if (!response.ok) {
          var error = new Error(response.status);
          this.form.classList.remove("loading", "results");
          throw error;
        }
        return response.text();
      })
      .then((text) => {
        const resultsMarkup = new DOMParser()
          .parseFromString(text, "text/html")
          .querySelector(`#shopify-section-${predictiveSearch}`)?.innerHTML;
        if (this.predictiveSearchResults) {
          this.predictiveSearchResults.innerHTML = resultsMarkup;
        }
        this.form.classList.remove("loading");
        this.form.classList.add("results");
        if (this.querySelectorAll(".more-result-link").length > 0) {
          this.querySelectorAll(".more-result-link").forEach((e) => {
            e.href = `${routes.search_url}?q=${encodeURIComponent(
              searchTerm
            )}&options%5Bprefix%5D=last`;
          });
        }
        NextSkyTheme.trapFocus(this);
      })
      .catch((error) => {
        this.form.classList.remove("loading", "results");
        throw error;
      });
  }

  hideAnimationText() {
    if (this.querySelector(".search-animation")) {
      this.querySelector(".search-animation").classList.add("hidden-important");
    }
  }
}
customElements.define("action-search", ActionSearch);

class SearchText extends HTMLElement {
  constructor() {
    super();
    Motion.inView(this, this.init.bind(this));
  }

  async init() {
    await this.animation(this.getAttribute("data-text"));
  }

  async animation(text) {
    (this.innerHTML = text),
      await Motion.animate(
        this,
        {
          width: [0, `${this.scrollWidth + 1}px`],
        },
        {
          duration: 0.7,
          delay: 0.5,
        }
      ).finished,
      this.closest(".search-animation")
        .querySelector(".text-cursor")
        .classList.remove("hidden-important");
  }
}
customElements.define("search-text", SearchText);
