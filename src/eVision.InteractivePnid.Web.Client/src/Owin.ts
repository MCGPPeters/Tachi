"use strict";

// <reference path="eVision.InteractivePnid.Web.Client.d.ts" />

var superagent = require("superagent");
var http = require("http");

export type AppFunc = (environment, callback) => void;

export class Middleware {
    constructor(private appFunc: AppFunc) {
        this.invoke = this.invoke.bind(this);
    }

    invoke(request) {
        const headers = request.req._headers;
        const owinRequestData = {
            // An IDictionary<string, string[]> of request headers.
            "owin.RequestHeaders": headers,
            // A string containing the HTTP request method of the request (such as GET and POST).
            "owin.RequestMethod": request.method,
            // A string containing the request path. The path must be relative to the �root� of the application delegate.
            "owin.RequestPath": `${request.url}`,
            // A string containing the portion of the request path corresponding to the �root� of the application delegate.
            "owin.RequestPathBase": "",
            // A string containing the protocol name and version (such as HTTP/1.0 or HTTP/1.1).
            "owin.RequestProtocol": "HTTP/1.1",
            // A string containing the query string component of the HTTP request URI, without the leading �?� (such as foo=bar&baz=quux). The value may be an empty string.
            "owin.RequestQueryString": "",
            // A string containing the URI scheme used for the request (such as HTTP or HTTPS).
            "owin.RequestScheme": request.protocol.substr(0, request.protocol.length - 1)
        };

        // A Stream with the request body, if any. Stream.Null can be used as a placeholder if there�s no request body.
        if (request.body) {
            owinRequestData["owin.RequestBody"] = new Buffer(request.body);
        } else {
            owinRequestData["owin.RequestBody"] = new Buffer(0);
        }

        console.log(owinRequestData);

        this.appFunc(owinRequestData, (failure, owinResponseData) => {

            console.log(`Received the owinResponseData : ${owinResponseData}`);

            request.on("response", (response) => {

                console.log(`Received the response : ${response}`);

                if (failure) {
                    console.error(`The request failed because : ${failure}`);
                    return;
                }

                var owinEnvironmentResponseHeaders = owinResponseData["owin.ResponseHeaders"];
                for (let key in owinEnvironmentResponseHeaders) {
                    if (owinEnvironmentResponseHeaders.hasOwnProperty()) {
                        owinEnvironmentResponseHeaders[key] = owinEnvironmentResponseHeaders[key][0];
                    }
                }
                if (owinResponseData["owin.ResponseStatusCode"]) {
                    response.status = owinResponseData["owin.ResponseStatusCode"];
                }
                if (owinResponseData["owin.ResponseReasonPhrase"]) {
                    response.statusMessage = owinResponseData["owin.ResponseReasonPhrase"];
                }
                if (owinResponseData["owin.ResponseProtocol"]) {
                    response.httpVersion = owinResponseData["owin.ResponseProtocol"];
                }

                response.headers = owinEnvironmentResponseHeaders;

                console.log(owinRequestData);
            });
        });
    }
}