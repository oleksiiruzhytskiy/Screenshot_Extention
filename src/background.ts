chrome.runtime.onInstalled.addListener(({ reason }) => {
  console.log('Расширение "Скриншотер" установлено!');
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "capture_screen") {

        console.log('message', message);
        console.log('sender', sender);
        console.log('sendResponse', sendResponse);
    }
      
  });

