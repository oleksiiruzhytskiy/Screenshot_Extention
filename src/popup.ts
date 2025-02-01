document.getElementById("window")?.addEventListener("click", () => {
  navigator.mediaDevices
    .getDisplayMedia({
      video: {
        //@ts-ignore
        mediaSource: "screen", // или "window", "screen" — для всего экрана, "window" — для отдельного окна
      },
    })
    .then((stream) => {
      const track = stream.getVideoTracks()[0];
      const imageCapture = new ImageCapture(track);

      imageCapture.grabFrame().then((imageBitmap) => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          console.error("❌ Ошибка контекста canvas.");
          return;
        }

        canvas.width = imageBitmap.width;
        canvas.height = imageBitmap.height;
        ctx.drawImage(imageBitmap, 0, 0);
        const dataUrl = canvas.toDataURL();

        // ✅ Сохраняем изображение в `chrome.storage`
        chrome.storage.local.set({ screenshot: dataUrl }, () => {
          console.log("dataUrl", dataUrl);
          console.log("📷 Скриншот сохранен!");

          // ✅ Открываем редактор в новой вкладке
          chrome.tabs.create({ url: "editor.html" });
        });

        track.stop();
      });
    })
    .catch((error) => {
      console.error("❌ Ошибка получения потока:", error);
    });
});
