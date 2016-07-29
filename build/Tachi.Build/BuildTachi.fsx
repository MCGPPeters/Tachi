module BuildTachi

type Configuration = Configuration of string

type Tag = Tag of string

type SemVer = {
    mayor : int
    minor : int
    patch : int
}

open System.IO

type Assembly = {
    version: SemVer
    fileSystemInfo : FileSystemInfo
}

type Artefact =
    | Assembly of Assembly

type Project = {
    name : string
    description : string
    guid : string
    tags : Tag list
    path : string
    artefacts : Artefact list
}

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

type CleanError = CleanError of Exception

type DeleteArtefactError = DeleteArtefactError of Exception

type CompileFailed = Project * CompileError list

type DeleteArtefactFailed = Artefact * DeleteArtefactError list

type CleanFailed = Project * CleanError list

type BuildFailureCause = 
    | CleanFailed of CleanFailed
    | CompileFailed of CompileFailed
    | DeleteArtefactFailed of DeleteArtefactFailed

type CleanInput = Project list

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

let delete artefact =
    match artefact with
    | Assembly assembly -> 
        match tryTo (assembly.fileSystemInfo.Delete()) with
        | Success _ -> Success artefact
        | Failure causes -> 
            let errors = 
                causes 
                |> List.map (fun cause -> 
                    DeleteArtefactError cause)
            Failure [DeleteArtefactFailed (artefact, errors)]

let clean project =
    project.artefacts 
        |> List.map (fun artefact -> 
            match tryTo (delete artefact) with
            | Success a -> Success artefact
            | Failure causes -> 
                let errors = 
                    causes 
                    |> List.map (fun cause -> 
                        CleanError cause)
                Failure [CleanFailed (project, errors)])

let clean projects =
    projects 
    |> List.map (fun project ->
         match tryTo (clean project) with
         | Success a -> Success project
         | Failure causes -> 
            let errors = 
                causes 
                |> List.map (fun cause -> 
                    CleanError cause)
            Failure [CleanFailed (project, errors)])
    

let compile cleanResult compile testInput =
    match cleanResult with
    | Success projects -> 
        projects 
        |> List.map (fun project ->
            match tryTo (compile project) with
            | Success artefacts ->
                Success artefacts
            | Failure causes -> 
                let errors = 
                       causes 
                       |> List.map (fun cause -> 
                            CompileError cause)
                Failure [CompileFailed (project, errors)])
    | Failure causes -> 
        causes
        |> List.map (fun cause -> 
            Failure ([CleanFailed cause]))

let writeOutput buildResult output = 
    match buildResult with
    | Success _ -> 
        tryTo (output "Build succeeded" )
    | Failure causes -> 
        causes
        |> List.map (fun cause -> 
                match cause with
                | CleanFailed (project, cleanErrors) -> 
                    sprintf "Failed to clean the artefacts for project '%s' because of the following errors '%s' " project.name
                        (cleanErrors 
                            |> List.fold (fun currentMessage nextMessage -> 
                                currentMessage + ("\r\n" + nextMessage.ToString())) "")
                | CompileFailed (project, compilerErrors) -> 
                    sprintf "Failed to compile project '%s' because of the following errors '%s'" project.name (compilerErrors 
                        |> List.fold (fun currentMessage nextMessage -> 
                            currentMessage + ("\r\n" + nextMessage.ToString())) ""))
        |> List.fold (fun currentMessage nextMessage -> currentMessage + ("\r\n" + nextMessage)) ""
        |> fun errorMessage -> tryTo (output errorMessage)

let p1 = {
    name = ""
    description = ""
    guid = ""
    tags = []
    path = ""
    artefacts = []
    }

let build = bind (clean [p1]) (writeOutput Console.Write)