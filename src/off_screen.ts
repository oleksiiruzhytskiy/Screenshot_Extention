// Импортируем функцию для логирования
import { log } from "./utils/logger";
import { captureScreen, screenshotCaptured } from "./variable_messages/variable";

// Слушаем сообщения от других частей расширения
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  // Проверяем, если действие "captureScreen" — начинаем захват экрана
  if (message.action === captureScreen) {
    log("⚡ Начинаем захват экрана...");

    try {
      log("🔍 Получаем доступ к медиа-устройствам...");
      // Запрашиваем доступ к экрану через getDisplayMedia API
      const stream = await navigator.mediaDevices
        .getDisplayMedia({
          video: true, // Запрашиваем только видеопоток
        })
        .then((stream) => {
          log("✅ Поток получен inside THEN:", stream); // Логируем успешный ответ
          log(
            "📺 Тип экрана:",
            stream.getVideoTracks()[0].getSettings().displaySurface // Логируем тип экрана (например, полный экран или окно)
          );
          return stream; // Возвращаем поток
        })
        .catch((err) => log("❌ Ошибка:", err)); // Логируем ошибку в случае неудачи

      log("Получен поток:", stream); // Логируем поток

      // Проверка, что поток был получен
      if (!stream) {
        log("❌ Не удалось получить поток.");
        return;
      }

      // Получаем первый видеотрек из потока
      const track = stream.getVideoTracks()[0];
      log("📹 Получен видео-трек:", track); // Логируем видео-трек
      // Создаем элемент canvas для захвата скриншота
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d"); // Получаем контекст для рисования
      if (!ctx) {
        log("❌ Ошибка контекста canvas.");
        return;
      }

      // Создаем элемент video для воспроизведения потока
      const videoElement = document.createElement("video");
      videoElement.srcObject = stream; // Устанавливаем источник видео как поток
      videoElement.play(); // Запускаем воспроизведение

      // Когда видео готово к загрузке данных, делаем скриншот
      videoElement.onloadeddata = () => {
        // Устанавливаем размеры canvas равными размерам видео
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;

        // Рисуем изображение с видео на canvas
        ctx.drawImage(videoElement, 0, 0);

        log("📷 Скриншот захвачен!");

        // Преобразуем canvas в data URL (скриншот) в формате JPEG с качеством 70%
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);

        // Отправляем сообщение с данными скриншота
        chrome.runtime.sendMessage({
          action: screenshotCaptured,
          dataUrl: dataUrl,
        });
        log("📤 Отправлено сообщение с данными скриншота.");

        // Останавливаем видео-трек через 500 мс, чтобы освободить ресурсы
        setTimeout(() => {
          track.stop();
        }, 500);
        log("🛑 Остановлен видео-трек.");
      };
    } catch (error) {
      // Логируем ошибку захвата экрана
      log("❌ Ошибка захвата экрана:", log);
    }
  }
});
