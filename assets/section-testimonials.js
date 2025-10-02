import { SlideSection } from "@NextSkyTheme/slide";

class TestimonialsSlide extends SlideSection {
  constructor() {
    super();
    this.initThumb();
  }

  initThumb() {
    const sectionId = this.dataset.sectionId;
    const thumbsContainer = document.querySelector(
      `#testimonials-thumb-swiper-${sectionId}`
    );
    const itemDesktop = thumbsContainer?.dataset.desktop
      ? thumbsContainer?.dataset.desktop
      : 4;
    const itemTablet = thumbsContainer?.dataset.tablet
      ? thumbsContainer?.dataset.tablet
      : "";

    if (!thumbsContainer || !this.swiper) return;

    if (!thumbsContainer.classList.contains("swiper-container")) {
      thumbsContainer.classList.add("swiper-container");
    }
    this.thumbsSwiper = new Swiper(thumbsContainer, {
      slidesPerView: 1,
      spaceBetween: 60,
      watchSlidesProgress: true,
      watchSlidesVisibility: true,
      grabCursor: true,
      loop: true,
      allowTouchMove: false,
      slideActiveClass: "swiper-slide-thumb-active",
      breakpoints: {
        768: {
          slidesPerView: itemTablet,
        },
        1025: {
          slidesPerView: itemDesktop,
        },
      },
      on: {
        init: function() {
          this.slides.forEach((slide, index) => {
            slide.setAttribute('tabindex',0);
          });
        },
      }
    });

    this.swiper.thumbs.swiper = this.thumbsSwiper;
    this.swiper.thumbs.init();
    const section = this.closest(".section-testimonials");
    const nextEl = section.querySelector(
      ".testimonial-swiper-action .swiper-button-next"
    );
    const prevEl = section.querySelector(
      ".testimonial-swiper-action .swiper-button-prev"
    );
    if (nextEl) {
      nextEl.setAttribute("tabindex", "0");
      this.swiper.navigation.nextEl = nextEl;
      nextEl.addEventListener("click", (e) => {
        e.preventDefault();
        this.swiper.slideNext();
      });
      nextEl.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.swiper.slideNext();
        }
      });
    }
    if (prevEl) {
      prevEl.setAttribute("tabindex", "0");
      this.swiper.navigation.prevEl = prevEl;
      prevEl.addEventListener("click", (e) => {
        e.preventDefault();
        this.swiper.slidePrev();
      });
      prevEl.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.swiper.slidePrev();
        }
      });
    }
    this.addKeyboardNavigationToSlides();
    this.swiper.on("slideChangeTransitionEnd", () => {
      this.swiper.thumbs.update();
    });
  }

  addKeyboardNavigationToSlides() {
    if (!this.thumbsSwiper) return;
    setTimeout(() => {
      const slides = this.thumbsSwiper.slides;
      slides.forEach(slide => {
        slide.addEventListener('keydown', (e) => {
          const key = e.key;
          switch (key) {
            case 'Enter':
            case ' ':
              e.preventDefault();
              const realIndex = parseInt(slide.dataset.swiperSlideIndex);
              this.thumbsSwiper.slideTo(realIndex);
              this.swiper.slideTo(realIndex);
              break;
          }
        });
      });
    }, 100);
  }
}
customElements.define("testimonial-slide", TestimonialsSlide);
