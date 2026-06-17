const illustrationData = [
  { fileName: "Faster.mp4", title: "Nissan GTR R35", date: "2023", description: "2023" },
  { fileName: "katana.png", title: "Katana (Saya)", date: "2024", description: "2024" },
  { fileName: "katana2.png", title: "Katana", date: "2024", description: "2024" }
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
      const isVideo = fileName.toLowerCase().endsWith('.mp4') || fileName.toLowerCase().endsWith('.webm');
      let media;

      if (isVideo) {
        const canvas = document.createElement("canvas");
        canvas.className = "illustrations";
        

        const video = document.createElement("video");
        video.src = `images/projects_3d_models/${fileName}`;
        video.muted = true;
        video.loop = true;
        video.style.display = "none";
        video.preload = "metadata";

        canvas.videoElement = video;

        let videoLoaded = false;
        let isPlaying = false;
        let renderAnimationId = null;

        const renderFrame = () => {
          if (videoLoaded && video.readyState >= video.HAVE_FUTURE_DATA) {
            const ctx = canvas.getContext("2d");
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          }
          if (isPlaying) {
            renderAnimationId = requestAnimationFrame(renderFrame);
          }
        };

        const startRendering = () => {
          if (!isPlaying && videoLoaded) {
            isPlaying = true;
            video.play().catch(() => {});
            renderFrame();
          }
        };

        const stopRendering = () => {
          isPlaying = false;
          if (renderAnimationId) {
            cancelAnimationFrame(renderAnimationId);
            renderAnimationId = null;
          }
        };

        video.addEventListener("loadedmetadata", () => {
          videoLoaded = true;
          const aspectRatio = video.videoWidth / video.videoHeight;
          const canvasHeight = canvas.offsetHeight || 40 * window.innerHeight / 100;
          canvas.height = canvasHeight;
          canvas.width = canvasHeight * aspectRatio;
        });

        video.addEventListener("error", () => {
          resolve({ img: canvas, title, date, description, width: 0 });
        });

        const observerOptions = {
          root: null,
          rootMargin: "50px",
          threshold: 0.01
        };

        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              if (videoLoaded) {
                startRendering();
              }
            } else {
              stopRendering();
            }
          });
        }, observerOptions);

        video.addEventListener("loadedmetadata", () => {
          videoLoaded = true;
          const aspectRatio = video.videoWidth / video.videoHeight;
          const canvasHeight = canvas.offsetHeight || 40 * window.innerHeight / 100;
          canvas.height = canvasHeight;
          canvas.width = canvasHeight * aspectRatio;
          
          setTimeout(() => {
            if (observer) {
              observer.observe(canvas);
            }
          }, 100);
          
          resolve({ img: canvas, title, date, description, width: video.videoWidth || 0 });
        });

        document.body.appendChild(video);
        media = canvas;
      } else {
        media = document.createElement("img");
        media.src = `images/projects_3d_models/${fileName}`;
        media.className = "illustrations";
        media.alt = title;

        media.addEventListener("load", () => {
          resolve({ img: media, title, date, description, width: media.naturalWidth || 0 });
        });

        media.addEventListener("error", () => {
          resolve({ img: media, title, date, description, width: 0 });
        });
      }
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

        const isVideoMedia = item.img.tagName === "CANVAS" && item.img.classList.contains("illustrations");

        if (isVideoMedia) {
          zoomImage.style.display = "none";
          let canvasInZoom = zoomWindow.querySelector(".zoom-window-canvas");
          if (!canvasInZoom) {
            canvasInZoom = document.createElement("canvas");
            canvasInZoom.className = "zoom-window-canvas";

            zoomImage.parentNode.insertBefore(canvasInZoom, zoomImage);
          }
          
          const hiddenVideo = item.img.videoElement;
          
          if (hiddenVideo) {
            canvasInZoom.width = hiddenVideo.videoWidth;
            canvasInZoom.height = hiddenVideo.videoHeight;
            
            let renderZoomAnimationId = null;
            
            const renderZoomFrame = () => {
              if (canvasInZoom.offsetParent !== null) {
                const ctx = canvasInZoom.getContext("2d");
                try {
                  ctx.drawImage(hiddenVideo, 0, 0, canvasInZoom.width, canvasInZoom.height);
                } catch (e) {
                  console.debug("Canvas render error:", e);
                }
              }
              
              if (zoomWindow.classList.contains("active")) {
                renderZoomAnimationId = requestAnimationFrame(renderZoomFrame);
              }
            };
            
            hiddenVideo.currentTime = 0;
            hiddenVideo.play().then(() => {
              renderZoomFrame();
            }).catch((err) => {
              console.debug("Play error:", err);
              renderZoomFrame();
            });
          }
          canvasInZoom.style.display = "block";
        } else {
          zoomImage.style.display = "block";
          const canvasInZoom = zoomWindow.querySelector(".zoom-window-canvas");
          if (canvasInZoom) {
            canvasInZoom.style.display = "none";
          }
          zoomImage.src = item.img.src;
        }

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
