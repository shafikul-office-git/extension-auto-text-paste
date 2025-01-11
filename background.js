let intervalId = null;

// shortcut Set
chrome.commands.onCommand.addListener((command) => {
  if (command === "start-simulation") {
    if (!intervalId) {
      intervalId = setInterval(() => {
        chrome.tabs.query({ currentWindow: true }, (tabs) => {
          if (tabs.length > 1) {
            chrome.tabs.query(
              { active: true, currentWindow: true },
              (activeTabs) => {
                const activeTabIndex = tabs.findIndex(
                  (tab) => tab.id === activeTabs[0].id
                );
                const nextTabIndex = (activeTabIndex + 1) % tabs.length;
                chrome.tabs.update(tabs[nextTabIndex].id, { active: true });
              }
            );
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

// frontend sent message
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

  // save position
  if (message.action === "savePosition") {
    const position = message.position;

    chrome.storage.session.set({ positionPath: position }).then(() => {
      console.log("Mouse position saved:", position);
    });
  }

  // load then get text
  if (message.action === "loadContent") {
    chrome.storage.session.get(["content"]).then((result) => {
      if (result.content) {
        sendResponse({ content: result.content });
      } else {
        sendResponse({ content: "" });
      }
    });
    return true;
  }

  // save text
  if (message.action === "saveContent") {
    const text = message.content;
    chrome.storage.session.set({ content: text }).then(() => {
      // console.log("Content saved:", text);
    });
  }
});
