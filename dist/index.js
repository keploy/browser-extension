/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
// /* eslint-disable no-unused-vars */
// /* eslint-disable no-unreachable */

// // Put content script here
// // console.log("Hello from content script");

// // let stateMap = new Map()

// // chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
// //     if (!stateMap.has(request.tabId) || stateMap.get(request.tabId)!==request.event){
// //         console.log("content-script: ", request, "stateMap = ", stateMap)
// //         stateMap.set(request.tabId, request.event)
// //         if(request.testName !== undefined && request.testName !== "Untitled" && request.event!=="projectLoaded") {
// //             sendDataToExtension(request.event, request.testName, request.appid, request.tabId); 
// //             if(request.event == "playbackStarted"){
//                 fetch(`http://localhost:8081/api/regression/selenium/get?appid=` + appid + `&testName=` + testName)
//                     .then((response) => response.json())
//                     .then((data) => {
//                     console.log(data);
//                     if (data.length == 1) {
//                         sessionStorage.setItem("depArr", JSON.stringify(data[0].deps));
//                         // return sendResponse(true);
//                         return true
//                     }
//                 });
// //             }else{
// //                 return sendResponse(true);
// //             }
// //         } 
// //         else if(request.event === "infraRecordingClose") {
// //             var storeEvent = new CustomEvent('eventMode', {"detail":{"event":request.event}});
// //             document.dispatchEvent(storeEvent);
// //             return sendResponse(true);
// //         }
// //     }
// //     // return true;
// // });
    
// // function sendDataToExtension(event, testName, appid, tabId) {
// //     var dataObj = {"event":event, "testName":testName, "appid": appid, "tabId": tabId};
// //     let storeEvent = new CustomEvent('eventMode', {"detail":dataObj});
        
// //     document.dispatchEvent(storeEvent);
// // }
/******/ })()
;
//# sourceMappingURL=index.js.map