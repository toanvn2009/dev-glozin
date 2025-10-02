import { initSlide, loadSlideVideo } from "@NextSkyTheme/slide";
export class LazyLoadEventHover {
  constructor(e) {
    (this.triggerEventsJs = e),
      (this.eventOptionsJs = { passive: !0 }),
      (this.userEventListenerJs = this.triggerListenerJs.bind(this)),
      (this.delayedScriptsJs = { normal: [], async: [], defer: [] });
  }
  triggerListenerJs() {
    const scrollTop =
      document.documentElement.scrollTop || document.body.scrollTop;
    const isTouch = matchMedia("(any-pointer:coarse)").matches;
    if (isTouch) {
      if (scrollTop > 10) {
        this._removeUserInteractionListenerJs(this),
          "loading" === document.readyState
            ? document.addEventListener(
                "DOMContentLoaded",
                this._loadEverythingReadyNow.bind(this)
              )
            : this._loadEverythingReadyNow();
      } else {
        this._removeUserInteractionListenerJs(this);
        const e = new LazyLoadEventHover(["scroll", "pageshow"]);
        e._addUserInteractionListenerJs(e);
      }
    } else {
      this._removeUserInteractionListenerJs(this),
        "loading" === document.readyState
          ? document.addEventListener(
              "DOMContentLoaded",
              this._loadEverythingReadyNow.bind(this)
            )
          : this._loadEverythingReadyNow();
    }
  }
  _removeUserInteractionListenerJs(e) {
    this.triggerEventsJs.forEach((t) =>
      window.removeEventListener(t, e.userEventListenerJs, e.eventOptionsJs)
    );
  }
  _addUserInteractionListenerJs(e) {
    const isTouch = matchMedia("(any-pointer:coarse)").matches;
    const scrollTop =
      document.documentElement.scrollTop || document.body.scrollTop;
    this.triggerEventsJs.forEach((t) => {
      if (!isTouch) {
        if (t === "scroll" || t === "pageshow") {
          if (scrollTop <= 10) {
            return;
          }
        }
      }
      window.addEventListener(t, e.userEventListenerJs, e.eventOptionsJs);
    });
  }
  async _preloadAllScriptsJs() {
    await this.initLazyDomHtml();
    await this.initLazyLoadJs();
    await this.initLazyLoadImage();
    await this.initLazySlideSection();
    await this.initLazyTemplateModal();
  }

  initLazyDomHtml() {
    const elements = document.querySelectorAll(".element-tabs__content");
    elements.forEach((entry) => {
      const element = entry;
      const templates = element.querySelectorAll("template.tabs__content");
      templates.forEach((template) => {
        const content = document.createElement("div");
        content.appendChild(template.content.firstElementChild.cloneNode(true));
        element.appendChild(
          content.querySelector(".product-tabs__content-item")
        );
        template.remove();
      });
    });
  }

  initLazyLoadJs() {
    import(importJs.formAction);
    import(importJs.newsletterPopup);
    import(importJs.featuredProductBanner);
    import(importJs.productTabs);
    import(importJs.suitableProductsFinder);
    import(importJs.shopableVideo);
    import(importJs.compactProductBundle);
    import(importJs.testimonials);
  }

  initLazyLoadImage() {
    import(importJs.newsletterPopup);
    const lazyImage = document.querySelectorAll(".image-lazy-load");
    lazyImage.forEach((entry) => {
      const imgElement = entry;
      const pictureElement = imgElement.closest("picture");
      if (pictureElement) {
        const sourceElement = pictureElement.querySelector("source");
        const imgSourceSrcset = sourceElement.dataset.srcset;
        if (imgSourceSrcset) {
          sourceElement.setAttribute("srcset", imgSourceSrcset);
          sourceElement.removeAttribute("data-srcset");
        }
      }
      const imgSrcset = imgElement.dataset.srcset;
      const motionEffect = imgElement.closest("motion-effect");
      if (imgSrcset) {
        imgElement.setAttribute("srcset", imgSrcset);
        imgElement.removeAttribute("data-srcset");
        imgElement.classList.add("lazy-loaded");
        if (motionEffect) {
          motionEffect.classList.remove("loading");
          motionEffect.classList.add("loaded");
        }
      }
    });
  }

  initLazySlideSection() {
    const loadingSwiper = document.querySelectorAll(
      ".lazy-loading-swiper-after"
    );
    loadingSwiper.forEach((el) => {
      el.classList.remove("lazy-loading-swiper-after");
      initSlide(el);
    });

    document.querySelectorAll("video-local-slide").forEach((video) => {
      loadSlideVideo(video, true);
    });
  }

  initLazyTemplateModal() {
    const templateModal = document.querySelectorAll(".lazy-template-modal");
    templateModal.forEach((el) => {
      const content = document.createElement("div");
      content.appendChild(el.content.firstElementChild.cloneNode(true));
      el.closest(".shopify-section").appendChild(
        content.querySelector(".content-element")
      );
      el.remove();
    });
  }

  async _loadEverythingReadyNow() {
    this._preloadAllScriptsJs(),
      await this._loadScriptsFromListJs(this.delayedScriptsJs.normal),
      await this._loadScriptsFromListJs(this.delayedScriptsJs.defer),
      await this._loadScriptsFromListJs(this.delayedScriptsJs.async),
      await this._triggerDOMContentLoadedJs(),
      await this._triggerWindowLoadJs(),
      window.dispatchEvent(new Event("nextskyspeed-allScriptsLoaded"));
  }
  async _loadScriptsFromListJs(e) {
    const t = e.shift();
    return t
      ? (await this._transformScript(t), this._loadScriptsFromListJs(e))
      : Promise.resolve();
  }
  async _transformScript(e) {
    return (
      await this._requestAnimFrame(),
      new Promise((t) => {
        const s = document.createElement("script");
        let n;
        [...e.attributes].forEach((e) => {
          let t = e.nodeName;
          "type" !== t &&
            ("data-nextskylazy-type" === t && ((t = "type"), (n = e.nodeValue)),
            s.setAttribute(t, e.nodeValue));
        }),
          e.hasAttribute("src")
            ? (s.addEventListener("load", t), s.addEventListener("error", t))
            : ((s.text = e.text), t()),
          e.parentNode.replaceChild(s, e);
      })
    );
  }
  async _triggerDOMContentLoadedJs() {
    (this.domReadyFired = !0),
      await this._requestAnimFrame(),
      document.dispatchEvent(new Event("nextskyspeed-DOMContentLoaded")),
      await this._requestAnimFrame(),
      window.dispatchEvent(new Event("nextskyspeed-DOMContentLoaded")),
      await this._requestAnimFrame(),
      document.dispatchEvent(new Event("nextskyspeed-readystatechange")),
      await this._requestAnimFrame(),
      document.nextskyonreadystatechange &&
        document.nextskyonreadystatechange();
  }
  async _triggerWindowLoadJs() {
    await this._requestAnimFrame(),
      window.dispatchEvent(new Event("nextskyspeed-load")),
      await this._requestAnimFrame(),
      window.nextskyonload && window.nextskyonload(),
      await this._requestAnimFrame(),
      window.dispatchEvent(new Event("nextskyspeed-pageshow")),
      await this._requestAnimFrame(),
      window.nextskyonpageshow && window.nextskyonpageshow();
  }
  async _requestAnimFrame() {
    return new Promise((e) => requestAnimationFrame(e));
  }
  static run() {
    const isTouch = matchMedia("(any-pointer:coarse)").matches;
    const events = isTouch
      ? ["scroll", "pageshow"]
      : [
          "pageshow",
          "scroll",
          "keydown",
          "mousemove",
          "touchmove",
          "touchstart",
          "touchend",
          "wheel",
        ];
    const e = new LazyLoadEventHover(events);
    e._addUserInteractionListenerJs(e);
  }
}
export class LazyLoader {
  constructor(selector, rootMargin = "200px") {
    this.lazyImages = document.querySelectorAll(selector);
    this.rootMargin = rootMargin;
    this.observer = null;
    this.init();
  }

  init() {
    this.createObserver();
    this.observeImages();
  }

  createObserver() {
    const isTouch = matchMedia("(any-pointer:coarse)").matches;
    if (isTouch) {
      this.rootMargin = "50px";
    }
    this.observer = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const imgElement = entry.target;
            const pictureElement = imgElement.closest("picture");
            if (pictureElement) {
              const sourceElement = pictureElement.querySelector("source");
              const imgSourceSrcset = sourceElement.dataset.srcset;
              if (imgSourceSrcset) {
                sourceElement.setAttribute("srcset", imgSourceSrcset);
                sourceElement.removeAttribute("data-srcset");
              }
            }
            const imgSrcset = imgElement.dataset.srcset;
            const parentElement = imgElement.closest("motion-effect");
            if (imgSrcset) {
              imgElement.setAttribute("srcset", imgSrcset);
              imgElement.removeAttribute("data-srcset");
              imgElement.classList.remove("image-lazy-load");
              imgElement.classList.add("lazy-loaded");
              if (parentElement) {
                parentElement.classList.remove("loading");
                parentElement.classList.add("loaded");
              }
            }
            observer.unobserve(imgElement);
          }
        });
      },
      {
        rootMargin: this.rootMargin,
      }
    );
  }

  observeImages() {
    this.lazyImages.forEach((imgElement) => {
      this.observer.observe(imgElement);
    });
  }
}

export function loadImages(imageOrArray) {
  if (!imageOrArray) {
    return Promise.resolve();
  }
  const images =
    imageOrArray instanceof Element ? [imageOrArray] : Array.from(imageOrArray);
  if (images.length > 1) {
    return Promise.resolve();
  }
  return Promise.all(
    images.map((image) => {
      return new Promise((resolve) => {
        if (
          (image.tagName === "IMG" && image.complete) ||
          !image.offsetParent
        ) {
          resolve();
        } else {
          image.onload = () => {
            resolve();
          };
        }
      });
    })
  );
}
