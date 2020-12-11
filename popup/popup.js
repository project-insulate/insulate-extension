// ********* Functions ***********

function login() {
  console.log("Initiate login")
  chrome.runtime.sendMessage({
    login: true
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
