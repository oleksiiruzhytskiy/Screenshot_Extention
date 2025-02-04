import { log } from "./utils/logger";
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === "captureScreen") {
    log("⚡ Начинаем захват экрана...");
    try {
      log("🔍 Получаем доступ к медиа-устройствам...");
      const stream = await navigator.mediaDevices
        .getDisplayMedia({
          video: true,
        })
        .then((stream) => {
          log("✅ Поток получен inside THEN:", stream);
          log(
            "📺 Тип экрана:",
            stream.getVideoTracks()[0].getSettings().displaySurface
          );
          return stream;
        })
        .catch((err) => log("❌ Ошибка:", err));

      log("Получен поток:", stream);

      if (!stream) {
        log("❌ Не удалось получить поток.");
        return;
      }

      const track = stream.getVideoTracks()[0];
      log("📹 Получен видео-трек:", track);

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        log("❌ Ошибка контекста canvas.");
        return;
      }

      const videoElement = document.createElement("video");
      videoElement.srcObject = stream;
      videoElement.play();

      videoElement.onloadeddata = () => {
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;

        ctx.drawImage(videoElement, 0, 0);

        log("📷 Скриншот захвачен!");

        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);

        chrome.runtime.sendMessage({
          action: "screenshotCaptured",
          dataUrl: dataUrl,
        });
        log("📤 Отправлено сообщение с данными скриншота.");
        setTimeout(() => {
          track.stop();
        }, 500);
        log("🛑 Остановлен видео-трек.");
      };
    } catch (error) {
      log("❌ Ошибка захвата экрана:", log);
      const logMessage =
        error instanceof Error ? error.message : "Неизвестная ошибка";
      chrome.runtime.sendMessage({
        action: "capturelog",
        log: logMessage,
      });
    }
  }
});
