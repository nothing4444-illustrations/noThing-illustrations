const illustrationData = [
  { fileName: "Cartethiya - Wuthering Waves.png", title: "Cartethiya - Wuthering Waves", date: "2026", description: "2026" },
  { fileName: "Aphelios - League of Legends.png", title: "Aphelios - League of Legends", date: "2025", description: "2025" },
  { fileName: "Eminence in Shadow - Alpha.png", title: "Eminence in Shadow - Alpha", date: "2025", description: "2025" },
  { fileName: "Goku.png", title: "Son Goku - Dragon Ball Super", date: "2026", description: "2026" },
  { fileName: "Illustration.png", title: "OC - Lilith", date: "2025", description: "2025" },
  { fileName: "Jane Doe ZZZ.png", title: "Jane Doe - Zenless Zone Zero", date: "2026", description: "2026" },
  { fileName: "White Hair.png", title: "OC - Lyra", date: "2026", description: "2026" }
];

window.addEventListener("DOMContentLoaded", () => {
  const galleryRow = document.querySelector(".gallery-row");
  const zoomWindow = document.querySelector(".zoom-window");
  const zoomImage = zoomWindow?.querySelector(".zoom-window-image");
  const zoomTitle = zoomWindow?.querySelector(".zoom-window-title");
  const zoomDescription = zoomWindow?.querySelector(".zoom-window-description");
  const zoomClose = zoomWindow?.querySelector(".zoom-window-close");

  if (!galleryRow) {
    return;
  }

  galleryRow.innerHTML = "";

  const imagePromises = illustrationData.map(({ fileName, title, date, description }) => {
    return new Promise((resolve) => {
      const img = document.createElement("img");
      img.src = `images/projects_illustrations/${fileName}`;
      img.className = "illustrations";
      img.alt = title;

      img.addEventListener("load", () => {
        resolve({ img, title, date, description, width: img.naturalWidth || 0 });
      });

      img.addEventListener("error", () => {
        resolve({ img, title, date, description, width: 0 });
      });
    });
  });

  Promise.all(imagePromises).then((images) => {
    const loadedCount = images.filter((item) => item.width > 0).length;
    console.log(`Illustration gallery loaded: ${images.length} images, ${loadedCount} succeeded`);

    images.sort((a, b) => a.width - b.width);
    images.forEach((item, index) => {
      const card = document.createElement("div");
      card.className = "illustration-card";

      const overlay = document.createElement("div");
      overlay.className = "illustration-overlay";
      overlay.innerHTML = `
        <h1 class="illustration-overlay-title">${item.title}</h1>
        <h2 class="illustration-overlay-date">${item.date}</h2>
      `;

      item.img.alt = item.title;
      card.appendChild(item.img);
      card.appendChild(overlay);
      galleryRow.appendChild(card);

      card.addEventListener("click", () => {
        if (!zoomWindow || !zoomImage || !zoomTitle || !zoomDescription) {
          return;
        }

        zoomImage.src = item.img.src;
        zoomImage.alt = item.title;
        zoomTitle.textContent = item.title;
        zoomDescription.textContent = item.description || "Texto editável para esta ilustração.";
        zoomWindow.classList.add("active");
        zoomWindow.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
      });
    });

    const closeZoomWindow = () => {
      if (!zoomWindow) {
        return;
      }

      zoomWindow.classList.remove("active");
      zoomWindow.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    };

    zoomClose?.addEventListener("click", closeZoomWindow);
    zoomWindow?.addEventListener("click", (event) => {
      if (event.target === zoomWindow) {
        closeZoomWindow();
      }
    });

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && zoomWindow?.classList.contains("active")) {
        closeZoomWindow();
      }
    });
  });
});

