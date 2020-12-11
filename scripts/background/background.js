// console.info("Initiate background.js for Project Insulate");

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
  // console.log(request);

  // Case 1: Login using customToken 

  // Step 1: Prepare URL fro Chrome Web Auth Flow
  // Step 2: Initiate Web Auth Flow
  // Step 3: Use /api/login to either create new user or login - get custom token
  // Step 4: Login firebase using this custom token
  // Step 5: Show on UI that the login is complete

  if (request.login) {
    try {

      // Step 1

      // remote redirect
      let fullURL = "https://coil.com/oauth/auth?response_type=code&scope=simple_wm openid&client_id=360c3e4f-52b3-4355-a711-eae313e529fe&state=b5f1872f-9d32-5f31-819d-5a4daeab4ea9&redirect_uri=https://cjadajociaammcjggipgndckjbjadnig.chromiumapp.org/provider_cb"

      // local redirect
      // let fullURL = "https://coil.com/oauth/auth?response_type=code&scope=simple_wm openid&client_id=360c3e4f-52b3-4355-a711-eae313e529fe&state=b5f1872f-9d32-5f31-819d-5a4daeab4ea9&redirect_uri=https://kpafcniimffgahocmkkmjappffdmdapg.chromiumapp.org/provider_cb"

      // Step 2
      chrome.identity.launchWebAuthFlow(
        { url: fullURL, interactive: true },
        function (redirect_url) {
          const url = new URL(redirect_url);
          const authCode = url.searchParams.get("code");

          // Step 3
          fetch("https://project-insulate.herokuapp.com/api/user/login", {
            // fetch("http://localhost:8000/api/user/login", {
            method: "post",
            body: JSON.stringify({
              authCode: authCode
            }),
            headers: {
              "Content-Type": "application/json"
            }
          })
            .then(async (response) => {
              return await response.json();
            })
            .then(async function (data) {
              if (data.errors) {
                throw new Error("Failed to log in", data);
              }

              try {
                const customToken = data["customToken"];
                const user = await firebase.auth().signInWithCustomToken(customToken);

                console.log("Insulate extension: User logged in!");
                chrome.runtime.sendMessage({
                  loginComplete: true
                })
              }
              catch (err) {
                console.log("Login failed through firebase auth", err);
              }
            });
        });

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
      chrome.tabs.sendMessage(activeTabId, {
        type: 'access_token',
      })
    }
  }

  // Case 4: On initial load of popup.js, provide current user login status
  else if (request.isUserLoggedIn) {
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