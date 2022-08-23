/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
/*!******************************!*\
  !*** ./src/content/index.js ***!
  \******************************/
/* eslint-disable no-unused-vars */
/* eslint-disable no-unreachable */

// Put content script here
console.log("Hello from content script");

let stateMap = new Map()

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (!stateMap.has(request.tabId) || stateMap.get(request.tabId)!==request.event){
        console.log("content-script: ", request, "stateMap = ", stateMap)
        stateMap.set(request.tabId, request.event)
        if(request.testName != undefined && request.testName !== "Untitled" && request.event!=="projectLoaded") {
            sendDataToExtension(request.event, request.testName, request.appid, request.tabId); 
        } 
    }
    return sendResponse(true);
});
    
function sendDataToExtension(event, testName, appId, tabId) {
    var meta = {"seleniunEvent":event, "testName":testName, "appId": appId, "tabId": tabId};
    
    let storeEvent = new CustomEvent('kselenium', {"detail":meta});
    document.dispatchEvent(storeEvent);
}
/******/ })()
;
//# sourceMappingURL=index.js.map