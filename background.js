console.info("Initiate background.js");

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (tab.active && changeInfo.status === "complete") {
    chrome.tabs.executeScript(tabId, { file: "content.js" }, (_) => {
      let e = chrome.runtime.lastError;
      if (e) {
        console.log("Execution of content.js failed", e);
      } else {
        console.log("content.js executed", `tabId: ${tabId}`);
      }
    });
  }
});