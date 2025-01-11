let intervalId = null;

chrome.commands.onCommand.addListener((command) => {
  if (command === "start-simulation") {
    if (!intervalId) {
      intervalId = setInterval(() => {
        chrome.tabs.query({ currentWindow: true }, (tabs) => {
          if (tabs.length > 1) {
            chrome.tabs.query({ active: true, currentWindow: true }, (activeTabs) => {
              const activeTabIndex = tabs.findIndex((tab) => tab.id === activeTabs[0].id);
              const nextTabIndex = (activeTabIndex + 1) % tabs.length;
              chrome.tabs.update(tabs[nextTabIndex].id, { active: true });
            });
          }
        });
      }, 500);
    }
  } else if (command === "stop-simulation") {
    clearInterval(intervalId);
    intervalId = null;
  }
});

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension Installed");
});