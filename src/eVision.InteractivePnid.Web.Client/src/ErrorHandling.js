"use strict";
var EitherMonad = require("./Either");
var Bind = EitherMonad.bind;
var AsSuccess = EitherMonad.asSuccess;
var AsFailure = EitherMonad.asFailure;
function Try(success, func) {
    return Bind(success, function (item) { return tryCatch(item, func); });
}
exports.Try = Try;
function tryCatch(source, func) {
    try {
        return AsSuccess(func(source));
    }
    catch (error) {
        return AsFailure(error);
    }
}
//# sourceMappingURL=ErrorHandling.js.map