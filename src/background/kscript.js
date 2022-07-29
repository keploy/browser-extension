/* eslint-disable no-global-assign */
/* eslint-disable no-prototype-builtins */
/* eslint-disable no-unused-vars */
window.foo = "barrr"

console.log("kscript.js injected")

const flatten = require("flat");
const Hashes = require("jshashes");
var SHA256 =  new Hashes.SHA256

const MockXMLHttpRequest = require("mock-xmlhttprequest");
const MockXhr = MockXMLHttpRequest.newMockXhr();
function RecordXMLRequests() {
    const origFetch = window.fetch;
    window.fetch = (...args) => {
        console.log("in fetch", args);
        return origFetch.apply(window, args);
    };
    const origXMLHttpRequestSend = XMLHttpRequest.prototype.send;
    const origXMLHttpRequestOpen = XMLHttpRequest.prototype.open;
    const wrappedSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
    // let depArr: any[] = [];
    // @ts-ignore
    XMLHttpRequest.prototype.open = function (...args) {
        console.log(args);
        // @ts-ignore
        this.requestArr = args;
        // @ts-ignore
        return origXMLHttpRequestOpen.apply(this, args);
    };
    // @ts-ignore
    XMLHttpRequest.prototype.wrappedSetRequestHeader =
        XMLHttpRequest.prototype.setRequestHeader;
    // Override the existing setRequestHeader function so that it stores the headers
    XMLHttpRequest.prototype.setRequestHeader = function (header, value) {
        // Call the wrappedSetRequestHeader function first
        // so we get exceptions if we are in an erronous state etc.
        // @ts-ignore
        wrappedSetRequestHeader.apply(this, [header, value]);
        // Create a headers map if it does not exist
        // @ts-ignore
        if (!this.headers) {
            // @ts-ignore
            this.headers = {};
            // @ts-ignore
            this.headerKeys = "";
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
        // @ts-ignore
        this.headerKeys += header.toLowerCase() + ',';
    };
    XMLHttpRequest.prototype.send = function (...args) {
        console.log("before xmlHttpRequest send: ", this);
        this.addEventListener("readystatechange", function (e) {
            // @ts-ignore
            if (this.readyState == this.DONE || (this.requestArr[0] === "POST" && this.readyState === 3)) {
                // @ts-ignore
                console.log("---", this.method, ", ", this.requestArr[0]);
                // @ts-ignore
                const urlArr = this.requestArr[1].split("?");
                var paramKeys = "";
                const url = urlArr[0];
                if (urlArr.length > 1) {
                    var params = urlArr[1].split("&");
                    params.forEach(function (el) {
                        paramKeys += el.split("=")[0];
                    });
                }
                const flattenJSON = (args[0] !== null && args[0] !== undefined) ? JSON.stringify(Object.keys(flatten(args[0]))) : "";
                // @ts-ignore
                let hashPwd = SHA256.hex(this.requestArr[0] + url + paramKeys + this.headerKeys + flattenJSON)
                    // .digest("hex");
                // @ts-ignore
                console.log(hashPwd, " hash of request: ", this.requestArr[0] + url + paramKeys + this.headerKeys + flattenJSON);
                // if( !depArr.has(hashPwd) ) {
                let storedDepArrString = sessionStorage.getItem("depArr");
                if (storedDepArrString != null) {
                    let arr = JSON.parse(storedDepArrString);
                    arr.push({ [hashPwd]: {
                            status: this.status,
                            headers: getHeaders(this.getAllResponseHeaders()),
                            body: this.response,
                        }
                    });
                    sessionStorage.setItem("depArr", JSON.stringify(arr));
                }
                else {
                    sessionStorage.setItem("depArr", JSON.stringify([{ [hashPwd]: {
                                status: this.status,
                                headers: getHeaders(this.getAllResponseHeaders()),
                                body: this.response,
                            }
                        }]));
                }
                // }
            }
        });
        const x = origXMLHttpRequestSend.apply(this, args);
        return x;
    };
}
function getHeaders(headers) {
    // Convert the header string into an array
    // of individual headers
    const arr = headers.trim().split(/[\r\n]+/);
    // Create a map of header names to values
    const headerMap = {};
    arr.forEach(function (line) {
        const parts = line.split(": ");
        const header = parts.shift();
        const value = parts.join(": ");
        if (typeof header === typeof "string" && header !== undefined) {
            // @ts-ignore
            headerMap[header] = value;
        }
    });
    return headerMap;
}
function onRecordStop(test_name, appid) {
    if (test_name != undefined && appid != undefined && test_name != "" && appid != "") {
        fetch("http://localhost:8081/api/regression/selenium/insert", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                app_id: appid,
                test_name: test_name,
                // deps: mapToObj(depArr),
                deps: JSON.parse(sessionStorage.getItem("depArr") || "")
            }),
        }).then(res => console.log(res));
    }
}
function fetchDeps(testName, appid) {
    if (testName != undefined && appid != undefined && testName != "" && appid != "") {
        fetch(`http://localhost:8081/api/regression/selenium/get?appid=` + appid + `&testName=` + testName)
            .then((response) => response.json())
            .then((data) => {
            console.log(data);
            if (data.length == 1) {
                sessionStorage.setItem("depArr", JSON.stringify(data[0].deps));
            }
        });
    }
}
var originalXMLHttpRequest;
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
            const urlArr = xhr.url.split("?");
            const url = urlArr[0];
            var paramKeys = "";
            if (urlArr.length > 1) {
                var params = urlArr[1].split("&");
                params.forEach(function (el) {
                    paramKeys += el.split("=")[0];
                });
            }
            const flattenJSON = (xhr.body !== null && xhr.body !== undefined) ? JSON.stringify(Object.keys(flatten(xhr.body))) : "";
            let headersArr = Object.keys(xhr.requestHeaders.getHash()), headerKeys = "";
            headersArr.forEach(el => headerKeys += el + ",");
            // @ts-ignore
            let hashPwd = SHA256.hex(this.requestArr[0] + url + paramKeys + this.headerKeys + flattenJSON)

            // let hashPwd = crypto.createHash("sha256").update(xhr.method + url + paramKeys + headerKeys + flattenJSON)
            //     .digest("hex");
            console.log(hashPwd, " hash of request: ", xhr.method + url + paramKeys + headerKeys + flattenJSON);
            let depArr = JSON.parse(sessionStorage.getItem("depArr") || "[]");
            depArr = depArr.filter((el) => {
                if (!el.hasOwnProperty(hashPwd)) {
                    return true;
                }
                xhr.respond(el[hashPwd].status, el[hashPwd].headers, el[hashPwd].body);
            });
            sessionStorage.setItem("depArr", JSON.stringify(depArr));
            console.log("xhr: ", xhr);
            const responseHeaders = { 'Content-Type': 'application/json' };
            const response = '{ "message": "Success!" }';
            xhr.respond(200, responseHeaders, response);
        };
        XMLHttpRequest = MockXhr;
        // @ts-ignore
        // XMLHttpRequest = undefined;
    }
    document.addEventListener("eventMode", function (event) {
        // @ts-ignore
        const dataFromPage = event.detail;
        console.log("into webpage: ", dataFromPage, internalStorage);
        if (dataFromPage.event === "recordingStarted") {
            console.log(`
            
            recordingStarted: `, event, `
            
            `);
            RecordXMLRequests();
            sessionStorage.setItem("testName", dataFromPage.testName);
            sessionStorage.setItem("appid", dataFromPage.appid);
            sessionStorage.setItem("mode", "record");
            // unloadCallbackTab.set(dataFromPage.tabId, true)
            // window.addEventListener("beforeunload", function (e) {
            //     //     this.alert(depArr)
            //     window.addEventListener("load", function(e){
            //         console.log(" **** Redirect **** ")
            //     })
            //     onRecordStop(dataFromPage.testName, dataFromPage.appid, dataFromPage.tabId);
            //     // e.preventDefault();
            // });
            // window.onbeforeunload = function() {
            //     onRecordStop(dataFromPage.value)
            // }
        }
        else if (dataFromPage.event === "recordingStopped") {
            //     onRecordStop(dataFromPage.value)
            //     XMLHttpRequest.prototype.send = origXMLHttpRequestSend;
            //     XMLHttpRequest.prototype.open = origXMLHttpRequestOpen;
            //     XMLHttpRequest.prototype.setRequestHeader = wrappedSetRequestHeader;
        }
        else if (dataFromPage.event === "projectLoaded") {
            sessionStorage.setItem("appid", dataFromPage.appid);
        }
        else if (dataFromPage.event === "infraRecordingClose") {
            let testName = sessionStorage.getItem("testName");
            let appid = sessionStorage.getItem("appid");
            if (testName != null && appid != null) {
                onRecordStop(testName, appid);
            }
            sessionStorage.clear();
        }
        else if (sessionStorage.getItem("mode") == null && dataFromPage.event === "playbackStarted") {
            console.log("playback event called in webapp: ", dataFromPage);
            sessionStorage.setItem("testName", dataFromPage.testName);
            sessionStorage.setItem("appid", dataFromPage.appid);
            sessionStorage.setItem("mode", "test");
            fetchDeps(dataFromPage.testName, dataFromPage.appid);
            // XMLHttpRequest.addEventListener("readystatechange")
            originalXMLHttpRequest = XMLHttpRequest;
            // Mock JSON response
            MockXhr.onSend = (xhr) => {
                const urlArr = xhr.url.split("?");
                const url = urlArr[0];
                var paramKeys = "";
                if (urlArr.length > 1) {
                    var params = urlArr[1].split("&");
                    params.forEach(function (el) {
                        paramKeys += el.split("=")[0];
                    });
                }
                const flattenJSON = (xhr.body !== null && xhr.body !== undefined) ? JSON.stringify(Object.keys(flatten(xhr.body))) : "";
                let headersArr = Object.keys(xhr.requestHeaders.getHash()), headerKeys = "";
                headersArr.forEach(el => headerKeys += el + ",");
                // @ts-ignore
                let hashPwd = SHA256.hex(this.requestArr[0] + url + paramKeys + this.headerKeys + flattenJSON)

                // let hashPwd = crypto.createHash("sha256").update(xhr.method + url + paramKeys + headerKeys + flattenJSON)
                //     .digest("hex");
                console.log(hashPwd, " hash of request: ", xhr.method + url + paramKeys + headerKeys + flattenJSON);
                let depArr = JSON.parse(sessionStorage.getItem("depArr") || "[]");
                depArr = depArr.filter((el) => {
                    if (!el.hasOwnProperty(hashPwd)) {
                        return true;
                    }
                    xhr.respond(el[hashPwd].status, el[hashPwd].headers, el[hashPwd].body);
                });
                sessionStorage.setItem("depArr", JSON.stringify(depArr));
                console.log("xhr: ", xhr);
                const responseHeaders = { 'Content-Type': 'application/json' };
                const response = '{ "message": "Success!" }';
                xhr.respond(200, responseHeaders, response);
            };
            XMLHttpRequest = MockXhr;
            // @ts-ignore
            // XMLHttpRequest = undefined;
        }
        else if (dataFromPage.event === "playbackStopped") {
            sessionStorage.clear();
            XMLHttpRequest = originalXMLHttpRequest;
        }
        // @ts-ignore
        internalStorage[dataFromPage.testName] = [dataFromPage.event, dataFromPage.appid];
    });
}

registerXML()

exports.default = registerXML;
