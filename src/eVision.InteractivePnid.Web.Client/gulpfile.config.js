"use strict";
var path = require("path");

var GulpConfig = (function() {
    function gulpConfig() {

        this.pathSeperator = "/";
        this.basePath = ".";
        this.sourceFolder = "src";
        this.testsFolder = "test";
        this.outputFolder = "dist";
        this.libaryTypingsfolder = "typings";
        this.findAllTypeScriptFilesInPath = "/**/*.ts";
        this.findAllJavaScriptFilesInPath = "/**/*.js";
        this.findAllSourceMapFilesInPath = "/**/*.js.map";
        this.findAllFilesInPath = "/**/*.*";
        this.tsCompilerSettings = {
            module: "commonjs",
            target: "ES5",
            sourcemap: true,
            logErrors: true,
            removeComments: false
        };

        this.tsSourcePath = [this.basePath, this.sourceFolder].join(this.pathSeperator);
        this.tsTestsPath = [this.basePath, this.testsFolder].join(this.pathSeperator);
        this.tsLibraryTypingsPath = [this.basePath, this.libaryTypingsfolder].join(this.pathSeperator);

        this.tsSources = [this.tsSourcePath, this.findAllTypeScriptFilesInPath].join(this.pathSeperator);
        this.tsTests = [this.tsTestsPath, this.findAllTypeScriptFilesInPath].join(this.pathSeperator);
        this.tsLibraryTypings = [this.tsLibraryTypingsPath, this.findAllTypeScriptFilesInPath].join(this.pathSeperator);

        this.jsOutputPath = [this.basePath, this.outputFolder].join(this.pathSeperator);
        this.jsSourcePath = [this.jsOutputPath, this.sourceFolder].join(this.pathSeperator);
        this.jsTestsPath = [this.jsOutputPath, this.testsFolder].join(this.pathSeperator);

        this.jsSources = [this.jsSourcePath, this.findAllJavaScriptFilesInPath].join(this.pathSeperator);
        this.jsTests = [this.jsTestsPath, this.findAllJavaScriptFilesInPath].join(this.pathSeperator);
        this.jsTestFiles = [this.jsTestsPath, this.findAllFilesInPath].join(this.pathSeperator);
        this.sourceMapOutput = [this.jsOutputPath, this.findAllSourceMapFilesInPath].join(this.pathSeperator);

        this.msBuildSettings = {
            targets: ["Clean", "Build"],
            toolsVersion: 14.0,
            stdout: true,
            logCommand: true,
            errorOnFail: true,
            properties: { Configuration: "Debug" }
        };

        this.allJavaScript = [
            this.jsSources,
            this.jsTests
        ];
        this.allTypeScript = [
            this.tsSources,
            this.tsTests,
            this.tsLibraryTypings
        ];
    }

    return gulpConfig;
})();
module.exports = GulpConfig;