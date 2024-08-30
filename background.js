let readerMode = false;
let saveSettingsEnabled = false;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "toggleReaderMode") {
    readerMode = !readerMode;
    sendResponse({ readerMode });

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "toggleReaderMode", readerMode });
      }
    });

    saveReaderModeSettings();
  } else if (message.action === "getReaderMode") {
    sendResponse({ readerMode });
  } else if (message.action === "toggleSaveSettings") {
    saveSettingsEnabled = !saveSettingsEnabled;
    sendResponse({ saveSettingsEnabled });

    saveReaderModeSettings();
  } else if (readerMode) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id, message);
      }
    });
  } else {
    sendResponse({ status: "error", message: "Reader mode is off" });
  }

  return true;
});

function saveReaderModeSettings() {
  chrome.storage.local.set({ readerMode, saveSettingsEnabled }, () => {
    console.log("Reader mode settings saved.");
  });
}

function loadReaderModeSettings() {
  chrome.storage.local.get(['readerMode', 'saveSettingsEnabled'], (result) => {
    readerMode = result.readerMode !== undefined ? result.readerMode : false;
    saveSettingsEnabled = result.saveSettingsEnabled !== undefined ? result.saveSettingsEnabled : false;
  });
}

loadReaderModeSettings();
