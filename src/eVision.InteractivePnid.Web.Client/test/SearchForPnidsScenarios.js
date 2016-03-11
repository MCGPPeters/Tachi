"use strict";
/// <reference path="../test/test.d.ts" />
var assert = require("assert");
var request = require("superagent");
var Owin = require("../src/Owin");
var EitherMonad = require("../src/Either");
var Success = EitherMonad.Success;
var Failure = EitherMonad.Failure;
var edge = require("edge");
var ErrorIdentifier;
(function (ErrorIdentifier) {
    ErrorIdentifier[ErrorIdentifier["ConnectionFailed"] = 0] = "ConnectionFailed";
})(ErrorIdentifier || (ErrorIdentifier = {}));
var OrganisationalUnit = (function () {
    function OrganisationalUnit(name, description) {
        this.name = name;
        this.description = description;
    }
    return OrganisationalUnit;
})();
var PnidSearchResult = (function () {
    function PnidSearchResult(drawingNumber, drawingDescription, organisationalUnitName, organisationalUnitDescription) {
        this.drawingNumber = drawingNumber;
        this.drawingDescription = drawingDescription;
        this.organisationalUnitName = organisationalUnitName;
        this.organisationalUnitDescription = organisationalUnitDescription;
    }
    return PnidSearchResult;
})();
var QueryClient = (function () {
    function QueryClient(implementation) {
        this.implementation = implementation;
    }
    QueryClient.prototype.searchPnidByTagNumber = function (tagNumber) {
        return this.implementation(tagNumber);
    };
    return QueryClient;
})();
describe("Searching for P&IDs", function () {
    describe("when making a request", function () {
        describe("and the connection is succesfull", function () {
            var tagNumber = "FF-1305";
            var expectedResult = new Success(null);
            var imp = function () { return expectedResult; };
            var sut = new QueryClient(imp);
            var result = sut.searchPnidByTagNumber(tagNumber);
            it("should return the correct result", function () {
                assert.equal(expectedResult, result);
            });
        });
    });
    describe("based on an tagnumber", function () {
        describe("when a P&ID is available for this tagnumber", function () {
            var organisationalUnit = new OrganisationalUnit("Area", "Haven North Tank Farm");
            var expectedResult = new Success([
                new PnidSearchResult("51", "alien aircraft construction template", "Area 51", "Classified"),
                new PnidSearchResult("51a", "alien aircraft construction template (addendum)", "Area 51", "Classified"),
            ]);
            var appFunc = edge.func({
                assemblyFile: "./../../tests/eVision.InteractivePnid.Tests.Fixtures/bin/debug/eVision.InteractivePnid.Tests.Fixtures.dll",
                typeName: "eVision.InteractivePnid.Tests.Fixtures.TestablePnidApplication",
                methodName: "Invoke"
            });
            var imp = function (tagNumber) {
                var res = null;
                var middleware = new Owin.Middleware(appFunc);
                request
                    .get("/query/pnids/by/tagnumber/" + tagNumber)
                    .set({ Accept: "application/json" })
                    .use(middleware.invoke)
                    .end(function (e, r) {
                    if (e) {
                        res = new Failure(ErrorIdentifier.ConnectionFailed);
                    }
                    else {
                        res = new Success(r.body);
                    }
                });
                return res;
            };
            var sut = new QueryClient(imp);
            var result = sut.searchPnidByTagNumber("FF-1305");
            it("should return the correct result", function () {
                assert.equal(expectedResult, result);
            });
        });
    });
});
//# sourceMappingURL=SearchForPnidsScenarios.js.map