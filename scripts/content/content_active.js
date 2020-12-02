// console.log("content_active.js")

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
        console.log("Value is set to ", metas);
    });
}

metaValues = getMetas();
saveMetas(metaValues);