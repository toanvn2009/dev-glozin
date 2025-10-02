import { LazyLoader } from "@NextSkyTheme/lazy-load";
import * as NextSkyTheme from "@NextSkyTheme/global";
import { eventModal, checkUrlParameters } from "@NextSkyTheme/modal";
class NewsletterPopup extends HTMLElement {
  constructor() {
    super();
    this.enable = this.dataset.enable;
    this.initialized = false;
    this.sectionId = this.dataset.sectionId;
    this.scrollTriggered = false;
    this.spaceScroll = 70;
    this.contact_form = this.querySelector("form#contact_form");
  }

  connectedCallback() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.init());
    } else {
      if ("requestIdleCallback" in window) {
        requestIdleCallback(() => this.init());
      } else {
        setTimeout(() => this.init(), 100);
      }
    }
  }

  init() {
    if (window.Shopify && window.Shopify.designMode) {
      const _self = this;
      document.addEventListener("shopify:section:select", (event) => {
        _self.actionDesignMode(event);
      });
      document.addEventListener("shopify:section:load", (event) => {
        _self.createPopup();
      });
      document.addEventListener("shopify:section:deselect", () => {
        _self.closePopup();
      });
    }
    if (this.initialized) return;
    this.initialized = true;

    const urlChecked = checkUrlParameters();
    if (urlChecked) {
      NextSkyTheme.setCookie("newsletter_popup", "true", 365);
      return;
    }
    const getCookie = NextSkyTheme.getCookie("newsletter_popup");
    if (
      (this.enable === "show-on-homepage" || this.enable === "show-all-page") &&
      getCookie === null
    ) {
      this.initScrollTrigger();
    }
    document.addEventListener(
      "modal:opened",
      this.handleModalOpened.bind(this)
    );
    this.evenSubmitForm();
  }

  initInactivityTrigger() {
    if (this._inactivityInitialized) return;
    this._inactivityInitialized = true;
    this._inactivityTimer = null;
    this._inactivityTriggered = false;
    const events = ["scroll", "click", "mousemove", "keydown"];
    const _self = this;
    function resetTimer() {
      if (_self._inactivityTimer) clearTimeout(_self._inactivityTimer);
      if (_self._inactivityTriggered) return;
      _self._inactivityTimer = setTimeout(() => {
        if (!_self._inactivityTriggered) {
          _self._inactivityTriggered = true;
          if (_self._inactivityTimer) {
            clearTimeout(_self._inactivityTimer);
            _self._inactivityTimer = null;
          }
          const activeModal =
            NextSkyTheme.getRoot().classList.contains("open-modal");
          if (!activeModal) {
            _self.createPopup();
          }
          events.forEach((event) => {
            window.removeEventListener(event, resetTimer);
          });
        }
      }, 4000);
    }
    events.forEach((event) => {
      window.addEventListener(event, resetTimer, { passive: true });
    });
    resetTimer();
  }

  initScrollTrigger() {
    const _self = this;
    const scrollHandler = () => {
      if (_self.scrollTriggered) return;

      const featuredBanners = document.querySelectorAll(
        ".section-featured-product-banner"
      );
      if (featuredBanners.length > 0) {
        const currentScroll =
          window.pageYOffset || document.documentElement.scrollTop;
        let hasPassedAllBanners = true;

        featuredBanners.forEach((banner) => {
          const bannerRect = banner.getBoundingClientRect();
          const bannerBottom = bannerRect.bottom + window.pageYOffset;
          if (currentScroll < bannerBottom) {
            hasPassedAllBanners = false;
          }
        });

        if (!hasPassedAllBanners) {
          return;
        }
      }

      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const documentHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const scrollPercentage = (scrollTop / documentHeight) * 100;
      if (scrollPercentage >= _self.spaceScroll) {
        _self.scrollTriggered = true;
        _self.initInactivityTrigger();
        window.removeEventListener("scroll", scrollHandler);
      }
    };

    window.addEventListener("scroll", scrollHandler, { passive: true });
  }

  actionDesignMode(event) {
    const _self = this;
    const currentTarget = event.target;
    const wrapper = document.querySelector("newsletter-modal-popup");
    const template = currentTarget.querySelector("newsletter-modal-popup");
    if (
      JSON.parse(currentTarget.dataset.shopifyEditorSection).id ===
      this.sectionId
    ) {
      if (!wrapper.classList.contains("active")) {
        _self.createPopup(template);
      }
    } else {
      if (wrapper.classList.contains("active")) {
        _self.closePopup();
      }
    }
  }

  createPopup(templateDesignMode) {
    let template;
    if (window.Shopify && window.Shopify.designMode) {
      const existingPopup = document.querySelector("newsletter-modal-popup");
      if (existingPopup.classList.contains("active")) {
        eventModal(existingPopup, "close", true);
      }
    }
    if (window.Shopify && window.Shopify.designMode) {
      template = templateDesignMode;
    } else {
      template = this.querySelector("newsletter-modal-popup");
    }
    if (!template) return;
    eventModal(template, "open", true, null, true);
    NextSkyTheme.global.rootToFocus = template;
    this.initNotShow(template);
  }

  handleModalOpened() {
    if (this.tagName === "NEWSLETTER-POPUP") {
      new LazyLoader(".image-lazy-load");
    }
  }

  closePopup() {
    const wrapper = document.querySelector("newsletter-modal-popup");
    if (wrapper.classList.contains("active")) {
      eventModal(wrapper, "close", true);
    }
  }

  initNotShow(modal) {
    const notShowCheckbox = modal?.querySelector(".newsletter-action");
    if (!notShowCheckbox || notShowCheckbox.type !== "checkbox") return;
    const _self = this;

    notShowCheckbox.addEventListener("change", () => {
      _self.eventNotShow(notShowCheckbox);
    });
  }

  eventNotShow(checkbox) {
    if (checkbox.checked) {
      NextSkyTheme.setCookie("newsletter_popup", "true", 1);
    } else {
      NextSkyTheme.deleteCookie("newsletter_popup");
    }
  }

  evenSubmitForm() {
    if (this.contact_form) {
      this.contact_form.addEventListener("submit", (e) => {
        const submitButton =
          e.submitter ||
          this.contact_form.querySelector('button[type="submit"]');
        const spinner = submitButton?.querySelector(".icon-load");
        const text = submitButton?.querySelector(
          ".hidden-on-load.transition-short"
        );

        submitButton?.classList.add("loading");
        spinner?.classList.remove("opacity-0", "pointer-none");
        text?.classList.add("opacity-0");
      });
    }
  }
}
customElements.define("newsletter-popup", NewsletterPopup);
