import { SlideSection } from "@NextSkyTheme/slide";
import * as NextSkyTheme from "@NextSkyTheme/global";
import { LazyLoader } from "@NextSkyTheme/lazy-load";
import { createVideoProgressBar } from "@NextSkyTheme/progress-video";
import { eventModal } from "@NextSkyTheme/modal";
class ShopableVideo extends SlideSection {
  constructor() {
    super();
    this.innerWidth = window.innerWidth;
    this.autoplayVideo = this.dataset.autoplayVideo === "true";
    this.autoplay = this.dataset.autoplay === "true";
    this.initShopableVideo();
    this.modalOpen = false;
  }

  connectedCallback() {
    if (this.classList.contains("swiper-slide-center")) {
      this.handleCenterSlides();
    }
    window.addEventListener("resize", this.handleResize.bind(this));
    const mediaQuery = window.matchMedia("(max-width: 1024.98px)");
    const handleMediaQueryChange = (mediaQuery) => {
      if (mediaQuery.matches) {
        this.playActiveSlideVideo(this.swiper.activeIndex);
      } else {
        if (!this.autoplayVideo) {
          this.pauseAllVideos();
        }
        if (this.classList.contains("swiper-slide-center")) {
          this.updateCenterSlideClass();
        }
      }
    };
    handleMediaQueryChange(mediaQuery);
    mediaQuery.addEventListener("change", handleMediaQueryChange);
    document.addEventListener(
      "modal:opened",
      this.handleModalOpened.bind(this)
    );
    document.addEventListener(
      "modal:closed",
      this.handleModalClosed.bind(this)
    );
  }

  handleModalOpened() {
    this.modalOpen = true;
    if (this.swiper && this.swiper.autoplay && this.autoplay) {
      this.swiper.autoplay.stop();
    }
  }

  handleModalClosed() {
    this.modalOpen = false;
    if (this.swiper && this.swiper.autoplay && this.autoplay) {
      setTimeout(() => {
        this.swiper.autoplay.start();
      }, 100);
    }
  }

  handleCenterSlides() {
    if (!this) return;
    if (this.innerWidth < 1025) return;

    const checkSwiper = setInterval(() => {
      if (this.swiper) {
        clearInterval(checkSwiper);
        this.updateCenterSlideClass();
        this.swiper.on("slideChange", () => {
          if (this.innerWidth >= 1025) {
            this.updateCenterSlideClass(true);
          }
        });
        this.swiper.on("breakpoint", () => {
          if (this.innerWidth >= 1025) {
            this.updateCenterSlideClass();
          }
        });
      }
    }, 100);
  }

  handleResize() {
    const useCenterSlideMode = this.classList.contains("swiper-slide-center");
    this.innerWidth = window.innerWidth;
    if (this.innerWidth >= 1025) {
      if (this.swiper && useCenterSlideMode) {
        this.updateCenterSlideClass();
      }
    } else {
      this.resetCenterSlideEffects();
    }
    if (!this.autoplayVideo || !this.swiper) return;
    if (useCenterSlideMode) {
      if (this.innerWidth >= 1025) {
        this.playCenterSlideVideo();
      } else {
        this.playActiveSlideVideo(this.swiper.activeIndex);
      }
    }
  }

  resetCenterSlideEffects() {
    if (!this || !this.swiper) return;

    const allSlides = Array.from(this.querySelectorAll(".swiper-slide"));

    allSlides.forEach((slide) => {
      slide.classList.remove("center-slide");
      const videoInner = slide.querySelector(".video-item--ratio");
      if (videoInner) {
        videoInner.style.height = "";
        videoInner.style.marginTop = "";
        videoInner._hasSetupTransition = false;
      }
    });
  }

  updateCenterSlideClass(immediate = false) {
    if (!this || !this.swiper) return;

    if (!this._animations) {
      this._animations = new Map();
    }

    this._animations.forEach((animation) => {
      if (animation && typeof animation.cancel === "function") {
        animation.cancel();
      }
    });
    this._animations.clear();

    let videoHeight;
    const allSlides = Array.from(this.querySelectorAll(".swiper-slide"));
    const previousCenterSlide = this.querySelector(
      ".swiper-slide.center-slide"
    );

    if (!this._maxSlideHeight) {
      let maxHeight = 0;
      allSlides.forEach((slide) => {
        const slideHeight = slide.scrollHeight;
        if (slideHeight > maxHeight) {
          maxHeight = slideHeight;
        }
      });

      this._maxSlideHeight = maxHeight > 0 ? maxHeight : 500;
    }

    allSlides.forEach((slide) => {
      slide.classList.remove("center-slide");
    });

    const slidesPerView = parseInt(this.swiper.params.slidesPerView);
    if (typeof slidesPerView === "number" && slidesPerView % 2 !== 0) {
      const centerIndex =
        Math.floor(slidesPerView / 2) + this.swiper.activeIndex;
      if (centerIndex >= 0 && centerIndex < allSlides.length) {
        allSlides[centerIndex].classList.add("center-slide");
        const newCenterSlide = allSlides[centerIndex];
        const buttonPlay = newCenterSlide.querySelector(".play-button");
        if (buttonPlay && this.autoplayVideo) {
          buttonPlay.classList.add("active");
        }
        const video = newCenterSlide.querySelector("video-local-shopable");

        if (video) {
          if (!this._originalVideoHeight) {
            this._originalVideoHeight = video.offsetHeight || 300;
          }
          videoHeight = this._originalVideoHeight;

          if (!this._lastSlideChangeTime) {
            this._lastSlideChangeTime = Date.now();
            this._isRapidSwiping = false;
          } else {
            const timeSinceLastChange = Date.now() - this._lastSlideChangeTime;
            this._lastSlideChangeTime = Date.now();
            this._isRapidSwiping = timeSinceLastChange < 300;
          }

          if (!this._containerInitialized) {
            const swiperWrapper = this.querySelector(".swiper-wrapper");
            if (swiperWrapper) {
              swiperWrapper.style.minHeight = this._maxSlideHeight + 10 + "px";
              this._containerInitialized = true;
            }
          }

          const centerVideoInner =
            newCenterSlide.querySelector(".video-item--ratio");
          if (centerVideoInner) {
            this._setVideoEffectWithMargin(centerVideoInner, videoHeight, 0);
          }

          allSlides.forEach((slide) => {
            if (!slide.classList.contains("center-slide")) {
              const nonCenterVideoInner =
                slide.querySelector(".video-item--ratio");
              const buttonPlay = slide.querySelector(".play-button");
              if (buttonPlay && this.autoplayVideo) {
                buttonPlay.classList.remove("active");
              }
              if (nonCenterVideoInner && videoHeight) {
                const targetHeight = videoHeight - 100;
                const marginTop = Math.max(0, (videoHeight - targetHeight) / 2);
                this._setVideoEffectWithMargin(
                  nonCenterVideoInner,
                  targetHeight,
                  marginTop
                );
              }
            }
          });
        }

        if (newCenterSlide !== previousCenterSlide) {
          this.dispatchEvent(
            new CustomEvent("center-slide-updated", {
              detail: {
                centerSlide: newCenterSlide,
                immediate: immediate === true,
              },
            })
          );
        }
      }
    }
  }

  _setVideoEffectWithMargin(element, targetHeight, marginTop) {
    if (!element._hasSetupTransition) {
      element.style.transition = this._isRapidSwiping
        ? "height 0.15s cubic-bezier(0.4, 0, 0.2, 1), margin-top 0.15s cubic-bezier(0.4, 0, 0.2, 1)"
        : "height 0.3s cubic-bezier(0.4, 0, 0.2, 1), margin-top 0.3s cubic-bezier(0.4, 0, 0.2, 1)";

      element._hasSetupTransition = true;

      requestAnimationFrame(() => {
        element.style.height = `${targetHeight}px`;
        element.style.marginTop = `${marginTop}px`;
      });
    } else {
      element.style.height = `${targetHeight}px`;
      element.style.marginTop = `${marginTop}px`;
    }
  }

  initShopableVideo() {
    this.setupVideoAutoplay();
  }

  setupVideoAutoplay() {
    if (!this.swiper) return;
    const useCenterSlideMode = this.classList.contains("swiper-slide-center");
    if (useCenterSlideMode) {
      if (this.innerWidth >= 1025) {
        this.playCenterSlideVideo();
      } else {
        this.playActiveSlideVideo(this.swiper.activeIndex);
      }
    } else {
      this.playActiveSlideVideo(this.swiper.activeIndex);
    }
    this.swiper.on("slideChangeTransitionEnd", () => {
      if (useCenterSlideMode) {
        if (this.innerWidth >= 1025) {
          this.playCenterSlideVideo({ immediate: true });
        } else {
          this.playActiveSlideVideo(this.swiper.activeIndex, {
            immediate: true,
          });
        }
      } else {
        if (this.innerWidth >= 1025) {
          if (this.autoplayVideo) {
            this.playActiveSlideVideo(this.swiper.activeIndex, {
              immediate: true,
            });
          }
        } else {
          this.playActiveSlideVideo(this.swiper.activeIndex, {
            immediate: true,
          });
        }
      }
    });
    this.addEventListener("center-slide-updated", (event) => {
      if (useCenterSlideMode) {
        const immediate = event.detail?.immediate === true;
        this.playCenterSlideVideo({ immediate: immediate });
      }
    });
  }

  playCenterSlideVideo(options = {}) {
    this.pauseAllVideos();
    if (!this.autoplayVideo) return;

    const centerSlide = this.querySelector(".swiper-slide.center-slide");
    if (!centerSlide) return;

    this._playSlideVideo(centerSlide, options);
  }

  playActiveSlideVideo(activeIndex, options = {}) {
    this.pauseAllVideos();
    const activeSlide = this.swiper?.slides[activeIndex];
    if (!activeSlide) return;

    this._playSlideVideo(activeSlide, options);
  }

  _isIntersectingVideo(video) {
    const playButton = video
      .closest("shopable-item")
      .querySelector(".play-button");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach(({ target, isIntersecting, intersectionRatio }) => {
          if (isIntersecting && intersectionRatio > 0.2) {
            if (
              video.closest(".center-slide") ||
              (video.closest(".swiper-slide-active") &&
                window.innerWidth <= 1024)
            ) {
              const p = video.play();
              if (playButton) {
                playButton.classList.add("active");
              }
              if (p && typeof p.catch === "function") {
                p.catch((err) => {
                  if (err?.name !== "AbortError")
                    console.warn("play failed:", err);
                });
              }
            }
          } else {
            target.pause();
            if (playButton) {
              playButton.classList.remove("active");
            }
          }
        });
      },
      { threshold: [0, 0.2, 1] }
    );
    io.observe(video);
  }

  _playSlideVideo(slide, options = {}) {
    const videoLocalElement = slide.querySelector("video-local-shopable");
    if (!videoLocalElement) return;
    let videoElement = videoLocalElement.querySelector("video");

    if (options.immediate) {
      if (videoElement) {
        this._playVideo(videoElement, slide);
      } else {
        const newVideo = loadContentVideo(videoLocalElement);
        if (newVideo && newVideo.nodeName === "VIDEO") {
          setTimeout(() => this._playVideo(newVideo, slide), 100);
        }
        const video = videoLocalElement.querySelector("video");
        this._isIntersectingVideo(video);
      }
      return;
    }

    const handleIntersection = (entries, observer) => {
      if (!entries[0].isIntersecting) return;
      observer.unobserve(this);
      const newVideo = loadContentVideo(videoLocalElement);
      if (newVideo && newVideo.nodeName === "VIDEO") {
        setTimeout(() => this._playVideo(newVideo, slide), 100);
      }
      const video = videoLocalElement.querySelector("video");
      this._isIntersectingVideo(video);
    };
    new IntersectionObserver(handleIntersection.bind(this), {
      rootMargin: "0px 0px 200px 0px",
    }).observe(this);
  }

  _playVideo(video, slide) {
    if (!this.autoplayVideo) return;
    const playButton = slide.querySelector(".play-button");
    if (playButton) playButton.classList.add("active");

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        video.play();
      });
    }
  }

  pauseAllVideos() {
    const videos = this.querySelectorAll("video-local-shopable video");
    videos.forEach((video) => {
      if (!video.paused) {
        video.pause();
      }
    });
    const playButtons = this.querySelectorAll(".play-button");
    playButtons.forEach((button) => {
      button.classList.remove("active");
    });
  }
}
customElements.define("shopable-video", ShopableVideo);

class ShopableItem extends HTMLElement {
  constructor() {
    super();
    this.isModalOpen = false;
    if (this.querySelector(".mute-button")) {
      this.querySelector(".mute-button").addEventListener(
        "click",
        this.clickMuteVideo.bind(this),
        false
      );
    }
    if (this.querySelector(".play-button")) {
      this.querySelector(".play-button").addEventListener(
        "click",
        this.clickPlayVideo.bind(this),
        false
      );
    }
    if (this.classList.contains("sticky-video")) {
      this.classList.remove("active");
    }
  }

  connectedCallback() {
    this.addEventListener("click", this.onShowPopupModal.bind(this), false);
    if (this.classList.contains("sticky-video")) {
      const allStickyVideos = document.querySelectorAll(".sticky-video");
      const isFirstStickyVideo = this === allStickyVideos[0];
      if (isFirstStickyVideo) {
        this.initScroll();
        if (this.getStickyHiddenCookie()) {
          this.classList.remove("active");
        }
        this.setupCloseButton();
      } else {
        this.classList.remove("active");
      }
    }
    this.addEventListener("keydown", this.handleKeyDown.bind(this), false);
  }

  handleKeyDown(event) {
    const isPlayButton = event.target.closest(".play-button");
    const isMuteButton = event.target.closest(".mute-button");
    if (event.key === "Enter" && !isPlayButton && !isMuteButton) {
      event.preventDefault();
      this.onShowPopupModal(event);
    }
  }

  setupMobileActionButton(modalPopup) {
    if (!modalPopup) return;

    modalPopup.addEventListener("click", (event) => {
      const actionButton = event.target.closest(".popup-information__mobile");
      if (actionButton) {
        event.preventDefault();
        event.stopPropagation();

        const currentId = modalPopup.getAttribute("data-current");
        if (!currentId) return;

        const currentItem = modalPopup.querySelector(`#${currentId}`);
        if (!currentItem) return;

        const popupInfo = currentItem.querySelector(".popup-information");
        if (!popupInfo) return;

        const buttonCloseModal = modalPopup.querySelector(".modal__close");
        const buttonCloseInformation = currentItem.querySelector(
          ".modal__close-information"
        );

        actionButton.classList.toggle("active");

        this.toggleElements(buttonCloseInformation, buttonCloseModal);

        popupInfo.classList.toggle("active");

        this.updateSwiperState(modalPopup);
      }

      const closeInfoButton = event.target.closest(".modal__close-information");
      if (closeInfoButton) {
        event.preventDefault();
        event.stopPropagation();

        const actionButton = event.target
          .closest(".drawer__body")
          .querySelector(".popup-information__mobile");

        if (actionButton) {
          actionButton.classList.remove("active");
        }

        const currentId = modalPopup.getAttribute("data-current");
        if (!currentId) return;

        const currentItem = modalPopup.querySelector(`#${currentId}`);
        if (!currentItem) return;

        const popupInfo = currentItem.querySelector(".popup-information");
        if (popupInfo) {
          this.hidePopupInformation(popupInfo);
        }

        const buttonCloseModal = modalPopup.querySelector(".modal__close");

        closeInfoButton.classList.add("hidden-important");
        closeInfoButton.classList.remove("active");
        buttonCloseModal.classList.remove("hidden-important");

        this.updateSwiperState(modalPopup);
      }
    });
  }

  toggleElements(elementToShow, elementToHide) {
    if (elementToShow.classList.contains("hidden-important")) {
      elementToShow.classList.remove("hidden-important");
      elementToShow.classList.add("active");
      elementToHide.classList.add("hidden-important");
    } else {
      elementToShow.classList.remove("active");
      elementToShow.classList.add("hidden-important");
      elementToHide.classList.remove("hidden-important");
    }
  }

  updateSwiperState(modalPopup) {
    const swiperContainer = modalPopup.querySelector("slide-section");
    if (swiperContainer && swiperContainer.swiper) {
      this.handleSwipeability(modalPopup, swiperContainer);
    }
  }

  hidePopupInformation(popupInfo) {
    popupInfo.classList.remove("active");
    popupInfo.dispatchEvent(
      new CustomEvent("popup-information:closed", {
        bubbles: true,
        detail: { popupInfo },
      })
    );
    const modalPopup = popupInfo.closest("modal-popup");
    if (modalPopup) {
      const swiperContainer = modalPopup.querySelector("slide-section");
      if (swiperContainer && swiperContainer.swiper) {
        this.handleSwipeability(modalPopup, swiperContainer);
      }
    }
    popupInfo.style.transform = "";
  }

  setupCloseButton() {
    const closeButton = this.querySelector(".shopable-sticky__close");
    if (closeButton) {
      closeButton.classList.remove("pointer-none");
      closeButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.closeStickyPopup();
      });
    }
  }

  initScroll() {
    if (this.getStickyHiddenCookie()) {
      return;
    }
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () =>
        this.setupScrollObserver()
      );
    } else {
      this.setupScrollObserver();
    }
  }

  closeStickyPopup() {
    this.classList.remove("active");
    NextSkyTheme.setCookie("shopable_sticky_closed", "true", 1);
  }

  getStickyHiddenCookie() {
    const getCookieValue = NextSkyTheme.getCookie("shopable_sticky_closed");
    return getCookieValue === "true";
  }

  setupScrollObserver() {
    const mainElement = document.querySelector("main");
    if (!mainElement) return;

    const firstSections = Array.from(
      mainElement.querySelectorAll("section")
    ).slice(0, 1);
    const allStickyVideos = document.querySelectorAll(".sticky-video");
    if (allStickyVideos.length === 0) return;
    const firstStickyVideo = allStickyVideos[0];
    const isFirstStickyVideo = this === firstStickyVideo;
    if (!isFirstStickyVideo) {
      this.classList.remove("active");
      return;
    }
    const shopableVideoSection = firstStickyVideo.closest(
      ".section-shopable-video"
    );
    if (!shopableVideoSection) return;

    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0,
    };

    const shopableVideoObserver = new IntersectionObserver((entries) => {
      if (this.getStickyHiddenCookie() || this.isModalOpen) {
        return;
      }
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.classList.remove("active");
        } else {
          const rect = entry.target.getBoundingClientRect();
          const hasScrolledBeyondFirstSections = firstSections.every(
            (section) => {
              return section.getBoundingClientRect().bottom <= 0;
            }
          );
          if (hasScrolledBeyondFirstSections) {
            if (rect.top > window.innerHeight) {
              this.classList.add("active");
            } else if (rect.bottom < 0) {
              this.classList.add("active");
            }
          }
        }
      });
    }, options);

    const firstSectionsObserver = new IntersectionObserver((entries) => {
      if (this.getStickyHiddenCookie() || this.isModalOpen) {
        return;
      }
      if (window.scrollY > 100) {
        const allSectionsPassedTop = firstSections.every((section) => {
          return section.getBoundingClientRect().bottom <= 0;
        });
        if (allSectionsPassedTop) {
          const shopableRect = shopableVideoSection.getBoundingClientRect();
          if (shopableRect.top > 0) {
            const screens = this.getAttribute("data-screens");
            if (screens == "desktop_only") {
              this.classList.add("block-md");
            } else {
              this.classList.add("block");
              this.classList.remove("hidden");
            }
            setTimeout(() => this.classList.add("active"), 100);
          } else {
            this.classList.remove("active");
          }
        } else {
          this.classList.remove("active");
        }
      } else {
        this.classList.remove("active");
      }
    }, options);
    firstSections.forEach((section) => {
      firstSectionsObserver.observe(section);
    });
    shopableVideoObserver.observe(shopableVideoSection);
    let ticking = false;
    const scrollHandler = () => {
      if (!ticking && !this.getStickyHiddenCookie()) {
        window.requestAnimationFrame(() => {
          if (window.scrollY > 0) {
            this.handleScroll(firstSections, shopableVideoSection);
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    this._scrollHandler = scrollHandler;
    window.addEventListener("scroll", this._scrollHandler, { passive: true });
    this.classList.remove("active");
    this._shopableVideoObserver = shopableVideoObserver;
    this._firstSectionsObserver = firstSectionsObserver;
  }

  handleScroll(firstSections, shopableVideoSection) {
    if (this.getStickyHiddenCookie() || this.isModalOpen) return;
    if (window.scrollY <= 0) {
      this.classList.remove("active");
      return;
    }
    const allSectionsPassedTop = firstSections.every((section) => {
      return section.getBoundingClientRect().bottom <= 0;
    });
    const shopableVideoRect = shopableVideoSection.getBoundingClientRect();
    const isShopableVideoVisible =
      shopableVideoRect.top < window.innerHeight &&
      shopableVideoRect.bottom > 0;
    if (allSectionsPassedTop) {
      const screens = this.getAttribute("data-screens");
      if (screens == "desktop_only") {
        this.classList.add("block-md");
      } else {
        this.classList.add("block");
        this.classList.remove("hidden");
      }
      if (isShopableVideoVisible) {
        this.classList.remove("active");
      } else if (shopableVideoRect.top > window.innerHeight) {
        setTimeout(() => this.classList.add("active"), 100);
      } else if (shopableVideoRect.bottom < 0) {
        setTimeout(() => this.classList.add("active"), 100);
      }
    } else {
      this.classList.remove("active");
    }
  }

  openVideo(event) {
    const currentTarget = event.currentTarget;
    currentTarget
      .closest(".section-shopable-video")
      .querySelectorAll("video-local-shopable")
      .forEach((el) => {
        loadContentVideo(el);
      });
    if (currentTarget.classList.contains("sticky-video")) {
      return;
    }
    if (this.querySelector("video")) {
      const currentItem = this;

      this.closest(".section-shopable-video")
        .querySelectorAll("shopable-item")
        .forEach((el) => {
          el.classList.remove("active-video");
          if (el.querySelector(".mute-button")?.classList.contains("active")) {
            el.querySelector(".mute-button").classList.remove("active");
          }
          const video = el.querySelector("video");
          if (video) {
            if (!video.paused) {
              video.pause();
            }
            if (
              el.querySelector(".play-button")?.classList.contains("active")
            ) {
              el.querySelector(".play-button").classList.remove("active");
            }
          }
        });
      const currentVideo = this.querySelector("video");
      currentVideo.muted = true;
      currentVideo.play();
      this.querySelector(".play-button").classList.add("active");
    }
  }

  _isIntersectingVideo(video) {
    const playButton = video
      .closest("shopable-item")
      .querySelector(".play-button");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach(({ target, isIntersecting, intersectionRatio }) => {
          if (isIntersecting && intersectionRatio > 0.2) {
            if (
              video.closest(".center-slide") ||
              (video.closest(".swiper-slide-active") &&
                window.innerWidth <= 1024)
            ) {
              const p = video.play();
              if (playButton) {
                playButton.classList.add("active");
              }
              if (p && typeof p.catch === "function") {
                p.catch((err) => {
                  if (err?.name !== "AbortError")
                    console.warn("play failed:", err);
                });
              }
            }
          } else {
            target.pause();
            if (playButton) {
              playButton.classList.remove("active");
            }
          }
        });
      },
      { threshold: [0, 0.2, 1] }
    );
    io.observe(video);
  }

  clickMuteVideo(event) {
    event.preventDefault();
    event.stopPropagation();
    const videoLocalElement = this.querySelector("video-local-shopable");
    if (!videoLocalElement) return;
    let video = videoLocalElement.querySelector("video");
    if (!video) {
      video = loadContentVideo(videoLocalElement);
      if (!video || video.nodeName !== "VIDEO") return;
      const isVideo = videoLocalElement.querySelector("video");
      this._isIntersectingVideo(isVideo);
    }
    video.muted = !video.muted;
    const muteButton = this.querySelector(".mute-button");
    if (muteButton) {
      muteButton.classList.toggle("active", !video.muted);
    }
  }

  clickPlayVideo(event) {
    event.preventDefault();
    event.stopPropagation();
    const videoLocalElement = this.querySelector("video-local-shopable");
    if (!videoLocalElement) return;
    let video = videoLocalElement.querySelector("video");
    if (!video) {
      video = loadContentVideo(videoLocalElement);
      if (!video || video.nodeName !== "VIDEO") return;
      const isVideo = videoLocalElement.querySelector("video");
      this._isIntersectingVideo(isVideo);
    }
    const playButton = this.querySelector(".play-button");
    const muteButton = this.querySelector(".mute-button");

    const allShopableItems =
      this.closest("shopable-video").querySelectorAll("shopable-item");

    allShopableItems.forEach((item) => {
      if (item !== this) {
        const otherVideoElement = item.querySelector(
          "video-local-shopable video"
        );
        const otherPlayButton = item.querySelector(".play-button");
        const otherMuteButton = item.querySelector(".mute-button");

        if (otherVideoElement) {
          if (!otherVideoElement.paused) {
            otherVideoElement.pause();
          }
          if (otherPlayButton) otherPlayButton.classList.remove("active");
          if (otherMuteButton) otherMuteButton.classList.remove("active");
        }
      }
    });

    if (video.paused) {
      video.muted = false;
      video
        .play()
        .then(() => {
          if (playButton) playButton.classList.add("active");
          if (muteButton) muteButton.classList.add("active");
        })
        .catch();
    } else {
      video.muted = true;
      video.pause();
      if (playButton) playButton.classList.remove("active");
      if (muteButton) muteButton.classList.remove("active");
    }
  }

  clickMuteVideoPopup(slide) {
    const muteButton = slide.querySelector(".mute-button");
    if (muteButton) {
      const newPlayButton = muteButton.cloneNode(true);
      muteButton.parentNode.replaceChild(newPlayButton, muteButton);
      newPlayButton.addEventListener("click", (event) => {
        const currentTarget = event.currentTarget;
        const videoLocal = currentTarget.closest(".modal-shopable_content");
        if (videoLocal && videoLocal.querySelector("video")) {
          const video = videoLocal.querySelector("video");
          if (video.muted == false) {
            video.muted = true;
            currentTarget.classList.remove("active");
          } else {
            video.muted = false;
            currentTarget.classList.add("active");
          }
        }
      });
    }
  }

  clickMuteVideoPopupMobile(slide) {
    const muteButton = slide.querySelector(".mute-button-mobile");
    if (muteButton) {
      const newPlayButton = muteButton.cloneNode(true);
      muteButton.parentNode.replaceChild(newPlayButton, muteButton);
      newPlayButton.addEventListener("click", (event) => {
        const currentTarget = event.currentTarget;
        const videoLocal = currentTarget.closest(".modal-shopable_content");
        if (videoLocal && videoLocal.querySelector("video")) {
          const video = videoLocal.querySelector("video");
          if (video.muted == false) {
            video.muted = true;
            currentTarget.classList.remove("active");
          } else {
            video.muted = false;
            currentTarget.classList.add("active");
          }
        }
      });
    }
  }

  clickPlayVideoPopup(slide) {
    const videoElement = slide.querySelector("video");
    if (videoElement) {
      const videoLocal = videoElement.closest("video-local");
      const playButton = videoLocal?.querySelector(".play-button-popup");

      if (videoElement._clickHandler) {
        videoElement.removeEventListener("click", videoElement._clickHandler);
        playButton.removeEventListener("click", videoElement._clickHandler);
      }

      const self = this;

      videoElement._clickHandler = function (event) {
        event.preventDefault();
        event.stopPropagation();

        if (videoElement.paused) {
          videoElement.play();
          if (playButton) playButton.classList.add("active");
          if (videoLocal) videoLocal.classList.remove("active");

          if (typeof self._createProgressBarForVideo === "function") {
            self._createProgressBarForVideo(videoElement);
          } else {
            const videoContainer =
              videoElement.closest(".video_inner") ||
              videoElement.parentElement;
            videoElement._progressBar = createVideoProgressBar(videoElement, {
              container: videoContainer,
              allowHide: true,
            });

            if (videoElement._progressBar) {
              videoElement._progressBar.show();
            }
          }
        } else {
          videoElement.pause();
          if (playButton) playButton.classList.remove("active");
          if (videoLocal) videoLocal.classList.add("active");

          if (videoElement._progressBar) {
            if (typeof videoElement._progressBar.destroy === "function") {
              videoElement._progressBar.destroy();
            } else {
              videoElement._progressBar.hide();
              const progressContainer =
                videoElement.parentElement.querySelector(".video-progress-bar");
              if (progressContainer) {
                progressContainer.remove();
              }
            }
            videoElement._progressBar = null;
          }
        }
      };
      videoElement.addEventListener("click", videoElement._clickHandler);
      playButton.addEventListener("click", videoElement._clickHandler);
    }
  }

  findAndActivateSlide(modalPopup, productId) {
    const swiperContainer = modalPopup.querySelector("slide-section");
    if (!swiperContainer || !swiperContainer.swiper) {
      modalPopup.removeAttribute("data-loading");
      return;
    }

    const clickedItem = document.querySelector(`[data-product="${productId}"]`);
    if (!clickedItem) {
      modalPopup.removeAttribute("data-loading");
      return;
    }

    const position = clickedItem.getAttribute("data-position");
    if (position !== null && !isNaN(parseInt(position))) {
      const slideIndex = parseInt(position);
      swiperContainer.swiper.slideTo(slideIndex, 0, false);
    } else {
      swiperContainer.swiper.slideTo(0, 0, false);
    }

    const nextButton = modalPopup.querySelector(
      ".modal-nav .swiper-button-next"
    );
    const prevButton = modalPopup.querySelector(
      ".modal-nav .swiper-button-prev"
    );

    const swiperPagination = modalPopup.querySelector(
      ".modal-pagination .swiper-pagination"
    );
    if (swiperPagination) {
      swiperContainer.swiper.params.pagination = {
        ...swiperContainer.swiper.params.pagination,
        el: swiperPagination,
        clickable: true,
        type: "custom",
        renderCustom: function (swiper, current, total) {
          return current + "/" + total;
        },
      };

      swiperContainer.swiper.pagination.destroy();
      swiperContainer.swiper.pagination.init();
      swiperContainer.swiper.pagination.render();
      swiperContainer.swiper.pagination.update();
    }

    if (nextButton && prevButton && swiperContainer.swiper.navigation) {
      const _self = this;
      _self.updateCurrentSlideId(modalPopup, swiperContainer);
      nextButton.setAttribute("tabindex", "0");
      prevButton.setAttribute("tabindex", "0");
      swiperContainer.swiper.navigation.nextEl = nextButton;
      swiperContainer.swiper.navigation.prevEl = prevButton;
      nextButton.addEventListener("click", (e) => {
        e.preventDefault();
        swiperContainer.swiper.slideNext();
        _self.updateCurrentSlideId(modalPopup, swiperContainer);
      });
      nextButton.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          swiperContainer.swiper.slideNext();
          _self.updateCurrentSlideId(modalPopup, swiperContainer);
        }
      });
      prevButton.addEventListener("click", (e) => {
        e.preventDefault();
        swiperContainer.swiper.slidePrev();
        _self.updateCurrentSlideId(modalPopup, swiperContainer);
      });
      prevButton.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          swiperContainer.swiper.slidePrev();
          _self.updateCurrentSlideId(modalPopup, swiperContainer);
        }
      });
      if (!swiperContainer._hasSlideChangeHandler) {
        swiperContainer.swiper.on("slideChange", () => {
          _self.updateCurrentSlideId(modalPopup, swiperContainer);
        });
        swiperContainer._hasSlideChangeHandler = true;
      }
    }
    this.updateSwiperState(modalPopup);

    const activeSlide =
      swiperContainer.swiper.slides[swiperContainer.swiper.activeIndex];
    if (activeSlide) {
      const activeVideo = activeSlide.querySelector("video");
      const videoSrc = activeVideo?.getAttribute("data-src");
      if (
        videoSrc &&
        (!activeVideo.src || activeVideo.src.indexOf(videoSrc) === -1)
      ) {
        activeVideo.src = videoSrc;
        activeVideo.load();
      }
      if (activeVideo) {
        if (!activeVideo.paused) {
          if (typeof this._createProgressBarForVideo === "function") {
            this._createProgressBarForVideo(activeVideo);
          } else {
            const videoContainer =
              activeVideo.closest(".video_inner") || activeVideo.parentElement;
            activeVideo._progressBar = createVideoProgressBar(activeVideo, {
              container: videoContainer,
              allowHide: true,
            });

            if (activeVideo._progressBar) {
              activeVideo._progressBar.show();
            }
          }
        } else {
          const playHandler = () => {
            if (typeof this._createProgressBarForVideo === "function") {
              this._createProgressBarForVideo(activeVideo);
            } else {
              const videoContainer =
                activeVideo.closest(".video_inner") ||
                activeVideo.parentElement;
              activeVideo._progressBar = createVideoProgressBar(activeVideo, {
                container: videoContainer,
                allowHide: true,
              });

              if (activeVideo._progressBar) {
                activeVideo._progressBar.show();
              }
            }

            activeVideo.removeEventListener("play", playHandler);
          };

          activeVideo.addEventListener("play", playHandler);
        }
      }
    }

    modalPopup.removeAttribute("data-loading");
  }

  handleSwipeability(modalPopup, swiperContainer) {
    if (!modalPopup || !swiperContainer || !swiperContainer.swiper) return;

    const hasPopupInfo =
      modalPopup.querySelector(".popup-information") !== null;

    const hasActivePopupInfo =
      modalPopup.querySelector(".popup-information.active") !== null;
    const mediaQuery = window.matchMedia("(max-width: 1024.98px)");
    const handleMediaQueryChange = (mediaQuery) => {
      if (mediaQuery.matches) {
        if (hasActivePopupInfo) {
          swiperContainer.swiper.allowTouchMove = false;
          swiperContainer.swiper.unsetGrabCursor();
        } else {
          swiperContainer.swiper.allowTouchMove = true;
          swiperContainer.swiper.setGrabCursor();
        }
      } else {
        if (hasPopupInfo) {
          swiperContainer.swiper.allowTouchMove = false;
          swiperContainer.swiper.unsetGrabCursor();
        } else {
          swiperContainer.swiper.allowTouchMove = true;
          swiperContainer.swiper.setGrabCursor();
        }
      }
    };
    handleMediaQueryChange(mediaQuery);
    mediaQuery.addEventListener("change", handleMediaQueryChange);
  }

  onShowPopupModal(event) {
    event.preventDefault();
    const clickedItem = this;
    const productId = clickedItem.getAttribute("data-product");
    const currentTarget = event.currentTarget;
    if (!productId) return;
    let modalPopup = document.querySelector("modal-popup");
    if (!modalPopup) {
      const shopable_video = this.closest(
        ".section-shopable-video"
      ).querySelector(".template");
      if (shopable_video) {
        const content = document.createElement("div");
        content.appendChild(
          shopable_video.content.firstElementChild.cloneNode(true)
        );
        NextSkyTheme.getBody().appendChild(
          content.querySelector("modal-popup")
        );
        NextSkyTheme.global.rootToFocus = this;
        modalPopup = document.querySelector("modal-popup");
        this.setupMobileActionButton(modalPopup);
        if (currentTarget.classList.contains("sticky-video")) {
          const rootElement = document.documentElement;
          rootElement.classList.add("open-modal-shopable-video");
          this._modalObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
              if (mutation.attributeName === "class") {
                const isModalOpen = rootElement.classList.contains(
                  "open-modal-shopable-video"
                );
                this.isModalOpen = isModalOpen;

                if (isModalOpen) {
                  this.classList.remove("active");
                  if (this._scrollHandler) {
                    window.removeEventListener("scroll", this._scrollHandler);
                  }
                } else {
                  if (this._scrollHandler) {
                    window.addEventListener("scroll", this._scrollHandler, {
                      passive: true,
                    });
                  }
                  if (!this.getStickyHiddenCookie()) {
                    this.classList.add("active");
                  }
                  if (this._modalObserver) {
                    this._modalObserver.disconnect();
                    this._modalObserver = null;
                  }
                }
              }
            });
          });
          this._modalObserver.observe(rootElement, {
            attributes: true,
            attributeFilter: ["class"],
          });
        }
      }
    }

    if (modalPopup) {
      this.isModalOpen = true;
      this.openVideo(event);
      modalPopup.setAttribute("data-loading", "true");
      modalPopup.setAttribute("data-current", productId);
      eventModal(modalPopup, "open", true);
      const swiperContainer = modalPopup.querySelector("slide-section");
      if (swiperContainer) {
        if (!swiperContainer.swiper) {
          setTimeout(() => {
            this.findAndActivateSlide(modalPopup, productId);
          }, 100);
        } else {
          this.findAndActivateSlide(modalPopup, productId);
        }
      } else {
        modalPopup.removeAttribute("data-loading");
      }
      new LazyLoader(".image-lazy-load");
    }
  }

  closeAllPopupInformation(modalPopup) {
    const popupInfo = modalPopup.querySelectorAll(".popup-information");
    popupInfo.forEach((info) => {
      if (info.classList.contains("active")) {
        info.classList.remove("active");
      }
    });
  }

  updateCurrentSlideId(modalPopup, swiperContainer) {
    if (!modalPopup || !swiperContainer || !swiperContainer.swiper) return;

    const _self = this;
    const activeIndex = swiperContainer.swiper.activeIndex;
    const activeSlide = swiperContainer.swiper.slides[activeIndex];

    if (activeSlide) {
      const productId =
        activeSlide.getAttribute("data-product-id") ||
        activeSlide
          .querySelector("[data-product-id]")
          ?.getAttribute("data-product-id");

      if (productId) {
        const buttonCloseModal = modalPopup.querySelector(".modal__close");
        if (buttonCloseModal.classList.contains("hidden-important")) {
          buttonCloseModal.classList.remove("hidden-important");
        }
        modalPopup.setAttribute("data-current", productId);
        _self.closeAllPopupInformation(modalPopup);
        const allSlides = swiperContainer.swiper.slides;
        allSlides.forEach((slide, index) => {
          const video = slide.querySelector("video");
          const videoLocal = slide.querySelector("video-local");
          const btnMute = videoLocal?.querySelector(".mute-button");
          const btnMuteMobile = slide.querySelector(".mute-button-mobile");
          const buttonCloseInformation = slide.querySelector(
            ".modal__close-information"
          );
          if (buttonCloseInformation) {
            buttonCloseInformation.classList.add("hidden-important");
          }
          if (video) {
            if (index === activeIndex) {
              video.muted = false;
              btnMute.classList.add("active");
              btnMuteMobile.classList.add("active");

              if (typeof _self._createProgressBarForVideo === "function") {
                const videoContext =
                  video.closest("modal-popup") ||
                  video.closest(".section-shopable-video");
                const contextVideos = videoContext
                  ? videoContext.querySelectorAll("video")
                  : [];
                contextVideos.forEach((v) => {
                  if (v !== video && v._progressBar) {
                    if (typeof v._progressBar.destroy === "function") {
                      v._progressBar.destroy();
                    } else {
                      v._progressBar.hide();
                      const progressContainer = v.parentElement.querySelector(
                        ".video-progress-bar"
                      );
                      if (progressContainer) {
                        progressContainer.remove();
                      }
                    }
                    v._progressBar = null;
                  }
                });
              }

              if (!video.paused) {
                if (typeof _self._createProgressBarForVideo === "function") {
                  _self._createProgressBarForVideo(video);
                } else {
                  const videoContainer =
                    video.closest(".video_inner") || video.parentElement;
                  video._progressBar = createVideoProgressBar(video, {
                    container: videoContainer,
                    allowHide: true,
                  });

                  if (video._progressBar) {
                    video._progressBar.show();
                  }
                }
              } else {
                video.play();
                if (video._playListenerForProgress) {
                  video.removeEventListener(
                    "play",
                    video._playListenerForProgress
                  );
                }

                video._playListenerForProgress = function () {
                  if (typeof _self._createProgressBarForVideo === "function") {
                    _self._createProgressBarForVideo(video);
                  } else {
                    const videoContainer =
                      video.closest(".video_inner") || video.parentElement;
                    video._progressBar = createVideoProgressBar(video, {
                      container: videoContainer,
                      allowHide: true,
                    });

                    if (video._progressBar) {
                      video._progressBar.show();
                    }
                  }

                  video.removeEventListener(
                    "play",
                    video._playListenerForProgress
                  );
                  video._playListenerForProgress = null;
                };

                video.addEventListener("play", video._playListenerForProgress, {
                  once: true,
                });
              }
            } else {
              video.muted = true;
              btnMute.classList.remove("active");
              btnMuteMobile.classList.remove("active");

              if (video._playListenerForProgress) {
                video.removeEventListener(
                  "play",
                  video._playListenerForProgress
                );
                video._playListenerForProgress = null;
              }

              if (video._progressBar) {
                if (typeof video._progressBar.destroy === "function") {
                  video._progressBar.destroy();
                } else {
                  video._progressBar.hide();
                  const progressContainer = video.parentElement.querySelector(
                    ".video-progress-bar"
                  );
                  if (progressContainer) {
                    progressContainer.remove();
                  }
                }
                video._progressBar = null;
              }
            }
          }
        });
        _self.clickPlayVideoPopup(activeSlide);
        _self.clickMuteVideoPopup(activeSlide);
        _self.clickMuteVideoPopupMobile(activeSlide);
        _self.handleSwipeability(modalPopup, swiperContainer);
      }
    }
  }

  _createProgressBarForVideo(video) {
    if (!video) return;
    const videoContext =
      video.closest("modal-popup") || video.closest(".section-shopable-video");
    const contextVideos = videoContext
      ? videoContext.querySelectorAll("video")
      : [];

    contextVideos.forEach((v) => {
      if (v !== video && v._progressBar) {
        if (typeof v._progressBar.destroy === "function") {
          v._progressBar.destroy();
        } else {
          v._progressBar.hide();
          const progressContainer = v.parentElement.querySelector(
            ".video-progress-bar"
          );
          if (progressContainer) {
            progressContainer.remove();
          }
        }
        v._progressBar = null;
      }
    });

    if (video._progressBar) {
      if (typeof video._progressBar.destroy === "function") {
        video._progressBar.destroy();
      } else {
        video._progressBar.hide();
        const progressContainer = video.parentElement.querySelector(
          ".video-progress-bar"
        );
        if (progressContainer) {
          progressContainer.remove();
        }
      }
      video._progressBar = null;
    }

    const videoContainer = video.closest(".video_inner") || video.parentElement;
    video._progressBar = createVideoProgressBar(video, {
      container: videoContainer,
      allowHide: true,
    });

    if (video._progressBar) {
      video._progressBar.show();
    }
  }
}
customElements.define("shopable-item", ShopableItem);

class PopupInformationHeader extends ShopableItem {
  constructor() {
    super();
    this.isDragging = false;
    this.startY = 0;
    this.currentY = 0;
    this.threshold = 100;

    this.startDrag = this.startDrag.bind(this);
    this.onDrag = this.onDrag.bind(this);
    this.endDrag = this.endDrag.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.headerElement = this;
    if (this.headerElement) {
      this.headerElement.addEventListener("touchstart", this.startDrag, {
        passive: true,
      });
      this.headerElement.addEventListener("touchmove", this.onDrag, {
        passive: false,
      });
      this.headerElement.addEventListener("touchend", this.endDrag);
      this.headerElement.addEventListener("mousedown", this.startDrag);
      document.addEventListener("mousemove", this.onDrag);
      document.addEventListener("mouseup", this.endDrag);
    }
  }

  disconnectedCallback() {
    if (this.headerElement) {
      this.headerElement.removeEventListener("touchstart", this.startDrag);
      this.headerElement.removeEventListener("touchmove", this.onDrag);
      this.headerElement.removeEventListener("touchend", this.endDrag);

      this.headerElement.removeEventListener("mousedown", this.startDrag);
      document.removeEventListener("mousemove", this.onDrag);
      document.removeEventListener("mouseup", this.endDrag);
    }
  }

  startDrag(e) {
    this.container = this.closest(".popup-information.active");
    if (!this.container) return;
    this.isDragging = true;
    this.startY = e.type.includes("mouse") ? e.clientY : e.touches[0].clientY;
    this.currentY = this.startY;
  }

  onDrag(e) {
    if (!this.isDragging || !this.container) return;

    e.preventDefault();
    this.currentY = e.type.includes("mouse") ? e.clientY : e.touches[0].clientY;
    const dragDistance = this.currentY - this.startY;

    if (dragDistance > 0) {
      this.container.style.transform = `translateY(${dragDistance}px)`;
    }
  }

  endDrag() {
    if (!this.isDragging || !this.container) return;
    const dragDistance = this.currentY - this.startY;

    if (dragDistance > this.threshold) {
      const modalPopup = this.container.closest("modal-popup");
      if (modalPopup) {
        const currentId = modalPopup.getAttribute("data-current");
        if (currentId) {
          const currentItem = modalPopup.querySelector(`#${currentId}`);
          if (currentItem) {
            const buttonCloseModal = modalPopup.querySelector(".modal__close");
            const buttonCloseInformation = currentItem.querySelector(
              ".modal__close-information"
            );
            const actionButton = modalPopup.querySelector(
              ".popup-information__mobile"
            );
            this.hidePopupInformation(this.container);
            if (actionButton) {
              actionButton.classList.remove("active");
            }
            if (buttonCloseInformation && buttonCloseModal) {
              buttonCloseInformation.classList.add("hidden-important");
              buttonCloseInformation.classList.remove("active");
              buttonCloseModal.classList.remove("hidden-important");
            }
            this.updateSwiperState(modalPopup);
          }
        }
      }
    } else {
      this.container.style.transform = "";
    }
    this.isDragging = false;
  }
}
customElements.define("popup-information-header", PopupInformationHeader);

function loadContentVideo(videoLocalElement) {
  if (!videoLocalElement) return null;
  if (
    !videoLocalElement.getAttribute("loaded") &&
    videoLocalElement.querySelector("template")
  ) {
    const content = document.createElement("div");
    content.appendChild(
      videoLocalElement
        .querySelector("template")
        .content.firstElementChild.cloneNode(true)
    );
    videoLocalElement.setAttribute("loaded", true);
    const video = content.querySelector("video")
      ? content.querySelector("video")
      : content.querySelector("iframe");
    const deferredElement = videoLocalElement.appendChild(video);
    const alt = deferredElement.getAttribute("alt");
    const img = deferredElement.querySelector("img");
    const videoElement = videoLocalElement.querySelector("video");
    if (videoElement) {
      videoElement.preload = "metadata";
    }

    if (alt && img) {
      img.setAttribute("alt", alt);
    }

    return deferredElement;
  }
  return null;
}
