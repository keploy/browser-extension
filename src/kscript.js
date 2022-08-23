/* eslint-disable no-global-assign */
/* eslint-disable no-prototype-builtins */
/* eslint-disable no-unused-vars */

const MockXMLHttpRequest = require("mock-xmlhttprequest");
const MockXhr = MockXMLHttpRequest.newMockXhr();
const {isValidJSONString, onRecordStop, Send, Open, SetRequestHeader, getResponseHeaders, getQueryParams, getRequestHeaders, ProcessXmlSend} = require("./utils")

function RecordXMLRequests() {
    XMLHttpRequest.prototype.open = function (...args) {
        this.requestArr = args;
        return Open.apply(this, args);
    };
    // Override the existing setRequestHeader function so that it stores the headers
    XMLHttpRequest.prototype.setRequestHeader = function (header, value) {
        // Call the SetRequestHeader function first
        // so we get exceptions if we are in an erronous state etc.
        SetRequestHeader.apply(this, [header, value]);
        // Create a headers map if it does not exist
        if (!this.headers) {
            this.headers = {};
        }
        // Create a list for the header that if it does not exist
        if (!this.headers[header]) {
            this.headers[header] = [];
        }
        // Add the value to the header
        this.headers[header].push(value);
    };
    XMLHttpRequest.prototype.send = function (...args) {
        this.addEventListener("readystatechange", function (e) {
            let isPushed = false
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
    const mode = sessionStorage.getItem("mode");
    switch (mode) {
        case "record":
            RecordXMLRequests();
            break;
        case "test":
             // Mock JSON response
            MockXhr.onSend = (xhr) => {
                ProcessXmlSend(xhr, "test", xhr.url, xhr.body, xhr.requestHeaders.getHash(), xhr.method)
            };
            XMLHttpRequest = MockXhr;
            break;
        default:
            if (mode != null) {
                console.error("received unknown keploy mode", mode)
            }
    }
}

// TODO why is the eventListener declared here? 
document.addEventListener("kselenium", function (event) {
    // TODO this should really be a switch case
    const meta = event.detail;
    switch (meta.event) {
        case "recordingStarted":
            sessionStorage.setItem("testName", meta.testName);
            sessionStorage.setItem("app", meta.app);
            sessionStorage.setItem("mode", "record");
            registerXML();
            break;
        case "recordingStopped":
            onRecordStop()
            break;
        case "projectLoaded":
            sessionStorage.setItem("app", meta.app);
            break;
        case "playbackStopped":
            sessionStorage.removeItem("depArr")
            sessionStorage.removeItem("testName")
            sessionStorage.removeItem("app")
            sessionStorage.removeItem("mode")
            XMLHttpRequest = originalXMLHttpRequest;
            break
        case "playbackStarted":
            if (mode == null) {
                sessionStorage.setItem("testName", meta.testName);
                sessionStorage.setItem("app", meta.app);
                sessionStorage.setItem("mode", "test");
                registerXML();
            }
        default:
            console.error("unsupported selenium event", meta.event)
    }
});

registerXML()

exports.default = registerXML;
