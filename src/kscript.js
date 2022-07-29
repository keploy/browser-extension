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

function isValidJSONString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

const origXMLHttpRequestSend = XMLHttpRequest.prototype.send;
const origXMLHttpRequestOpen = XMLHttpRequest.prototype.open;
const wrappedSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;

// XMLHttpRequest.prototype.send = function(...args) {
//     setTimeout(function() {
//         return origXMLHttpRequestSend.apply(this, args)
//     }, 3000)
// }

function ResetXMLHttpRequest() {
    XMLHttpRequest.prototype.send = origXMLHttpRequestSend
    XMLHttpRequest.prototype.open = origXMLHttpRequestOpen
    XMLHttpRequest.prototype.setRequestHeader = wrappedSetRequestHeader
}

function RecordXMLRequests() {
    const origFetch = window.fetch;
    window.fetch = (...args) => {
        console.log("in fetch", args);
        return origFetch.apply(window, args);
    };
    // const origXMLHttpRequestSend = XMLHttpRequest.prototype.send;
    // const origXMLHttpRequestOpen = XMLHttpRequest.prototype.open;
    // const wrappedSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
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
        console.log(`
        
            setRequestHeader: `, header, `
            
            `)
        // @ts-ignore
        this.headerKeys += header.toLowerCase() + ',';
    };
    XMLHttpRequest.prototype.send = function (...args) {
        console.log("before xmlHttpRequest send: ", this);
        this.addEventListener("readystatechange", function (e) {
            console.log(" *** ", this.status, " ", this.response, " ", this.readyState)
            // @ts-ignore
            if (this.readyState == this.DONE || (this.requestArr[0] === "POST" && this.readyState === 3) || (this.readyState === 3 && this.status != 0 && this.response!=undefined )) {
                // @ts-ignore
                console.log("---", this.method, ", ", this.requestArr[0], ", ", isValidJSONString(args[0]) ? "" : args[0]);
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
                let flattenJSON = (args[0] !== null && args[0] !== undefined) ? JSON.stringify(Object.keys(flatten(isValidJSONString(args[0]) ? JSON.parse(args[0]) : args[0])) ) : "";
                if(this.headerKeys ==undefined){
                    this.headerKeys = ""
                }
                if(this.headers != undefined && this.headers != null) {
                    this.headerKeys = ""
                    let headers = Object.keys(this.headers)
                    headers.forEach((headerKey) => this.headerKeys += headerKey.toLowerCase()+",")
                    if(this.headerKeys == "[]"){
                        this.headerKeys = ""
                    }
                }
                if(flattenJSON=="[]"){
                    flattenJSON = ""
                }
                // @ts-ignore
                let hashPwd = SHA256.hex(String(this.requestArr[0]).toUpperCase() + url + paramKeys + this.headerKeys + flattenJSON)
                    // .digest("hex");
                // @ts-ignore
                console.log(hashPwd, " hash of request: ", String(this.requestArr[0]).toUpperCase() + url + paramKeys + this.headerKeys + flattenJSON);
                // if( !depArr.has(hashPwd) ) {
                let storedDepArrString = sessionStorage.getItem("depArr");
                let resp
                if(this.responseType === "" || this.responseType === "text"){
                    resp = this.responseText
                } 
                else if (this.responseType === "json"){
                    resp = JSON.stringify(this.response)
                }
                else{
                    resp = this.response
                }
                if (storedDepArrString != null) {
                    let arr = JSON.parse(storedDepArrString);
                    arr.push({ [hashPwd]: {
                            status: this.status,
                            headers: getHeaders(this.getAllResponseHeaders()),
                            body: resp,
                            response_type: this.responseType
                        }
                    });
                    sessionStorage.setItem("depArr", JSON.stringify(arr));
                }
                else {
                    sessionStorage.setItem("depArr", JSON.stringify([{ [hashPwd]: {
                                status: this.status,
                                headers: getHeaders(this.getAllResponseHeaders()),
                                body: resp,
                                response_type: this.responseType
                            }
                        }]));
                }
                // }
            }
        });
        const x = origXMLHttpRequestSend.apply(this, args);
        if(this.status == 200){
            console("###")
        }
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
        const requestDeps = new originalXMLHttpRequest()
        requestDeps.open('GET', `http://localhost:8081/api/regression/selenium/get?appid=` + appid + `&testName=` + testName, false)
        requestDeps.send(null)
        if(requestDeps.status == 200){
            const docs = JSON.parse( requestDeps.responseText )
            console.log("** ** ",requestDeps.responseText)
            sessionStorage.setItem("depArr", JSON.stringify(docs[0].deps))
        }
        // fetch(`http://localhost:8081/api/regression/selenium/get?appid=` + appid + `&testName=` + testName)
        //     .then((response) => response.json())
        //     .then((data) => {
        //     console.log(data);
        //     if (data.length == 1) {
        //         sessionStorage.setItem("depArr", JSON.stringify(data[0].deps));
        //     }
        // });
    }
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
            const urlArr = xhr.url.split("?");
            const url = urlArr[0];
            var paramKeys = "";
            if (urlArr.length > 1) {
                var params = urlArr[1].split("&");
                params.forEach(function (el) {
                    paramKeys += el.split("=")[0];
                });
            }
            let flattenJSON = (xhr.body !== null && xhr.body !== undefined) ? JSON.stringify( Object.keys(flatten(isValidJSONString(xhr.body) ? JSON.parse(xhr.body) : xhr.body)) ) : "";
            let headersArr = Object.keys(xhr.requestHeaders.getHash()), headerKeys = "";
            headersArr.forEach(el => headerKeys += el + ",");
            if(headerKeys == "[]"){
                headerKeys = ""
            }
            if(flattenJSON == "[]"){
                flattenJSON = []
            }
            // @ts-ignore
            let hashPwd = SHA256.hex(String(xhr.method).toUpperCase() + url + paramKeys + headerKeys + flattenJSON)

            // let hashPwd = crypto.createHash("sha256").update(xhr.method + url + paramKeys + headerKeys + flattenJSON)
            //     .digest("hex");
            console.log(hashPwd, " hash of request: ", String(xhr.method).toUpperCase() + url + paramKeys + headerKeys + flattenJSON);
            let depArr = JSON.parse(sessionStorage.getItem("depArr") || "[]");
            let responseHeaders = { 'Content-Type': 'application/json' };
            let response = '{ "message": "Success!" }';
            let status = 200, matchedDepp = false
            console.log("before depArr: ", depArr)
            depArr = depArr.filter((el) => {
                if (!el.hasOwnProperty(hashPwd) || matchedDepp) {
                    return true;
                }
                status = el[hashPwd].status
                responseHeaders = el[hashPwd].headers
                // if (el[hashPwd].response_type === "json") {
                //     el[hashPwd].body = JSON.parse(el[hashPwd].body)
                // }
                response = el[hashPwd].body
                matchedDepp = true
                return false
                // xhr.respond(el[hashPwd].status, el[hashPwd].headers, el[hashPwd].body);
            });
            // if(response == "")
            console.log("after depArr: ", depArr)
            sessionStorage.setItem("depArr", JSON.stringify(depArr));
            console.log("xhr: ", xhr);
            xhr.respond(status, responseHeaders, response);
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
            ResetXMLHttpRequest()
            sessionStorage.clear();
        }
        else if (sessionStorage.getItem("mode") == null && dataFromPage.event === "playbackStarted") {
            console.log("playback event called in webapp: ", dataFromPage);
            sessionStorage.setItem("testName", dataFromPage.testName);
            sessionStorage.setItem("appid", dataFromPage.appid);
            sessionStorage.setItem("mode", "test");
            // fetchDeps(dataFromPage.testName, dataFromPage.appid);
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
                let flattenJSON = (xhr.body !== null && xhr.body !== undefined) ? JSON.stringify( Object.keys(flatten( isValidJSONString(xhr.body) ? JSON.parse(xhr.body) : xhr.body ))) : "";
                let headersArr = Object.keys(xhr.requestHeaders.getHash()), headerKeys = "";
                headersArr.forEach(el => headerKeys += el + ",");
                if(headerKeys == "[]"){
                    headerKeys = ""
                }
                if(flattenJSON == "[]"){
                    flattenJSON = ""
                }
                // @ts-ignore
                let hashPwd = SHA256.hex(String(xhr.method).toUpperCase() + url + paramKeys + headerKeys + flattenJSON)

                // let hashPwd = crypto.createHash("sha256").update(xhr.method + url + paramKeys + headerKeys + flattenJSON)
                //     .digest("hex");
                console.log(hashPwd, " hash of request: ", String(xhr.method).toUpperCase() + url + paramKeys + headerKeys + flattenJSON);
                let depArr = JSON.parse(sessionStorage.getItem("depArr") || "[]");
                let responseHeaders = { 'Content-Type': 'application/json' };
                let response = '{ "message": "Success!" }';
                let status = 200, matchedDepp = false
                console.log("before depArr: ", depArr)
                depArr = depArr.filter((el) => {
                    if (!el.hasOwnProperty(hashPwd) || matchedDepp) {
                        return true;
                    }
                    status = el[hashPwd].status
                    responseHeaders = el[hashPwd].headers
                    // if (el[hashPwd].response_type === "json") {
                    //     el[hashPwd].body = JSON.parse(el[hashPwd].body)
                    // }
                    response = el[hashPwd].body
                    matchedDepp = true
                    return false
                    // xhr.respond(el[hashPwd].status, el[hashPwd].headers, el[hashPwd].body);
                });
                console.log("after depArr: ", depArr)
                sessionStorage.setItem("depArr", JSON.stringify(depArr));
                console.log("xhr: ", xhr);
                xhr.respond(status, responseHeaders, response);
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
