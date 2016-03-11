"use strict";
/// <reference path="../test/test.d.ts" />
var request = require("superagent");
import Owin = require("../src/Owin");
var edge = require("edge");
var assert = require("assert");


describe("an http client", () => {


    it("/OK should return the status code ok", (done) => {
        var appFunc = edge.func("./../../tests/eVision.InteractivePnid.Tests.Fixtures/bin/debug/eVision.InteractivePnid.Tests.Fixtures.dll");
        var middleware = new Owin.Middleware(appFunc);

        request
            .get("/OK")
            .use(middleware.invoke)
            .end((err, response) => {
                assert.equal(response.status, "200");
                done();
            });
    });

    it("/NotFound should return the status code NotFound", (done) => {

        var appFunc = edge.func("./../../tests/eVision.InteractivePnid.Tests.Fixtures/bin/debug/eVision.InteractivePnid.Tests.Fixtures.dll");
        var middleware = new Owin.Middleware(appFunc);

        request
            .get("/NotFound")
            .use(middleware.invoke)
            .end((err, response) => {
                assert.equal(response.status, "404");
                done();
            });
    });

    //it("should handle form data", (done) => {

    //    app.use(bodyParser.urlencoded());
    //    app.post("/greeting", (req: express.Request, res) => {
    //        var environment = {
    //            // A Stream with the request body, if any. Stream.Null can be used as a placeholder if there�s no request body.
    //            "owin.RequestBody": new Buffer(req.body),
    //            // An IDictionary<string, string[]> of request headers.
    //            "owin.RequestHeaders": req.headers,
    //            // A string containing the HTTP request method of the request (such as GET and POST).
    //            "owin.RequestMethod": req.method,
    //            // A string containing the request path. The path must be relative to the �root� of the application delegate.
    //            "owin.RequestPath": req.url,
    //            // A string containing the portion of the request path corresponding to the �root� of the application delegate.
    //            "owin.RequestPathBase": req.baseUrl,
    //            // A string containing the protocol name and version (such as HTTP/1.0 or HTTP/1.1).
    //            "owin.RequestProtocol": req.httpVersion,
    //            // A string containing the query string component of the HTTP request URI, without the leading �?� (such as foo=bar&baz=quux). The value may be an empty string.
    //            "owin.RequestQueryString": req.query,
    //            // A string containing the URI scheme used for the request (such as HTTP or HTTPS).
    //            "owin.RequestScheme": req.protocol
    //        }

    //        callMiddleware(environment, (failure, success) => {
    //            console.error(failure);
    //            res.statusCode = success.statusCode;
    //            res.body = success.body;
    //            res.send();
    //        });
    //    });

    //    request(app)
    //        .post("/greeting")
    //        .type("form")
    //        .send({ name: "Maurice"})
    //        .expect(200)
    //        .expect("Hello Maurice", done);
    //});
});