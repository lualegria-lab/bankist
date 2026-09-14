'use strict';

///////////////////////////////////////
// Shared preferences

const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;
const scrollBehavior = prefersReducedMotion ? 'auto' : 'smooth';

///////////////////////////////////////
// Modal window

const modal = document.querySelector('.modal');
const overlay = document.querySelector('.overlay');
const btnCloseModal = document.querySelector('.btn--close-modal');
const btnsOpenModal = document.querySelectorAll('.btn--show-modal');
const modalForm = document.querySelector('.modal__form');
const modalMessage = document.querySelector('.modal__message');
const focusableSelectors =
  'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])';

let lastFocusedElement;

const getFocusableModalElements = function () {
  return [...modal.querySelectorAll(focusableSelectors)].filter(
    el => !el.disabled && el.offsetParent !== null
  );
};

const openModal = function (e) {
  e?.preventDefault();
  lastFocusedElement = document.activeElement;

  modal.classList.remove('hidden');
  overlay.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  modalMessage.textContent = '';

  getFocusableModalElements()[0]?.focus();
};

const closeModal = function (e) {
  e?.preventDefault();

  modal.classList.add('hidden');
  overlay.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');

  lastFocusedElement?.focus();
};

const trapModalFocus = function (e) {
  if (e.key !== 'Tab' || modal.classList.contains('hidden')) return;

  const focusableElements = getFocusableModalElements();
  if (!focusableElements.length) return;

  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements.at(-1);

  if (e.shiftKey && document.activeElement === firstFocusable) {
    e.preventDefault();
    lastFocusable.focus();
  }

  if (!e.shiftKey && document.activeElement === lastFocusable) {
    e.preventDefault();
    firstFocusable.focus();
  }
};

btnsOpenModal.forEach(btn => btn.addEventListener('click', openModal));

btnCloseModal.addEventListener('click', closeModal);
overlay.addEventListener('click', closeModal);

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
    closeModal(e);
    return;
  }

  trapModalFocus(e);
});

modalForm.addEventListener('submit', function (e) {
  e.preventDefault();

  if (!modalForm.checkValidity()) {
    modalForm.reportValidity();
    return;
  }

  modalForm.reset();
  modalMessage.textContent = 'Thanks! We will be in touch shortly.';
});

///////////////////////////////////////
// Smooth scrolling

const btnScrollTo = document.querySelector('.btn--scroll-to');
const section1 = document.querySelector('#section--1');

btnScrollTo.addEventListener('click', function () {
  section1.scrollIntoView({ behavior: scrollBehavior });
});

const scrollToSection = function (e) {
  const link = e.target.closest('a[href^="#section"]');
  if (!link) return;

  const targetSection = document.querySelector(link.getAttribute('href'));
  if (!targetSection) return;

  e.preventDefault();
  targetSection.scrollIntoView({ behavior: scrollBehavior });
};

// Page navigation
document.querySelector('.nav__links').addEventListener('click', scrollToSection);
document.querySelector('.footer__nav').addEventListener('click', scrollToSection);

///////////////////////////////////////
// Tabbed component

const tabs = document.querySelectorAll('.operations__tab');
const tabsContainer = document.querySelector('.operations__tab-container');
const tabsContent = document.querySelectorAll('.operations__content');

const activateTab = function (clicked) {
  const targetPanel = document.getElementById(
    clicked.getAttribute('aria-controls')
  );

  tabs.forEach(tab => {
    const isActive = tab === clicked;
    tab.classList.toggle('operations__tab--active', isActive);
    tab.setAttribute('aria-selected', isActive);
    tab.setAttribute('tabindex', isActive ? '0' : '-1');
  });

  tabsContent.forEach(content => {
    content.classList.remove('operations__content--active');
    content.hidden = true;
  });

  targetPanel.classList.add('operations__content--active');
  targetPanel.hidden = false;
};

tabsContainer.addEventListener('click', function (e) {
  const clicked = e.target.closest('.operations__tab');
  if (!clicked) return;

  activateTab(clicked);
});

tabsContainer.addEventListener('keydown', function (e) {
  const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
  if (!keys.includes(e.key)) return;

  const currentIndex = [...tabs].indexOf(document.activeElement);
  if (currentIndex < 0) return;

  e.preventDefault();

  let nextIndex = currentIndex;
  if (e.key === 'ArrowRight') nextIndex = (currentIndex + 1) % tabs.length;
  if (e.key === 'ArrowLeft')
    nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
  if (e.key === 'Home') nextIndex = 0;
  if (e.key === 'End') nextIndex = tabs.length - 1;

  tabs[nextIndex].focus();
  activateTab(tabs[nextIndex]);
});

activateTab(document.querySelector('.operations__tab--active'));

///////////////////////////////////////
// Menu fade animation

const nav = document.querySelector('.nav');

const handleHover = function (e) {
  if (!e.target.classList.contains('nav__link')) return;

  const link = e.target;
  const siblings = link.closest('.nav').querySelectorAll('.nav__link');
  const logo = link.closest('.nav').querySelector('img');

  siblings.forEach(el => {
    if (el !== link) el.style.opacity = this;
  });
  logo.style.opacity = this;
};

// Passing "argument" into handler
nav.addEventListener('mouseover', handleHover.bind(0.5));
nav.addEventListener('mouseout', handleHover.bind(1));

///////////////////////////////////////
// Sticky navigation

const header = document.querySelector('.header');
let headerObserver;

const stickyNav = function (entries) {
  const [entry] = entries;

  if (!entry.isIntersecting) nav.classList.add('sticky');
  else nav.classList.remove('sticky');
};

const observeHeader = function () {
  headerObserver?.disconnect();

  const navHeight = nav.getBoundingClientRect().height;
  headerObserver = new IntersectionObserver(stickyNav, {
    root: null,
    threshold: 0,
    rootMargin: `-${navHeight}px 0px 0px 0px`,
  });
  headerObserver.observe(header);
};

if ('IntersectionObserver' in window) {
  observeHeader();
  window.addEventListener('resize', observeHeader);
} else {
  nav.classList.add('sticky');
}

///////////////////////////////////////
// Reveal sections

const allSections = document.querySelectorAll('.section');
const initialTargetSection = window.location.hash
  ? document.querySelector(window.location.hash)
  : null;

if ('IntersectionObserver' in window && !prefersReducedMotion) {
  const revealSection = function (entries, observer) {
    const [entry] = entries;

    if (!entry.isIntersecting) return;

    entry.target.classList.remove('section--hidden');
    observer.unobserve(entry.target);
  };

  const sectionObserver = new IntersectionObserver(revealSection, {
    root: null,
    threshold: 0.15,
  });

  allSections.forEach(function (section) {
    sectionObserver.observe(section);
    if (section === initialTargetSection) return;

    section.classList.add('section--hidden');
  });
}

if (initialTargetSection?.classList.contains('section')) {
  window.addEventListener(
    'load',
    function () {
      initialTargetSection.scrollIntoView({ behavior: 'auto' });
    },
    { once: true }
  );
}

///////////////////////////////////////
// Lazy loading images

const imgTargets = document.querySelectorAll('img[data-src]');

const loadImage = function (img) {
  const removeLazyBlur = function () {
    img.classList.remove('lazy-img');
  };

  img.addEventListener('load', removeLazyBlur, { once: true });
  img.addEventListener('error', removeLazyBlur, { once: true });
  img.src = img.dataset.src;
};

const loadImg = function (entries, observer) {
  const [entry] = entries;
  if (!entry.isIntersecting) return;

  loadImage(entry.target);
  observer.unobserve(entry.target);
};

if ('IntersectionObserver' in window) {
  const imgObserver = new IntersectionObserver(loadImg, {
    root: null,
    threshold: 0,
    rootMargin: '200px 0px',
  });

  imgTargets.forEach(img => imgObserver.observe(img));
} else {
  imgTargets.forEach(loadImage);
}

///////////////////////////////////////
// Slider

const slider = function () {
  const sliderElement = document.querySelector('.slider');
  const slides = document.querySelectorAll('.slide');
  const btnLeft = document.querySelector('.slider__btn--left');
  const btnRight = document.querySelector('.slider__btn--right');
  const dotContainer = document.querySelector('.dots');

  let curSlide = 0;
  const maxSlide = slides.length;

  const createDots = function () {
    slides.forEach(function (_, i) {
      dotContainer.insertAdjacentHTML(
        'beforeend',
        `<button class="dots__dot" type="button" data-slide="${i}" aria-label="Show testimonial ${
          i + 1
        }"></button>`
      );
    });
  };

  const activateDot = function (slide) {
    document.querySelectorAll('.dots__dot').forEach((dot, i) => {
      const isActive = i === slide;
      dot.classList.toggle('dots__dot--active', isActive);
      dot.setAttribute('aria-current', isActive ? 'true' : 'false');
    });
  };

  const goToSlide = function (slide) {
    slides.forEach((s, i) => {
      s.style.transform = `translateX(${100 * (i - slide)}%)`;
      s.setAttribute('aria-hidden', i === slide ? 'false' : 'true');
    });
  };

  const nextSlide = function () {
    curSlide = curSlide === maxSlide - 1 ? 0 : curSlide + 1;

    goToSlide(curSlide);
    activateDot(curSlide);
  };

  const prevSlide = function () {
    curSlide = curSlide === 0 ? maxSlide - 1 : curSlide - 1;

    goToSlide(curSlide);
    activateDot(curSlide);
  };

  const init = function () {
    goToSlide(0);
    createDots();
    activateDot(0);
  };
  init();

  btnRight.addEventListener('click', nextSlide);
  btnLeft.addEventListener('click', prevSlide);

  sliderElement.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prevSlide();
    }

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextSlide();
    }
  });

  dotContainer.addEventListener('click', function (e) {
    if (!e.target.classList.contains('dots__dot')) return;

    curSlide = Number(e.target.dataset.slide);
    goToSlide(curSlide);
    activateDot(curSlide);
  });
};
slider();
