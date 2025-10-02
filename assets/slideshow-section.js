class SlideshowSection extends HTMLElement {
  constructor() {
    super();
    this.mainSlide = this.querySelector(".swiper-slideshow-main");
    this.init();
  }

  init() {
    const _this = this;
    this.initSlideShow();
  }

  initSlideShow() {
    let autoplay = this.mainSlide?.dataset.autoplay === "true";
    const loop = this.mainSlide?.dataset.loop === "true";
    let autoPlaySpeed = this.mainSlide?.dataset.autoPlaySpeed
      ? this.mainSlide?.dataset.autoPlaySpeed
      : 3000;
    const effect = this.mainSlide?.dataset.effect
      ? this.mainSlide?.dataset.effect
      : "slide";
    const animation = this.mainSlide?.dataset.effect
      ? this.mainSlide?.dataset.animation
      : "default";
    const pauseOnMouseEnter =
      this.mainSlide?.dataset.pauseOnMouseEnter === "true";
    if (autoplay) {
      autoplay = { delay: autoPlaySpeed, pauseOnMouseEnter: pauseOnMouseEnter };
    }
    const _this = this;
    const base = {
      autoplay: autoplay,
      effect: effect,
      loop: loop,
      navigation: {
        nextEl: this.querySelector(".swiper-button-next"),
        prevEl: this.querySelector(".swiper-button-prev"),
      },
      pagination: {
        clickable: true,
        el: this.querySelector(".swiper-pagination"),
      },
      on: {
        init: function (sw) {
          _this.querySelectorAll(".slide-video-1").forEach((video) => {
            _this.loadSlideVideo(video, false);
          });
        },
        slideChangeTransitionStart: function (sw) {
          const currentSlide = this.slides[this.activeIndex];
          currentSlide
            .querySelectorAll("motion-effect")
            .forEach(async (motion) => {
              await motion.initAnimate();
            });
        },
        slideChangeTransitionEnd: function () {
          _this.querySelectorAll("video-local-slide").forEach((video) => {
            _this.loadSlideVideo(video, false);
          });
          const currentSlide = this.slides[this.activeIndex];
          currentSlide
            .querySelectorAll("motion-effect")
            .forEach(async (motion) => {
              motion.classList.remove("animate-delay"),
                await motion.initAnimateEffect();
            });
        },
      },
    };
    base.effect = effect;
    base.speed = 400;
    const swiper = new Swiper(this.mainSlide, base);
    return swiper;
  }

  loadSlideVideo(_this, lazy = false) {
    if (window.innerWidth > 787) {
      if (!lazy && _this.classList.contains("video-mobile")) {
        return;
      }
    } else {
      if (!lazy && _this.classList.contains("video-desktop")) {
        return;
      }
    }
    if (!_this.getAttribute("loaded") && _this.querySelector("template")) {
      const content = document.createElement("div");
      content.appendChild(
        _this
          .querySelector("template")
          .content.firstElementChild.cloneNode(true)
      );
      _this.setAttribute("loaded", true);
      const deferredElement = _this.appendChild(content.querySelector("video"));
      const alt = deferredElement.getAttribute("alt");
      const img = deferredElement.querySelector("img");
      const video = _this.querySelector("video");
      video.preload = "metadata";
      this.waitForFirstFrame(video).then(() => {
        _this.closest(".swiper-slideshow-main").classList.add("is-ready");
      });
      if (alt && img) {
        img.setAttribute("alt", alt);
      }
      if (
        deferredElement.nodeName == "VIDEO" &&
        deferredElement.getAttribute("autoplay")
      ) {
        deferredElement.play();
      }
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach(({ target, isIntersecting, intersectionRatio }) => {
            if (isIntersecting && intersectionRatio > 0.2) {
              const p = video.play();
              if (p && typeof p.catch === "function") {
                p.catch((err) => {
                  if (err?.name !== "AbortError")
                    console.warn("play failed:", err);
                });
              }
            } else {
              target.pause();
            }
          });
        },
        { threshold: [0, 0.2, 1] }
      );
      io.observe(video);
    }
  }

  waitForFirstFrame(video) {
    return new Promise((resolve) => {
      const done = () => {
        cleanup();
        resolve();
      };
      const cleanup = () => {
        video.removeEventListener("loadeddata", done);
        video.removeEventListener("playing", done);
        video.removeEventListener("timeupdate", onTime);
      };
      const onTime = () => {
        if (video.currentTime > 0) done();
      };

      if (
        (video.readyState >= 2 && video.videoWidth) ||
        video.currentTime > 0
      ) {
        return resolve();
      }
      video.addEventListener("loadeddata", done, { once: true });
      video.addEventListener("playing", done, { once: true });
      video.addEventListener("timeupdate", onTime, { once: true });

      if ("requestVideoFrameCallback" in video) {
        video.requestVideoFrameCallback(() => {
          done();
        });
      }
    });
  }
}
if (!customElements.get("slideshow-section")) {
  customElements.define("slideshow-section", SlideshowSection);
}
