/* eslint-disable no-empty */
/* eslint-disable no-unused-vars */

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
  commands: [
    {
      id: "open",
      name: "open"
    },
    {
      id: "infraRecordingClose",
      name: "Infra Recording Close"
    }
  ]
})

var appid = ""
var testName = ""

chrome.runtime.onSuspend.addListener(function() {
  console.log("Unloading.");
  chrome.storage.sync.set({"appid": appid}, function() {});
});

chrome.storage.sync.get("appid", function(data) {
  appid = data
  console.log("shouldn't be an empty object", data);
});

// let x = chrome.scripting.RegisteredContentScript()
// console.log("chrome.scripting.RegisteredContentScript: ", x)
// chrome.tabs.onUpdated.addListener(async function(tabId, changeInfo, tab){
//   console.log("tabId", tabId, " tab: ", tab)
  // try{

    // await chrome.scripting.registerContentScripts(
      chrome.scripting.getRegisteredContentScripts(
        {ids: ["1"]}, (scripts) => {
          if(scripts != null || scripts.length == 0){
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
    // chrome.scripting.registerContentScripts(
    //   [{
    //      world: "MAIN", 
    //      id: "1", 
    //      js: [ `kscript.js`], 
    //      runAt: "document_start",
    //      allFrames: true,
    //      matches: ["<all_urls>"]
    //   }],
      // function(){
      //   if(!chrome.runtime.lastError){
      //     // console.log(window.foo)
      //     console.log("registerContentScripts injected")
      //   }
      //   else{
      //     console.log(chrome.runtime.lastError)
      //   }
      // },
    // )
  // }
  // catch(err){
  //   console.log(err)
  // }
// })

// chrome.scripting.registerContentScripts(
//   [{
//      world: "MAIN", 
//      id: "2", 
//      js: [ `index.js`], 
//      runAt: "document_start",
//      allFrames: true,
//      matches: ["<all_urls>"]
//   }],)

chrome.runtime.onMessageExternal.addListener(async (message, sender, sendResponse) => {
  console.log("event triggered", message)
  // chrome.scripting.registerContentScripts(scripts: [chrome.scripting.RegisteredContentScript])

  if (message.action === "execute") {
    console.log("execute the following command: ", message.command.command)
    switch (message.command.command) {
      case "open":
        // console.log("called open")
        // setTimeout(() => {
          // console.log("ended open command")
          sendResponse(true);
        // }, 3000)
        break;
      case "infraRecordingClose":
        sendResponse(true);
        break;
      case "close":
        break;
    }
    // sendResponse(false);
  }
  else {

    // stop selenium recording before closing the rescording tab
    if(message.event==="recordingStopped"){
      console.log("removed listener")
      chrome.storage.sync.get(['tabid'], function(d) {
        console.log("infraRecordingClose: ", d)
        chrome.tabs.sendMessage(d.tabid, {event: "infraRecordingClose"}, (resp) => {
          if(!chrome.runtime.lastError && resp) {
            console.log("infraRecordingClose sendMessage returned: ", resp)
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
    else if(message.event==="playbackStarted"){
      console.log("into playback background")
      chrome.tabs.onUpdated.addListener(
        tabListener
      )
  
    }
    else if(message.event==="playbackStopped"){
      chrome.storage.sync.get(['tabid'], function(d) {
        console.log("playbackStopped: ", d)
        chrome.tabs.sendMessage(d.tabid, {event: message.event, testName: message.options.testName, appid: d.appid, tabId: d.tabid}, (resp) => {
          if(!chrome.runtime.lastError && resp) {
            console.log("playbackStopped sendMessage returned: ", resp)
            chrome.storage.sync.remove('tabid')
          } else {
            console.log(chrome.runtime.lastError)
          }
        })
      })
    }
    else if(message.event !== "commandRecorded"){
      chrome.tabs.onUpdated.addListener(
        tabListener
      )
    }
  
    
    sendResponse(true);
  }
  function tabListener(tabId, changeInfo, tab) {
    if(
      tab.active === true
    ){
      console.log(tab)
      chrome.storage.sync.get(["appid"], function(d) {
        chrome.storage.sync.set({ "tabid": tabId, ...d}, function(){})
        appid = d.appid
        console.log("started: ", d, " ", appid)
        let data = {
          testName: message.options.testName, 
          event: message.event,
          appid: appid,
          tabId: tabId
        }
        if(message.event == "playbackStarted"){

          chrome.scripting.executeScript(
            {
              target: {tabId},
              world: "MAIN",
              func: function(appid, testName, tabid){
                let fetched = false
                const requestDeps = new XMLHttpRequest()
                requestDeps.open('GET', `http://localhost:8081/api/regression/selenium/get?appid=` + appid + `&testName=` + testName, false)
                requestDeps.send(null)
                if(requestDeps.status == 200 && sessionStorage.getItem("depArr")==null){
                    const docs = JSON.parse( requestDeps.responseText )
                    // console.log("** ** ",requestDeps.responseText)
                    sessionStorage.setItem("depArr", JSON.stringify(docs[0].deps))
                    var dataObj = {"event":"playbackStarted", "testName":testName, "appid": appid, "tabId": tabid};
                    let storeEvent = new CustomEvent('eventMode', {"detail":dataObj});
                    document.dispatchEvent(storeEvent);
                }
                // fetch(`http://localhost:8081/api/regression/selenium/get?appid=` + appid + `&testName=` + testName)
                //     .then((response) => response.json())
                //     .then((data) => {
                //     console.log("fetched data: ", data);
                //     fetched = true
                //     if (data.length == 1 && sessionStorage.getItem("depArr")==null) {
                //         sessionStorage.setItem("depArr", JSON.stringify(data[0].deps));
                //         var dataObj = {"event":"playbackStarted", "testName":testName, "appid": appid, "tabId": tabid};
                //         let storeEvent = new CustomEvent('eventMode', {"detail":dataObj});
                //         document.dispatchEvent(storeEvent);
                //         // chrome.tabs.onUpdated.removeListener(tabListener)
                //         // return sendResponse(true);
                //         return true
                //     }
                // });
              },
              args: [appid, message.options.testName, tabId],
              injectImmediately: true,
            },
            function(results){
              console.log(results)
              if(results != undefined){
                chrome.tabs.onUpdated.removeListener(tabListener)
              }
              // chrome.tabs.sendMessage(tabId, data, (resp) => {
              //   if(!chrome.runtime.lastError && resp) {
              //     console.log(resp)
              //     chrome.tabs.onUpdated.removeListener(tabListener)
              //   } else {
              //     console.log(chrome.runtime.lastError)
              //   }
              // });
              // if(result){
                // chrome.tabs.onUpdated.removeListener(tabListener)
              // }
            },
          )
        }
        else {
          chrome.tabs.sendMessage(tabId, data, (resp) => {
            if(!chrome.runtime.lastError && resp) {
              console.log(resp)
              chrome.tabs.onUpdated.removeListener(tabListener)
            } else {
              console.log(chrome.runtime.lastError)
            }
          });
        }
      });

    }
  }

});