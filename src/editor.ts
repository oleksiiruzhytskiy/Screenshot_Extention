// Импортируем библиотеку Cropper.js для обрезки изображений
import Cropper from "cropperjs";
// Импортируем функцию для логирования из утилит
import {log} from "./utils/logger";

// Ждем загрузки DOM-контента, прежде чем инициализировать обработчики и логику
document.addEventListener("DOMContentLoaded", () => {
  // Получаем элементы с DOM, которые будут использоваться для манипуляций
  const imgElement = document.getElementById("screenshotImage") as HTMLImageElement;
  const downloadBtn = document.getElementById("downloadBtn") as HTMLButtonElement;
  const rotateToRightBtn = document.getElementById("rotateToRight") as HTMLButtonElement;
  const rotateToLeftBtn = document.getElementById("rotateToLeft") as HTMLButtonElement;
  const zoomInBtn = document.getElementById("zoomInBtn") as HTMLButtonElement;
  const zoomOutBtn = document.getElementById("zoomOutBtn") as HTMLButtonElement;
  const cropBtn = document.getElementById("cropBtn");

  // Проверка наличия необходимых элементов на странице
  if (!imgElement || !downloadBtn) {
    log("❌ Ошибка: Элементы не найдены!");
    return;
  }

  // Инициализация переменных для Cropper и для хранения изображений в формате Blob
  let cropper: Cropper;
  let originalImageBlob: Blob;
  let croppedImageBlob: Blob;

  // Функция для получения Blob из изображения (преобразуем изображение в формат Blob)
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

  // Функция для инициализации Cropper.js
  const initializeCropper = () => {
    cropper = new Cropper(imgElement, {
      aspectRatio: NaN, // Обрезка без фиксированного соотношения сторон
      viewMode: 2, // Мод установки области для обрезки
      responsive: true, // Адаптивность на экранах разных размеров
      autoCropArea: 1, // Автоматически обрезать на весь контейнер
      center: true, // Центрирование изображения
      ready() {
        log("Cropper готов!"); // Логируем, когда Cropper готов к использованию
      },
      crop(event) {
        log("Обрезка произошла!", event.detail); // Логируем событие обрезки
      },
    });
  };

  // Загружаем изображение из локального хранилища (chrome.storage.local) и обрабатываем его
  chrome.storage.local.get("screenshot", (data) => {
    if (data.screenshot) {
      imgElement.src = data.screenshot;
      imgElement.onload = async () => {
        try {
          originalImageBlob = await getImageBlob(imgElement.src); // Преобразуем изображение в Blob
          log("🖼 Исходное изображение загружено и преобразовано в Blob!");
          log('Image', imgElement.src); // Логируем путь к изображению
        } catch (error) {
          log(error); // Логируем ошибку, если не удалось получить Blob
        }

        initializeCropper(); // Инициализируем Cropper
      };
    } else {
      log("❌ Скриншот не найден!"); // Если изображение не найдено, выводим ошибку
    }
  });

  // Обработчик для кнопок поворота и зума
  const handleButtonClick = (action: "rotate" | "zoom", value: number): void => {
    if (cropper) {
      switch (action) {
        case "rotate":
          cropper.rotate(value); // Поворот изображения на указанный угол
          break;
        case "zoom":
          cropper.zoom(value); // Масштабирование изображения
          break;
        default:
          log("❌ Неверное действие"); // Логируем ошибку для недопустимого действия
      }
    }
  };

  // Функция для центрирования изображения в обрезке
  const centerImage = () => {
    const canvasData = cropper.getCanvasData(); // Получаем данные о холсте
    const imageData = cropper.getImageData(); // Получаем данные о изображении
    log("canvasData", canvasData); // Логируем данные о холсте
    log("imageData", imageData); // Логируем данные об изображении

    const newLeft = (canvasData.width - imageData.width) / 2; // Расчитываем новое положение изображения по оси X
    const newTop = (canvasData.height - imageData.height) / 2; // Расчитываем новое положение изображения по оси Y

    cropper.setCanvasData({
      left: newLeft, // Устанавливаем новое положение по X
      top: newTop, // Устанавливаем новое положение по Y
    });
  };

  // Добавляем обработчики событий для кнопок поворота и зума
  rotateToRightBtn.addEventListener("click", () => {
    handleButtonClick("rotate", 90); // Поворот на 90 градусов вправо
    centerImage(); // Центрируем изображение
  });
  rotateToLeftBtn.addEventListener("click", () => {
    handleButtonClick("rotate", -90); // Поворот на 90 градусов влево
    centerImage(); // Центрируем изображение
  });
  zoomInBtn.addEventListener("click", () => handleButtonClick("zoom", 0.1)); // Увеличение масштаба
  zoomOutBtn.addEventListener("click", () => handleButtonClick("zoom", -0.1)); // Уменьшение масштаба

  // Добавляем обработчик события для кнопки "Обрезать"
  cropBtn?.addEventListener("click", () => {
    if (cropper) {
      const canvas = cropper.getCroppedCanvas(); // Получаем обрезанное изображение в формате canvas
      const cropperModal = document.querySelector(".cropper-modal"); // Получаем элемент для модального окна

      // Если модальное окно существует, делаем его видимым
      if (cropperModal) {
        // (cropperModal as HTMLElement).style.opacity = "1"; 
      } else {
        log("❌ Элемент .cropper-modal не найден!"); // Логируем ошибку, если модальное окно не найдено
      }

      // Если canvas не получен, логируем ошибку
      if (!canvas) {
        log("❌ Ошибка получения canvas");
      }

      // Преобразуем canvas в Blob и обновляем изображение
      canvas.toBlob((blob) => {
        if (!blob) {
          log("❌ Ошибка при создании Blob");
          return;
        }

        croppedImageBlob = blob; // Сохраняем обрезанное изображение
        imgElement.src = URL.createObjectURL(croppedImageBlob); // Обновляем изображение
        log("📸 Изображение обрезано!"); // Логируем успешную обрезку
        cropper.destroy(); // Уничтожаем объект Cropper после завершения обрезки
      }, "image/png");
    } else {
      log("❌ Cropper не инициализирован!"); // Логируем ошибку, если Cropper не был инициализирован
    }
  });

  // Обработчик для кнопки "Скачать"
  downloadBtn.addEventListener("click", () => {
    const imageToDownload = croppedImageBlob || originalImageBlob; // Используем обрезанное изображение, если оно есть, иначе оригинальное
    if (!imageToDownload) {
      log("❌ Нет изображения для сохранения!"); // Логируем ошибку, если нет изображения для сохранения
      return;
    }

    // Создаем ссылку для скачивания изображения
    const link = document.createElement("a");
    link.href = URL.createObjectURL(imageToDownload); // Преобразуем Blob в URL
    link.download = "screenshot.png"; // Устанавливаем имя файла
    document.body.appendChild(link);
    link.click(); // Симулируем клик по ссылке для скачивания
    document.body.removeChild(link); // Удаляем ссылку из DOM
    log("📥 Изображение сохранено!"); // Логируем успешное сохранение изображения
  });
});
