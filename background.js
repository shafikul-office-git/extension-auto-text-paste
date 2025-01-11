let intervalId = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "start") {
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
      }, 500); // প্রতি 500ms (অর্ধ সেকেন্ড)
    }
  } else if (message.action === "stop") {
    clearInterval(intervalId);
    intervalId = null;
  }
});
