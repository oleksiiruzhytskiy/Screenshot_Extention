import Cropper from "cropperjs";
import {log} from "./utils/logger";
document.addEventListener("DOMContentLoaded", () => {
  const imgElement = document.getElementById(
    "screenshotImage"
  ) as HTMLImageElement;
  const downloadBtn = document.getElementById(
    "downloadBtn"
  ) as HTMLButtonElement;
  const rotateToRightBtn = document.getElementById(
    "rotateToRight"
  ) as HTMLButtonElement;
  const rotateToLeftBtn = document.getElementById(
    "rotateToLeft"
  ) as HTMLButtonElement;
  const zoomInBtn = document.getElementById("zoomInBtn") as HTMLButtonElement;
  const zoomOutBtn = document.getElementById("zoomOutBtn") as HTMLButtonElement;
  const cropBtn = document.getElementById("cropBtn");

  if (!imgElement || !downloadBtn) {
    log("❌ Ошибка: Элементы не найдены!");
    return;
  }
  let cropper: Cropper;
  let originalImageBlob: Blob;
  let croppedImageBlob: Blob;

  // Функция для получения Blob из изображения
  const getImageBlob = (src: string): Promise<Blob> => {
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
  const initializeCropper = () => {
    cropper = new Cropper(imgElement, {
      aspectRatio: NaN,
      viewMode: 2,
      responsive: true,
      autoCropArea: 1,
      center: true,
      ready() {
        log("Cropper готов!");
      },
      crop(event) {
        log("Обрезка произошла!", event.detail);
      },
    });
  };

  chrome.storage.local.get("screenshot", (data) => {
    if (data.screenshot) {
      imgElement.src = data.screenshot;
      imgElement.onload = async () => {
        try {
          originalImageBlob = await getImageBlob(imgElement.src);
          log(
            "🖼 Исходное изображение загружено и преобразовано в Blob!"
          );
          log('Image', imgElement.src);
        } catch (error) {
          log(error);
        }

        initializeCropper();
      };
    } else {
      log("❌ Скриншот не найден!");
    }
  });

  const handleButtonClick = (
    action: "rotate" | "zoom",
    value: number
  ): void => {
    if (cropper) {
      switch (action) {
        case "rotate":
          cropper.rotate(value);
          break;
        case "zoom":
          cropper.zoom(value);
          break;
        default:
          log("❌ Неверное действие");
      }
    }
  };

  const centerImage = () => {
    const canvasData = cropper.getCanvasData(); 
    const imageData = cropper.getImageData(); 
    log("canvasData", canvasData);
    log("imageData", imageData);
  
    const newLeft = (canvasData.width - imageData.width) / 2;
    const newTop = (canvasData.height - imageData.height) / 2;
  
    cropper.setCanvasData({
      left: newLeft,
      top: newTop,
    });
  };
  
  rotateToRightBtn.addEventListener("click", () => {
    handleButtonClick("rotate", 90);
    centerImage();
  });
  rotateToLeftBtn.addEventListener("click", () => {
    handleButtonClick("rotate", -90);
    centerImage();
  });
  zoomInBtn.addEventListener("click", () => handleButtonClick("zoom", 0.1));
  zoomOutBtn.addEventListener("click", () => handleButtonClick("zoom", -0.1));

  cropBtn?.addEventListener("click", () => {
    if (cropper) {
      const canvas = cropper.getCroppedCanvas();
      const cropperModal = document.querySelector(".cropper-modal");
      if (cropperModal) {
        (cropperModal as HTMLElement).style.opacity = "1";
      } else {
        log("❌ Элемент .cropper-modal не найден!");
      }

      if (!canvas) {
        log("❌ Ошибка получения canvas");
      }

      canvas.toBlob((blob) => {
        if (!blob) {
          log("❌ Ошибка при создании Blob");
          return;
        }

        croppedImageBlob = blob;
        imgElement.src = URL.createObjectURL(croppedImageBlob);
        log("📸 Изображение обрезано!");
        cropper.destroy();
      }, "image/png");
    } else {
      log("❌ Cropper не инициализирован!");
    }
  });

  downloadBtn.addEventListener("click", () => {
    const imageToDownload = croppedImageBlob || originalImageBlob;
    if (!imageToDownload) {
      log("❌ Нет изображения для сохранения!");
      return;
    }

    const link = document.createElement("a");
    link.href = URL.createObjectURL(imageToDownload);
    link.download = "screenshot.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    log("📥 Изображение сохранено!");
  });
});
