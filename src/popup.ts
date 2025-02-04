import { log } from "./utils/logger";
const saveScreenshotAndOpenEditor = (dataUrl: string) => {
  if (!dataUrl) {
    log("❌ Ошибка: пустое изображение.");
    return;
  }

  chrome.storage.local.set({ screenshot: dataUrl }, () => {
    log("📷 Скриншот сохранен!");
    log("Set local storage screenshot:", dataUrl);

    chrome.tabs.create({ url: "editor.html" });
  });
};

document.getElementById("windowButton")?.addEventListener("click", () => {
  setTimeout(() => {
    const popupContainer = document.querySelector(".popup-container");
    if (popupContainer) {
      document.body.style.display = "none";
    }
  }, 300);
  chrome.runtime.sendMessage({ action: "requestCapture" });
  log("Click on Window and send message /requestCapture/");
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "screenshotCaptured") {
    saveScreenshotAndOpenEditor(message.dataUrl);
  } else if (message.action === "captureError") {
    log("Ошибка захвата:", message.error);
  }
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "captureError") {
    log(
      "❌ Ошибка захвата при считывании сообщения /captureError/:",
      message.error
    );
  }
});

document.getElementById("captureButton")?.addEventListener("click", () => {
  chrome.tabs.captureVisibleTab({ format: "png" }, saveScreenshotAndOpenEditor);
});
