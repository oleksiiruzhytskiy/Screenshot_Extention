(()=>{"use strict";var e={257:(e,t,r)=>{r.d(t,{R:()=>o});var o=function(){}}},t={};function r(o){var n=t[o];if(void 0!==n)return n.exports;var c=t[o]={exports:{}};return e[o](c,c.exports,r),c.exports}r.d=(e,t)=>{for(var o in t)r.o(t,o)&&!r.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:t[o]})},r.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t);var o,n,c=r(257),a="captureError",i=function(e){e?chrome.storage.local.set({screenshot:e},(function(){(0,c.R)("📷 Скриншот сохранен!"),(0,c.R)("Set local storage screenshot:",e),chrome.tabs.create({url:"editor.html"})})):(0,c.R)("❌ Ошибка: пустое изображение.")};null===(o=document.getElementById("windowButton"))||void 0===o||o.addEventListener("click",(function(){setTimeout((function(){document.querySelector(".popup-container")&&(document.body.style.display="none")}),300),chrome.runtime.sendMessage({action:"requestCapture"}),(0,c.R)("Click on Window and send message /requestCapture/")})),chrome.runtime.onMessage.addListener((function(e){"screenshotCaptured"===e.action?i(e.dataUrl):e.action===a&&(0,c.R)("Ошибка захвата:",e.error)})),chrome.runtime.onMessage.addListener((function(e){e.action===a&&(0,c.R)("❌ Ошибка захвата при считывании сообщения /captureError/:",e.error)})),null===(n=document.getElementById("captureButton"))||void 0===n||n.addEventListener("click",(function(){chrome.tabs.captureVisibleTab({format:"png"},i)}))})();
//# sourceMappingURL=popup.js.map