chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Content script received message:', message);

  try {
    if (message.action === "toggleReaderMode") {
      // ... (keep the existing code)
    } else if (message.action === "increaseFontSize") {
      let fontSize = parseInt(window.getComputedStyle(document.body).fontSize);
      document.body.style.fontSize = (fontSize + 2) + 'px';
      saveReaderModeSettings();
      sendResponse({ status: "success", message: "Font size increased" });
    } else if (message.action === "decreaseFontSize") {
      let fontSize = parseInt(window.getComputedStyle(document.body).fontSize);
      document.body.style.fontSize = Math.max(12, fontSize - 2) + 'px';
      saveReaderModeSettings();
      sendResponse({ status: "success", message: "Font size decreased" });
    } else if (message.action === "toggleRTL") {
      document.body.style.direction = message.data ? 'rtl' : 'ltr';
      saveReaderModeSettings();
      sendResponse({ status: "success", message: "Text direction toggled" });
    } else if (message.action === "changeBackgroundColor") {
      document.body.style.backgroundColor = message.color;
      saveReaderModeSettings();
      sendResponse({ status: "success", message: "Background color changed" });
    } else if (message.action === "changeFontFamily") {
      document.body.style.fontFamily = message.font;
      saveReaderModeSettings();
      sendResponse({ status: "success", message: "Font family changed" });
    } else if (message.action === "changeTextAlign") {
      document.body.style.textAlign = message.align;
      saveReaderModeSettings();
      sendResponse({ status: "success", message: "Text alignment changed" });
    } else if (message.action === "increaseContentWidth") {
      let contentWidth = parseInt(window.getComputedStyle(document.body).width);
      document.body.style.width = (contentWidth + 50) + 'px';
      document.body.style.margin = '0 auto';
      saveReaderModeSettings();
      sendResponse({ status: "success", message: "Content width increased" });
    } else if (message.action === "decreaseContentWidth") {
      let contentWidth = parseInt(window.getComputedStyle(document.body).width);
      document.body.style.width = Math.max(400, contentWidth - 50) + 'px';
      document.body.style.margin = '0 auto';
      saveReaderModeSettings();
      sendResponse({ status: "success", message: "Content width decreased" });
    } else if (message.action === "toggleDarkMode") {
      document.body.style.backgroundColor = message.data ? '#333' : '#f4f4f4';
      document.body.style.color = message.data ? '#fff' : '#000';
      saveReaderModeSettings();
      sendResponse({ status: "success", message: "Dark mode toggled" });
    } else if (message.action === "increaseLineHeight") {
      let lineHeight = parseFloat(window.getComputedStyle(document.body).lineHeight);
      document.body.style.lineHeight = (lineHeight + 0.1) + '';
      saveReaderModeSettings();
      sendResponse({ status: "success", message: "Line height increased" });
    } else if (message.action === "decreaseLineHeight") {
      let lineHeight = parseFloat(window.getComputedStyle(document.body).lineHeight);
      document.body.style.lineHeight = Math.max(1.0, lineHeight - 0.1) + '';
      saveReaderModeSettings();
      sendResponse({ status: "success", message: "Line height decreased" });
    } else if (message.action === "zoomIn") {
      let zoomLevel = parseFloat(window.getComputedStyle(document.body).zoom) || 1;
      document.body.style.zoom = (zoomLevel + 0.1).toFixed(1);
      saveReaderModeSettings();
      sendResponse({ status: "success", message: "Zoomed in" });
    } else if (message.action === "zoomOut") {
      let zoomLevel = parseFloat(window.getComputedStyle(document.body).zoom) || 1;
      document.body.style.zoom = Math.max(0.5, zoomLevel - 0.1).toFixed(1);
      saveReaderModeSettings();
      sendResponse({ status: "success", message: "Zoomed out" });
    } else if (message.action === "nextChapter") {
      let nextButton = document.querySelector('.next-chapter-button'); // Adjust the selector as needed
      if (nextButton) {
        nextButton.click();
        sendResponse({ status: "success", message: "Navigated to next chapter" });
      } else {
        sendResponse({ status: "error", message: "Next chapter button not found" });
      }
    } else {
      console.error('Unknown action received:', message.action);
      sendResponse({ status: "error", message: "Unknown action" });
    }
  } catch (error) {
    console.error('An error occurred while processing message:', error);
    sendResponse({ status: "error", message: error.message });
  }
});

function saveReaderModeSettings() {
  chrome.storage.local.set({
    fontSize: window.getComputedStyle(document.body).fontSize,
    lineHeight: window.getComputedStyle(document.body).lineHeight,
    isRTL: (document.body.style.direction === 'rtl').toString(),
    backgroundColor: window.getComputedStyle(document.body).backgroundColor,
    fontFamily: window.getComputedStyle(document.body).fontFamily,
    textAlign: window.getComputedStyle(document.body).textAlign,
    contentWidth: window.getComputedStyle(document.body).width,
    isDarkMode: (document.body.style.backgroundColor === '#333').toString(),
    zoomLevel: (window.getComputedStyle(document.body).zoom || 1).toString()
  }, () => {
    console.log("Reader mode settings saved.");
  });
}

function loadReaderModeSettings() {
  chrome.storage.local.get([
    'fontSize',
    'lineHeight',
    'isRTL',
    'backgroundColor',
    'fontFamily',
    'textAlign',
    'contentWidth',
    'isDarkMode',
    'zoomLevel'
  ], (result) => {
    if (result.fontSize) document.body.style.fontSize = result.fontSize;
    if (result.lineHeight) document.body.style.lineHeight = result.lineHeight;
    if (result.isRTL) document.body.style.direction = result.isRTL === "true" ? 'rtl' : 'ltr';
    if (result.backgroundColor) document.body.style.backgroundColor = result.backgroundColor;
    if (result.fontFamily) document.body.style.fontFamily = result.fontFamily;
    if (result.textAlign) document.body.style.textAlign = result.textAlign;
    if (result.contentWidth) document.body.style.width = result.contentWidth;
    if (result.isDarkMode) {
      document.body.style.backgroundColor = result.isDarkMode === "true" ? '#333' : '#f4f4f4';
      document.body.style.color = result.isDarkMode === "true" ? '#fff' : '#000';
    }
    if (result.zoomLevel) document.body.style.zoom = result.zoomLevel;
  });
}

loadReaderModeSettings();
