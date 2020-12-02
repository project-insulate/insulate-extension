// ********* Functions ***********

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
            throw new Error("Failed to log in", data);
          }

          const customToken = data["customToken"];

          // Step 4
          chrome.runtime.sendMessage({
            customToken: customToken
          });
        });

    });
}

function logout() {
  chrome.runtime.sendMessage({
    logout: true
  });
}


// ********* Setup on load ***********

document.getElementById('login').onclick = login;
document.getElementById('logout').onclick = logout;

// Use to update the HTML accordingly
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Case 1: Listener for login complete
  if (request.loginComplete) {
    document.getElementById('login-state').style.display = "block";
    document.getElementById('login-state-2').style.display = "block";
    document.getElementById('logout-state').style.display = "none";
  }

  // Case 2: Listener for logout complete
  else if (request.logoutComplete) {
    document.getElementById('login-state').style.display = "none";
    document.getElementById('login-state-2').style.display = "none";
    document.getElementById('logout-state').style.display = "block";
  }

  // Case 3: Initial page load
  else if (request.type === "userLoggedInCheck") {
    if (request.userLoggedIn) {
      document.getElementById('login-state').style.display = "block";
      document.getElementById('login-state-2').style.display = "block";
      document.getElementById('logout-state').style.display = "none";
    }
    else {
      document.getElementById('login-state').style.display = "none";
      document.getElementById('login-state-2').style.display = "none";
      document.getElementById('logout-state').style.display = "block";
    }
  }
})


// Default states for meta related stuff
document.getElementById('monetization-correct').style.display = "none";
document.getElementById('monetization-correct-value').style.display = "none";
document.getElementById('monetization-wrong').style.display = "block";
document.getElementById('monetization-wrong-value').style.display = "block";

document.getElementById('insulated-correct').style.display = "none";
document.getElementById('insulated-correct-value').style.display = "none";
document.getElementById('insulated-wrong').style.display = "block";
document.getElementById('insulated-wrong-value').style.display = "block";

chrome.storage.local.get(["metas"], function (result) {
  console.log("Value is set to ", result);
  if (result.metas.monetization) {
    document.getElementById('monetization-correct').style.display = "block";
    document.getElementById('monetization-correct-value').style.display = "block";
    document.getElementById('monetization-wrong').style.display = "none";
    document.getElementById('monetization-wrong-value').style.display = "none";
    document.getElementById("monetization-pointer").textContent = result.metas.monetization;
  }

  if (result.metas.insulateId) {
    document.getElementById('insulated-correct').style.display = "block";
    document.getElementById('insulated-correct-value').style.display = "block";
    document.getElementById('insulated-wrong').style.display = "none";
    document.getElementById('insulated-wrong-value').style.display = "none";
    document.getElementById("insulated-id").textContent = result.metas.insulateId;
  }
});

// Request background script to find if a user is logged in or not on load
chrome.runtime.sendMessage({ isUserLoggedIn: true })
