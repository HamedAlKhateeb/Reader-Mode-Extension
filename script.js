(function () {
    'use strict';

    let fontSize = 18;
    let lineHeight = 1.6;
    let isRTL = false;
    let backgroundColor = '#f4f4f4';
    let fontFamily = 'Arial, sans-serif';
    let isDarkMode = false;
    let textAlign = 'left';
    let zoomLevel = 1;

    let readerModeActive = false;
    let originalStyles = new Map();
    let contentWidth = 800;
    let saveSettingsEnabled = false;

    const fontOptions = ['Arial', 'Noto Sans Arabic', 'Dubai', 'Times New Roman'];
    const backgroundColorOptions = ['#ffffff', '#ffff00', '#808080'];

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        try {
            if (message.action === "toggleReaderMode") {
                readerModeActive = !readerModeActive;
                if (readerModeActive) {
                    isolateMainContent();
                } else {
                    deactivateReaderMode();
                }
                sendResponse({ status: "success", readerMode: readerModeActive });
            } else if (message.action === "toggleRTL") {
                isRTL = !isRTL;
                adjustDirection(isRTL);
                sendResponse({ status: "success" });
            } else if (readerModeActive) {
                switch (message.action) {
                    case "increaseFontSize":
                        fontSize += 2;
                        adjustFontSize(fontSize);
                        break;
                    case "decreaseFontSize":
                        fontSize = Math.max(12, fontSize - 2);
                        adjustFontSize(fontSize);
                        break;
                    case "changeBackgroundColor":
                        backgroundColor = message.color;
                        adjustBackgroundColor(backgroundColor);
                        break;
                    case "changeFontFamily":
                        fontFamily = message.font;
                        adjustFontFamily(fontFamily);
                        break;
                    case "changeTextAlign":
                        textAlign = message.align;
                        adjustTextAlign(textAlign);
                        break;
                    case "increaseContentWidth":
                        contentWidth += 50;
                        adjustContentWidth(contentWidth);
                        break;
                    case "decreaseContentWidth":
                        contentWidth = Math.max(400, contentWidth - 50);
                        adjustContentWidth(contentWidth);
                        break;
                    case "toggleDarkMode":
                        isDarkMode = !isDarkMode;
                        adjustDarkMode(isDarkMode);
                        break;
                    case "increaseLineHeight":
                        lineHeight += 0.1;
                        adjustLineHeight(lineHeight);
                        break;
                    case "decreaseLineHeight":
                        lineHeight = Math.max(1.0, lineHeight - 0.1);
                        adjustLineHeight(lineHeight);
                        break;
                    case "zoomIn":
                        zoomLevel += 0.1;
                        adjustZoomLevel(zoomLevel);
                        break;
                    case "zoomOut":
                        zoomLevel = Math.max(0.5, zoomLevel - 0.1);
                        adjustZoomLevel(zoomLevel);
                        break;
                    case "toggleSaveSettings":
                        saveSettingsEnabled = !saveSettingsEnabled;
                        sendResponse({ status: "success", saveSettingsEnabled: saveSettingsEnabled });
                        break;
                    default:
                        sendResponse({ status: "error", message: "Unknown action" });
                }
            } else {
                sendResponse({ status: "error", message: "Reader mode is off" });
            }
        } catch (error) {
            sendResponse({ status: "error", message: error.message });
        }
    });

    function isolateMainContent() {
        const elementsToRemove = [
            'script', 'style', 'iframe', 'object', 'embed', 'applet', 'noframes', 'noscript',
            'header', 'footer', 'aside', 'nav', '.ad', '.ads', '.advertisement', '.sponsored',
            '.promoted', '.banner', '.sidebar', '.widget', '.footer', '.header', '.menu',
            '.navigation', '.social', '.share', '.comments', '.related', '.recommended',
            '.popular', '.trending', '.sidebar', '.widget', '.footer', '.header', '.menu',
            '.navigation', '.social', '.share', '.comments', '.related', '.recommended',
            '.popular', '.trending'
        ];

        elementsToRemove.forEach(selector => {
            document.querySelectorAll(selector).forEach(element => {
                element.remove();
            });
        });

        let mainContent = document.querySelector('article') ||
                          document.querySelector('main') ||
                          document.querySelector('.content') ||
                          document.querySelector('.post') ||
                          document.querySelector('.entry') ||
                          document.querySelector('.article') ||
                          document.querySelector('.main') ||
                          document.querySelector('.body') ||
                          document.body;

        originalStyles = saveOriginalStyles();
        document.body.innerHTML = '';
        document.body.appendChild(mainContent);
        applyReaderModeStyles();
    }

    function deactivateReaderMode() {
        restoreOriginalStyles(originalStyles);
        location.reload();
    }

    function saveOriginalStyles() {
        let styles = new Map();
        document.querySelectorAll('*').forEach(element => {
            styles.set(element, {
                fontSize: element.style.fontSize,
                lineHeight: element.style.lineHeight,
                direction: element.style.direction,
                backgroundColor: element.style.backgroundColor,
                fontFamily: element.style.fontFamily,
                textAlign: element.style.textAlign,
                width: element.style.width
            });
        });
        return styles;
    }

    function restoreOriginalStyles(styles) {
        styles.forEach((originalStyle, element) => {
            element.style.fontSize = originalStyle.fontSize;
            element.style.lineHeight = originalStyle.lineHeight;
            element.style.direction = originalStyle.direction;
            element.style.backgroundColor = originalStyle.backgroundColor;
            element.style.fontFamily = originalStyle.fontFamily;
            element.style.textAlign = originalStyle.textAlign;
            element.style.width = originalStyle.width;
        });
    }

    function adjustFontSize(size) {
        document.body.style.fontSize = `${size}px`;
        saveReaderModeSettings();
    }

    function adjustDirection(isRTL) {
        document.body.style.direction = isRTL ? 'rtl' : 'ltr';
        saveReaderModeSettings();
    }

    function adjustBackgroundColor(color) {
        document.body.style.backgroundColor = color;
        saveReaderModeSettings();
    }

    function adjustFontFamily(font) {
        document.body.style.fontFamily = font;
        saveReaderModeSettings();
    }

    function adjustTextAlign(align) {
        document.body.style.textAlign = align;
        saveReaderModeSettings();
    }

    function adjustContentWidth(width) {
        document.body.style.width = `${width}px`;
        document.body.style.margin = '0 auto';
        saveReaderModeSettings();
    }

    function adjustDarkMode(isDarkMode) {
        if (isDarkMode) {
            document.body.style.backgroundColor = '#333';
            document.body.style.color = '#fff';
        } else {
            document.body.style.backgroundColor = backgroundColor;
            document.body.style.color = '#000';
        }
        saveReaderModeSettings();
    }

    function adjustLineHeight(lineHeight) {
        document.body.style.lineHeight = lineHeight;
        saveReaderModeSettings();
    }

    function adjustZoomLevel(zoomLevel) {
        document.body.style.zoom = zoomLevel.toFixed(1);
        saveReaderModeSettings();
    }

    function applyReaderModeStyles() {
        const style = document.createElement('style');
        style.innerHTML = `
            body {
                font-size: ${fontSize}px;
                line-height: ${lineHeight};
                direction: ${isRTL ? 'rtl' : 'ltr'};
                background-color: ${backgroundColor};
                font-family: ${fontFamily};
                text-align: ${textAlign};
                width: ${contentWidth}px;
                margin: 0 auto;
                padding: 20px;
                zoom: ${zoomLevel};
            }
            img {
                max-width: 100%;
                height: auto;
            }
            a {
                color: inherit;
                text-decoration: none;
            }
            a:hover {
                text-decoration: underline;
            }
        `;
        document.head.appendChild(style);
    }

    loadReaderModeSettings();

    window.addEventListener('beforeunload', () => {
        sessionStorage.clear();
    });

    function loadReaderModeSettings() {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
                const tabId = tabs[0].id;
                chrome.cookies.get({ url: tabs[0].url, name: "readerModeActive" }, (cookie) => {
                    readerModeActive = cookie ? cookie.value === "true" : false;
                });
                chrome.cookies.get({ url: tabs[0].url, name: "fontSize" }, (cookie) => {
                    fontSize = cookie ? parseInt(cookie.value) : 18;
                });
                chrome.cookies.get({ url: tabs[0].url, name: "lineHeight" }, (cookie) => {
                    lineHeight = cookie ? parseFloat(cookie.value) : 1.6;
                });
                chrome.cookies.get({ url: tabs[0].url, name: "isRTL" }, (cookie) => {
                    isRTL = cookie ? cookie.value === "true" : false;
                });
                chrome.cookies.get({ url: tabs[0].url, name: "backgroundColor" }, (cookie) => {
                    backgroundColor = cookie ? cookie.value : '#f4f4f4';
                });
                chrome.cookies.get({ url: tabs[0].url, name: "fontFamily" }, (cookie) => {
                    fontFamily = cookie ? cookie.value : 'Arial, sans-serif';
                });
                chrome.cookies.get({ url: tabs[0].url, name: "isDarkMode" }, (cookie) => {
                    isDarkMode = cookie ? cookie.value === "true" : false;
                });
                chrome.cookies.get({ url: tabs[0].url, name: "textAlign" }, (cookie) => {
                    textAlign = cookie ? cookie.value : 'left';
                });
                chrome.cookies.get({ url: tabs[0].url, name: "contentWidth" }, (cookie) => {
                    contentWidth = cookie ? parseInt(cookie.value) : 800;
                });
                chrome.cookies.get({ url: tabs[0].url, name: "zoomLevel" }, (cookie) => {
                    zoomLevel = cookie ? parseFloat(cookie.value) : 1;
                });
                chrome.cookies.get({ url: tabs[0].url, name: "saveSettingsEnabled" }, (cookie) => {
                    saveSettingsEnabled = cookie ? cookie.value === "true" : false;
                });

                if (readerModeActive) {
                    isolateMainContent();
                }
            }
        });
    }

    function saveReaderModeSettings() {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
                const tabId = tabs[0].id;
                chrome.cookies.set({
                    url: tabs[0].url,
                    name: "readerModeActive",
                    value: readerModeActive.toString()
                });
                chrome.cookies.set({
                    url: tabs[0].url,
                    name: "fontSize",
                    value: fontSize.toString()
                });
                chrome.cookies.set({
                    url: tabs[0].url,
                    name: "lineHeight",
                    value: lineHeight.toString()
                });
                chrome.cookies.set({
                    url: tabs[0].url,
                    name: "isRTL",
                    value: isRTL.toString()
                });
                chrome.cookies.set({
                    url: tabs[0].url,
                    name: "backgroundColor",
                    value: backgroundColor
                });
                chrome.cookies.set({
                    url: tabs[0].url,
                    name: "fontFamily",
                    value: fontFamily
                });
                chrome.cookies.set({
                    url: tabs[0].url,
                    name: "isDarkMode",
                    value: isDarkMode.toString()
                });
                chrome.cookies.set({
                    url: tabs[0].url,
                    name: "textAlign",
                    value: textAlign
                });
                chrome.cookies.set({
                    url: tabs[0].url,
                    name: "contentWidth",
                    value: contentWidth.toString()
                });
                chrome.cookies.set({
                    url: tabs[0].url,
                    name: "zoomLevel",
                    value: zoomLevel.toString()
                });
                chrome.cookies.set({
                    url: tabs[0].url,
                    name: "saveSettingsEnabled",
                    value: saveSettingsEnabled.toString()
                });
            }
        });
    }
})();
