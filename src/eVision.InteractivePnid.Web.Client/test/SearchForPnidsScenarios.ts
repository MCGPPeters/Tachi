"use strict";
/// <reference path="../test/test.d.ts" />

var assert = require("assert");
var request = require("superagent");
import Owin = require("../src/Owin");
import EitherMonad = require("../src/Either");
import Either = EitherMonad.Either;
import Success = EitherMonad.Success;
import Failure = EitherMonad.Failure;
var edge = require("edge");

enum ErrorIdentifier {
    ConnectionFailed
}

class OrganisationalUnit {
    constructor(public name: string, public description: string) {}
}

class PnidSearchResult {
    constructor(public drawingNumber: string, public drawingDescription: string, public organisationalUnitName: string, public organisationalUnitDescription: string) {}
}

class QueryClient {
    constructor(private implementation: (_) => Either<ErrorIdentifier, PnidSearchResult[]>) {
    }

    searchPnidByTagNumber(tagNumber: string): Either<ErrorIdentifier, PnidSearchResult[]> {
        return this.implementation(tagNumber);
    }
}

describe("Searching for P&IDs", () => {

    describe("when making a request", () => {

        describe("and the connection is succesfull", () => {

            var tagNumber = "FF-1305";
            const expectedResult = new Success<PnidSearchResult[]>(null);
            var imp = () => expectedResult;
            var sut = new QueryClient(imp);

            var result = sut.searchPnidByTagNumber(tagNumber);

            it("should return the correct result", () => {
                assert.equal(expectedResult, result);
            });
        });
    });

    describe("based on an tagnumber", () => {
        describe("when a P&ID is available for this tagnumber", () => {
            var organisationalUnit = new OrganisationalUnit("Area", "Haven North Tank Farm");

            const expectedResult = new Success<PnidSearchResult[]>([
                new PnidSearchResult("51", "alien aircraft construction template", "Area 51", "Classified"),
                new PnidSearchResult("51a", "alien aircraft construction template (addendum)", "Area 51", "Classified"),
            ]);

            const appFunc = edge.func({
                assemblyFile: "./../../tests/eVision.InteractivePnid.Tests.Fixtures/bin/debug/eVision.InteractivePnid.Tests.Fixtures.dll",
                typeName: "eVision.InteractivePnid.Tests.Fixtures.TestablePnidApplication",
                methodName: "Invoke"
            });

            var imp = (tagNumber: string) => {
                var res: Either<ErrorIdentifier, PnidSearchResult[]> = null;
                var middleware = new Owin.Middleware(appFunc);
                request
                    .get(`/query/pnids/by/tagnumber/${tagNumber}`)
                    .set({ Accept: "application/json" })
                    .use(middleware.invoke)
                    .end((e, r) => {
                        if (e) {
                            res = new Failure<ErrorIdentifier>(ErrorIdentifier.ConnectionFailed);
                        } else {
                            res = new Success<PnidSearchResult[]>(r.body);
                        }
                    });
                return res;
            };

            var sut = new QueryClient(imp);
            var result = sut.searchPnidByTagNumber("FF-1305");

            it("should return the correct result", () => {
                assert.equal(expectedResult, result);
            });
        });
    });
});