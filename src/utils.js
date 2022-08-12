const flatten = require("flat");
const Hashes = require("jshashes");
var SHA256 =  new Hashes.SHA256

function isValidJSONString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}
exports.isValidJSONString = isValidJSONString

const Send = XMLHttpRequest.prototype.send;
const Open = XMLHttpRequest.prototype.open;
const SetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
exports.Send = Send
exports.Open = Open
exports.SetRequestHeader = SetRequestHeader

function onRecordStop() {
    let test_name = sessionStorage.getItem("testName");
    let appid = sessionStorage.getItem("appid");
    if (test_name != undefined && appid != undefined && test_name != "" && appid != "") {
        fetch("http://localhost:8081/api/deps", {
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
    XMLHttpRequest.prototype.send = Send
    XMLHttpRequest.prototype.open = Open
    XMLHttpRequest.prototype.setRequestHeader = SetRequestHeader
    sessionStorage.removeItem("depArr")
    sessionStorage.removeItem("testName")
    sessionStorage.removeItem("appid")
    sessionStorage.removeItem("mode")
}
exports.onRecordStop = onRecordStop

function getResponseHeaders(headers) {
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
exports.getResponseHeaders = getResponseHeaders

function getQueryParams(rawUrl){
    const urlArr = rawUrl.split("?");
    var paramKeys = "";
    const url = urlArr[0];
    if (urlArr.length > 1) {
        var params = urlArr[1].split("&");
        params.forEach(function (el) {
            paramKeys += "/"+el.split("=")[0];
        });
        paramKeys += "/"
    }
    return {url, paramKeys}
}
exports.getQueryParams = getQueryParams

function getRequestHeaders(headerObj){
    if(headerObj != undefined && headerObj != null) {
        let headers = Object.keys(headerObj), headerKeys = ""
        headers.forEach((key) => headerKeys += key.toLowerCase()+",")
        return headerKeys
    }
    return ""
}
exports.getRequestHeaders = getRequestHeaders

exports.ProcessXmlSend = function(xml, mode, ...args){
    let rawUrl = args[0], requestBody = args[1], requestHeaders = args[2], method = args[3], url="", paramKeys=""
    if(rawUrl != undefined){
        const res = getQueryParams(rawUrl)
        url = res.url
        paramKeys = res.paramKeys
    }
    let flattenJSON = (requestBody !== null && requestBody !== undefined) ? JSON.stringify( Object.keys(flatten(isValidJSONString(requestBody) ? JSON.parse(requestBody) : requestBody)) ) : "";
    if(flattenJSON == "[]"){
        flattenJSON = []
    }
    let headerKeys = getRequestHeaders(requestHeaders)

    let hashPwd = SHA256.hex(String(method).toUpperCase() + url + paramKeys + headerKeys + flattenJSON)
    if(mode == "record"){
        let storedDepArrString = sessionStorage.getItem("depArr");
        let resp = xml.response
        if (storedDepArrString != null) {
            let arr = JSON.parse(storedDepArrString);
            arr.push({ [hashPwd]: {
                    status: xml.status,
                    headers: getResponseHeaders(xml.getAllResponseHeaders()),
                    body: resp,
                    response_type: xml.responseType
                }
            });
            sessionStorage.setItem("depArr", JSON.stringify(arr));
        }
        else {
            sessionStorage.setItem("depArr", JSON.stringify([{ [hashPwd]: {
                    status: xml.status,
                    headers: getResponseHeaders(xml.getAllResponseHeaders()),
                    body: resp,
                    response_type: xml.responseType
                }
            }]));
        }
    }
    else if(mode == "test"){
        let depArr = JSON.parse(sessionStorage.getItem("depArr") || "[]");
        let responseHeaders = { 'Content-Type': 'application/json' };
        let response = '{ "message": "Success!" }';
        let status = 200, matchedDepp = false
        depArr = depArr.filter((el) => {
            // eslint-disable-next-line no-prototype-builtins
            if (!el.hasOwnProperty(hashPwd) || matchedDepp) {
                return true;
            }
            status = el[hashPwd].status
            responseHeaders = el[hashPwd].headers
            response = el[hashPwd].body
            matchedDepp = true
            return false
        });
        sessionStorage.setItem("depArr", JSON.stringify(depArr));
        xml.respond(status, responseHeaders, response);
    }
}