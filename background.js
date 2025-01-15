let intervalId = null;


// shortcut Set
chrome.commands.onCommand.addListener((command) => {
  if (command === "start-simulation") {
    if (!intervalId) {
      intervalId = setInterval(() => {

        chrome.tabs.query({
          currentWindow: true
        }, (tabs) => {
          if (tabs.length > 1) {
            chrome.tabs.query({
              active: true,
              currentWindow: true
            }, (activeTabs) => {
              const activeTabIndex = tabs.findIndex(tab => tab.id === activeTabs[0].id);
              const nextTabIndex = (activeTabIndex + 1) % tabs.length;

              chrome.tabs.update(tabs[nextTabIndex].id, {
                active: true
              }, () => {
                chrome.storage.session.get(["positionPath", "content"]).then((data) => {
                  const position = data.positionPath;
                  let content = data.content || "";
                  let othrContent = "";
                  let getContent = "";

                  if (!position) {
                    console.log('No valid position set');
                    return;
                  }


                  const parts = content.split(/\n\n/);
                  for (let i = 0; i < parts.length; i++) {
                    if (parts[i].trim() == "") {
                      continue;
                    }

                    if (i < 3) {
                      getContent += parts[i] + "\n\n";
                    } else {
                      othrContent += parts[i] + "\n\n";
                    }
                  }

                  chrome.scripting.executeScript({
                    target: {
                      tabId: tabs[nextTabIndex].id
                    },
                    func: (position, content) => {
                      const element = document.elementFromPoint(position.pageX, position.pageY);



                      const iframeContentCreate = (getElement, text) => {
                        const iframeDoc = getElement.contentDocument || getElement.contentWindow.document;
                        let injectedContent = text.replace(/\n/g, "<br>");
                        let createBodyContent = document.createElement('p');
                        createBodyContent.innerHTML = injectedContent;
                        iframeDoc.body.appendChild(createBodyContent);
                      };



                      if (element) {
                        console.log("Element Found:", element);
                        if (element.tagName === "IFRAME") {
                          try {
                            // console.log(getContent);
                            iframeContentCreate(element, content);
                          } catch (err) {
                            console.log("Cross-origin iframe. Injection failed.");
                          }
                        } else if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
                          element.value += content;
                          element.dispatchEvent(new Event('input', {
                            bubbles: true
                          }));
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
                    args: [position, getContent],
                  });


                  chrome.storage.session.set({
                      content: othrContent
                    })
                    .then(() => {
                      console.log("Oher Conent --->> ", othrContent);

                      chrome.scripting.executeScript({
                        target: {
                          tabId: tabs[nextTabIndex].id
                        },
                        func: (getContent, parts) => {
                          console.log(parts);

                          // console.log("Session content updated --->>>> ", getContent);
                        },
                        args: [getContent, parts]
                      });
                    })
                })
              });

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

// frontend sent message
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

  // save position
  if (message.action === "savePosition") {
    const position = message.position;

    chrome.storage.session.set({
      positionPath: position
    }).then(() => {
      console.log("Mouse position saved:", position);
    });
  }

  // load then get text
  if (message.action === "loadContent") {
    chrome.storage.session.get(["content"]).then((result) => {
      if (result.content) {
        sendResponse({
          content: result.content
        });
      } else {
        sendResponse({
          content: ""
        });
      }
    });
    return true;
  }

  // save text
  if (message.action === "saveContent") {
    const text = message.content;
    chrome.storage.session.set({
      content: text
    }).then(() => {
      // console.log("Content saved:", text);
    });
  }
});