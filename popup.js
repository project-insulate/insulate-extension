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

chrome.storage.sync.get(["metas"], function (result) {
  console.log("Value is set to ", result);
  if (result.metas.monetization)
    document.getElementById("p1").innerHTML = result.metas.monetization;
  if (result.metas.insulateId)
    document.getElementById("p2").innerHTML = result.metas.insulateId;
});

document.getElementById('login').onclick = login;
document.getElementById('getInfo').onclick = getInfo;
document.getElementById('logout').onclick = logout;

function login() {
  // Step 1: Prepare URL fro Chrome Web Auth Flow
  // Step 2: Initiate Web Auth Flow
  // Step 3: Use /api/login to either create new user or login - get custom token
  // Step 4: Login firebase using this custom token
  // ! TODO - Step 5: Show on UI that the login is complete

  console.log("Initiate login")

  // Step 1
  let fullURL = "https://coil.com/oauth/auth?response_type=code&scope=simple_wm openid&client_id=360c3e4f-52b3-4355-a711-eae313e529fe&state=b5f1872f-9d32-5f31-819d-5a4daeab4ea9&redirect_uri=https://kpafcniimffgahocmkkmjappffdmdapg.chromiumapp.org/provider_cb"

  // Step 2
  chrome.identity.launchWebAuthFlow(
    { url: fullURL, interactive: true },
    function (redirect_url) {
      const url = new URL(redirect_url);
      const authCode = url.searchParams.get("code");

      // Step 3
      fetch("http://localhost:8000/api/user/login", {
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
        .then(function (data) {
          if (data.errors) {
            throw new Error("Failed to add the block", data);
          }

          const customToken = data["customToken"];

          // Step 4
          firebase.auth().signInWithCustomToken(customToken)
            .then((user) => {
              // Signed in
              console.log("Login complete")
              console.log(user)
            })
            .catch((error) => {
              console.log("Login failed", error);
            })

        });

    });

}

function getInfo() {
  // firebase.auth().currentUser.getIdToken(true)
  //   .then(function (idToken) {
  //     console.log("idtoken", idToken);
  //   })

  console.log("kiddan?")
  const token = "kiddanToken";
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { token: token }, function (response) {
      console.log(response.tokenSent);
    });
  });

}

function logout() {
  firebase.auth().signOut().then(function () {
    window.user = null;
  }).catch(function (error) {
    // An error happened.
    console.error("logout failed", error)
  });
}
chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.msg === "updateToken") {
      firebase.auth().currentUser.getIdToken(true)
        .then(function (idToken) {
          console.log("Updating idToken on refresh", idToken);
          chrome.storage.sync.set({ access_token: idToken }, function () {
            console.log('Value is set to ' + idToken);
          });
        })
    }
  }
);

firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    window.user = user;
    console.log("logged in...")
    firebase.auth().currentUser.getIdToken(true)
      .then(function (idToken) {
        console.log("idtoken", idToken);
        // chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        //   chrome.tabs.sendMessage(tabs[0].id, { token: idToken }, function (response) {
        //     console.log(response);
        //   });
        // });
        chrome.storage.sync.set({ access_token: idToken }, function () {
          console.log('Value is set to ' + idToken);
        });
      })
  } else {
    // askForLogin();
    console.log("askForLogin()");
  }
});
