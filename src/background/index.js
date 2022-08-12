/* eslint-disable no-empty */
/* eslint-disable no-unused-vars */

const {tabListener} = require("./utils")

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