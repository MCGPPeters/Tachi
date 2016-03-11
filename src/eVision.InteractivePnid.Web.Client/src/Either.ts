/// <reference path="eVision.InteractivePnid.Web.Client.d.ts" />

"use strict";

export class Unit {
}

export class Option<T> {

    constructor(public value: T) {}

    isSuccess: boolean;
    isFailure: boolean;
}

export class Failure<TFailure> extends Option<TFailure> {
    isFailure = true;
    isSuccess = false;
}

export class Success<TSuccess> extends Option<TSuccess> {
    isFailure = false;
    isSuccess = true;
}

export type Either<TFailure, TSuccess> = Failure<TFailure> | Success<TSuccess>

export function asSuccess<TFailure, TSuccess>(source: TSuccess): Either<TFailure, TSuccess> {
    return new Success(source);
}

export function asFailure<TFailure, TSuccess>(source: TFailure): Either<TFailure, TSuccess> {
    return new Failure(source);
}

export function match<TFailure, TSuccess, TResult>(result: Either<TFailure, TSuccess>, failure: (f: TFailure) => Either<TFailure, TResult>, success: (s: TSuccess) => Either<TFailure, TResult>) {
    return result.isSuccess
        ? success(result.value as TSuccess)
        : failure(result.value as TFailure);
}

export function bind<TFailure, TSuccess, TResult>(result: Either<TFailure, TSuccess>, func: (success: TSuccess) => Either<TFailure, TResult>): Either<TFailure, TResult> {
    return match<TFailure, TSuccess, TResult>(result,
        failure => new Failure(failure),
        success => func(success)
    );

}