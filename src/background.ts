// Импортируем функцию логирования из утилит для вывода сообщений в консоль.
import { log } from "./utils/logger";
import { captureError, captureScreen } from "./variable_messages/variable";

// Добавляем слушатель на событие установки расширения в браузере.
// Когда расширение будет установлено, это событие будет вызвано.
chrome.runtime.onInstalled.addListener(() => {
  log('Расширение "Скриншотер" установлено!'); // Логируем сообщение об успешной установке.
});

// Асинхронная функция для проверки и создания offscreen-документа (невидимой вкладки).
async function ensureOffscreenDocument() {
  try {
    // Получаем URL для страницы off_screen.html из расширения.
    const offscreenUrl = chrome.runtime.getURL("off_screen.html");
    log("🔍 Проверяем offscreen URL:", offscreenUrl); // Логируем URL для offscreen документа.

    // Получаем список всех offscreen-документов, которые могут быть уже созданы.
    const contexts = await chrome.runtime
      .getContexts({
        contextTypes: [chrome.runtime.ContextType.OFFSCREEN_DOCUMENT], // Проверяем только для типа контекста OFFSCREEN_DOCUMENT.
      })
      .then((contexts) => contexts || []); // Если нет контекстов, возвращаем пустой массив.

    // Если хотя бы один offscreen-документ найден, выводим сообщение.
    if (contexts.length > 0) {
      log("✅ Offscreen document уже существует.");
      chrome.runtime.sendMessage({ action: captureScreen }); // Отправляем сообщение для захвата экрана.
      return; // Завершаем выполнение, так как документ уже существует.
    }

    // Если offscreen-документ не найден, создаем новый.
    log("⚡ Создаём offscreen документ...");
    await chrome.offscreen.createDocument({
      url: offscreenUrl, // Устанавливаем URL для offscreen-документа.
      reasons: [chrome.offscreen.Reason.DISPLAY_MEDIA], // Указываем причину создания: для захвата экрана.
      justification: "Необходимо для скрытого захвата экрана.", // Объяснение для создания документа.
    });

    // Логируем успешное создание offscreen-документа.
    log("✅ Offscreen document успешно создан!");

    // После создания offscreen-документа, отправляем сообщение для захвата экрана.
    chrome.runtime.sendMessage({ action: captureError });
  } catch (error) {
    // Если возникла ошибка при создании offscreen-документа, логируем ошибку.
    log("❌ Ошибка при создании offscreen-документа:", error);
  }
}

// Добавляем слушатель сообщений, чтобы реагировать на события от других частей расширения.
chrome.runtime.onMessage.addListener((message) => {
  // Если сообщение содержит действие "requestCapture", запускаем процесс захвата экрана.
  if (message.action === "requestCapture") {
    log("📩 Получено сообщение:", message); // Логируем полученное сообщение.
    ensureOffscreenDocument(); // Вызываем функцию для создания offscreen-документа.
  } else if (message.action === captureError) {
    // Если сообщение содержит ошибку захвата, логируем ошибку.
    log("❌ Ошибка захвата:", message.error);
  }
});
