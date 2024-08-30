document.addEventListener('DOMContentLoaded', () => {
  const statusDiv = document.getElementById('status');
  const toggleButton = document.getElementById('toggleReaderMode');
  const increaseFontButton = document.getElementById('increaseFont');
  const decreaseFontButton = document.getElementById('decreaseFont');
  const toggleRTLButton = document.getElementById('toggleRTL');
  const backgroundColorSelect = document.getElementById('backgroundColor');
  const fontFamilySelect = document.getElementById('fontFamily');
  const alignLeftButton = document.getElementById('alignLeft');
  const alignCenterButton = document.getElementById('alignCenter');
  const alignRightButton = document.getElementById('alignRight');
  const increaseWidthButton = document.getElementById('increaseWidth');
  const decreaseWidthButton = document.getElementById('decreaseWidth');
  const toggleDarkModeButton = document.getElementById('toggleDarkMode');
  const increaseLineHeightButton = document.getElementById('increaseLineHeight');
  const decreaseLineHeightButton = document.getElementById('decreaseLineHeight');
  const toggleSaveSettingsButton = document.getElementById('toggleSaveSettings');
  const zoomInButton = document.getElementById('zoomIn');
  const zoomOutButton = document.getElementById('zoomOut');

  let readerModeEnabled = false;
  let saveSettingsEnabled = false;

  // Populate font family dropdown
  const availableFonts = ["Arial", "Noto Sans Arabic", "Dubai", "Times New Roman"];
  availableFonts.forEach(font => {
    const option = document.createElement('option');
    option.value = font;
    option.textContent = font;
    fontFamilySelect.appendChild(option);
  });

  // Populate background color dropdown
  const availableColors = ["#ffffff", "#ffff00", "#808080"];
  availableColors.forEach(color => {
    const option = document.createElement('option');
    option.value = color;
    option.textContent = color === "#ffffff" ? "White" : color === "#ffff00" ? "Yellow" : "Grey";
    backgroundColorSelect.appendChild(option);
  });

  function updateButtonText() {
    statusDiv.textContent = readerModeEnabled ? "Reader Mode: ON" : "Reader Mode: OFF";
    toggleSaveSettingsButton.textContent = saveSettingsEnabled ? "Save Settings: ON" : "Save Settings: OFF";
  }

  function saveReaderModeOptions() {
    chrome.storage.local.set({
      readerModeEnabled,
      fontSize: window.getComputedStyle(document.body).fontSize,
      backgroundColor: window.getComputedStyle(document.body).backgroundColor,
      fontFamily: window.getComputedStyle(document.body).fontFamily,
      textAlign: window.getComputedStyle(document.body).textAlign,
      darkMode: document.body.classList.contains('dark-mode'),
      lineHeight: window.getComputedStyle(document.body).lineHeight,
      saveSettingsEnabled
    });
  }

  function applyReaderModeOptions() {
    chrome.storage.local.get([
      'fontSize', 'backgroundColor', 'fontFamily', 'textAlign', 'darkMode', 'lineHeight', 'saveSettingsEnabled'
    ], (options) => {
      if (options.fontSize) document.body.style.fontSize = options.fontSize;
      if (options.backgroundColor) document.body.style.backgroundColor = options.backgroundColor;
      if (options.fontFamily) document.body.style.fontFamily = options.fontFamily;
      if (options.textAlign) document.body.style.textAlign = options.textAlign;
      if (options.darkMode) document.body.classList.add('dark-mode');
      if (options.lineHeight) document.body.style.lineHeight = options.lineHeight;
      saveSettingsEnabled = options.saveSettingsEnabled || false;
      updateButtonText();
    });
  }

  // Send a message to get the current reader mode state and update the UI
  chrome.runtime.sendMessage({ action: "getReaderMode" }, (response) => {
    readerModeEnabled = response.readerMode;
    updateButtonText();
  });

  // Add event listeners
  toggleButton.addEventListener('click', () => {
    readerModeEnabled = !readerModeEnabled;
    console.log('Toggling reader mode:', readerModeEnabled ? 'ON' : 'OFF');
    chrome.runtime.sendMessage({ action: "toggleReaderMode", readerMode: readerModeEnabled });
    updateButtonText();
  });

  toggleSaveSettingsButton.addEventListener('click', () => {
    saveSettingsEnabled = !saveSettingsEnabled;
    console.log('Toggling Save Settings:', saveSettingsEnabled ? 'ON' : 'OFF');
    chrome.runtime.sendMessage({ action: "toggleSaveSettings", saveSettingsEnabled: saveSettingsEnabled });
    updateButtonText();
  });

  increaseFontButton.addEventListener('click', () => {
    console.log('Increasing font size.');
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "increaseFontSize" });
      }
    });
  });

  decreaseFontButton.addEventListener('click', () => {
    console.log('Decreasing font size.');
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "decreaseFontSize" });
      }
    });
  });

  toggleRTLButton.addEventListener('click', () => {
    console.log('Toggling RTL.');
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "toggleRTL" });
      }
    });
  });

  backgroundColorSelect.addEventListener('change', () => {
    console.log('Changing background color to:', backgroundColorSelect.value);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "changeBackgroundColor", color: backgroundColorSelect.value });
      }
    });
  });

  fontFamilySelect.addEventListener('change', () => {
    console.log('Changing font family to:', fontFamilySelect.value);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "changeFontFamily", font: fontFamilySelect.value });
      }
    });
  });

  alignLeftButton.addEventListener('click', () => {
    console.log('Aligning text to the left.');
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "changeTextAlign", align: 'left' });
      }
    });
  });

  alignCenterButton.addEventListener('click', () => {
    console.log('Aligning text to the center.');
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "changeTextAlign", align: 'center' });
      }
    });
  });

  alignRightButton.addEventListener('click', () => {
    console.log('Aligning text to the right.');
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "changeTextAlign", align: 'right' });
      }
    });
  });

  increaseWidthButton.addEventListener('click', () => {
    console.log('Increasing width.');
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "increaseContentWidth" });
      }
    });
  });

  decreaseWidthButton.addEventListener('click', () => {
    console.log('Decreasing width.');
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "decreaseContentWidth" });
      }
    });
  });

  toggleDarkModeButton.addEventListener('click', () => {
    console.log('Toggling dark mode.');
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "toggleDarkMode" });
      }
    });
  });

  increaseLineHeightButton.addEventListener('click', () => {
    console.log('Increasing line height.');
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "increaseLineHeight" });
      }
    });
  });

  decreaseLineHeightButton.addEventListener('click', () => {
    console.log('Decreasing line height.');
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "decreaseLineHeight" });
      }
    });
  });

  zoomInButton.addEventListener('click', () => {
    console.log('Zooming in.');
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "zoomIn" });
      }
    });
  });

  zoomOutButton.addEventListener('click', () => {
    console.log('Zooming out.');
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "zoomOut" });
      }
    });
  });

  // Apply saved settings when the popup is loaded
  applyReaderModeOptions();
});
