// console.log("insulate-extension: content.js injected");

// ********* Helper functions ***********
activeTabURL = '';

// get metas by injecting this script into the webpage
function getMetas() {
  const metasFromHTML = document.getElementsByTagName("meta");
  const metas = {};
  for (var i = 0; i < metasFromHTML.length; i++) {
    // get monetization tag value
    if (metasFromHTML[i].name === "monetization") {
      metas["monetization"] = metasFromHTML[i].content;
    }
    // get insulate-id value
    else if (metasFromHTML[i].name === "insulate-id") {
      metas["insulateId"] = metasFromHTML[i].content;
    }
  }
  return metas;
}

// save meta values to local storage for popup.js to pick up
function saveMetas(metas) {
  chrome.storage.local.set({ metas }, function () {
    // console.log("Value is set to ", metas);
  });
}

function checkIfBackendPushRequired(metas) {
  //  ? cache values for 5 minutes
  if (metas.monetization && metas.insulateId) {
    return true;
  }
  return false;
}


function initBlock() {
  if (checkIfBackendPushRequired(metaValues)) {
    chrome.runtime.sendMessage({ accessTokenRequired: true });
  }
}

// ********* Main listener ***********

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

  // Case 1: Initialize the script
  if (request.type === 'tab') {
    activeTabURL = request.value.url;
    main();
  }

  // Case 2: Request for access token
  else if (request.type === 'access_token') {
    if (request.accessToken) {

      fetch("https://project-insulate.herokuapp.com/api/block", {
        method: "post",
        body: JSON.stringify({
          paymentPointer: metaValues.monetization,
          clientId: metaValues.insulateId
        }),
        headers: {
          "Authorization": `Bearer ${request.accessToken}`,
          "Content-Type": "application/json"
        }
      })
        .then(async (response) => {
          return await response.json();
        })
        .then(function (data) {
          if (data.errors) {
            throw new Error("Failed to add the block", data);
          }
          console.log("Insulate extension: transactionId", data);
          window.postMessage({ type: "insulateTransactionId", text: data.transactionId }, "*")
        });
    }
  }
})


// main function called in case 1 inside the listener
function main() {
  metaValues = getMetas();
  saveMetas(metaValues);
  initBlock();
}