/* eslint-disable no-global-assign */
/* eslint-disable no-prototype-builtins */
/* eslint-disable no-unused-vars */

const MockXMLHttpRequest = require("mock-xmlhttprequest");
const MockXhr = MockXMLHttpRequest.newMockXhr();
const {isValidJSONString, onRecordStop, Send, Open, SetRequestHeader, getResponseHeaders, getQueryParams, getRequestHeaders, ProcessXmlSend} = require("./utils")

function RecordXMLRequests() {
    // @ts-ignore
    XMLHttpRequest.prototype.open = function (...args) {
        // @ts-ignore
        this.requestArr = args;
        // @ts-ignore
        return Open.apply(this, args);
    };
    // Override the existing setRequestHeader function so that it stores the headers
    XMLHttpRequest.prototype.setRequestHeader = function (header, value) {
        // Call the SetRequestHeader function first
        // so we get exceptions if we are in an erronous state etc.
        // @ts-ignore
        SetRequestHeader.apply(this, [header, value]);
        // Create a headers map if it does not exist
        // @ts-ignore
        if (!this.headers) {
            // @ts-ignore
            this.headers = {};
        }
        // Create a list for the header that if it does not exist
        // @ts-ignore
        if (!this.headers[header]) {
            // @ts-ignore
            this.headers[header] = [];
        }
        // Add the value to the header
        // @ts-ignore
        this.headers[header].push(value);
    };
    XMLHttpRequest.prototype.send = function (...args) {
        this.addEventListener("readystatechange", function (e) {
            let isPushed = false
            // @ts-ignore
            if (((this.readyState >= 3 && this.status > 0 && this.response!=undefined )) && !isPushed ) {
                ProcessXmlSend(this, "record", this.requestArr[1], args[0], this.headers, this.requestArr[0])
                isPushed = true
            }
        });
        const x = Send.apply(this, args);
        return x;
    };
}

var originalXMLHttpRequest = XMLHttpRequest;
function registerXML() {
    
    const unloadCallbackTab = new Map();
    // an object used to store things passed in from the API
    const internalStorage = {};
    const mode = sessionStorage.getItem("mode");
    if (mode != null && mode == "record") {
        RecordXMLRequests();
    }
    else if (mode != null && mode == "test") {
        // Mock JSON response
        MockXhr.onSend = (xhr) => {
            ProcessXmlSend(xhr, "test", xhr.url, xhr.body, xhr.requestHeaders.getHash(), xhr.method)
        };
        XMLHttpRequest = MockXhr;
    }
    document.addEventListener("eventMode", function (event) {
        // @ts-ignore
        const dataFromPage = event.detail;
        if (dataFromPage.event === "recordingStarted") {
            RecordXMLRequests();
            sessionStorage.setItem("testName", dataFromPage.testName);
            sessionStorage.setItem("appid", dataFromPage.appid);
            sessionStorage.setItem("mode", "record");
        }
        else if (dataFromPage.event === "recordingStopped") {
                onRecordStop()
        }
        else if (dataFromPage.event === "projectLoaded") {
            sessionStorage.setItem("appid", dataFromPage.appid);
        }
        else if (sessionStorage.getItem("mode") == null && dataFromPage.event === "playbackStarted") {
            sessionStorage.setItem("testName", dataFromPage.testName);
            sessionStorage.setItem("appid", dataFromPage.appid);
            sessionStorage.setItem("mode", "test");
            originalXMLHttpRequest = XMLHttpRequest;
            // Mock JSON response
            MockXhr.onSend = (xhr) => {
                ProcessXmlSend(xhr, "test", xhr.url, xhr.body, xhr.requestHeaders.getHash(), xhr.method)
            };
            XMLHttpRequest = MockXhr;
        }
        else if (dataFromPage.event === "playbackStopped") {
            sessionStorage.removeItem("depArr")
            sessionStorage.removeItem("testName")
            sessionStorage.removeItem("appid")
            sessionStorage.removeItem("mode")
            XMLHttpRequest = originalXMLHttpRequest;
        }
        // @ts-ignore
        internalStorage[dataFromPage.testName] = [dataFromPage.event, dataFromPage.appid];
    });
}

registerXML()

exports.default = registerXML;
