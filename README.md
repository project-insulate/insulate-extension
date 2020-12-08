# Project Insulate Chrome Extension

Project Insulate aims to protect an API call used by a provider to send data when dependent on Web Monetization. Currently, the only way to fetch data is to keep the endpoint public if no paid-user login is present on the UI. Also, this project ensures no user PPI is shared with the provider to maintain the privacy component of the Web Monetization technology.

## Chrome Web Store
**TODO: insert extension live link**

## Screenshots
**TODO: add better screenshots**

<p float="left">
  <img src="https://i.imgur.com/YsjDyk6.png" width="300" />
  <img src="https://i.imgur.com/P5e1eBt.png" width="300" /> 
</p>

## How it works?
### Case 1: Provider (any one providing data and trying to secure API call)
Firstly, you would need to register with Project Insulate using the instructions given in [API README](https://github.com/project-insulate/insulate-api) to get a `clientId` and `clientSecret`. 

Once register, as you can see in the [demo.html page](https://github.com/project-insulate/insulate-extension/blob/master/demo.html), provider needs to add a `meta` tag with name as `insulate-id` and value being the `clientId`.

Everytime a user logged into the Insulate extension visits this page, it will automatically verify with the Insulate backend it's validity with Coil subscription and if valid, will return the webpage with an event `insulateTransactionId` giving the provider a `transactionId`. This transactionId can be passed to the provider's backend.

Now, provider's backend can send this `transactionId` with the `clientSecret` and Insulate's [API]((https://github.com/project-insulate/insulate-api)) will let you know if you should provide access to this user or not by validating the `transactionId` and hence securing the provider's endpoint.

### Case 2: Viewer
Simply download the extension and sign in with Coil. Extension will automatically deal with updating Insulate backend whenever a page with valid `monetization` and `insulate-id` meta tags are found, and provider can provide you access **without** knowing who the user is, mainting the privacy of the user.

## Running locally
To run Chrome extension locally, firstly:
```
git clone https://github.com/project-insulate/insulate-extension.git
cd insulate-extension
```
You can find step-by-step information [here at Chrome Documentation](https://developer.chrome.com/extensions/getstarted) to set up development environment for the extension.
---
#### Logo Attribution: 

Icons made by <a href="https://icon54.com/" title="Pixel perfect">Pixel perfect</a> from <a href="https://www.flaticon.com/" title="Flaticon"> www.flaticon.com</a>
