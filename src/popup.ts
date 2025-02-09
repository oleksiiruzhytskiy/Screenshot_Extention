// Импортируем функцию для логирования
import { log } from "./utils/logger";
import { captureError, requestCapture, screenshotCaptured } from "./variable_messages/variable";

// Функция для сохранения скриншота и открытия редактора
const saveScreenshotAndOpenEditor = (dataUrl: string) => {
  // Проверка на пустое изображение
  if (!dataUrl) {
    log("❌ Ошибка: пустое изображение.");
    return;
  }

  // Сохраняем скриншот в локальное хранилище
  chrome.storage.local.set({ screenshot: dataUrl }, () => {
    log("📷 Скриншот сохранен!");
    log("Set local storage screenshot:", dataUrl);

    // Открываем страницу редактора
    chrome.tabs.create({ url: "editor.html" });
  });
};

// Слушаем клик по кнопке "windowButton" для захвата экрана
document.getElementById("windowButton")?.addEventListener("click", () => {
  // Прячем попап окно через 300 мс после клика
  setTimeout(() => {
    const popupContainer = document.querySelector(".popup-container");
    if (popupContainer) {
      document.body.style.display = "none"; // Скрываем тело страницы
    }
  }, 300);

  // Отправляем сообщение на захват экрана
  chrome.runtime.sendMessage({ action: requestCapture });
  log("Click on Window and send message /requestCapture/");
});

// Обрабатываем сообщение от скрипта захвата скриншота
chrome.runtime.onMessage.addListener((message) => {
  // Если получено сообщение о захваченном скриншоте
  if (message.action === screenshotCaptured) {
    // Сохраняем скриншот и открываем редактор
    saveScreenshotAndOpenEditor(message.dataUrl);
  } else if (message.action === captureError) {
    // Логируем ошибку захвата
    log("Ошибка захвата:", message.error);
  }
});

// Дополнительная обработка ошибки захвата
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === captureError) {
    log(
      "❌ Ошибка захвата при считывании сообщения /captureError/:",
      message.error
    );
  }
});

// Слушаем клик по кнопке "captureButton" для захвата видимой вкладки
document.getElementById("captureButton")?.addEventListener("click", () => {
  // Захватываем видимую часть вкладки в формате PNG
  chrome.tabs.captureVisibleTab({ format: "png" }, saveScreenshotAndOpenEditor);
});
