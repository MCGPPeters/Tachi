/// <reference path="eVision.InteractivePnid.Web.Client.d.ts" />
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Unit = (function () {
    function Unit() {
    }
    return Unit;
})();
exports.Unit = Unit;
var Option = (function () {
    function Option(value) {
        this.value = value;
    }
    return Option;
})();
exports.Option = Option;
var Failure = (function (_super) {
    __extends(Failure, _super);
    function Failure() {
        _super.apply(this, arguments);
        this.isFailure = true;
        this.isSuccess = false;
    }
    return Failure;
})(Option);
exports.Failure = Failure;
var Success = (function (_super) {
    __extends(Success, _super);
    function Success() {
        _super.apply(this, arguments);
        this.isFailure = false;
        this.isSuccess = true;
    }
    return Success;
})(Option);
exports.Success = Success;
function asSuccess(source) {
    return new Success(source);
}
exports.asSuccess = asSuccess;
function asFailure(source) {
    return new Failure(source);
}
exports.asFailure = asFailure;
function match(result, failure, success) {
    return result.isSuccess
        ? success(result.value)
        : failure(result.value);
}
exports.match = match;
function bind(result, func) {
    return match(result, function (failure) { return new Failure(failure); }, function (success) { return func(success); });
}
exports.bind = bind;
//# sourceMappingURL=Either.js.map