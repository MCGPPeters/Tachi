//val build : Project -> Configuration -> Assembly
module BuildTachi

type Configuration = Configuration of string

type Tag = Tag of string

type SemVer = {
    mayor : int
    minor : int
    patch : int
}

type Assembly = {
    Version: SemVer
}

type Project = {
    name : string
    description : string
    guid : string
    tags : Tag list
    path : string
}

open System.IO

type todo = unit

let todo() = ()

type Result<'TSuccess, 'TFailure> = 
    | Success of 'TSuccess
    | Failure of 'TFailure list

let either onSuccess onFailure result = 
    match result with
    | Success x -> onSuccess x
    | Failure y -> onFailure y

let mergeResults result details = 
    match result with
    | Failure failureDetails -> Failure(failureDetails @ details)
    | Success successDetails -> Success(successDetails @ details)

let bind f result = 
    match result with
    | Success successDetails -> (f successDetails) |> mergeResults
    | Failure failureDetails -> (Failure failureDetails) |> mergeResults

let inline (>>=) f result = bind f result

let map f x = 
    match x with
    | Success s -> Success(f s)
    | Failure f -> Failure f

let apply wrappedFunction result = 
    match wrappedFunction, result with
    | Success f, Success x -> Success(f x)
    | Failure errs, Success _ -> Failure errs
    | Success _, Failure errs -> Failure errs
    | Failure errs, Failure moreErrs -> Failure(errs @ moreErrs)

open System

let tryTo doSomething = 
    try 
        Success doSomething
    with ex -> Failure [ ex ]

type CompileError = CompileError of Exception

type CompileFailed = Project * CompileError list

type BuildFailureCause = 
    | CleanFailed of FileSystemInfo
    | CompileFailed of CompileFailed

type CleanInput = todo

type CompileInput = Project list

type TestInput = Assembly list

type PackageInput = todo

type PublishInput = todo

type DeployInput = todo

type BuildResult<'TSuccess> = Result<'TSuccess, BuildFailureCause>

type BuildState = 
    | Cleaning of CleanInput
    | Compiling of BuildResult<CompileInput>
    | Testing of BuildResult<TestInput>
    | Packaging of BuildResult<PackageInput>
    | Publishing of BuildResult<PublishInput>
    | Deploying of BuildResult<DeployInput>
    | WritingBuildResult of BuildResult<BuildState>
    | Done

let compile cleanResult compile testInput =
    match cleanResult with
    | Success projects -> 
        projects 
        |> List.map (fun project ->
            match tryTo (compile project) with
            | Success assemblies ->
                Success assemblies
            | Failure causes -> 
                let compileErrors = 
                       causes 
                       |> List.map (fun cause -> 
                            CompileError cause)
                Failure [CompileFailed (project, compileErrors)])
    | Failure causes -> 
        causes
        |> List.map (fun cause -> 
            Failure ([CleanFailed cause]))

let writeOutput buildResult write = 
    match buildResult with
    | Success _ -> 
        tryTo (write "Build succeeded" )
    | Failure causes -> 
        causes
        |> List.map (fun cause -> 
                match cause with
                | CleanFailed directoryInfo -> sprintf "Failed to delete directory '%s'" directoryInfo.FullName
                | CompileFailed (project, compilerErrors) -> 
                    sprintf "Failed to compile project '%s' because of the following errors '%s'" project.name (compilerErrors 
                        |> List.fold (fun currentMessage nextMessage -> 
                            currentMessage + ("\r\n" + nextMessage.ToString())) ""))
        |> List.fold (fun currentMessage nextMessage -> currentMessage + ("\r\n" + nextMessage)) ""
        |> fun x -> tryTo (write x)