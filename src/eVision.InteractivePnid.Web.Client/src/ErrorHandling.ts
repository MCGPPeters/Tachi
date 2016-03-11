"use strict";

import EitherMonad = require("Either");
import Either = EitherMonad.Either;
import Bind = EitherMonad.bind;
import AsSuccess = EitherMonad.asSuccess;
import AsFailure = EitherMonad.asFailure;

export function Try<TSuccess, TResult>(
    success: Either<Error, TSuccess>,
    func: (source: TSuccess) => TResult): Either<Error, TResult> {
    return Bind<Error, TSuccess, TResult>(success, item => tryCatch(item, func));
}

function tryCatch<TSuccess, TResult>(
    source: TSuccess,
    func: (source: TSuccess) => TResult): Either<Error, TResult> {
    try {
        return AsSuccess<Error, TResult>(func(source));
    } catch (error) {
        return AsFailure<Error, TResult>(error);
    }
}