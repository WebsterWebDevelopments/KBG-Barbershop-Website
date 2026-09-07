/* ==========================================================================
   KBG Barbershop — script.js
   Vanilla JS only: mobile nav, scroll reveal, gallery lightbox,
   and booking form -> mailto generation.
   ========================================================================== */

// ---------------------------------------------------------------------------
// Add the KBG Barbershop booking email address between the quotation marks.
// Once this is set, the "Book appointment" button will automatically open
// a pre-filled email instead of showing the "call to book" fallback message.
// No other code changes are needed.
const BUSINESS_EMAIL = "";
// ---------------------------------------------------------------------------

const BUSINESS_PHONE_DISPLAY = "+1 832-989-7577";
const BUSINESS_PHONE_TEL = "+18329897577";

document.addEventListener("DOMContentLoaded", () => {
  initMobileNav();
  initSmoothScrollClose();
  initHeroEntrance();
  initScrollReveal();
  initGalleryLightbox();
  initBookingForm();
});

/* ---------------------------------------------------------------------------
   Mobile navigation toggle
--------------------------------------------------------------------------- */
function initMobileNav() {
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("navMenu");
  if (!toggle || !menu) return;

  toggle.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  });
}

// Close the mobile menu whenever a nav link is used (smooth scroll is
// handled natively via CSS `scroll-behavior: smooth` and the links' hrefs).
function initSmoothScrollClose() {
  const menu = document.getElementById("navMenu");
  const toggle = document.getElementById("navToggle");
  if (!menu || !toggle) return;

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menu.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
    });
  });
}

/* ---------------------------------------------------------------------------
   Hero entrance — a single orchestrated reveal on page load.
   (CSS hides .reveal-item elements only when <html> has the "js" class,
   set inline before the page body renders — see index.html. Here we just
   add "is-visible" on a stagger to play the entrance.)
--------------------------------------------------------------------------- */
function initHeroEntrance() {
  const heroItems = document.querySelectorAll(".hero .reveal-item");
  heroItems.forEach((el, i) => {
    setTimeout(() => {
      el.classList.add("is-visible");
    }, 150 + i * 140);
  });
}

/* ---------------------------------------------------------------------------
   Scroll reveal for section headers / content blocks (outside the hero)
--------------------------------------------------------------------------- */
function initScrollReveal() {
  const items = document.querySelectorAll(".reveal-item:not(.hero .reveal-item)");

  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );

  items.forEach((el) => observer.observe(el));
}

/* ---------------------------------------------------------------------------
   Gallery lightbox
--------------------------------------------------------------------------- */
function initGalleryLightbox() {
  const items = Array.from(document.querySelectorAll(".gallery-item"));
  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightboxImage");
  const closeBtn = document.getElementById("lightboxClose");
  const prevBtn = document.getElementById("lightboxPrev");
  const nextBtn = document.getElementById("lightboxNext");
  if (!items.length || !lightbox || !lightboxImage) return;

  // Build a full-size image list from each gallery item's thumbnail,
  // requesting a larger width from the image source for the lightbox view.
  const slides = items.map((item) => {
    const img = item.querySelector("img");
    const baseSrc = img.getAttribute("src").split("?")[0];
    return {
      src: `${baseSrc}?auto=format&fit=crop&w=1800&q=80`,
      alt: img.getAttribute("alt") || "",
    };
  });

  let currentIndex = 0;
  let lastFocusedElement = null;

  function openLightbox(index) {
    currentIndex = index;
    updateSlide();
    lastFocusedElement = document.activeElement;
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    closeBtn.focus();
    document.addEventListener("keydown", handleKeydown);
  }

  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = "";
    document.removeEventListener("keydown", handleKeydown);
    if (lastFocusedElement) lastFocusedElement.focus();
  }

  function updateSlide() {
    const slide = slides[currentIndex];
    lightboxImage.src = slide.src;
    lightboxImage.alt = slide.alt;
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % slides.length;
    updateSlide();
  }

  function showPrev() {
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    updateSlide();
  }

  function handleKeydown(e) {
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") showNext();
    if (e.key === "ArrowLeft") showPrev();
  }

  items.forEach((item, index) => {
    item.addEventListener("click", () => openLightbox(index));
  });

  closeBtn.addEventListener("click", closeLightbox);
  nextBtn.addEventListener("click", showNext);
  prevBtn.addEventListener("click", showPrev);

  // Clicking the dark backdrop (outside the image frame) closes the lightbox.
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });
}

/* ---------------------------------------------------------------------------
   Booking form -> validation + mailto generation
--------------------------------------------------------------------------- */
function initBookingForm() {
  const form = document.getElementById("bookingForm");
  const status = document.getElementById("formStatus");
  if (!form || !status) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    status.textContent = "";
    status.removeAttribute("data-state");

    const fields = {
      fullName: form.fullName.value.trim(),
      phone: form.phone.value.trim(),
      email: form.email.value.trim(),
      date: form.date.value,
      time: form.time.value,
      service: form.service.value,
      notes: form.notes.value.trim(),
    };

    const missing = Object.entries(fields).filter(([key, value]) => key !== "notes" && !value);

    if (missing.length > 0) {
      status.textContent = "Please fill in all required fields before booking.";
      status.setAttribute("data-state", "error");
      const firstMissingField = form.querySelector(`[name="${missing[0][0]}"]`);
      if (firstMissingField) firstMissingField.focus();
      return;
    }

    if (!BUSINESS_EMAIL) {
      status.innerHTML =
        `Online booking email is currently being configured. Please call KBG Barbershop at ` +
        `<a href="tel:${BUSINESS_PHONE_TEL}">${BUSINESS_PHONE_DISPLAY}</a> to book an appointment.`;
      status.setAttribute("data-state", "fallback");
      return;
    }

    const subject = "New Appointment Request – KBG Barbershop";
    const body =
      `Name: ${fields.fullName}\n` +
      `Phone: ${fields.phone}\n` +
      `Email: ${fields.email}\n` +
      `Preferred Date: ${fields.date}\n` +
      `Preferred Time: ${fields.time}\n` +
      `Service: ${fields.service}\n\n` +
      `Additional Notes:\n${fields.notes || "None"}`;

    const mailtoLink = `mailto:${BUSINESS_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.location.href = mailtoLink;

    status.textContent = "Opening your email app with your appointment details filled in...";
    status.setAttribute("data-state", "success");
  });
}
