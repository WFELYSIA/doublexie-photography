const STORAGE_KEY = "xiexie-photo-overrides-v1";
const defaultWorks = Array.isArray(window.PHOTOS) ? window.PHOTOS : [];

const gallery = document.querySelector("[data-gallery]");
const filterButtons = document.querySelectorAll("[data-filter]");
const lightbox = document.querySelector("[data-lightbox]");
const lightboxImage = document.querySelector("[data-lightbox-image]");
const lightboxCaption = document.querySelector("[data-lightbox-caption]");
const toast = document.querySelector("[data-toast]");
const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const manager = document.querySelector("[data-manager]");
const managerGrid = document.querySelector("[data-manager-grid]");
const manageButton = document.querySelector("[data-manage-photos]");
const addPhotosInput = document.querySelector("[data-add-photos]");
const addCategory = document.querySelector("[data-add-category]");
const resetPhotosButton = document.querySelector("[data-reset-photos]");
const photoCount = document.querySelector("[data-photo-count]");

let activeFilter = "all";
let currentIndex = 0;
let works = loadWorks();
let visibleWorks = [...works];

function loadWorks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved) && saved.length) {
      return saved.filter((item) => item && typeof item.src === "string");
    }
  } catch {
    // Ignore malformed local overrides and fall back to defaults.
  }
  return [...defaultWorks];
}

function persistWorks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(works));
  } catch {
    showToast("图片过多，无法在本机保存");
  }
}

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
  if (lightbox.classList.contains("is-open")) {
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") stepLightbox(-1);
    if (event.key === "ArrowRight") stepLightbox(1);
    return;
  }

  if (manager.classList.contains("is-open") && event.key === "Escape") {
    closeManager();
  }
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

function openManager() {
  renderManager();
  manager.classList.add("is-open");
  manager.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeManager() {
  manager.classList.remove("is-open");
  manager.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function renderManager() {
  managerGrid.innerHTML = "";

  works.forEach((work, index) => {
    const item = document.createElement("article");
    item.className = "manager-item";

    const preview = document.createElement("img");
    preview.src = work.src;
    preview.alt = work.caption;

    const info = document.createElement("div");
    info.className = "manager-item-info";
    const caption = document.createElement("strong");
    caption.textContent = work.caption;
    const tag = document.createElement("span");
    tag.textContent = work.tag;
    info.append(caption, tag);

    const actions = document.createElement("div");
    actions.className = "manager-item-actions";

    const replaceLabel = document.createElement("label");
    replaceLabel.className = "manager-action";
    replaceLabel.textContent = "替换";
    const replaceInput = document.createElement("input");
    replaceInput.type = "file";
    replaceInput.accept = "image/*";
    replaceInput.hidden = true;
    replaceInput.dataset.replaceIndex = String(index);
    replaceLabel.append(replaceInput);

    const removeButton = document.createElement("button");
    removeButton.className = "manager-action manager-action-danger";
    removeButton.type = "button";
    removeButton.textContent = "删除";

    actions.append(replaceLabel, removeButton);
    item.append(preview, info, actions);

    replaceInput.addEventListener("change", () => handleReplace(index, replaceInput));
    removeButton.addEventListener("click", () => handleRemove(index));
    managerGrid.append(item);
  });
}

async function handleReplace(index, input) {
  const file = input.files && input.files[0];
  if (!file) return;
  const dataUrl = await compressImage(file);
  if (!dataUrl) return;
  works[index] = {
    ...works[index],
    src: dataUrl,
  };
  persistWorks();
  buildGallery();
  renderManager();
  showToast("样片已替换");
}

async function handleAdd(files) {
  const category = addCategory.value === "composite" ? "composite" : "scene";
  const tag = category === "composite" ? "合成" : "场照";
  let added = 0;

  for (const file of files) {
    const dataUrl = await compressImage(file);
    if (!dataUrl) continue;
    works.push({
      src: dataUrl,
      category,
      tag,
      caption: `新增样片 ${String(works.length + 1).padStart(2, "0")}`,
    });
    added += 1;
  }

  if (added) {
    persistWorks();
    buildGallery();
    renderManager();
    showToast(`已添加 ${added} 张样片`);
  }
  addPhotosInput.value = "";
}

function handleRemove(index) {
  works.splice(index, 1);
  persistWorks();
  buildGallery();
  renderManager();
  showToast("样片已删除");
}

function compressImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const maxWidth = 1800;
        const scale = Math.min(1, maxWidth / image.naturalWidth);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(image.naturalWidth * scale);
        canvas.height = Math.round(image.naturalHeight * scale);
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.84));
      };
      image.onerror = () => {
        showToast("图片读取失败，请换一张重试");
        resolve("");
      };
      image.src = reader.result;
    };
    reader.onerror = () => {
      showToast("图片读取失败，请换一张重试");
      resolve("");
    };
    reader.readAsDataURL(file);
  });
}

manageButton.addEventListener("click", openManager);
document.querySelectorAll("[data-manager-close]").forEach((button) => {
  button.addEventListener("click", closeManager);
});

addPhotosInput.addEventListener("change", () => {
  if (addPhotosInput.files && addPhotosInput.files.length) {
    handleAdd([...addPhotosInput.files]);
  }
});

resetPhotosButton.addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  works = [...defaultWorks];
  buildGallery();
  renderManager();
  showToast("已恢复默认例图");
});

document.querySelector("[data-year]").textContent = new Date().getFullYear();

buildGallery();
