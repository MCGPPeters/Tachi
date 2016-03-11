var Config = require("./gulpfile.config");
var gulp = require("gulp");
var plugins = require("gulp-load-plugins")();
var tsc = require("gulp-typescript");
var sourcemaps = require("gulp-sourcemaps");
var del = require("gulp-rimraf");
var mocha = require("gulp-mocha");
var debug = require("gulp-debug");
var msbuild = require("gulp-msbuild");
var shell = require("gulp-shell");
var runSequence = require("run-sequence");

var config = new Config();

gulp.task("lint", function() {
    return gulp
        .src(config.allTypeScript)
        .pipe(plugins.tslint())
        .pipe(plugins.tslint.report("verbose", {
            emitError: false
        }));
});

gulp.task("compileSources", function() {
    return gulp
        .src([config.tsSources, config.tsLibraryTypings])
        .pipe(debug({ title: "compileSources:" }))
        .pipe(tsc(config.tsCompilerSettings))
        .pipe(gulp.dest(config.jsSourcePath));
});

gulp.task("compileMiddleware", function() {
    return gulp.src("../../tests/eVision.InteractivePnid.Tests.Fixtures/eVision.InteractivePnid.Tests.Fixtures.csproj")
        .pipe(debug({ title: "buildMiddleware:" }))
        .pipe(msbuild(config.msBuildSettings));
});

gulp.task("compileTests", function() {
    return gulp
        .src([config.tsTests, config.tsLibraryTypings])
        .pipe(debug({ title: "compileTests:" }))
        .pipe(tsc(config.tsCompilerSettings))
        .pipe(gulp.dest(config.jsTestsPath));
});

gulp.task("compile", function(callback) {
    runSequence("compileSources", "compileTests",
        callback);
});

gulp.task("test", function() {
    return gulp
        .src(config.jsTests, { read: false })
        .pipe(debug({ title: "test:" }))
        .pipe(mocha({ reporter: "spec" }));
});

gulp.task("clean", function() {
    var compileOutput = [
        config.jsSources,
        config.jsTestFiles,
        config.sourceMapOutput
    ];

    return gulp
        .src(compileOutput, { read: false })
        .pipe(debug({ title: "clean:" }))
        .pipe(del());
});

gulp.task("build-ts", function(callback) {
    runSequence("lint", "compile",
        callback);
});

gulp.task("build", function(callback) {
    runSequence("build-ts", "compileMiddleware",
        callback);
});

gulp.task("rebuild", function(callback) {
    runSequence("clean", "build",
        callback);
});

gulp.task("watch", function(callback) {
    gulp.watch(config.allTypeScript, ["default"], callback);
});

gulp.task("watch-ts", function(callback) {
    gulp.watch(config.allTypeScript, ["default-ts"], callback);
});

gulp.task("default-ts", function(callback) {
    runSequence("build-ts", "test",
        callback);
});

gulp.task("default", function(callback) {
    runSequence("build", "test",
        callback);
});