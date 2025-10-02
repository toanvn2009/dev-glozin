import { eventModal } from "@NextSkyTheme/modal";

class PopupLink extends HTMLElement {
  constructor() {
    super();
    this.sectionId = this.dataset.sectionId;
  }

  connectedCallback() {
    this.addEventListener("click", this.handleClick.bind(this), false);
    this.addEventListener("keydown", this.handleKeydown.bind(this), false);
  }

  handleClick(event) {
    event.preventDefault();
    this.openPopup();
  }

  handleKeydown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      this.openPopup();
    }
  }

  openPopup() {
    const linkPopup = document.querySelector(`link-popup[data-section-id="${this.sectionId}"]`);
    if (linkPopup) {
      if (window.Shopify && window.Shopify.designMode) {
        eventModal(linkPopup, "close", false);
      }
      eventModal(linkPopup, "open", false, null, true);
    }
  }

  disconnectedCallback() {
    this.removeEventListener("click", this.handleClick);
    this.removeEventListener("keydown", this.handleKeydown);
  }
}

customElements.define("popup-link", PopupLink);