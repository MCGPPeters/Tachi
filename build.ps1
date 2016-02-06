Param
(
	$configuration = "ci"
)

$paketBootstrapper = ".paket\paket.bootstrapper.exe"
$paket = ".paket\paket.exe"


& $paketBootstrapper

& $paket install

& ".packages\FSharp.Compiler.Tools\tools\fsi.exe" ".\build\Tachi.Build\BuildTachi.fsx"