import { LazyLoader } from "@NextSkyTheme/lazy-load";
import * as NextSkyTheme from "@NextSkyTheme/global";
import { notifier } from "@NextSkyTheme/notification";
import { eventModal } from "@NextSkyTheme/modal";

class NewsletterPopupPassword extends HTMLElement {
  constructor() {
    super();
    this.enable = this.dataset.enable;
    this.initialized = false;
    this.sectionId = this.dataset.sectionId;
    this.lastFocusedElement = null;
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

    const urlChecked = this.checkUrlParameters();
    if (urlChecked) {
      return;
    }
    const getCookie = NextSkyTheme.getCookie("newsletter_popup");
    if (
      (this.enable === "show-on-homepage" || this.enable === "show-all-page") &&
      getCookie === null
    ) {
      this.schedulePopupWithModalCheck();
    }

    const passwordHeading = this.querySelector(".password-modal__content-heading");
    if (passwordHeading) {
      passwordHeading.setAttribute("tabindex", "0"); 
      passwordHeading.addEventListener("click", () => {
        this.createPopup(); 
      });

      passwordHeading.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          this.createPopup(); 
        }
      });
    }
  }

  schedulePopupWithModalCheck() {
    const popupDelay = 6000;
    setTimeout(() => {
      const activeModal = NextSkyTheme.getRoot().classList.contains("open-modal");
      if (!activeModal) {
        this.createPopup();
      }
    }, popupDelay - 100);
  }

  actionDesignMode(event) {
    const _self = this;
    const currentTarget = event.target;
    const wrapper = document.querySelector("newsletter-modal-popup");
    const template = currentTarget.querySelector("template");
    if (
      JSON.parse(currentTarget.dataset.shopifyEditorSection).id ===
      this.sectionId
    ) {
      if (!wrapper) {
        _self.createPopup(template);
      }
    } else {
      if (wrapper) {
        _self.closePopup();
      }
    }
  }

  createPopup(templateDesignMode) {
    let template;
    let timeShowPopup = 0;
    if (window.Shopify && window.Shopify.designMode) {
      const existingPopup = document.querySelector("newsletter-modal-popup");
      if (existingPopup) {
        existingPopup.remove();
      }
    }
    if (window.Shopify && window.Shopify.designMode) {
      template = templateDesignMode;
      timeShowPopup = 0;
    } else {
      template = this.querySelector("template");
      timeShowPopup = 100;
    }
    if (!template) return;
    const content = document.createElement("div");
    content.appendChild(template.content.firstElementChild.cloneNode(true));
    const wrapper = NextSkyTheme.getBody().appendChild(
      content.querySelector("newsletter-modal-popup")
    );

    this.lastFocusedElement = document.activeElement;

    setTimeout(() => {
      eventModal(wrapper, "open", true, null, true);
      NextSkyTheme.global.rootToFocus = wrapper;
      new LazyLoader(".image-lazy-load");
    }, timeShowPopup);
    const form = document.querySelector('.password-form-popup');
    const submitButton = form.querySelector('.password-button'); 
    const passwordInput = form.querySelector('#Password--storefront');
  if (!form || !submitButton || !passwordInput) {
      return;
    }

    submitButton.addEventListener('click', function (e) {

      if(passwordInput.value != "") {
      const spinner = submitButton?.querySelector(".icon-load");
      const text = submitButton?.querySelector(".hidden-on-load.transition-short");

      submitButton?.classList.add("loading");
      spinner?.classList.remove("opacity-0", "pointer-none");
      text?.classList.add("opacity-0");
      }
    });
    
    this.initNotShow(wrapper);
  }

  closePopup() {
    const wrapper = document.querySelector("newsletter-modal-popup");
    if (wrapper) {
      eventModal(wrapper, "close", true);
      if (this.lastFocusedElement) {
        this.lastFocusedElement.focus();
      }
    }
  }

  checkUrlParameters() {
    const urlInfo = window.location.href;
    const newURL = location.href.split("?")[0];

    if (urlInfo.indexOf("customer_posted=true") >= 1) {
      NextSkyTheme.setCookie("newsletter_popup", "true", 1);
      notifier.show(message.newsletter.success, "success", 4000);
      window.history.pushState("object", document.title, newURL);
      return true;
    }

    if (
      urlInfo.indexOf("contact%5Btags%5D=newsletter&form_type=customer") >= 1
    ) {
      notifier.show(message.newsletter.error, "error", 4000);
      window.history.pushState("object", document.title, newURL);
      return false;
    }

    return false;
  }

  initNotShow(modal) {
    const notShow = modal?.querySelector(".newsletter-action");
    if (!notShow) return;
    const _self = this;

    notShow.addEventListener("click", () => {
        _self.eventNotShow(modal);
    });
    notShow.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        _self.eventNotShow(modal);
      }
    });
  }

  eventNotShow(modal) {
    NextSkyTheme.setCookie("newsletter_popup", "true", 1);
    eventModal(modal, "close", true);
  }
}

customElements.define("newsletter-popup-password", NewsletterPopupPassword);

