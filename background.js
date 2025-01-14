let intervalId = null;

// shortcut Set
chrome.commands.onCommand.addListener((command) => {
  if (command === "start-simulation") {
    if (!intervalId) {
      intervalId = setInterval(() => {
        chrome.storage.session.get("positionPath").then((data) => {
          const position = data.positionPath;

          console.log(position);
          if (!position) {
            console.log('No valid position set');
            return;
          }

          chrome.tabs.query({ currentWindow: true }, (tabs) => {
            if (tabs.length > 1) {
              chrome.tabs.query({ active: true, currentWindow: true }, (activeTabs) => {
                const activeTabIndex = tabs.findIndex(tab => tab.id === activeTabs[0].id);
                const nextTabIndex = (activeTabIndex + 1) % tabs.length;
          
                chrome.tabs.update(tabs[nextTabIndex].id, { active: true }, () => {
                  chrome.scripting.executeScript({
                    target: { tabId: tabs[nextTabIndex].id },
                    func: (position) => {
                      const element = document.elementFromPoint(position.pageX, position.pageY);
                      if (element) {
                        console.log("Element Found:", element);
          
                        if (element.tagName === "IFRAME") {
                          try {
                            const iframeDoc = element.contentDocument || element.contentWindow.document;
                            iframeDoc.body.innerHTML += "Injected content into iframe body";
                            // console.log("Content injected into iframe body.");
                          } catch (err) {
                            console.log("Cross-origin iframe. Injection failed.");
                          }
          
                        } else if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
                          element.value = "Auto-filled text";
                          element.dispatchEvent(new Event('input', { bubbles: true }));
                          // console.log("Text injected in input/textarea.");
          
                        } else if (element.tagName === "DIV") {
                          element.innerHTML = "Injected Content in DIV";
                          // console.log("Content injected in DIV.");
          
                        } else {
                          element.innerHTML = "Injected Content in element";
                          // console.log("Content injected in element.");
                        }
                      } else {
                        console.log("No element found at the specified position.");
                      }
                    },
                    args: [position],
                  });
                });
              });
            }
          });
          

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
