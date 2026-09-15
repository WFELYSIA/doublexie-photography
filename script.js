const works = Array.isArray(window.PHOTOS) ? window.PHOTOS : [];

const gallery = document.querySelector("[data-gallery]");
const filterButtons = document.querySelectorAll("[data-filter]");
const lightbox = document.querySelector("[data-lightbox]");
const lightboxImage = document.querySelector("[data-lightbox-image]");
const lightboxCaption = document.querySelector("[data-lightbox-caption]");
const toast = document.querySelector("[data-toast]");
const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const photoCount = document.querySelector("[data-photo-count]");

let activeFilter = "all";
let currentIndex = 0;
let visibleWorks = [...works];

function buildGallery() {
  gallery.innerHTML = "";
  if (photoCount) photoCount.textContent = `${works.length} 张样片`;

  works.forEach((work, index) => {
    const item = document.createElement("button");
    item.className = "gallery-item";
    item.type = "button";
    item.dataset.category = work.category;
    item.setAttribute("aria-label", `查看${work.caption}`);

    const image = document.createElement("img");
    image.src = work.src;
    image.alt = work.caption;
    image.loading = "lazy";

    const caption = document.createElement("span");
    caption.className = "gallery-caption";
    const captionText = document.createElement("span");
    captionText.textContent = work.caption;
    const tag = document.createElement("span");
    tag.className = "gallery-tag";
    tag.textContent = work.tag;
    caption.append(captionText, tag);

    item.append(image, caption);
    item.addEventListener("click", () => openLightbox(index));
    gallery.append(item);
  });

  applyFilter(activeFilter, false);
}

function applyFilter(filter, animate = true) {
  activeFilter = filter;
  visibleWorks = works.filter((work) => filter === "all" || work.category === filter);

  filterButtons.forEach((button) => {
    const isActive = button.dataset.filter === filter;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  document.querySelectorAll(".gallery-item").forEach((item) => {
    const show = filter === "all" || item.dataset.category === filter;
    item.classList.toggle("hidden", !show);
    if (animate) {
      item.style.animation = "none";
      void item.offsetWidth;
      item.style.animation = "rise-in 0.4s ease both";
    }
  });
}

function openLightbox(index) {
  const target = works[index];
  currentIndex = visibleWorks.indexOf(target);
  if (currentIndex === -1) currentIndex = 0;
  const work = visibleWorks[currentIndex];
  lightboxImage.src = work.src;
  lightboxImage.alt = work.caption;
  lightboxCaption.textContent = `${work.caption} · ${work.tag}`;
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function stepLightbox(direction) {
  currentIndex = (currentIndex + direction + visibleWorks.length) % visibleWorks.length;
  const work = visibleWorks[currentIndex];
  lightboxImage.src = work.src;
  lightboxImage.alt = work.caption;
  lightboxCaption.textContent = `${work.caption} · ${work.tag}`;
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => applyFilter(button.dataset.filter));
});

document.querySelector("[data-lightbox-close]").addEventListener("click", closeLightbox);
document.querySelector("[data-lightbox-prev]").addEventListener("click", () => stepLightbox(-1));
document.querySelector("[data-lightbox-next]").addEventListener("click", () => stepLightbox(1));

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});

document.addEventListener("keydown", (event) => {
  if (!lightbox.classList.contains("is-open")) return;
  if (event.key === "Escape") closeLightbox();
  if (event.key === "ArrowLeft") stepLightbox(-1);
  if (event.key === "ArrowRight") stepLightbox(1);
});

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 1800);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast("已复制到剪贴板");
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.append(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
    showToast("已复制到剪贴板");
  }
}

document.querySelectorAll("[data-copy]").forEach((button) => {
  button.addEventListener("click", () => copyText(button.dataset.copy));
});

menuToggle.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(open));
});

nav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

window.addEventListener("scroll", () => {
  header.classList.toggle("is-scrolled", window.scrollY > 24);
});

document.querySelector("[data-year]").textContent = new Date().getFullYear();

buildGallery();