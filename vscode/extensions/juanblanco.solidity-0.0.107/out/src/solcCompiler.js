'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.SolcCompiler = exports.compilerType = void 0;
const solErrorsToDiagnostics_1 = require("./solErrorsToDiagnostics");
const solc = require("solc");
const fs = require("fs");
const path = require("path");
const https = require("https");
const contractsCollection_1 = require("./model/contractsCollection");
const projectService_1 = require("./projectService");
var compilerType;
(function (compilerType) {
    compilerType[compilerType["localNode"] = 0] = "localNode";
    compilerType[compilerType["Remote"] = 1] = "Remote";
    compilerType[compilerType["localFile"] = 2] = "localFile";
    compilerType[compilerType["default"] = 3] = "default";
})(compilerType = exports.compilerType || (exports.compilerType = {}));
class SolcCompiler {
    constructor(rootPath) {
        this.rootPath = rootPath;
        this.localSolc = null;
        this.currentCompilerType = compilerType.default;
    }
    setSolcCache(solcCachePath) {
        this.solcCachePath = solcCachePath;
    }
    getVersion() {
        return this.localSolc.version();
    }
    isRootPathSet() {
        return typeof this.rootPath !== 'undefined' && this.rootPath !== null;
    }
    // simple validation to match our settings with the ones passed
    initialisedAlready(localInstallationPath, remoteInstallationVersion, enableNodeCompiler) {
        // tslint:disable-next-line:curly
        if (this.localSolc === null)
            return false;
        // tslint:disable-next-line: curly
        if (this.enableNodeCompilerSetting !== enableNodeCompiler)
            return false;
        let installedNodeLocally = false;
        if (this.isRootPathSet() && enableNodeCompiler) {
            installedNodeLocally = this.isInstalledSolcUsingNode(this.rootPath);
            if (this.currentCompilerType === compilerType.localNode && installedNodeLocally) {
                return true;
            }
        }
        if (this.currentCompilerType === compilerType.localFile && localInstallationPath === this.currentCompilerSetting) {
            return true;
        }
        if (this.currentCompilerType === compilerType.Remote && remoteInstallationVersion === this.currentCompilerSetting) {
            return true;
        }
        if (this.currentCompilerType === compilerType.default && !installedNodeLocally &&
            (typeof localInstallationPath === 'undefined' || localInstallationPath === null || localInstallationPath === '') &&
            (typeof remoteInstallationVersion === 'undefined' || remoteInstallationVersion === null || remoteInstallationVersion === '')) {
            return true;
        }
        return false;
    }
    intialiseCompiler(localInstallationPath, remoteInstallationVersion, enableNodeCompiler) {
        return new Promise((resolve, reject) => {
            try {
                if (this.initialisedAlready(localInstallationPath, remoteInstallationVersion, enableNodeCompiler)) {
                    resolve();
                }
                else {
                    let solidityfile = '';
                    this.enableNodeCompilerSetting = enableNodeCompiler;
                    if (enableNodeCompiler && this.isInstalledSolcUsingNode(this.rootPath)) {
                        solidityfile = require(this.getLocalSolcNodeInstallation());
                        this.localSolc = solc.setupMethods(solidityfile);
                        this.currentCompilerType = compilerType.localNode;
                        this.currentCompilerSetting = null;
                        resolve();
                    }
                    else {
                        // local file
                        if (typeof localInstallationPath !== 'undefined' && localInstallationPath !== null && localInstallationPath !== '') {
                            solidityfile = require(localInstallationPath);
                            this.localSolc = solc.setupMethods(solidityfile);
                            this.currentCompilerType = compilerType.localFile;
                            this.currentCompilerSetting = localInstallationPath;
                            resolve();
                        }
                        else {
                            // remote
                            if (typeof remoteInstallationVersion !== 'undefined' && remoteInstallationVersion !== null && remoteInstallationVersion !== '') {
                                const solcService = this;
                                this.loadRemoteWasmVersionRetry(remoteInstallationVersion, 1, 3).then((solcSnapshot) => {
                                    solcService.currentCompilerType = compilerType.Remote;
                                    solcService.currentCompilerSetting = remoteInstallationVersion;
                                    solcService.localSolc = solcSnapshot;
                                    resolve();
                                }).catch((error) => reject('There was an error loading the remote version: ' + remoteInstallationVersion + ',' + error));
                            }
                            else {
                                this.localSolc = require('solc');
                                this.currentCompilerType = compilerType.default;
                                this.currentCompilerSetting = null;
                                resolve();
                            }
                        }
                    }
                }
            }
            catch (error) {
                reject(error);
            }
        });
    }
    getLocalSolcNodeInstallation() {
        return path.join(this.rootPath, 'node_modules', 'solc', 'soljson.js');
    }
    isInstalledSolcUsingNode(rootPath) {
        return fs.existsSync(this.getLocalSolcNodeInstallation());
    }
    compile(contracts) {
        return this.localSolc.compile(contracts);
    }
    loadRemoteVersion(remoteCompiler, cb) {
        solc.loadRemoteVersion(remoteCompiler, cb);
    }
    compileSolidityDocumentAndGetDiagnosticErrors(filePath, documentText, packageDefaultDependenciesDirectory, packageDefaultDependenciesContractsDirectory) {
        if (this.isRootPathSet()) {
            const contracts = new contractsCollection_1.ContractCollection();
            contracts.addContractAndResolveImports(filePath, documentText, projectService_1.initialiseProject(this.rootPath, packageDefaultDependenciesDirectory, packageDefaultDependenciesContractsDirectory));
            const contractsForCompilation = contracts.getDefaultContractsForCompilationDiagnostics();
            contractsForCompilation.settings = null;
            const outputString = this.compile(JSON.stringify(contractsForCompilation));
            const output = JSON.parse(outputString);
            if (output.errors) {
                return output
                    .errors
                    .map(error => solErrorsToDiagnostics_1.errorToDiagnostic(error));
            }
        }
        else {
            const contract = {};
            contract[filePath] = documentText;
            const output = this.compile({ sources: contract });
            if (output.errors) {
                return output.errors.map((error) => solErrorsToDiagnostics_1.errorToDiagnostic(error));
            }
        }
        return [];
    }
    downloadCompilationFile(version, path) {
        const file = fs.createWriteStream(path);
        const url = 'https://binaries.soliditylang.org/bin/soljson-' + version + '.js';
        return new Promise((resolve, reject) => {
            const request = https.get(url, function (response) {
                if (response.statusCode !== 200) {
                    reject('Error retrieving solidity compiler: ' + response.statusMessage);
                }
                else {
                    response.pipe(file);
                    file.on("finish", function () {
                        file.close();
                        resolve();
                    });
                }
            }).on('error', function (error) {
                reject(error);
            });
            request.end();
        });
    }
    loadRemoteWasmVersionRetry(versionString, retryNumber, maxRetries) {
        return new Promise((resolve, reject) => {
            this.loadRemoteWasmVersion(versionString).then((solcConfigured) => resolve(solcConfigured)).catch((reason) => {
                if (retryNumber <= maxRetries) {
                    return this.loadRemoteWasmVersionRetry(versionString, retryNumber + 1, maxRetries);
                }
                else {
                    reject(reason);
                }
            });
        });
    }
    loadRemoteWasmVersion(versionString) {
        const pathVersion = path.resolve(path.join(this.solcCachePath, 'soljson-' + versionString + '.js'));
        return new Promise((resolve, reject) => {
            try {
                if (fs.existsSync(pathVersion) && versionString !== 'latest') {
                    const solidityfile = require(pathVersion);
                    const solcConfigured = solc.setupMethods(solidityfile);
                    resolve(solcConfigured);
                }
                else {
                    this.downloadCompilationFile(versionString, pathVersion).then(() => {
                        const solidityfile = require(pathVersion);
                        const solcConfigured = solc.setupMethods(solidityfile);
                        resolve(solcConfigured);
                    }).catch((reason) => reject(reason));
                }
            }
            catch (error) {
                reject(error);
            }
        });
    }
}
exports.SolcCompiler = SolcCompiler;
//# sourceMappingURL=solcCompiler.js.map