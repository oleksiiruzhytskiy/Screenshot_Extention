// import Cropper from 'cropperjs';
//@ts-nocheck

document.addEventListener("DOMContentLoaded", () => {
  const imgElement = document.getElementById("screenshotImage");
  const downloadBtn = document.getElementById("downloadBtn");
  const rotateToRightBtn = document.getElementById("rotateToRight");
  const rotateToLeftBtn = document.getElementById("rotateToLeft");
  const zoomInBtn = document.getElementById("zoomInBtn");
  const zoomOutBtn = document.getElementById("zoomOutBtn");
  const cropBtn = document.getElementById("cropBtn");

  if (!imgElement || !downloadBtn) {
    console.error("❌ Ошибка: Элементы не найдены!");
    return;
  }
let cropper;
let originalImageBlob;
let croppedImageBlob;

  // Функция для получения Blob из изображения
  const getImageBlob = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject("❌ Ошибка создания контекста canvas");

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (!blob) return reject("❌ Не удалось создать Blob");
          resolve(blob);
        }, "image/png");
      };
      img.onerror = () => reject("❌ Ошибка загрузки изображения");
      img.src = src;
    });
  };

  chrome.storage.local.get("screenshot", (data) => {
    if (data.screenshot) {
      imgElement.src = data.screenshot;
      imgElement.onload = async () => {
        try {
          originalImageBlob = await getImageBlob(imgElement.src);
          console.log(
            "🖼 Исходное изображение загружено и преобразовано в Blob!"
          );
        } catch (error) {
          console.error(error);
        }

        cropper = new Cropper(imgElement, {
          aspectRatio: NaN,
          viewMode: 2,
          responsive: true,
          autoCropArea: 1,
          ready() {
            console.log("Cropper готов!");
          },
          crop(event) {
            console.log("Обрезка произошла!", event.detail);
          },
        });
      };
    } else {
      console.error("❌ Скриншот не найден!");
    }
  });

  const handleButtonClick = (action, value) => {
    if (cropper) {
      switch (action) {
        case "rotate":
          cropper.rotate(value);
          break;
        case "zoom":
          cropper.zoom(value);
          break;
        default:
          console.error("❌ Неверное действие");
      }
    }
  };

  rotateToRightBtn.addEventListener("click", () =>
    handleButtonClick("rotate", 90)
  );
  rotateToLeftBtn.addEventListener("click", () =>
    handleButtonClick("rotate", -90)
  );
  zoomInBtn.addEventListener("click", () => handleButtonClick("zoom", 0.1));
  zoomOutBtn.addEventListener("click", () => handleButtonClick("zoom", -0.1));

  cropBtn?.addEventListener("click", () => {
    if (cropper) {
      const canvas = cropper.getCroppedCanvas();
      const cropperModal = document.querySelector(".cropper-modal");
      if (cropperModal) {
        cropperModal.style.opacity = '1';
      } else {
        console.error("❌ Элемент .cropper-modal не найден!");
      }

      if (!canvas) {
        console.error("❌ Ошибка получения canvas");
        return;
      }

      canvas.toBlob((blob) => {
        if (!blob) {
          console.error("❌ Ошибка при создании Blob");
          return;
        }

        croppedImageBlob = blob;
        imgElement.src = URL.createObjectURL(croppedImageBlob);
        console.log("📸 Изображение обрезано!");
      }, "image/png");
    } else {
      console.error("❌ Cropper не инициализирован!");
    }
  });

  downloadBtn.addEventListener("click", () => {
    const imageToDownload = croppedImageBlob || originalImageBlob;
    if (!imageToDownload) {
      console.error("❌ Нет изображения для сохранения!");
      return;
    }

    const link = document.createElement("a");
    link.href = URL.createObjectURL(imageToDownload);
    link.download = "screenshot.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    console.log("📥 Изображение сохранено!");
  });
});
