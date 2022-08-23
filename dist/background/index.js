/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/background/utils.js":
/*!*********************************!*\
  !*** ./src/background/utils.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, exports) => {

/* eslint-disable no-unused-vars */
function injectFetchScript (tabId, appid, message, tabListener) {
    chrome.scripting.executeScript(
        {
          target: {tabId},
          world: "MAIN",
          func: function(appid, testName, tabid){
            const requestDeps = new XMLHttpRequest()
            requestDeps.open('GET', `http://localhost:8081/api/deps?appid=` + appid + `&testName=` + testName, false)
            requestDeps.send(null)
            if(requestDeps.status == 200 && sessionStorage.getItem("depArr")==null){
                const docs = JSON.parse( requestDeps.responseText )
                sessionStorage.setItem("depArr", JSON.stringify(docs[0].deps))
                var dataObj = {"event":"playbackStarted", "testName":testName, "appid": appid, "tabId": tabid};
                let storeEvent = new CustomEvent('keploy', {"detail":dataObj});
                document.dispatchEvent(storeEvent);
            }
          },
          args: [appid, message.options.testName, tabId],
          injectImmediately: true,
        },
        function(results){
          if(results != undefined){
            chrome.tabs.onUpdated.removeListener(tabListener)
          }
        },
      )
}

exports.tabListener = function(message, appid){
    return function tabListener(tabId, changeInfo, tab) {
        if(tab.active === true){
            chrome.storage.sync.get(["appid"], function(d) {
            chrome.storage.sync.set({ "tabid": tabId, ...d}, function(){})
            appid = d.appid
            let data = {
                testName: message.options.testName, 
                event: message.event,
                appid: appid,
                tabId: tabId
            }
            if(message.event == "playbackStarted"){
                injectFetchScript(tabId, appid, message, tabListener)
            }
            else {
                chrome.tabs.sendMessage(tabId, data, (resp) => {
                if(!chrome.runtime.lastError && resp) {
                    chrome.tabs.onUpdated.removeListener(tabListener)
                } else {
                    console.log(chrome.runtime.lastError)
                }
                });
            }
            });

        }
    }
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!*********************************!*\
  !*** ./src/background/index.js ***!
  \*********************************/
/* eslint-disable no-empty */
/* eslint-disable no-unused-vars */

const {tabListener} = __webpack_require__(/*! ./utils */ "./src/background/utils.js")

// import browser from 'webextension-polyfill'
// import UAParser from 'ua-parser-js'

// const parser = new UAParser(window.navigator.userAgent)
// const browserName = parser.getBrowser().name
// const isChrome = browserName === 'Chrome'
// const isFirefox = browserName === 'Firefox'

function getId() {
  return 'mooikfkahbdckldjjndioackbalphokd'
  // if (process.env.SIDE_ID) return process.env.SIDE_ID
  // return isChrome
    // ? 'mooikfkahbdckldjjndioackbalphokd'
    // : isFirefox
    // ? '{a6fd85ed-e919-4a43-a5af-8da18bda539f}'
    // : ''
}

const sideId = getId()

function startPolling(payload) {
  setInterval(() => {
    chrome.runtime.sendMessage(sideId, {
        uri: '/health',
        verb: 'get',
      }).catch(res => ({ error: res.message }))
      .then(res => {
        if (!res) {
          chrome.runtime.sendMessage(sideId, {
            uri: '/register',
            verb: 'post',
            payload,
          })
        }
      })
  }, 1000)
}

startPolling({
  name: "Selenium IDE plugin",
  version: "1.0.0",
  commands: []
})

var appid = ""

chrome.scripting.getRegisteredContentScripts(
  {ids: ["1"]}, (scripts) => {
    if(scripts.length === 0){
      console.log("registers content script!!!")
      chrome.scripting.registerContentScripts(
        [{
            world: "MAIN", 
            id: "1", 
            js: [ `kscript.js`], 
            runAt: "document_start",
            allFrames: true,
            matches: ["<all_urls>"]
        }],
      )        
    }
  }
)

chrome.runtime.onMessageExternal.addListener(async (message, sender, sendResponse) => {
  console.log("event triggered", message)

  if(message.event==="recordingStopped" || message.event==="playbackStopped"){
    chrome.storage.sync.get(['tabid'], function(d) {
      chrome.tabs.sendMessage(d.tabid, {event: message.event, testName: message.options.testName, appid: d.appid, tabId: d.tabid}, (resp) => {
        if(!chrome.runtime.lastError && resp) {
          chrome.storage.sync.remove('tabid')
        } else {
          console.log(chrome.runtime.lastError)
        }
      })
    })
  }
  else if (message.event==="projectLoaded"){
    appid = message.options.projectName
    chrome.storage.sync.set({"appid": appid}, function() {});
  }
  else if(message.event !== "commandRecorded"){
    chrome.tabs.onUpdated.addListener(
      tabListener(message, appid)
    )
  }
  
  sendResponse(true);

});
})();

/******/ })()
;
//# sourceMappingURL=index.js.map