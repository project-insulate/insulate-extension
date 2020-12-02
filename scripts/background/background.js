console.info("Initiate background.js for Project Insulate");

// ********* Firebase setup ***********

var firebaseConfig = {
  apiKey: "AIzaSyA2XPqup45dgwr2kY3Ia-Nh9LFCOUmCjd0",
  authDomain: "project-insulate.firebaseapp.com",
  databaseURL: "https://project-insulate.firebaseio.com",
  projectId: "project-insulate",
  storageBucket: "project-insulate.appspot.com",
  messagingSenderId: "940006048159",
  appId: "1:940006048159:web:c6e7a79481f87061f43daa",
  measurementId: "G-WY11YRBL0B"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);


// ********* Injection of content.js on every new tab ***********
let activeTabId;
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (tab.active && changeInfo.status === "complete") {
    chrome.tabs.executeScript(tabId, { file: "scripts/content/content.js" }, (_) => {
      // capture the error
      let e = chrome.runtime.lastError;

      activeTabId = tabId;
      chrome.tabs.sendMessage(tabId, {
        type: 'tab',
        value: tab
      });
    });
  }
});

chrome.tabs.onActivated.addListener(function (activeInfo) {
  if (activeInfo.tabId) {
    chrome.tabs.executeScript(activeInfo.tabId, { file: "scripts/content/content_active.js" }, (_) => {
      // capture the error
      let e = chrome.runtime.lastError;

      activeTabId = activeInfo.tabId;
    });
  }
});


// ********* Main listener ***********
// Runs 4 different cases and sends message back to content.js and popup.js accordingly

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  console.log(request);

  // Case 1: Login using customToken 
  if (request.customToken) {
    console.log("Request object contains customToken");
    try {
      const user = await firebase.auth().signInWithCustomToken(request.customToken);
      console.log("User logged in!");
      chrome.runtime.sendMessage({
        loginComplete: true
      })
    } catch (error) {
      console.log("Login failed", error);
    }
  }

  // Case 2: Logout
  else if (request.logout) {
    try {
      await firebase.auth().signOut();
      chrome.runtime.sendMessage({
        logoutComplete: true
      })
    } catch (error) {
      console.error("logout failed", error)
    }
  }

  // Case 3: Fetch latest accessToken for content.js to create a block
  else if (request.accessTokenRequired) {
    try {
      if (firebase.auth().currentUser) {
        const token = await firebase.auth().currentUser.getIdToken(true);
        chrome.tabs.sendMessage(activeTabId, {
          type: 'access_token',
          accessToken: token
        })
      }
    } catch (error) {
      console.error("fetching access token failed", error);
      chrome.tabs.sendMessage(activeTabId, {
        type: 'access_token',
      })
    }
  }

  // Case 4: On initial load of popup.js, provide current user login status
  else if (request.isUserLoggedIn) {
    console.log("firebase.auth().currentUser", firebase.auth().currentUser)
    if (firebase.auth().currentUser) {
      chrome.runtime.sendMessage({
        type: "userLoggedInCheck",
        userLoggedIn: true
      })
    }
    else {
      chrome.runtime.sendMessage({
        type: "userLoggedInCheck",
        userLoggedIn: false
      })
    }
  }
})