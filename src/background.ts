import {log} from './utils/logger';

chrome.runtime.onInstalled.addListener(() => {
  log('Расширение "Скриншотер" установлено!');
});

async function ensureOffscreenDocument() {
  try {
    const offscreenUrl = chrome.runtime.getURL("off_screen.html");
    log("🔍 Проверяем offscreen URL:", offscreenUrl);

    const contexts = await chrome.runtime.getContexts({
      contextTypes: [chrome.runtime.ContextType.OFFSCREEN_DOCUMENT],
    }).then(contexts => contexts || []);
    if (contexts.length > 0) {
      log("✅ Offscreen document уже существует.");
      chrome.runtime.sendMessage({ action: "captureScreen" });
      return;
    }

    log("⚡ Создаём offscreen документ...");
    await chrome.offscreen.createDocument({
      url: offscreenUrl,
      reasons: [chrome.offscreen.Reason.DISPLAY_MEDIA],
      justification: "Необходимо для скрытого захвата экрана.",
    });

    log("✅ Offscreen document успешно создан!");

    chrome.runtime.sendMessage({ action: "captureScreen" });
  } catch (error) {
    log("❌ Ошибка при создании offscreen-документа:", error);
  }
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "requestCapture") {
    log("📩 Получено сообщение:", message);
    ensureOffscreenDocument();
  } else if (message.action === "captureError") {
    log("❌ Ошибка захвата:", message.error);
  }
});
