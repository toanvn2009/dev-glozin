import { initSlide } from "@NextSkyTheme/slide";
import {
  LazyLoadEventHover,
  LazyLoader,
  loadImages,
} from "@NextSkyTheme/lazy-load";
import { CustomElement } from "@NextSkyTheme/safari-element-patch";
import "@NextSkyTheme/add-to-cart";
import "@NextSkyTheme/variant-swatch";
import * as NextSkyTheme from "@NextSkyTheme/global";
import { notifier, notifierInline } from "@NextSkyTheme/notification";
import { eventModal } from "@NextSkyTheme/modal";

LazyLoadEventHover.run();
new LazyLoader(".image-lazy-load");
new NextSkyTheme.FSProgressBar("free-ship-progress-bar");

document.addEventListener("shopify:section:load", function () {
  new LazyLoader(".image-lazy-load");
  new NextSkyTheme.FSProgressBar("free-ship-progress-bar");
});

try {
  document.querySelector(":focus-visible");
} catch (e) {
  focusVisiblePolyfill();
}

function eventFlashingBrowseTab() {
  const { enable, firstNotification, secondaryNotification } =
    window.flashingBrowseTab || {};
  const titleTag = document.querySelector("title");
  if (!enable || !titleTag) return;
  const originalTitle = titleTag.innerText;
  let isActive = true;
  let myTimer = null;

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      if (!isActive) {
        clearInterval(myTimer);
        titleTag.innerText = originalTitle;
        isActive = true;
      }
    } else {
      if (!firstNotification || !secondaryNotification) return;
      isActive = false;
      let toggle = true;
      myTimer = setInterval(() => {
        titleTag.innerText = toggle ? firstNotification : secondaryNotification;
        toggle = !toggle;
      }, 2000);
    }
  });
}
eventFlashingBrowseTab();

function eventScrollbarWidth() {
  requestAnimationFrame(() => {
    NextSkyTheme.getRoot().style.setProperty(
      "--scrollbar-width",
      NextSkyTheme.getScrollbarWidth() + "px"
    );
    window.addEventListener("resize", () => {
      NextSkyTheme.getRoot().style.setProperty(
        "--scrollbar-width",
        NextSkyTheme.getScrollbarWidth() + "px"
      );
    });
  });
}

eventScrollbarWidth();

function focusVisiblePolyfill() {
  const navKeys = [
    "ARROWUP",
    "ARROWDOWN",
    "ARROWLEFT",
    "ARROWRIGHT",
    "TAB",
    "ENTER",
    "SPACE",
    "ESCAPE",
    "HOME",
    "END",
    "PAGEUP",
    "PAGEDOWN",
  ];
  let currentFocusedElement = null;
  let mouseClick = null;

  window.addEventListener("keydown", (event) => {
    if (navKeys.includes(event.code.toUpperCase())) {
      mouseClick = false;
    }
  });

  window.addEventListener("mousedown", () => {
    mouseClick = true;
  });

  window.addEventListener(
    "focus",
    () => {
      if (currentFocusedElement)
        currentFocusedElement.classList.remove("focused");

      if (mouseClick) return;

      currentFocusedElement = document.activeElement;
      currentFocusedElement.classList.add("focused");
    },
    true
  );
}

var Shopify = Shopify || {};
if (typeof window.Shopify == "undefined") {
  window.Shopify = {};
}

Shopify.bind = function (fn, scope) {
  return function () {
    return fn.apply(scope, arguments);
  };
};

Shopify.setSelectorByValue = function (selector, value) {
  for (var i = 0, count = selector.options.length; i < count; i++) {
    var option = selector.options[i];
    if (value == option.value || value == option.innerHTML) {
      selector.selectedIndex = i;
      return i;
    }
  }
};

Shopify.addListener = function (target, eventName, callback) {
  target.addEventListener
    ? target.addEventListener(eventName, callback, false)
    : target.attachEvent("on" + eventName, callback);
};

Shopify.postLink = function (path, options) {
  options = options || {};
  var method = options["method"] || "post";
  var params = options["parameters"] || {};

  var form = document.createElement("form");
  form.setAttribute("method", method);
  form.setAttribute("action", path);

  for (var key in params) {
    var hiddenField = document.createElement("input");
    hiddenField.setAttribute("type", "hidden");
    hiddenField.setAttribute("name", key);
    hiddenField.setAttribute("value", params[key]);
    form.appendChild(hiddenField);
  }
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
};

Shopify.CountryProvinceSelector = function (
  country_domid,
  province_domid,
  options
) {
  this.countryEl = document.getElementById(country_domid);
  this.provinceEl = document.getElementById(province_domid);
  this.provinceContainer = document.getElementById(
    options["hideElement"] || province_domid
  );

  Shopify.addListener(
    this.countryEl,
    "change",
    Shopify.bind(this.countryHandler, this)
  );

  this.initCountry();
  this.initProvince();
};

Shopify.CountryProvinceSelector.prototype = {
  initCountry: function () {
    var value = this.countryEl.getAttribute("data-default");
    Shopify.setSelectorByValue(this.countryEl, value);
    this.countryHandler();
  },

  initProvince: function () {
    var value = this.provinceEl.getAttribute("data-default");
    if (value && this.provinceEl.options.length > 0) {
      Shopify.setSelectorByValue(this.provinceEl, value);
    }
  },

  countryHandler: function () {
    var opt = this.countryEl.options[this.countryEl.selectedIndex];
    var raw = opt.getAttribute("data-provinces");
    var provinces = JSON.parse(raw);

    this.clearOptions(this.provinceEl);
    if (provinces && provinces.length == 0) {
      this.provinceContainer.style.display = "none";
    } else {
      for (var i = 0; i < provinces.length; i++) {
        var opt = document.createElement("option");
        opt.value = provinces[i][0];
        opt.innerHTML = provinces[i][1];
        this.provinceEl.appendChild(opt);
      }

      this.provinceContainer.style.display = "";
    }
  },

  clearOptions: function (selector) {
    while (selector.firstChild) {
      selector.removeChild(selector.firstChild);
    }
  },

  setOptions: function (selector, values) {
    for (var i = 0, count = values.length; i < values.length; i++) {
      var opt = document.createElement("option");
      opt.value = values[i];
      opt.innerHTML = values[i];
      selector.appendChild(opt);
    }
  },
};

class PageLoader extends HTMLElement {
  constructor() {
    super();
    this.bindEvents();
  }

  bindEvents() {
    window.addEventListener("load", this.onLoad.bind(this), false);
  }

  onLoad() {
    const loadingContainer = this.querySelector(".loading-container");
    Motion.animate(
      loadingContainer,
      { scale: [1, 0.5], opacity: [1, 0] },
      { duration: 0.3 }
    );
    Motion.animate(this, { opacity: [1, 0] }, { duration: 0.3 }).finished.then(
      () => {
        this.remove();
      }
    );
  }
}
customElements.define("page-loader", PageLoader);

class BackToTop extends HTMLElement {
  constructor() {
    super();
    this.addEventListener("click", this.backToTop.bind(this), false);
    this.addEventListener("keyup", (event) => {
      if (event.code.toUpperCase() === "ENTER") {
        this.backToTop();
      }
    });
    this.throttledScroll = NextSkyTheme.throttle(
      this.updateScrollPercentage.bind(this),
      16
    );
    this.prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    this.easeInOutCubic = (t) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  connectedCallback() {
    window.addEventListener("scroll", this.throttledScroll);
  }

  backToTop() {
    if (document.documentElement.scrollTop > 0 || document.body.scrollTop > 0) {
      this.smoothScrollTo(0, 600, 0.1);
      this.blur();
    }
  }

  updateScrollPercentage() {
    const scrollHeight =
      document.documentElement.scrollHeight || document.body.scrollHeight;
    const scrollTop =
      document.documentElement.scrollTop || document.body.scrollTop;
    const clientHeight =
      document.documentElement.clientHeight || document.body.clientHeight;
    const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;
    this.style.setProperty(
      "--scroll-percentage",
      scrollPercentage.toFixed(2) + "%"
    );
    if (scrollTop > 200) {
      this.classList.add("show");
    } else {
      this.classList.remove("show");
    }
  }

  smoothScrollTo(y, baseDuration = 650, kick = 0.2) {
    if (this.prefersReducedMotion) {
      window.scrollTo(0, y);
      return;
    }
    const startY = window.pageYOffset;
    const delta = y - startY;
    const dist = Math.abs(delta);

    const d = Math.max(620, Math.min(1200, baseDuration * (dist / 1400 + 1)));
    const start = performance.now() - d * kick;

    const step = (now) => {
      const t = Math.min(1, (now - start) / d);
      const eased = this.easeInOutCubic(t);
      window.scrollTo(0, startY + delta * eased);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  disconnectedCallback() {
    window.removeEventListener("scroll", this.throttledScroll);
  }
}
customElements.define("back-to-top", BackToTop);

class SiteHeader extends HTMLElement {
  constructor() {
    super();
    this.init();
  }

  get dataStickyType() {
    return this.hasAttribute("data-sticky-type")
      ? this.getAttribute("data-sticky-type")
      : "none";
  }
  get heightAnnouncementBar() {
    // Cache the announcement bar element
    if (!this._announcementBar) {
      this._announcementBar = document.querySelector(
        ".section-announcement-bar"
      );
    }
    return this._announcementBar
      ? Math.round(this._announcementBar.clientHeight)
      : 0;
  }

  init() {
    this.check = 0;
    requestAnimationFrame(() => {
      NextSkyTheme.getBody().style.setProperty(
        "--header-height",
        Math.round(this.clientHeight) + "px"
      );
    });
    this.onStickyHeader();
  }

  onStickyHeader() {
    if (this.dataStickyType != "none") {
      if (this.dataStickyType === "on-scroll-up") {
        this.closest(".site-header").classList.add("scroll-up");
      }
      if (this.dataStickyType === "always") {
        this.closest(".site-header").classList.add("header-sticky");
      }
      // Throttle scroll event for better performance
      this.throttledStickyFunction = NextSkyTheme.throttle(
        this.stickyFunction.bind(this),
        16
      );
      window.addEventListener("scroll", this.throttledStickyFunction, {
        passive: true,
      });
    }
  }

  stickyFunction() {
    let headerHeight =
      this.heightAnnouncementBar + Math.round(this.clientHeight);
    let header = this.closest(".site-header");
    let positionScrollY = window.scrollY;
    const isScrolling = this._lastScrollY !== positionScrollY;
    this._lastScrollY = positionScrollY;

    if (header && isScrolling) {
      if (this.dataStickyType === "always") {
        if (positionScrollY > headerHeight) {
          header.classList.add("section-header-sticky", "animate");
        } else {
          header.classList.remove("section-header-sticky", "animate");
        }
      } else {
        if (positionScrollY > 0) {
          if (positionScrollY > headerHeight) {
            header.classList.add("scr-pass-header");
            if (positionScrollY > this.check) {
              header.classList.add("header-sticky-hidden");
            } else {
              header.classList.remove("header-sticky-hidden");
              header.classList.add("animate");
            }
            header.classList.add("section-header-sticky");
            this.check = positionScrollY;
          } else {
            header.classList.remove("scr-pass-header");
            if (positionScrollY < 10 + this.heightAnnouncementBar) {
              header.classList.remove(
                "header-sticky-hidden",
                "section-header-sticky",
                "animate"
              );
            }
            this.check = 0;
          }
        } else {
          header.classList.remove(
            "header-sticky-hidden",
            "section-header-sticky",
            "animate"
          );
        }
      }
    }
  }
  disconnectedCallback() {
    // Clean up event listeners to prevent memory leaks
    if (this.throttledStickyFunction) {
      window.removeEventListener("scroll", this.throttledStickyFunction);
    }
    // Clear cached elements
    this._announcementBar = null;
  }
}
customElements.define("site-header", SiteHeader, {
  extends: "header",
});
CustomElement.observeAndPatchCustomElements({
  "site-header": {
    tagElement: "header",
    classElement: SiteHeader,
  },
});

class LazyLoadingImg extends HTMLImageElement {
  constructor() {
    super();
    this.init();
  }

  init() {
    // Cache media element to avoid repeated DOM queries
    this._media =
      this.closest(".image__media") || this.closest(".image-picture");

    if (this._media) {
      // Throttle resize event for better performance
      this.throttledLazyLoading = NextSkyTheme.throttle(
        this.lazyLoading.bind(this),
        100
      );
      window.addEventListener("resize", this.throttledLazyLoading, {
        passive: true,
      });

      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (
            mutation.attributeName.includes("src") ||
            mutation.attributeName.includes("srcset")
          ) {
            this.lazyLoading();
          }
        });
      });

      observer.observe(this, { attributes: true });
      this.lazyLoading();
    }
  }

  get media() {
    return this._media;
  }

  get elementParent() {
    return this.closest("motion-effect");
  }

  lazyLoading() {
    if (this.complete || this.classList.contains("loaded")) return;
    if (this.media) {
      this.media.classList.add("loading_img");
    }
    this.addEventListener("load", this.onImageLoad.bind(this));
  }

  onImageLoad() {
    this.classList.add("loaded");
    this.media?.classList.remove("loading_img");
    if (this.elementParent) {
      this.elementParent.classList.remove("loading");
      this.elementParent.classList.add("loaded");
    }
  }

  disconnectedCallback() {
    // Clean up event listeners
    if (this.throttledLazyLoading) {
      window.removeEventListener("resize", this.throttledLazyLoading);
    }
    // Clear cached elements
    this._media = null;
  }
}
customElements.define("lazy-loading-img", LazyLoadingImg, { extends: "img" });
CustomElement.observeAndPatchCustomElements({
  "lazy-loading-img": {
    tagElement: "img",
    classElement: LazyLoadingImg,
  },
});

class ToggleMenu extends HTMLElement {
  constructor() {
    super();
    this.container = this.closest(".header__inner");
    this.init();
  }
  init() {
    this.addEventListener("click", this.onClick.bind(this), false);
  }
  onClick(e) {
    e.preventDefault();
    const menu_drawer = this.closest(".header-wrapper").querySelector(
      "template.menu-drawer"
    );
    if (menu_drawer) {
      const content = document.createElement("div");
      content.appendChild(
        menu_drawer.content.firstElementChild.cloneNode(true)
      );
      NextSkyTheme.getBody().appendChild(content.querySelector("menu-drawer"));
    }
    setTimeout(
      () => eventModal(document.querySelector("menu-drawer"), "open", true),
      100
    );
    new LazyLoader(".image-lazy-load");
    CustomElement.observeAndPatchCustomElements({
      "button-close-model": {
        tagElement: "button",
        classElement: ButtonCloseModel,
      },
      "details-mega-menu": {
        tagElement: "details",
        classElement: DetailsMegaMenu,
      },
      "submenu-details": {
        tagElement: "details",
        classElement: SubMenuDetails,
      },
    });
  }
}
customElements.define("toggle-menu", ToggleMenu);

class MenuDrawer extends HTMLElement {
  constructor() {
    super();
    this.init();
  }
  init() {
    const overlay = this.querySelector(".modal-overlay");
    let width = window.innerWidth;
    window.addEventListener("resize", () => {
      const newWidth = window.innerWidth;
      if (newWidth > 1024 && width <= 1024) {
        eventModal(overlay, "close");
      }
      width = newWidth;
    });
  }
}
customElements.define("menu-drawer", MenuDrawer);

class ModalOverlay extends HTMLElement {
  constructor() {
    super();
    this.init();
  }
  init() {
    this.parentElement.addEventListener(
      "keyup",
      (event) => event.code.toUpperCase() === "ESCAPE" && this.onClick()
    );
    this.onClick = this.onClick.bind(this);
    this.addEventListener("click", this.onClick, false);
  }
  onClick() {
    eventModal(this, "close");
  }
}
customElements.define("modal-overlay", ModalOverlay);

class ButtonCloseModel extends HTMLButtonElement {
  constructor() {
    super();
    this.init();
  }
  init() {
    this.addEventListener("click", this.onClick.bind(this), false);
  }
  onClick(e) {
    eventModal(this, "close");
  }
}
customElements.define("button-close-model", ButtonCloseModel, {
  extends: "button",
});
CustomElement.observeAndPatchCustomElements({
  "button-close-model": {
    tagElement: "button",
    classElement: ButtonCloseModel,
  },
});

const megaMenuCount = new WeakMap();
class DetailsMegaMenu extends HTMLDetailsElement {
  constructor() {
    super(),
      (this.summaryElement = false),
      (this.contentElement = false),
      (this._open = false),
      (this.header = false),
      this.init();
  }

  set open(value) {
    value !== this._open &&
      ((this._open = value),
      this.isConnected
        ? this.transition(value)
        : value
        ? this.setAttribute("open", "")
        : this.removeAttribute("open"));
  }

  get open() {
    return this._open;
  }

  get dropdownsAnimation() {
    return this.header.hasAttribute("data-dropdowns-animation")
      ? this.header.getAttribute("data-dropdowns-animation")
      : "fade-in";
  }

  get menuTrigger() {
    return this.header.hasAttribute("data-menu-trigger") &&
      window.innerWidth >= 1025
      ? this.header.getAttribute("data-menu-trigger")
      : "click";
  }

  init() {
    (this.summaryElement = this.firstElementChild),
      (this.contentElement = this.lastElementChild),
      (this._open = this.hasAttribute("open")),
      (this.header = document.querySelector("header")),
      this.summaryElement.addEventListener(
        "click",
        this.onSummaryClicked.bind(this)
      ),
      (this.detectClickOutsideListener = this.detectClickOutside.bind(this)),
      (this.detectEscKeyboardListener = this.detectEscKeyboard.bind(this)),
      (this.detectFocusOutListener = this.detectFocusOut.bind(this)),
      (this.detectHoverListener = this.detectHover.bind(this)),
      this.addEventListener("mouseenter", this.detectHoverListener.bind(this)),
      this.addEventListener("mouseleave", this.detectHoverListener.bind(this));
    if (this.querySelector(".back-menu")) {
      this.querySelector(".back-menu").addEventListener(
        "click",
        this.onSummaryClicked.bind(this)
      );
    }
    window.Shopify.designMode &&
      (this.addEventListener("shopify:block:select", () => {
        if (window.innerWidth >= 1025) {
          this.open = !0;
        } else {
          const menu = document.querySelector("menu-drawer");
          if (menu && !document.body.classList.contains("selected-menu")) {
            document.body.classList.add("selected-menu");
          }
          const menu_drawer = this.closest(".header-wrapper").querySelector(
            "template.menu-drawer"
          );
          if (menu_drawer && !menu) {
            const content = document.createElement("div");
            content.appendChild(
              menu_drawer.content.firstElementChild.cloneNode(true)
            );
            NextSkyTheme.getBody().appendChild(
              content.querySelector("menu-drawer")
            );
          }
          setTimeout(() => {
            if (!menu) {
              eventModal(document.querySelector("menu-drawer"), "open", true);
            }
            document.body.classList.remove("selected-menu");
          }, 100);
          new LazyLoader(".image-lazy-load");
        }
      }),
      this.addEventListener("shopify:block:deselect", () => {
        if (window.innerWidth >= 1025) {
          this.open = !1;
        } else {
          setTimeout(() => {
            const menu_drawer = document.querySelector("menu-drawer");
            if (
              menu_drawer &&
              !document.body.classList.contains("selected-menu")
            ) {
              eventModal(menu_drawer, "close", false);
            }
          }, 100);
        }
      }));
  }

  onSummaryClicked(event) {
    event.preventDefault(),
      this.menuTrigger === "hover" &&
      this.summaryElement.hasAttribute("data-href") &&
      this.summaryElement.getAttribute("data-href").length > 0 &&
      (event.pointerType || this._open === true)
        ? (window.location.href = this.summaryElement.getAttribute("data-href"))
        : (this.open = !this.open);
  }
  async transition(value) {
    if (value) {
      megaMenuCount.set(
        DetailsMegaMenu,
        megaMenuCount.get(DetailsMegaMenu) + 1
      );
      this.setAttribute("open", "");
      this.summaryElement.setAttribute("open", "");
      document.addEventListener("click", this.detectClickOutsideListener);
      document.addEventListener("keydown", this.detectEscKeyboardListener);
      document.addEventListener("focusout", this.detectFocusOutListener);
      this.classList.add("detail-open");
      if (window.innerWidth >= 1025) {
        NextSkyTheme.getBody().classList.add("dropdown-open");
      }
      if (
        this.dropdownsAnimation === "fade-in-down" &&
        window.innerWidth >= 1025
      ) {
        this.contentElement.setAttribute("open", "");
        this.contentElement.classList.add("expanding");
        await this.fadeInDown();
        this.contentElement.classList.remove("expanding");
      } else {
        if (window.innerWidth >= 1025) {
          await this.fadeInDown();
        }
        setTimeout(() => this.contentElement.setAttribute("open", ""), 100);
      }
    } else {
      megaMenuCount.set(
        DetailsMegaMenu,
        megaMenuCount.get(DetailsMegaMenu) - 1
      );
      this.summaryElement.removeAttribute("open");
      this.contentElement.removeAttribute("open");
      document.removeEventListener("click", this.detectClickOutsideListener);
      document.removeEventListener("keydown", this.detectEscKeyboardListener);
      document.removeEventListener("focusout", this.detectFocusOutListener);
      this.classList.remove("detail-open");
      NextSkyTheme.getBody().classList.remove("dropdown-open");
      if (
        this.dropdownsAnimation === "fade-in-down" &&
        window.innerWidth >= 1025
      ) {
        this.contentElement.classList.add("expanding");
        await this.fadeInUp();
        this.contentElement.classList.remove("expanding");
        if (!this.open) this.removeAttribute("open");
      } else {
        setTimeout(() => {
          if (!this.open) this.removeAttribute("open");
        }, 300);
        if (window.innerWidth >= 1025) {
          this.fadeInUp();
        }
      }
    }
  }
  detectClickOutside(event) {
    !this.contains(event.target) && (this.open = !1);
  }
  detectEscKeyboard(event) {
    if (event.code === "Escape") {
      const targetMenu = event.target.closest("details[open]");
      targetMenu &&
        ((targetMenu.open = !1),
        targetMenu.firstElementChild.focus({ focusVisible: true }));
    }
  }
  detectFocusOut(event) {
    event.relatedTarget &&
      window.innerWidth >= 1025 &&
      !this.contains(event.relatedTarget) &&
      (this.open = !1);
  }
  detectHover(event) {
    this.menuTrigger !== "hover" ||
      (event.type === "mouseenter" ? (this.open = !0) : (this.open = !1));
  }
  fadeInDown() {
    Motion.animate(
      this.contentElement,
      {
        opacity: [0, 1],
      },
      { duration: 0.2, easing: [0.22, 0.61, 0.36, 1] }
    );
  }
  fadeInUp() {
    Motion.animate(
      this.contentElement,
      {
        opacity: [1, 0],
      },
      {
        duration: 0.2,
        delay: 0.12,
      }
    );
  }
}
customElements.define("details-mega-menu", DetailsMegaMenu, {
  extends: "details",
}),
  megaMenuCount.set(DetailsMegaMenu, 0);
CustomElement.observeAndPatchCustomElements({
  "details-mega-menu": {
    tagElement: "details",
    classElement: DetailsMegaMenu,
  },
});

class SubMenuDetails extends HTMLDetailsElement {
  constructor() {
    super(),
      (this.summaryElement = false),
      (this.contentElement = false),
      (this._open = false),
      (this.content = false),
      this.init();
  }

  get open() {
    return this._open;
  }

  set open(value) {
    value !== this._open &&
      ((this._open = value),
      this.isConnected
        ? this.transition(value)
        : value
        ? this.setAttribute("open", "")
        : this.removeAttribute("open"));
  }

  init() {
    this.summaryElement = this.firstElementChild;
    this.contentElement = this.lastElementChild;
    this._open = this.hasAttribute("open");
    this.content =
      this.closest(".menu-link").querySelector(".sub-children-menu");
    this.summaryElement.addEventListener(
      "click",
      this.onSummaryClicked.bind(this)
    );
    if (window.innerWidth < 1025) {
      this.initialize();
    } else {
      (this.detectHoverListener = this.detectHover.bind(this)),
        this.addEventListener(
          "mouseenter",
          this.detectHoverListener.bind(this)
        ),
        this.addEventListener(
          "mouseleave",
          this.detectHoverListener.bind(this)
        );
    }
  }

  onSummaryClicked(event) {
    event.preventDefault(),
      window.innerWidth >= 1025 &&
      this.hasAttribute("data-href") &&
      this.getAttribute("data-href").length > 0 &&
      (event.pointerType || this._open === true)
        ? (window.location.href = this.getAttribute("data-href"))
        : (this.open = !this.open);
  }

  async initialize() {
    if (this.content) {
      Motion.animate(
        this.content,
        this._open ? { height: "auto" } : { height: 0 },
        { duration: 0 }
      );
    }
  }

  detectHover(event) {
    event.type === "mouseenter" ? (this.open = !0) : (this.open = !1);
  }

  async transition(value) {
    return value
      ? (window.innerWidth < 1025
          ? Motion.animate(
              this.content,
              true ? { height: "auto" } : { height: 0 },
              { duration: 0.25 }
            )
          : this.closest("ul")
              .querySelectorAll("details")
              .forEach((details) => {
                details.removeAttribute("open");
                details._open = false;
              }),
        this.setAttribute("open", ""),
        (this._open = true))
      : (window.innerWidth < 1025
          ? Motion.animate(
              this.content,
              false ? { height: "auto" } : { height: 0 },
              { duration: 0.25 }
            )
          : "",
        this.removeAttribute("open"));
  }
}
customElements.define("submenu-details", SubMenuDetails, {
  extends: "details",
});
CustomElement.observeAndPatchCustomElements({
  "submenu-details": {
    tagElement: "details",
    classElement: SubMenuDetails,
  },
});

class CollapsibleRowDetails extends HTMLDetailsElement {
  constructor() {
    super(),
      (this.summaryElement = null),
      (this.contentElement = null),
      (this._open = false),
      (this._hiddenMobile = false),
      (this.content = null),
      this.init();
  }

  get open() {
    return this._open;
  }

  set open(value) {
    value !== this._open &&
      ((this._open = value),
      this.isConnected
        ? this.transition(value)
        : value
        ? this.setAttribute("open", "")
        : this.removeAttribute("open"));
  }

  init() {
    this.summaryElement = this.firstElementChild;
    this.contentElement = this.lastElementChild;
    this._open = this.hasAttribute("open");
    this._hiddenMobile = this.hasAttribute("hidden-mobile");
    this.content = this.querySelector(".collapsible-row__content");
    this.summaryElement.addEventListener(
      "click",
      this.onSummaryClicked.bind(this)
    );
    this.initialize();
  }

  onSummaryClicked(event) {
    event.preventDefault(), (this.open = !this.open);
  }

  async initialize() {
    if (this._hiddenMobile) {
      const mediaQuery = window.matchMedia("(max-width: 767px)");
      const handleMediaQueryChange = NextSkyTheme.throttle((mediaQuery) => {
        if (mediaQuery.matches) {
          this.removeAttribute("open"), this.classList.remove("detail-open");
          this._open = false;
          if (this.content) {
            Motion.animate(this.content, { height: 0 }, { duration: 0 });
          }
        } else {
          this.setAttribute("open", true), this.classList.add("detail-open");
          this._open = true;
          if (this.content) {
            Motion.animate(this.content, { height: "auto" }, { duration: 0 });
          }
        }
      }, 100);
      handleMediaQueryChange(mediaQuery);
      mediaQuery.addEventListener("change", () =>
        handleMediaQueryChange(mediaQuery)
      );
    } else {
      if (this.content) {
        Motion.animate(
          this.content,
          this._open ? { height: "auto" } : { height: 0 },
          { duration: 0 }
        );
      }
    }
  }

  async transition(value) {
    if (!this.content) {
      return;
    }
    return value
      ? (Motion.animate(
          this.content,
          true ? { height: "auto" } : { height: 0 },
          { duration: 0.3 }
        ),
        this.classList.add("detail-open"),
        this.setAttribute("open", ""))
      : (Motion.animate(
          this.content,
          false ? { height: "auto" } : { height: 0 },
          { duration: 0.3 }
        ),
        this.classList.remove("detail-open"),
        this.open || setTimeout(() => this.removeAttribute("open"), 300));
  }
}
customElements.define("collapsible-row", CollapsibleRowDetails, {
  extends: "details",
});
CustomElement.observeAndPatchCustomElements({
  "collapsible-row": {
    tagElement: "details",
    classElement: CollapsibleRowDetails,
  },
});

class ProgressBar extends HTMLElement {
  constructor() {
    super();
    const orders = this.dataset.order;
    this.init(orders);
  }
  init(orders) {
    const min = Number(this.dataset.feAmount);
    const threshold = Number(this.dataset.threshold);
    if (threshold > orders) {
      this.classList.add("notify");
    } else {
      this.classList.remove("notify");
    }
    if (!min) return;
    if (!orders) return;
    const order = Number(orders);
    if (!order) return;
    if ((order / min) * 100 > 100) {
      this.setProgressBar(100);
    } else {
      this.setProgressBar((order / min) * 100);
    }
  }
  setProgressBar(progress) {
    const p = this.querySelector(".progress");
    if (!p) return;
    const p_bar = p.closest(".progress-bar");
    p.style.width = progress + "%";
    if (!p_bar) return;
    if (progress <= 0) {
      p_bar.classList.add("d-none");
    } else {
      p_bar.classList.remove("d-none");
    }
  }
}
customElements.define("progress-bar", ProgressBar);

class QuantityInput extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector("input");
    this.changeEvent = new Event("change", { bubbles: true });

    // Cache DOM elements
    this._buttons = this.querySelectorAll("button");
    this._mainProduct = this.closest(".sec__main-product");

    this.input.addEventListener("change", this.onInputChange.bind(this));
    this._buttons.forEach((button) =>
      button.addEventListener("click", this.onButtonClick.bind(this))
    );
  }

  quantityUpdateUnsubscriber = undefined;

  connectedCallback() {
    this.validateQtyRules();
    this.quantityUpdateUnsubscriber = NextSkyTheme.subscribe(
      NextSkyTheme.PUB_SUB_EVENTS.quantityUpdate,
      this.validateQtyRules.bind(this)
    );
  }

  disconnectedCallback() {
    if (this.quantityUpdateUnsubscriber) {
      this.quantityUpdateUnsubscriber();
    }
  }

  onInputChange() {
    this.validateQtyRules();
  }

  onButtonClick(event) {
    event.preventDefault();
    const previousValue = this.input.value;

    event.target.name === "plus" ||
    event.target.closest("button").name === "plus"
      ? this.input.stepUp()
      : this.input.stepDown();
    if (previousValue !== this.input.value)
      this.input.dispatchEvent(this.changeEvent);

    // Use cached main product element
    if (this._mainProduct) {
      const mainProductInput = this._mainProduct.querySelector(
        "quantity-input input"
      );
      if (mainProductInput) {
        mainProductInput.value = this.input.value;
      }

      const sticky = this._mainProduct.querySelector(".sticky-add-cart");
      if (sticky) {
        const stickyInput = sticky.querySelector("quantity-input input");
        if (stickyInput) {
          stickyInput.value = this.input.value;
        }
      }
    }

    this.updateTotalPrice(this.input.value, this._mainProduct);
  }

  updateTotalPrice(previousValue, mainProduct) {
    const form = this.closest("form");
    if (!form) return;
    const priceElement = form.querySelector(".total-price__detail");
    if (!priceElement) return;
    const dataTotalPrice = priceElement?.getAttribute("data-total-price");
    const totalPrice = Number(dataTotalPrice) * Number(previousValue);
    const sticky = form.classList.contains("form-sticky-add-cart");
    const mainProductPriceElement = mainProduct?.querySelector(
      ".product-detail__buy-buttons .total-price__detail"
    );
    if (sticky && mainProductPriceElement) {
      mainProductPriceElement.textContent = NextSkyTheme.formatMoney(
        totalPrice,
        themeGlobalVariables.settings.money_format
      );
    }
    priceElement.textContent = NextSkyTheme.formatMoney(
      totalPrice,
      themeGlobalVariables.settings.money_format
    );
  }

  validateQtyRules() {
    const value = parseInt(this.input.value);

    if (this.input.min) {
      const min = parseInt(this.input.min);
      // Cache button elements
      if (!this._buttonMinus) {
        this._buttonMinus = this.querySelector(
          ".quantity__button[name='minus']"
        );
      }
      if (this._buttonMinus) {
        this._buttonMinus.classList.toggle("disabled", value <= min);
      }
    }

    if (this.input.max) {
      const max = parseInt(this.input.max);
      // Cache button elements
      if (!this._buttonPlus) {
        this._buttonPlus = this.querySelector(".quantity__button[name='plus']");
      }
      if (this._buttonPlus) {
        this._buttonPlus.classList.toggle("disabled", value >= max);
      }
    }

    // Use cached main product element
    if (this._mainProduct) {
      const mainProductInput = this._mainProduct.querySelector(
        "quantity-input input"
      );
      if (mainProductInput) {
        mainProductInput.value = this.input.value;
      }

      const sticky = this._mainProduct.querySelector(".sticky-add-cart");
      if (sticky) {
        const stickyInput = sticky.querySelector("quantity-input input");
        if (stickyInput) {
          stickyInput.value = this.input.value;
        }
      }
    }
  }

  disconnectedCallback() {
    if (this.quantityUpdateUnsubscriber) {
      this.quantityUpdateUnsubscriber();
    }
    // Clear cached elements
    this._buttons = null;
    this._mainProduct = null;
    this._buttonMinus = null;
    this._buttonPlus = null;
  }
}

customElements.define("quantity-input", QuantityInput);

class VideoSection extends HTMLElement {
  constructor() {
    super();
    this.thumb = this.querySelector(".video-thumbnail");
    this.video_iframe = this.querySelector(".video-has-bg iframe");
    this.init();
  }

  init() {
    if (this.video_iframe) {
      this.video_iframe.addEventListener("load", () => {
        if (this.thumb) {
          this.thumb.remove();
        }
      });
    }
    const handleIntersection = (entries, observer) => {
      if (!entries[0].isIntersecting) return;
      observer.unobserve(this);
      const videos = this.querySelectorAll("iframe");
      videos.forEach((video) => {
        const dataSrc = video.dataset.src;
        if (dataSrc) {
          video.src = dataSrc;
          video.removeAttribute("data-src");
        }
      });
    };
    new IntersectionObserver(handleIntersection.bind(this), {
      rootMargin: "0px 0px 200px 0px",
    }).observe(this);
  }
}
customElements.define("video-section", VideoSection);

class VideoLocal extends HTMLElement {
  constructor() {
    super();
    this.init();
  }
  init() {
    setTimeout(() => {
      this.loadContent();
    }, 100);
  }

  loadContentVideo(_this) {
    const width = window.innerWidth;
    if (_this.classList.contains("product__img_video") && width < 767) {
      _this.loadContent(_this);
      return;
    }
    if (!_this.getAttribute("loaded") && _this.querySelector("template")) {
      const content = document.createElement("div");
      content.appendChild(
        _this
          .querySelector("template")
          .content.firstElementChild.cloneNode(true)
      );
      _this.setAttribute("loaded", true);
      const video = content.querySelector("video")
        ? content.querySelector("video")
        : content.querySelector("iframe");
      const deferredElement = _this.appendChild(video);
      const alt = deferredElement.getAttribute("alt");
      const img = deferredElement.querySelector("img");
      if (alt && img) {
        img.setAttribute("alt", alt);
      }
      _this.thumb = _this.querySelector(".video-thumbnail");
      if (_this.thumb) {
        _this.thumb.remove();
      }
      if (
        deferredElement.nodeName == "VIDEO" &&
        deferredElement.getAttribute("autoplay")
      ) {
        deferredElement.play();
      }
      if (this.querySelector(".play-button")) {
        this.querySelector(".play-button").addEventListener(
          "click",
          this.clickPlayVideo.bind(this),
          false
        );
      }
    }
  }

  safePlay(video) {
    const p = video.play();
    if (p && typeof p.catch === "function") {
      p.catch((err) => {
        if (err?.name !== "AbortError") console.warn("play failed:", err);
      });
    }
  }

  loadContent(event) {
    if (event && event.currentTarget) {
      event.currentTarget.classList.add("active");
    }
    const _this = this;
    const handleIntersection = (entries, observer) => {
      if (!entries[0].isIntersecting) return;
      observer.unobserve(_this);
      this.loadContentVideo(_this);
      const videos = _this.querySelectorAll("video");
      videos.forEach((video) => {
        video.preload = "metadata";
        const dataSrc = video.dataset.src;
        if (dataSrc) {
          video.src = dataSrc;
          video.removeAttribute("data-src");
        }
        if (video.closest("video-product")) {
          if (video.autoplay || video.hasAttribute("autoplay")) {
            video.autoplay = false;
            video.removeAttribute("autoplay");
          }
          video.preload =
            video.preload === "none" ? "metadata" : video.preload || "metadata";

          const stop = () => {
            try {
              video.pause();
            } catch {}
            video.currentTime = 0;
          };

          video.addEventListener("loadeddata", stop, { once: true });
          video.addEventListener("playing", stop, { once: true });
          let timer = null;
          const onEnter = () => {
            clearTimeout(timer);
            timer = setTimeout(() => _this.safePlay(video), 60);
          };
          const onLeave = () => {
            clearTimeout(timer);
            if (!video.paused) video.pause();
          };
          video.addEventListener("pointerenter", onEnter);
          video.addEventListener("pointerleave", onLeave);
          video.addEventListener("focusin", onEnter);
          video.addEventListener("focusout", onLeave);
        }
        if (video.closest("quick-view-gallery")) {
          const videos = [...document.querySelectorAll("video")];
          videos.forEach((v) => {
            if (v !== video && !v.paused) {
              v.muted = true;
            }
          });
          video.muted = false;
        }
      });
    };
    new IntersectionObserver(handleIntersection.bind(_this), {
      rootMargin: "0px 0px 200px 0px",
    }).observe(_this);
  }

  clickPlayVideo(event) {
    event.preventDefault();
    event.stopPropagation();
    if (this.querySelector("video").paused) {
      this.querySelector("video").play();
      this.querySelector(".play-button").classList.add("active");
    } else {
      this.querySelector("video").pause();
      this.querySelector(".play-button").classList.remove("active");
    }
  }
}
customElements.define("video-local", VideoLocal);

class VideoLocalPlay extends VideoLocal {
  constructor() {
    super();
    this.init();
  }
  init() {
    const poster = this.querySelector("button");
    if (!poster) return;
    poster.addEventListener("click", this.loadContent.bind(this));
  }
}
customElements.define("video-local-play", VideoLocalPlay);

class VideoProduct extends VideoLocal {
  constructor() {
    super();
    this.init();
  }
  init() {
    setTimeout(() => {
      this.loadContent();
    }, 100);
  }
}
customElements.define("video-product", VideoProduct);

class VideoLocalScroll extends VideoLocal {
  constructor() {
    super();
    this.init();
  }

  init() {
    if (window.Shopify && window.Shopify.designMode) {
      this.loadContentVideo(this);
    } else {
      const _this = this;
      const handleIntersection = (entries, observer) => {
        if (!entries[0].isIntersecting) return;
        observer.unobserve(_this);
        this.loadContentVideo(_this);
        const video = this.querySelector("video")
          ? this.querySelector("video")
          : this.querySelector("iframe");
        const videoElement = this.querySelector("video");
        if (videoElement) {
          videoElement.preload = "metadata";
        }
        if (video) {
          const io = new IntersectionObserver(
            (entries) => {
              entries.forEach(
                ({ target, isIntersecting, intersectionRatio }) => {
                  if (isIntersecting && intersectionRatio > 0.2) {
                    this.safePlay(target);
                  } else {
                    target.pause();
                  }
                }
              );
            },
            { threshold: [0, 0.2, 1] }
          );
          io.observe(video);
        }
      };
      new IntersectionObserver(handleIntersection.bind(_this), {
        rootMargin: "0px 0px 200px 0px",
      }).observe(_this);
    }
  }
}

customElements.define("video-local-scroll", VideoLocalScroll);

class VideoProductGallery extends VideoLocal {
  constructor() {
    super();
    this.init();
  }

  init() {
    if (this.hasAttribute("auto-play")) {
      setTimeout(() => {
        this.loadContent();
      }, 100);
    } else {
      const poster = this.querySelector("button");
      if (!poster) return;
      poster.addEventListener("click", () => {
        NextSkyTheme.pauseAllMedia(this.closest("media-gallery"));
        this.loadContent();
      });
    }
  }
}
customElements.define("video-product-gallery", VideoProductGallery);

class AnnouncementBar extends HTMLElement {
  constructor() {
    super();
    this.animationDuration = 300;
    this.isAnimating = false;
    this.animationFrame = null;
  }

  connectedCallback() {
    requestAnimationFrame(() => this.init());
  }

  init() {
    this._naturalHeight = this.offsetHeight || 0;
    document.body.style.setProperty("--height-bar", `${this._naturalHeight}px`);
    this.closeButton = this.querySelector(".announcement-bar__close");
    this.parentSection = this.closest(".section-announcement-bar");
    if (!this.closeButton || !this.parentSection) return;
    if (this.closeButton) {
      this.closeButton.addEventListener("click", this.onCloseClick.bind(this));
      this.closeButton.addEventListener("keydown", this.onKeyDown.bind(this));
    }
  }

  onKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      this.onCloseClick(event);
    }
  }

  onCloseClick(event) {
    event.preventDefault();
    if (this.isAnimating) return;
    this.isAnimating = true;
    if (!this._naturalHeight || this._naturalHeight <= 0) {
      this._naturalHeight = this.offsetHeight;
    }
    this.parentSection.classList.add("announcement-closing");
    const startHeight = this._naturalHeight;
    const startTime = performance.now();
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }

    const animate = (currentTime) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / this.animationDuration, 1);
      const eased = this.easeOutCubic(progress);
      const currentHeight = startHeight * (1 - eased);
      const currentOpacity = 1 - eased;
      this.parentSection.style.height = `${currentHeight}px`;
      this.parentSection.style.opacity = String(currentOpacity);
      this.classList.add("d-none");
      document.body.style.removeProperty("--height-bar");
      if (progress < 1) {
        this.animationFrame = requestAnimationFrame(animate);
      } else {
        this.finishClosingAnimation();
      }
    };
    this.animationFrame = requestAnimationFrame(animate);
  }

  finishClosingAnimation() {
    this.parentSection.style.height = "0px";
    this.parentSection.style.opacity = "0";
    this.parentSection.classList.remove("announcement-closing");
    this.parentSection.classList.add("announcement-closed");
    NextSkyTheme.setCookie("announcement_closed", "true", 1);
    this.isAnimating = false;
  }

  easeOutCubic(x) {
    return 1 - Math.pow(1 - x, 3);
  }

  disconnectedCallback() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    if (this.closeButton) {
      this.closeButton.removeEventListener("click", this.onCloseClick);
      this.closeButton.removeEventListener("keydown", this.onKeyDown);
    }
  }
}
customElements.define("announcement-bar", AnnouncementBar);

class CartEstimate extends HTMLElement {
  constructor() {
    super();
    this.addonsUpdate();
  }

  get actionEstimate() {
    return this.querySelector(".addon-actions .estimate") || null;
  }

  get cartToggleAddons() {
    return this.querySelector(".toggle-addons") || null;
  }

  get cartActionAddons() {
    return document.querySelector(".drawer__cart-shipping") || null;
  }

  connectedCallback() {
    if (this.actionEstimate) {
      this.actionEstimate.addEventListener(
        "click",
        this.handleEstimateSave.bind(this)
      );
    }

    if (this.cartActionAddons) {
      this.cartActionAddons.addEventListener(
        "click",
        this.handleEstimateToggle.bind(this)
      );
    }

    if (this.cartToggleAddons) {
      this.cartToggleAddons.addEventListener(
        "click",
        this.handleEstimateToggle.bind(this)
      );
    }
  }

  handleEstimateSave(event) {
    event.preventDefault();
    const address = {
      zip: this.querySelector("#AddressZip").value || "",
      country: this.querySelector("#address_country").value || "",
      province: this.querySelector("#address_province").value || "",
    };
    this.fetchShippingRates(address);
  }

  fetchShippingRates(address) {
    const { zip, country, province } = address;
    const url = `${window.Shopify.routes.root}cart/shipping_rates.json?shipping_address%5Bzip%5D=${zip}&shipping_address%5Bcountry%5D=${country}&shipping_address%5Bprovince%5D=${province}`;
    this.actionEstimate.classList.add("loading");
    fetch(url)
      .then((response) => response.json())
      .then((data) => this.updateShippingMessage(data, address))
      .catch((error) => console.error("Error fetching shipping rates:", error));
  }

  updateShippingMessage(data, address) {
    const message = this.querySelector(".addon-message");
    message.innerHTML = "";

    if (data && data.shipping_rates) {
      if (data?.shipping_rates?.length) {
        this.showShippingSuccess(message, data.shipping_rates, address);
      } else {
        this.showShippingWarning(message);
      }
    } else {
      this.showShippingError(message, data);
    }
    this.actionEstimate.classList.remove("loading");
  }

  getIconSVG(type) {
    switch (type) {
      case "success":
        return '<svg width="18" height="18" fill="none" class="flex-auto w-18"><use href="#icon-success"></use></svg>';
      case "error":
        return '<svg width="18" height="18" fill="none" class="flex-auto w-18"><use href="#icon-error"></use></svg>';
      case "warning":
        return '<svg width="18" height="18" fill="none" class="flex-auto w-18"><use href="#icon-warning"></use></svg>';
      default:
        return '<svg width="18" height="18" fill="none" class="flex-auto w-18"><use href="#icon-success"></use></svg>';
    }
  }

  showShippingSuccess(message, rates, address) {
    message.classList.remove("error", "warning");
    message.classList.add("success", "column");

    const addressText = window.cartStrings?.shipping_rate.replace(
      "{{address}}",
      `${address.zip}, ${address.country} ${address.province}`
    );

    message.innerHTML =
      `<div class="flex content-center gap-sp-2">` +
      this.getIconSVG("success") +
      `<p>${addressText}: </p>` +
      `</div>`;

    rates.forEach((rate) => {
      message.innerHTML += `<li>${rate.name}: ${NextSkyTheme.formatMoney(
        rate.price,
        themeGlobalVariables.settings.money_format
      )}</li>`;
    });
  }

  showShippingWarning(message) {
    message.classList.remove("error", "success", "column");
    message.classList.add("warning");

    message.innerHTML =
      this.getIconSVG("warning") + `<p>${window.cartStrings?.no_shipping}</p>`;
  }

  showShippingError(message, errors) {
    message.classList.remove("success", "warning", "column");
    message.classList.add("error");

    message.innerHTML =
      this.getIconSVG("error") +
      Object.values(errors)
        .map((error) => `<p>${error[0]}</p>`)
        .join("");
  }

  addonsUpdate() {
    const country = this.querySelector("#address_country");
    const province = this.querySelector("#address_province");
    if (country && province) {
      new Shopify.CountryProvinceSelector(
        "address_country",
        "address_province",
        {
          hideElement: "address_province_container",
        }
      );
    }
  }

  handleEstimateToggle(event) {
    event.preventDefault();
    if (this.classList.contains("open")) {
      this.classList.remove("open");
      if (this.cartActionAddons) {
        this.cartActionAddons
          .closest(".drawer__cart-shipping")
          .classList.remove("active");
      }
      this.cartActionAddons.focus();
    } else {
      this.classList.add("open");
      if (this.cartActionAddons) {
        this.cartActionAddons
          .closest(".drawer__cart-shipping")
          .classList.add("active");
        this.cartToggleAddons.focus();
      }
    }
  }
}

if (!customElements.get("cart-estimate-element")) {
  customElements.define("cart-estimate-element", CartEstimate);
}

class CartNote extends HTMLElement {
  constructor() {
    super();
  }

  get cartActionId() {
    return this.querySelector(".apply-note") || null;
  }

  get cartToggleAddons() {
    return this.querySelector(".toggle-addons") || null;
  }

  get cartActionAddons() {
    return document.querySelector(".drawer__cart-note") || null;
  }

  connectedCallback() {
    if (this.cartActionId) {
      this.cartActionId.addEventListener(
        "click",
        this.handleNoteSave.bind(this)
      );
    }

    if (this.cartActionAddons) {
      this.cartActionAddons.addEventListener(
        "click",
        this.handleNoteToggle.bind(this)
      );
    }

    if (this.cartToggleAddons) {
      this.cartToggleAddons.addEventListener(
        "click",
        this.handleNoteToggle.bind(this)
      );
    }
  }

  handleNoteSave() {
    this.cartActionId.classList.add("loading");
    this.noteUpdate();
  }

  handleNoteToggle(event) {
    event.preventDefault();
    if (this.classList.contains("open")) {
      this.classList.remove("open");
      if (this.cartActionAddons) {
        this.cartActionAddons
          .closest(".drawer__cart-note")
          .classList.remove("active");
      }
      this.cartActionAddons.focus();
    } else {
      this.classList.add("open");
      if (this.cartActionAddons) {
        this.cartActionAddons
          .closest(".drawer__cart-note")
          .classList.add("active");
        this.cartToggleAddons.focus();
      }
    }
  }

  noteUpdate() {
    const body = JSON.stringify({
      note: this.querySelector(".cart-note").value,
    });
    fetch(`${routes?.cart_update_url}`, {
      ...NextSkyTheme.fetchConfig(),
      ...{ body },
    }).finally(() => {
      this.cartActionId.classList.remove("loading");
      this.classList.remove("open");
      if (this.cartActionAddons) {
        this.cartActionAddons
          .closest(".drawer__cart-note")
          .classList.remove("active");
      }
    });
  }
}

if (!customElements.get("cart-note-element")) {
  customElements.define("cart-note-element", CartNote);
}

class MainCartNote extends CartNote {
  constructor() {
    super();
  }

  connectedCallback() {
    this.querySelector(".cart-note").addEventListener(
      "change",
      this.noteUpdate.bind(this)
    );
  }
}

if (!customElements.get("main-cart-note")) {
  customElements.define("main-cart-note", MainCartNote);
}

class MiniCartUpSell extends HTMLElement {
  constructor() {
    super();
  }

  get type() {
    return this.getAttribute("data-type");
  }

  connectedCallback() {
    if (this.type == "auto") {
      fetch(this.dataset.url)
        .then((response) => response.text())
        .then((text) => {
          const html = document.createElement("div");
          html.innerHTML = text;
          const recommendations = html.querySelector(".swiper-wrapper");
          if (!recommendations) {
            if (this.closest(".drawer__cart-recommendations")) {
              this.closest(".drawer__cart-recommendations").classList.add(
                "hidden"
              );
            } else {
              this.classList.add("hidden");
            }
          }
          if (recommendations && recommendations.childElementCount == 0) {
            if (this.closest(".drawer__cart-recommendations")) {
              this.closest(".drawer__cart-recommendations").classList.add(
                "hidden"
              );
            } else {
              this.classList.add("hidden");
            }
          }
          if (
            recommendations &&
            recommendations.innerHTML.trim().length &&
            recommendations.childElementCount > 0
          ) {
            this.querySelector(".swiper-wrapper").innerHTML =
              recommendations.innerHTML;
            if (this.closest(".drawer__cart-recommendations")) {
              this.closest(".drawer__cart-recommendations").classList.remove(
                "hidden"
              );
            } else {
              this.classList.remove("hidden");
            }
          }
        })
        .finally(() => {})
        .catch((e) => {
          console.error(e);
        });
    } else {
      const recommendations = this.querySelector(".swiper-wrapper");
      if (!recommendations) {
        if (this.closest(".drawer__cart-recommendations")) {
          this.closest(".drawer__cart-recommendations").classList.add("hidden");
        } else {
          this.classList.add("hidden");
        }
      }
      if (recommendations && recommendations.childElementCount == 0) {
        if (this.closest(".drawer__cart-recommendations")) {
          this.closest(".drawer__cart-recommendations").classList.add("hidden");
        } else {
          this.classList.add("hidden");
        }
      }
      if (
        recommendations &&
        recommendations.innerHTML.trim().length &&
        recommendations.childElementCount > 0
      ) {
        this.querySelector(".swiper-wrapper").innerHTML =
          recommendations.innerHTML;
        if (this.closest(".drawer__cart-recommendations")) {
          this.closest(".drawer__cart-recommendations").classList.remove(
            "hidden"
          );
        } else {
          this.classList.remove("hidden");
        }
      }
    }
  }
}
customElements.define("mini-cart-recommendations", MiniCartUpSell);

class CarouselMobile extends HTMLElement {
  constructor() {
    super();
    this.enable = this.dataset.enableCarouselMobile == "true";
    this.isMulticontent = this.dataset.multicontent == "true";
    this.showPagination = this.dataset.showPagination == "true";
    this.bundle = this.dataset.bundle == "true";
    this.swiperSlideInnerHtml = this.innerHTML;
    this.mobileScreen = Number(this.dataset.mobileScreen) || 767;
    this.initCarousel();
  }

  initCarousel() {
    if (this.enable) {
      let width = window.innerWidth;
      // Debounce resize event for better performance
      this.debouncedResize = NextSkyTheme.debounce(() => {
        const newWidth = window.innerWidth;
        if (newWidth <= this.mobileScreen && width > this.mobileScreen) {
          this.actionOnMobile();
        }
        if (newWidth > this.mobileScreen && width <= this.mobileScreen) {
          this.actionOutMobile();
        }
        width = newWidth;
      }, 250);

      window.addEventListener("resize", this.debouncedResize, {
        passive: true,
      });

      if (width <= this.mobileScreen) {
        this.actionOnMobile();
      } else {
        this.actionOutMobile();
      }
    }
  }

  actionOnMobile() {
    this.classList.add("swiper");
    this.classList.remove(
      "grid-cols",
      "grid",
      "flex",
      "column",
      "flex-md-row",
      "wrap",
      "cols"
    );
    const html = this.swiperSlideInnerHtml.replaceAll(
      "switch-slide__mobile",
      "swiper-slide"
    );
    const wrapper = `<div class='swiper-wrapper custom-padding-carousel-mobile'>${html}</div>${
      this.showPagination
        ? '<div class="swiper-pagination" style="--swiper-pagination-bottom: 0"></div>'
        : ""
    }`;
    this.innerHTML = wrapper;
    initSlide(this);
    new LazyLoader(".image-lazy-load");
  }

  actionOutMobile() {
    new LazyLoader(".image-lazy-load");
    this.classList.remove("swiper");
    this.innerHTML = this.swiperSlideInnerHtml;
    if (this.bundle) {
      this.className = "";
      setTimeout(() => {
        this.classList.remove("swiper-backface-hidden");
      }, 100);
      return;
    }
    if (this.isMulticontent) {
      this.classList.add("flex", "column", "flex-md-row", "wrap", "cols");
      this.classList.remove("grid", "grid-cols");
    } else {
      this.classList.add("grid", "grid-cols");
      this.classList.remove("flex", "column", "flex-md-row", "wrap", "cols");
    }
    new LazyLoader(".image-lazy-load");
  }

  disconnectedCallback() {
    // Clean up event listeners
    if (this.debouncedResize) {
      window.removeEventListener("resize", this.debouncedResize);
    }
  }
}
customElements.define("carousel-mobile", CarouselMobile);

class NavBar extends HTMLElement {
  constructor() {
    super();
    this.init();
  }

  init() {
    document.body.classList.add("mobile-sticky-bar-enabled");
    // Cache site header to avoid repeated queries
    this._siteHeader = document.querySelector(".site-header");
    const header = this._siteHeader.querySelector("header");
    this._dataScroll = header.dataset.stickyType;
  }

  connectedCallback() {
    // Throttle scroll event for better performance
    this.throttledScroll = NextSkyTheme.throttle(
      this.updateScrollNavigationbar.bind(this),
      16
    );
    window.addEventListener("scroll", this.throttledScroll, { passive: true });
  }

  updateScrollNavigationbar() {
    const scrollTop =
      document.documentElement.scrollTop || document.body.scrollTop;
    const scrolledTo = window.scrollY + window.innerHeight;
    const threshold = this.offsetHeight;
    const isReachBottom = document.body.scrollHeight - threshold <= scrolledTo;
    if (isReachBottom) {
      this.classList.add("show");
      return;
    }
    if (scrollTop > 200) {
      if (this._dataScroll == "always") {
        this.classList.add("show");
        NextSkyTheme.getRoot().classList.add("mobile-sticky-bar-active");
      } else if (
        this._siteHeader &&
        this._siteHeader.classList.contains("animate") &&
        this._siteHeader.classList.contains("header-sticky-hidden")
      ) {
        this.classList.add("show");
        NextSkyTheme.getRoot().classList.add("mobile-sticky-bar-active");
      } else if (
        this._siteHeader &&
        this._siteHeader.classList.contains("animate") &&
        !this._siteHeader.classList.contains("header-sticky-hidden")
      ) {
        this.classList.remove("show");
        NextSkyTheme.getRoot().classList.remove("mobile-sticky-bar-active");
      } else if (!this._siteHeader) {
        this.classList.add("show");
        NextSkyTheme.getRoot().classList.add("mobile-sticky-bar-active");
      } else {
        this.classList.add("show");
        NextSkyTheme.getRoot().classList.add("mobile-sticky-bar-active");
      }
    } else {
      this.classList.remove("show");
      NextSkyTheme.getRoot().classList.remove("mobile-sticky-bar-active");
    }
  }

  disconnectedCallback() {
    // Clean up event listeners
    if (this.throttledScroll) {
      window.removeEventListener("scroll", this.throttledScroll);
    }
    // Clear cached elements
    this._siteHeader = null;
  }
}
customElements.define("mobile-navigation-bar", NavBar);

var BlsCustomer = (function () {
  return {
    init: function () {
      this.toggleForm(), this.deleteAddresses(), this.addAddresses();
    },
    toggleForm: function () {
      const e = document.querySelector(".add-address");
      const c = document.querySelector(".cancel-add");
      if (e !== null && c !== null) {
        e.addEventListener("click", () => {
          if (e.getAttribute("aria-expanded") === "false") {
            e.setAttribute("aria-expanded", "true");
            e.closest(".bls-customer__address").classList.add("active");
          } else {
            e.setAttribute("aria-expanded", "false");
            e.closest(".bls-customer__address").classList.remove("active");
          }
        });
        c.addEventListener("click", () => {
          if (
            c.closest(".bls-customer__address").classList.contains("active")
          ) {
            e.closest(".bls-customer__address").classList.remove("active");
            e.closest(".add-address").setAttribute("aria-expanded", "false");
          }
        });
      }
    },
    deleteAddresses: function () {
      const btn = document.querySelectorAll(".address-delete");
      btn.forEach((e) => {
        e.addEventListener("click", () => {
          const id = e?.dataset.formId;
          const msg = e?.dataset.confirmMessage;
          if (confirm(msg || "Are you sure you wish to delete this address?")) {
            Shopify.postLink("/account/addresses/" + id, {
              parameters: { _method: "delete" },
            });
          }
        });
      });
    },
    addAddresses: function () {
      if (Shopify && document.getElementById("AddressCountryNew")) {
        new Shopify.CountryProvinceSelector(
          "AddressCountryNew",
          "AddressProvinceNew",
          {
            hideElement: "AddressProvinceNewContainer",
          }
        );
      }
      const edit = document.querySelectorAll(".edit-country-option");
      edit.forEach((e) => {
        const formId = e?.dataset.formId;
        const editCountry = "AddressCountry_" + formId;
        const editProvince = "AddressProvince_" + formId;
        const editContainer = "AddressProvinceContainer_" + formId;
        new Shopify.CountryProvinceSelector(editCountry, editProvince, {
          hideElement: editContainer,
        });
      });
    },
  };
})();
BlsCustomer.init();
class ImageComparison extends HTMLElement {
  constructor() {
    super();
    this.container = this;
    this.slider = this.querySelector(".slider");
    this.overlay = this.querySelector(".image-after");
    this.handle = this.querySelector(".handle");
    this.x = 0;
    this.boundary = 300;
    this.mixClipPath;
    this.mixSliderColor;
    this.step = 50;
    this.elastic = 0.1;
    this.animated = false;
    this.observer = null;

    this.isHovering = false;

    this.init();
    this.setupDrag();

    this.handleResize = this.handleResize.bind(this);

    this.slider.addEventListener("focus", () => {
      document.addEventListener("keydown", this.handleKeyDown.bind(this));
    });

    this.slider.addEventListener("blur", () => {
      document.removeEventListener("keydown", this.handleKeyDown.bind(this));
    });

    window.addEventListener("resize", this.handleResize);

    window.addEventListener("orientationchange", () => {
      setTimeout(() => this.handleResize(), 200);
    });

    this.setupIntersectionObserver();
  }

  updateSliderStatus() {
    const swiperContainer = this.closest("slide-section");
    if (!swiperContainer) return;

    const swiperInstance = swiperContainer.swiper;
    if (!swiperInstance) return;

    swiperInstance.allowTouchMove = !this.isHovering;

    if (this.isHovering) {
      swiperInstance.allowSlideNext = false;
      swiperInstance.allowSlidePrev = false;
    } else {
      swiperInstance.allowSlideNext = true;
      swiperInstance.allowSlidePrev = true;
    }
    swiperInstance.update();
  }

  handleResize() {
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
    this.resizeTimeout = setTimeout(() => {
      const newWidth = this.container.clientWidth;
      const newFullBoundary = newWidth / 2;

      if (
        !this.fullBoundary ||
        Math.abs(this.fullBoundary - newFullBoundary) > 5
      ) {
        this.init();
        this.moveSlider(0);
      }
    }, 100);
  }

  init() {
    const handleWidth = this.handle ? this.handle.offsetWidth : 0;
    this.fullBoundary = this.container.clientWidth / 2;

    const offset = 1;
    this.boundary = this.fullBoundary - handleWidth / 2 + offset;

    this.mixClipPath = Motion.transform(
      [-this.fullBoundary, this.fullBoundary],
      ["inset(0% 0% 0% 0%)", "inset(0% 0% 0% 100%)"]
    );

    this.mixSliderColor = Motion.transform(
      [
        -this.boundary + 20,
        -this.boundary + 60,
        this.boundary - 60,
        this.boundary - 20,
      ],
      [
        "rgba(255, 255, 255)",
        "rgba(255, 255, 255)",
        "rgba(255, 255, 255)",
        "rgba(255, 255, 255)",
      ]
    );

    if (!this.animated) {
      const startPosition = -this.boundary + this.boundary * 0.2;
      this.moveSlider(startPosition);
    } else {
      this.moveSlider(0);
    }
  }

  setupIntersectionObserver() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !this.animated) {
            this.runEntranceAnimation();
          }
        });
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.2,
      }
    );
    this.observer.observe(this);
  }

  runEntranceAnimation() {
    this.animated = true;
    const startPosition = -this.boundary + this.boundary * 0.2;
    Motion.animate(startPosition, 0, {
      onUpdate: (value) => this.moveSlider(value),
      type: "spring",
      stiffness: 80,
      damping: 20,
      duration: 0.8,
      delay: 0.2,
    });
  }

  moveSlider(newX) {
    this.x = newX;
    const clipPathX = Motion.clamp(-this.fullBoundary, this.fullBoundary, newX);
    this.overlay.style.clipPath = this.mixClipPath(clipPathX);
    this.slider.style.transform = `translateX(${this.x}px)`;
    this.slider.style.backgroundColor = this.mixSliderColor(this.x);
  }

  handleKeyDown(event) {
    if (!this.slider.matches(":focus")) return;
    let moveBy = 0;

    if (event.key === "ArrowLeft") {
      moveBy = -this.step;
    } else if (event.key === "ArrowRight") {
      moveBy = this.step;
    } else {
      return;
    }

    Motion.animate(
      this.x,
      Motion.clamp(-this.boundary, this.boundary, this.x + moveBy),
      {
        onUpdate: (value) => this.moveSlider(value),
        type: "spring",
        stiffness: 900,
        damping: 40,
        velocity: moveBy * 10,
      }
    );
  }

  setupDrag() {
    let startX = 0;
    let startClientX = 0;
    let newX = 0;
    let isDragging = false;
    let dragBoundary = 0;
    const _this = this;
    function updateX() {
      _this.moveSlider(newX);
    }

    this.slider.addEventListener("pointerdown", (e) => {
      startX = this.x;
      startClientX = e.clientX;
      isDragging = true;
      dragBoundary = this.fullBoundary;
      document.body.style.cursor = "grabbing";
      this.slider.style.cursor = "grabbing";
      this.slider.classList.add("active");
      this.slider.setPointerCapture(e.pointerId);
      this.isHovering = true;
      this.updateSliderStatus();
    });

    this.slider.addEventListener("pointermove", (e) => {
      if (!this.slider.hasPointerCapture(e.pointerId) || !isDragging) return;

      const deltaX = e.clientX - startClientX;
      newX = startX + deltaX;

      const handleWidth = this.handle ? this.handle.offsetWidth : 0;
      const offset = 1;
      const maxPosition = dragBoundary - handleWidth / 2;
      const minPosition = -dragBoundary + handleWidth / 2 - offset;
      newX = Motion.clamp(minPosition, maxPosition, newX);
      Motion.frame.render(updateX);
    });

    this.slider.addEventListener("pointerup", (e) => {
      if (!this.slider.hasPointerCapture(e.pointerId)) return;
      this.slider.releasePointerCapture(e.pointerId);
      isDragging = false;
      document.body.style.cursor = "default";
      this.slider.style.cursor = "grab";
      this.slider.classList.remove("active");
      if (this.x < -this.boundary || this.x > this.boundary) {
        const targetX =
          this.x < -this.boundary ? -this.boundary : this.boundary;
        Motion.animate(this.x, targetX, {
          onUpdate: (value) => this.moveSlider(value),
          type: "spring",
          stiffness: 900,
          damping: 40,
        });
      }
      this.isHovering = false;
      this.updateSliderStatus();
    });
  }

  disconnectedCallback() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }

    window.removeEventListener("resize", this.handleResize);
    window.removeEventListener("orientationchange", this.handleResize);
    document.removeEventListener("keydown", this.handleKeyDown);

    this.removeEventListener("mouseenter", null);
    this.removeEventListener("mouseleave", null);
    this.removeEventListener("touchstart", null);
    this.removeEventListener("touchend", null);
  }
}
customElements.define("image-comparison", ImageComparison);

class AskQuestion extends HTMLButtonElement {
  constructor() {
    super();
    this.init();
  }
  init() {
    this.addEventListener("click", this.onClick.bind(this), false);

    const urlInfo = window.location.href;
    const newURL = location.href.split("?")[0];
    if (urlInfo.indexOf("contact_posted=true#ContactFormAsk") >= 1) {
      notifier.show(message.ask_question.success, "success", 4000);
      window.history.pushState("object", document.title, newURL);
    }
  }
  onClick(e) {
    const ask_question = e.target
      .closest(".ask-question")
      .querySelector("template");
    if (ask_question) {
      const content = document.createElement("div");
      content.appendChild(
        ask_question.content.firstElementChild.cloneNode(true)
      );
      NextSkyTheme.getBody().appendChild(
        content.querySelector("ask-question-popup")
      );
    }
    setTimeout(
      () =>
        eventModal(document.querySelector("ask-question-popup"), "open", true),
      100
    );
    NextSkyTheme.global.rootToFocus = this;
  }
}
customElements.define("ask-question", AskQuestion, {
  extends: "button",
});
CustomElement.observeAndPatchCustomElements({
  "ask-question": {
    tagElement: "button",
    classElement: AskQuestion,
  },
});
class SocialShare extends HTMLElement {
  constructor() {
    super();
    this.init();
  }
  init() {
    this.querySelectorAll(".blog-sharing .btn-sharing").forEach((share) => {
      share.addEventListener(
        "click",
        (event) => {
          event.preventDefault();
          const target = event.currentTarget;
          const social = target.getAttribute("data-social");
          const nameSocial = target.getAttribute("data-name");
          window.open(social, nameSocial, "height=500,width=500");
        },
        false
      );
    });
  }
}
customElements.define("social-share", SocialShare);

class LazyLoadTemplate extends HTMLElement {
  constructor() {
    super();
    this.init();
  }

  init() {
    if (this.querySelector("template")) {
      const handleIntersection = async (entries, observer) => {
        if (!entries[0].isIntersecting) return;
        observer.unobserve(this);
        const content = document.createElement("div");
        content.appendChild(
          this.querySelector("template").content.firstElementChild.cloneNode(
            true
          )
        );
        const html = content.querySelector(".product__countdown")
          ? content.querySelector(".product__countdown")
          : content.querySelector(".product_scrolling");
        await import(importJs.countdownTimer);
        this.parentNode.insertBefore(html, this.nextSibling);
        this.remove();
      };
      new IntersectionObserver(handleIntersection.bind(this), {
        rootMargin: "0px 0px 200px 0px",
      }).observe(this);
    }
  }
}
customElements.define("lazy-load-template", LazyLoadTemplate);

class ScrollingEffect extends HTMLElement {
  constructor() {
    super(),
      this.contents.forEach((element) => {
        const content =
          element.querySelector(".block__heading") ||
          element.querySelector(".block__description") ||
          element.querySelector(".block__buttons");
        Motion.scroll(
          Motion.animate(content, {
            opacity: [0, 0, 1, 1, 1, 0, 0],
          }),
          {
            target: content,
            offsets: ["33vh", "66vh"],
          }
        );
      });
  }

  get contents() {
    return Array.from(this.children);
  }
}
customElements.define("scrolling-effect", ScrollingEffect);
class MotionEffect extends HTMLElement {
  constructor() {
    super();
  }

  async connectedCallback() {
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      (this.initAnimate(),
      Motion.inView(
        this,
        async () => {
          this.mediaElements && (await loadImages(this.mediaElements)),
            setTimeout(() => {
              this.initAnimateEffect();
            }, 100);
        },
        {
          margin: this.animationConfig.rayo.margin,
        }
      ));
  }

  get scrollAnimation() {
    return themeGlobalVariables.settings.scrollAnimation;
  }

  get slideShowElements() {
    return this.hasAttribute("slideshow") ? true : false;
  }

  get mediaElements() {
    return this.querySelectorAll("img, svg");
  }

  get animateEffect() {
    return this.dataset.animate || "";
  }

  get delay() {
    return parseInt(this.dataset.animateDelay || 0) / 1000;
  }

  getMediaElement() {
    return this.querySelector("img");
  }

  getPlaceholderElement() {
    return this.querySelector("svg");
  }

  getMedia() {
    return this.getMediaElement() !== null
      ? this.getMediaElement()
      : this.getPlaceholderElement();
  }

  get delayLoad() {
    return this.classList.contains("animate-delay");
  }

  get delayMedia() {
    return this.closest(".block__media-gallery")
      ? this.closest(".block__media-gallery").classList.contains("insert")
      : false;
  }

  get animationConfig() {
    return {
      slideInLeft: {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 0.8,
        easing: [0.422, 0.117, 0.572, 0.786],
      },
      rayo: {
        ease: [0.22, 0.61, 0.36, 1],
        dIn: 0.8,
        dOut: 0.65,
        margin: "0px 0px -30px 0px",
        upY: 25,
        zx: 0,
        zy: 0,
        zScale: 1.06,
      },
      motion: {
        easing: [0.22, 0.61, 0.36, 1],
        dIn: 1.1,
        dOut: 0.7,
      },
    };
  }

  initAnimate() {
    if (
      this.scrollAnimation == "desktop_only" &&
      window.innerWidth < 768 &&
      !this.slideShowElements
    ) {
      return;
    }
    if (this.delayMedia) {
      return;
    }
    switch (this.animateEffect) {
      case "highlighted-text":
        this.highlightedTextInitial();
        break;
      case "left-to-right":
        this.leftToRightInitial();
        break;
      case "fade-in":
        this.fadeInInitial();
        break;
      case "fade-up":
        this.fadeUpInitial();
        break;
      case "zoom-in":
        this.zoomInInitial();
        break;
      case "zoom-in-big":
        this.zoomInBigInitial();
        break;
      case "zoom-out":
        this.zoomOutInitial();
        break;
      case "zoom-out-small":
        this.zoomOutSmallInitial();
        break;
      case "slide-in-left":
        this.slideInLeftInitial();
        break;
    }
  }

  leftToRightInitial() {
    Motion.animate(this, { opacity: 0 }, { duration: 0 });
  }

  fadeInInitial() {
    Motion.animate(this, { opacity: 0 }, { duration: 0 });
  }

  highlightedTextInitial() {
    this.animateSvgInitial();
  }

  fadeUpInitial() {
    this.style.willChange = "transform, opacity";
    Motion.animate(
      this,
      {
        transform: `translateY(${this.animationConfig.rayo.upY}px)`,
        opacity: 0,
      },
      { duration: 0 }
    );

    this._reverseToInitial = () => {
      Motion.animate(
        this,
        {
          transform: `translateY(${this.animationConfig.rayo.upY}px)`,
          opacity: 0,
        },
        {
          duration: this.animationConfig.rayo.dOut,
          easing: this.animationConfig.rayo.ease,
        }
      );
    };
    this.animateSvgInitial();
  }

  zoomInInitial() {
    Motion.animate(this, { transform: "scale(0.8)" }, { duration: 0 });
  }

  zoomInBigInitial() {
    Motion.animate(this, { transform: "scale(0)" }, { duration: 0 });
  }

  zoomOutSmallInitial() {
    if (window.innerWidth < 768) return;
    Motion.animate(
      this,
      {
        transform: `translate(${this.animationConfig.rayo.zx}px, ${this.animationConfig.rayo.zy}px) scale(${this.animationConfig.rayo.zScale})`,
      },
      { duration: 0 }
    );
  }
  zoomOutInitial() {
    if (window.innerWidth < 768) return;
    Motion.animate(
      this,
      { transform: "scale(1.1)", opacity: 1 },
      { duration: 0 }
    );
  }
  slideInLeftInitial() {
    Motion.animate(
      this,
      {
        clipPath: "inset(0% 100% 0% 0%)",
      },
      { duration: 0 }
    );
  }

  async initAnimateEffect() {
    if (
      this.scrollAnimation == "desktop_only" &&
      window.innerWidth < 768 &&
      !this.slideShowElements
    )
      return;

    if (this.delayMedia || this.delayLoad) return;

    switch (this.animateEffect) {
      case "highlighted-text":
        await this.highlightedText();
        break;
      case "fade-up":
        await this.fadeUp();
        break;
      case "zoom-out-small":
        await this.zoomOutSmall();
        break;
      case "left-to-right":
        this.leftToRight();
        break;
      case "fade-in":
        await this.fadeIn();
        break;
      case "zoom-in":
        await this.zoomIn();
        break;
      case "zoom-in-big":
        await this.zoomInBig();
        break;
      case "zoom-out":
        await this.zoomOut();
        break;
      case "slide-in-left":
        this.slideInLeft();
        break;
    }
    if (this.slideShowElements) {
      this.classList.add("animate-delay");
    }
  }

  async highlightedText() {
    await this.animateSvg();
  }

  async fadeUp() {
    await Motion.animate(
      this,
      { transform: "translateY(0px)", opacity: 1 },
      {
        duration: 0.5,
        delay: this.delay || 0,
        easing: this.animationConfig.rayo.ease,
      }
    ).finished;
    this.animateSvg();
  }

  async leftToRight() {
    await Motion.animate(this, { opacity: 1 }).finished;
    this.classList.add("show");
  }

  async fadeIn() {
    await Motion.animate(
      this,
      { opacity: 1 },
      {
        duration: 0.4,
        delay: this.delay,
        easing: this.animationConfig.motion.easing,
      }
    ).finished;
  }

  async zoomIn() {
    await Motion.animate(
      this,
      { transform: "scale(1)" },
      {
        duration: this.animationConfig.motion.dIn,
        delay: this.delay,
        easing: this.animationConfig.motion.easing,
      }
    ).finished;
  }

  async zoomInBig() {
    await Motion.animate(
      this,
      { transform: "scale(1)" },
      {
        duration: this.animationConfig.motion.dIn,
        delay: this.delay,
        easing: this.animationConfig.motion.easing,
      }
    ).finished;
  }

  async zoomOut() {
    if (window.innerWidth < 768) return;
    await Motion.animate(
      this,
      { transform: "scale(1)" },
      {
        duration: this.animationConfig.motion.dIn,
        delay: this.delay,
        easing: this.animationConfig.motion.easing,
      }
    ).finished;
  }

  async zoomOutSmall() {
    if (window.innerWidth < 768) return;
    Motion.animate(
      this,
      {
        transform: [
          `translate(${this.animationConfig.rayo.zx}px, ${this.animationConfig.rayo.zy}px) scale(${this.animationConfig.rayo.zScale})`,
          "translate(0px, 0px) scale(1)",
        ],
      },
      {
        duration: this.animationConfig.rayo.dIn,
        delay: this.delay || 0,
        easing: this.animationConfig.rayo.ease,
      }
    ).finished;
  }

  async slideInLeft() {
    Motion.animate(
      this.getMedia(),
      {
        clipPath: this.animationConfig.slideInLeft.clipPath,
      },
      {
        duration: this.animationConfig.slideInLeft.duration,
        easing: this.animationConfig.slideInLeft.easing,
        delay: this.delay,
      }
    ).finished;
  }

  animateSvgInitial() {
    const svg = this.querySelectorAll("svg");
    svg.forEach((el) => {
      el.classList.remove("animate");
    });
  }

  animateSvg() {
    const svg = this.querySelectorAll("svg");
    svg.forEach((el) => {
      el.classList.add("animate");
    });
  }
}
customElements.define("motion-effect", MotionEffect);
class MotionItemsEffect extends HTMLElement {
  constructor() {
    super();
    this.setupInitialAnimation();
    this.setupInViewEffect();
  }

  get scrollAnimation() {
    return themeGlobalVariables.settings.scrollAnimation;
  }

  get allItems() {
    return this.querySelectorAll(".motion-item");
  }

  get visibleItems() {
    return this.querySelectorAll(".product-item:not([style])");
  }

  setupInitialAnimation() {
    if (this.scrollAnimation == "desktop_only" && window.innerWidth < 768) {
      return;
    }
    Motion.animate(
      this.allItems,
      {
        y: 30,
        opacity: 0,
        visibility: "hidden",
      },
      {
        duration: 0,
      }
    );
  }

  setupInViewEffect() {
    if (this.scrollAnimation == "desktop_only" && window.innerWidth < 768) {
      return;
    }
    Motion.inView(this, this.animateItems.bind(this), {
      margin: "0px 0px -50px 0px",
    });
  }

  animateItems() {
    Motion.animate(
      this.allItems,
      {
        y: [30, 0],
        opacity: [0, 1],
        visibility: ["hidden", "visible"],
      },
      {
        duration: 0.5,
        delay: Motion.stagger(0.1),
        easing: [0, 0, 0.3, 1],
      }
    ).finished;
  }

  reloadAnimationEffect() {
    if (this.scrollAnimation == "desktop_only" && window.innerWidth < 768) {
      return;
    }
    Motion.animate(
      this.visibleItems,
      {
        y: [30, 0],
        opacity: [0, 1],
        visibility: ["hidden", "visible"],
      },
      {
        duration: 0.5,
        delay: Motion.stagger(0.1),
        easing: [0, 0, 0.3, 1],
      }
    ).finished;
  }
}
customElements.define("motion-items-effect", MotionItemsEffect);

class ButtonCopyLink extends HTMLButtonElement {
  constructor() {
    super();
    this.init();
  }
  init() {
    this.addEventListener("click", this.onClick.bind(this), false);
  }
  onClick() {
    const url = this.getAttribute("data-href");
    navigator.clipboard.writeText(url);
    notifierInline.show(window.message.socialCopyLink.success, "success");
  }
}
customElements.define("button-copy-link", ButtonCopyLink, {
  extends: "button",
});
CustomElement.observeAndPatchCustomElements({
  "button-copy-link": {
    tagElement: "button",
    classElement: ButtonCopyLink,
  },
});

class ButtonQuickView extends HTMLButtonElement {
  constructor() {
    super();
    this.init();
  }

  get sectionId() {
    return document.querySelector("quickview-drawer")
      ? document
          .querySelector("quickview-drawer")
          .getAttribute("data-section-id")
      : null;
  }

  init() {
    this.addEventListener("click", this.onClick.bind(this), false);
    this.addEventListener(
      "keypress",
      function (event) {
        if (event.key === "Enter") {
          this.onClick.bind(this)(event);
        }
      }.bind(this),
      false
    );
    window.Shopify.designMode &&
      (document.addEventListener("shopify:section:select", (event) => {
        const currentTarget = event.target;
        if (
          JSON.parse(currentTarget.dataset.shopifyEditorSection).id ===
          this.sectionId
        ) {
          const drawer = document.querySelector("quickview-drawer");
          eventModal(drawer, "open", false, "delay", true);
        }
      }),
      document.addEventListener("shopify:section:deselect", () => {
        const drawer = document.querySelector("quickview-drawer");
        if (drawer) {
          eventModal(drawer, "close", false);
        }
      }));
  }

  async onClick(e) {
    e.preventDefault();
    if (this.dataset.url) {
      this.setAttribute("aria-disabled", true);
      this.classList.add("loading");
      if (!this.sectionId) {
        window.location.href = this.dataset.url;
        return;
      }
      await (import(importJs.mediaGallery), import(importJs.productModel));
      this.fetchUrl();
    }
  }

  fetchUrl() {
    fetch(`${this.dataset.url}?section_id=${this.sectionId}`)
      .then((response) => response.text())
      .then((text) => {
        const html = NextSkyTheme.parser.parseFromString(text, "text/html");
        document.querySelector(".quickview-product").innerHTML =
          html.querySelector(".quickview-product").innerHTML;
      })
      .finally(async () => {
        this.classList.remove("loading");
        this.removeAttribute("aria-disabled");
        const drawer = document.querySelector("quickview-drawer");
        const beforeYouLeave = document.querySelector(
          "before-you-leave.active"
        );
        if (beforeYouLeave) {
          eventModal(beforeYouLeave, "close", false);
          if (NextSkyTheme.setCookie) {
            NextSkyTheme.setCookie("before_you_leave_hidden", "true", 1);
          }
        }
        eventModal(drawer, "open", false, "delay", true);
        NextSkyTheme.global.rootToFocus = this;
        new LazyLoader(".image-lazy-load");
        await (import(importJs.mediaLightboxGallery),
        import(importJs.countdownTimer),
        import(importJs.recipientForm));
        drawer.querySelector(".modal-inner").scrollTop = 0;
      })
      .catch((e) => {
        console.error(e);
      });
  }
}
customElements.define("button-quick-view", ButtonQuickView, {
  extends: "button",
});
CustomElement.observeAndPatchCustomElements({
  "button-quick-view": {
    tagElement: "button",
    classElement: ButtonQuickView,
  },
});

class SelectContact extends HTMLElement {
  constructor() {
    super();
    this.init();
  }

  init() {
    const text = this.getAttribute("text");
    if (text) {
      const options = text.split(",").map((item) => item.trim());
      const selectElement = this.closest(
        ".field-contact-subject"
      ).querySelector("select");
      options.forEach((optionText) => {
        const option = document.createElement("option");
        option.value = optionText.toLowerCase();
        option.textContent =
          optionText.charAt(0).toUpperCase() + optionText.slice(1);
        selectElement.appendChild(option);
      });
    }
  }
}
customElements.define("select-contact", SelectContact);

class BeforeYouLeave extends HTMLElement {
  constructor() {
    super();
    this.delay = parseInt(this.dataset.timeDelay, 10);
    this.sectionId = this.dataset.sectionId;
    this.interactions = 0;
    this.popupActive = false;
    this.cookieName = "before_you_leave_hidden";
    this.closeHandler = this.closeHandler.bind(this);
    if (
      NextSkyTheme.getCookie &&
      NextSkyTheme.getCookie(this.cookieName) === "true"
    ) {
      return;
    }
    if (!window.Shopify.designMode) {
      setTimeout(() => this.init(), 100);
    }
    window.Shopify.designMode &&
      (document.addEventListener("shopify:section:select", (event) => {
        const currentTarget = event.target;
        if (
          JSON.parse(currentTarget.dataset.shopifyEditorSection).id ===
          this.sectionId
        ) {
          eventModal(this, "open", false);
          this.bindCouponCopy();
        }
      }),
      document.addEventListener("shopify:section:deselect", () => {
        const modal = document.querySelector("before-you-leave");
        if (modal) {
          eventModal(modal, "close", false);
        }
      }));
  }

  init() {
    if (
      NextSkyTheme.getCookie &&
      NextSkyTheme.getCookie(this.cookieName) === "true"
    ) {
      return;
    }
    const sourceContent = document.getElementById(this.sectionId);
    if (!sourceContent) {
      return;
    }
    this.innerHTML = sourceContent.innerHTML;
    if (typeof BlsLazyloadImg !== "undefined") {
      BlsLazyloadImg.init();
    }
    this.initPopup();
  }

  initPopup() {
    if (
      NextSkyTheme.getCookie &&
      NextSkyTheme.getCookie(this.cookieName) === "true"
    ) {
      return;
    }
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
            eventModal(_self, "open", true);
            _self.bindCouponCopy();
          } else {
            _self._inactivityTriggered = false;
            resetTimer();
          }
          events.forEach((event) => {
            window.removeEventListener(event, resetTimer);
          });
        }
      }, _self.delay * 1000);
    }
    events.forEach((event) => {
      window.addEventListener(event, resetTimer, { passive: true });
    });
    resetTimer();
  }

  closeHandler(e) {
    if (
      e.target.closest(".close-before") ||
      e.target.matches(".modal-overlay")
    ) {
      eventModal(this, "close");
      this.popupActive = false;
      if (NextSkyTheme.setCookie) {
        NextSkyTheme.setCookie(this.cookieName, "true", 1);
      }
    }
  }

  bindCouponCopy() {
    const discounts = this.querySelectorAll(".discount");
    discounts.forEach((el) => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        navigator.clipboard.writeText(el.dataset.code);
        el.classList.add("action-copy");
        setTimeout(() => el.classList.remove("action-copy"), 2000);
      });
    });
  }
}

customElements.define("before-you-leave", BeforeYouLeave);

class ShareButton extends HTMLElement {
  constructor() {
    super();
    this.addEventListener("click", this.handleShare.bind(this));
  }

  handleShare() {
    const title = this.getAttribute("data-title") || document.title;
    const text = this.getAttribute("data-text") || "";
    const url = this.getAttribute("data-url") || window.location.href;

    if (navigator.share) {
      navigator.share({ title, text, url });
    }
  }
}
customElements.define("share-button", ShareButton);

class InnerTab extends HTMLElement {
  constructor() {
    super();
    this.querySelectorAll("button").forEach((button) =>
      button.addEventListener("click", this.onButtonClick.bind(this))
    );
  }

  onButtonClick(event) {
    const currentTarget = event.currentTarget;
    if (currentTarget.classList.contains("active")) {
      return;
    }
    const id = currentTarget.getAttribute("data-id");
    const visibleItems = document.getElementById(id);
    this.querySelectorAll("button").forEach((button) =>
      button.classList.remove("active")
    );
    currentTarget.classList.add("active");
    this.closest(".content-tabs")
      .querySelectorAll(".tab-content")
      .forEach((result) => {
        if (result.id !== id) {
          result.classList.add("hidden");
          Motion.animate(
            result,
            {
              transform: "translateY(10px)",
              opacity: 0,
              visibility: "hidden",
            },
            {
              duration: 0,
            }
          );
        }
      });

    visibleItems.classList.remove("hidden");
    Motion.animate(
      visibleItems,
      {
        transform: ["translateY(10px)", "translateY(0)"],
        opacity: [0, 1],
        visibility: ["hidden", "visible"],
      },
      {
        duration: 0.5,
        delay: Motion.stagger(0.1),
        easing: [0, 0, 0.3, 1],
      }
    );
  }
}
customElements.define("inner-tab", InnerTab);

class ProgressBarload extends HTMLElement {
  constructor() {
    super();
    const container = document.createElement("div");
    container.className = "progress-load-page";
    const bar = document.createElement("div");
    bar.className = "indeterminate";
    bar.style.width = "0%";
    container.appendChild(bar);
    this.appendChild(container);
    this.indicator = bar;
    this.progress = 0;
    this.minAnimationTime = 1000;
  }

  connectedCallback() {
    window.addEventListener("beforeunload", this.complete.bind(this));
  }

  disconnectedCallback() {
    window.removeEventListener("beforeunload", this.complete.bind(this));
  }

  complete() {
    this.style.display = "flex";
    this.progress = 0;
    this.isAnimating = true;
    this.indicator.style.transition = "none";
    this.indicator.style.width = "0%";
    this.indicator.style.opacity = "1";
    this.indicator.offsetWidth;
    this.indicator.style.transition = `width ${this.minAnimationTime}ms ease`;
    this.indicator.style.width = "100%";
  }
}
customElements.define("progress-bar-load", ProgressBarload);

class ProgressBarBlock extends HTMLElement {
  constructor() {
    super();
    this.percentageElement = this.querySelector(".progress-percentage");
    this.progressBar = this.querySelector(".progress-bar");
    this.targetPercentage = this.percentageElement
      ? parseInt(this.percentageElement.dataset.percentage)
      : 0;
  }

  connectedCallback() {
    if (this.percentageElement) {
      this.animatePercentage();
    }
  }

  animatePercentage() {
    let currentPercentage = 0;
    const updatePercentage = () => {
      if (currentPercentage <= this.targetPercentage) {
        this.percentageElement.textContent = currentPercentage + "%";
        currentPercentage++;
        setTimeout(updatePercentage.bind(this), 20);
      } else {
        this.percentageElement.textContent = this.targetPercentage + "%";
      }
    };
    setTimeout(updatePercentage.bind(this), 100);
  }

  resetAndAnimate() {
    if (this.percentageElement && this.progressBar) {
      this.progressBar.style.width = "0";
      this.progressBar.style.animation = "none";
      this.percentageElement.textContent = "0%";

      setTimeout(() => {
        this.progressBar.style.animation = `progressAnimation ${
          this.targetPercentage * 3
        }s ease-in-out forwards`;
        this.animatePercentage();
      }, 10);
    }
  }
}

customElements.define("progress-bar-block", ProgressBarBlock);

class CounterAnimation extends HTMLElement {
  connectedCallback() {
    this.counterElement = this.querySelector("[data-counter-target]");
    this.circleElement = this.querySelector(".progress-ring__circle");
    this.bgCircleElement = this.querySelector(".progress-ring__bg");
    this.svgElement = this.querySelector(".progress-ring");
    this.targetValue = parseFloat(this.dataset.counter) || 100;
    this.startValue = parseFloat(this.dataset.start) || 0;
    this.duration = parseFloat(this.dataset.duration) || 2000;
    this.isAnimated = false;

    this.setCircleAttributes();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.resetAnimation();
            this.animateCounter();
          }
        });
      },
      { threshold: 0.5 }
    );
    observer.observe(this);

    this.resizeObserver = new ResizeObserver(() => {
      this.setCircleAttributes();
      if (this.isAnimated && this.circleElement && this.circumference) {
        const percent = Math.min(this.targetValue, 100) / 100;
        const offset = this.circumference - percent * this.circumference;
        this.circleElement.style.strokeDashoffset = offset;
      }
      this.updateTextPosition();
    });
    this.resizeObserver.observe(this);
  }

  disconnectedCallback() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  setCircleAttributes() {
    const styles = getComputedStyle(this);
    const size = parseFloat(styles.getPropertyValue("--circle-size")) || 150;
    const stroke = parseFloat(styles.getPropertyValue("--circle-stroke")) || 8;
    const radius = size / 2 - stroke / 2;
    const center = size / 2;

    if (this.svgElement) {
      this.svgElement.setAttribute("viewBox", `0 0 ${size} ${size}`);
    }

    [this.circleElement, this.bgCircleElement].forEach((el) => {
      if (el) {
        el.setAttribute("r", radius);
        el.setAttribute("cx", center);
        el.setAttribute("cy", center);
      }
    });

    this.radius = radius;
    this.circumference = 2 * Math.PI * radius;

    if (this.circleElement) {
      this.circleElement.style.strokeDasharray = `${this.circumference} ${this.circumference}`;
      this.circleElement.style.strokeDashoffset = this.circumference;
    }

    this.updateTextPosition();
  }

  updateTextPosition() {
    if (this.counterElement && this.circleElement) {
      const centerX = parseFloat(this.circleElement.getAttribute("cx"));
      const centerY = parseFloat(this.circleElement.getAttribute("cy"));
      this.counterElement.setAttribute("x", centerX);
      this.counterElement.setAttribute("y", centerY);
      this.counterElement.setAttribute("dominant-baseline", "middle");
      this.counterElement.removeAttribute("dy");
    }
  }

  resetAnimation() {
    this.isAnimated = false;
    this.counterElement.textContent = this.startValue;
    if (this.circleElement && this.circumference) {
      this.circleElement.style.strokeDashoffset = this.circumference;
    }
  }

  animateCounter() {
    if (this.isAnimated) return;

    let current = this.startValue;
    const range = this.targetValue - this.startValue;
    const increment = range / (this.duration / 16);

    const updateCounter = () => {
      current += increment;
      if (current >= this.targetValue) {
        current = this.targetValue;
        this.isAnimated = true;
      }

      this.counterElement.textContent = Math.ceil(current);

      if (this.circleElement && this.circumference) {
        const percent = Math.min(current, 100) / 100;
        const offset = this.circumference - percent * this.circumference;
        this.circleElement.style.strokeDashoffset = offset;
      }

      if (current < this.targetValue) {
        requestAnimationFrame(updateCounter);
      }
    };

    requestAnimationFrame(updateCounter);
  }
}
customElements.define("counter-animation", CounterAnimation);

class TabRow extends HTMLElement {
  constructor() {
    super();
    this.tabHeadings = this.querySelectorAll(".tab-heading");
    this.tabContents = this.querySelectorAll(".tab-row__content");
    this.activeIndex = 0;
    this.init();
  }

  init() {
    this.tabContents.forEach((content, index) => {
      if (index !== this.activeIndex) {
        content.style.display = "none";
        content.classList.add("hidden");
      }
    });

    if (this.tabHeadings[this.activeIndex]) {
      this.tabHeadings[this.activeIndex].classList.add("active");
    }

    this.tabHeadings.forEach((heading, index) => {
      heading.addEventListener("click", () => this.switchTab(index));
    });
  }

  switchTab(index) {
    if (index === this.activeIndex) return;

    if (this.tabHeadings[this.activeIndex]) {
      this.tabHeadings[this.activeIndex].classList.remove("active");
    }

    const oldContent = this.tabContents[this.activeIndex];
    if (oldContent) {
      Motion.animate(
        oldContent,
        {
          transform: "translateY(10px)",
          opacity: 0,
          visibility: "hidden",
        },
        {
          duration: 0.4,
          easing: [0, 0, 0.3, 1],
        }
      ).finished.then(() => {
        oldContent.style.display = "none";
        oldContent.classList.add("hidden");
      });
    }

    this.activeIndex = index;

    if (this.tabHeadings[this.activeIndex]) {
      this.tabHeadings[this.activeIndex].classList.add("active");
    }

    const newContent = this.tabContents[this.activeIndex];
    if (newContent) {
      newContent.style.display = "block";
      newContent.classList.remove("hidden");
      Motion.animate(
        newContent,
        {
          transform: ["translateY(10px)", "translateY(0)"],
          opacity: [0, 1],
          visibility: ["hidden", "visible"],
        },
        {
          duration: 0.5,
          delay: 0.1,
          easing: [0, 0, 0.3, 1],
        }
      );
    }
  }
}

customElements.define("tab-row", TabRow);

class DiscountPopup extends HTMLElement {
  constructor() {
    super();
    this.sectionId = this.dataset.sectionId;
    this.modal = this.querySelector("discount-modal-popup");
    window.Shopify.designMode &&
      (document.addEventListener("shopify:section:select", (event) => {
        const currentTarget = event.target;
        if (
          JSON.parse(currentTarget.dataset.shopifyEditorSection).id ===
          this.sectionId
        ) {
          eventModal(this.modal, "open", false);
        }
      }),
      document.addEventListener("shopify:section:deselect", () => {
        if (this.modal) {
          eventModal(this.modal, "close", false);
        }
      }));
  }
}

customElements.define("discount-popup", DiscountPopup);
