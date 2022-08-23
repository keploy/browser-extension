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
                let storeEvent = new CustomEvent('kselenium', {"detail":dataObj});
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
