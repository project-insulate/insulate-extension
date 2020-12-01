console.log("insulate-extension: content.js injected");

// helper functions

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
  chrome.storage.sync.set({ metas }, function () {
    console.log("Value is set to ", metas);
  });
}

function checkIfBackendPushRequired(metas) {
  //  TODO:  cache values for 5 minutes
  if (metas.monetization && metas.insulateId) {
    return true;
  }
  return false;
}

// **** run the main functionality ****
// get all meta values needed
metaValues = getMetas();


saveMetas(metaValues);


function init() {

  if (checkIfBackendPushRequired(metaValues)) {

    chrome.runtime.sendMessage({
      msg: "updateToken"
    }, function () {

      chrome.storage.sync.get(['access_token'], function (result) {
        console.log('Value is set to ' + result);

        fetch("http://localhost:8000/api/block", {
          method: "post",
          body: JSON.stringify({
            paymentPointer: metaValues.monetization,
            clientId: metaValues.insulateId
          }),
          headers: {
            "Authorization": `Bearer ${result.access_token}`,
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
            console.log("transactionId", data);
            window.postMessage({ type: "insulateTransactionId", text: data.transactionId }, "*")
          });
      });

    });


  }
}

init();