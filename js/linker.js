const fs = require("fs");
const path = require("path");
const shell = require("shelljs");

function findPackages(paths, recursionDepth) {
	return Array.prototype.concat.apply([], paths.map((currentPath) => {
		const baseName = path.basename(currentPath);
		if (baseName === "node_modules") return [];
		try {
			const stats = fs.statSync(currentPath);
			if (stats.isDirectory()) {
				if (recursionDepth <= 0) return [];
				const contents = fs.readdirSync(currentPath);
				return findPackages(contents.map(((content) => path.join(currentPath, content))), recursionDepth-1);
			} else if (stats.isFile()) {
				if (baseName === "package.json") return [path.dirname(currentPath)];
			}
			return [];
		} catch (E) {
			// File does not exist - this happens in case of a "broken" symlink
			return [];
		}
	}));
}

function linkRegisterPackages(paths, dryRun, quiet) {
	return paths.forEach((registerPath) => {
		const cmd = "cd " + registerPath + " && npm link";
		console.info("Registering " + registerPath + " as linkable module\n  " + cmd);
		if (!dryRun) shell.exec(cmd, {quiet})
	});
}

/**
 * For an array of paths, this function returns a set of package names.
 */
function getPackageNamesSetAndPackagePaths(paths, quiet) {
	// this will be a set of package names (from the package.json files)
	const packageNames = new Set();
	// this will contain a Map packageName->path
	const packagePathsMap = new Map();
	paths.forEach((packagePath) => {
		const packageJson = JSON.parse(fs.readFileSync(path.join(packagePath, "package.json")));
		const name = packageJson.name;
		if (name !== undefined) {
			packageNames.add(name);
			packagePathsMap.set(name, packagePath);
		} else {
			/*if (!quiet) */console.warn("Found a package without name in: " + packagePath);
		}
	});
	return {packageNames, packagePathsMap};
}

function linkPackages(packagePath, packageNames, packagePathsMap, dryRun, quiet, npmLink) {
	if (!fs.existsSync(packagePath)) throw new Error("Path " + packagePath + " does not exist");
	if (!quiet) console.info("Linking dependencies of " + packagePath + ":");
	const installedTargetBasePath = path.join(".", packagePath, "node_modules");
	packageNames.forEach((targetPackageName) => {
		const installedTargetPath = path.join(installedTargetBasePath, targetPackageName);
		if (fs.existsSync(installedTargetPath)) {
			if (npmLink) {
				const cmd = "cd " + packagePath + " && npm link " + targetPackageName;
				if (!quiet) console.info("  Linking: " + targetPackageName + " into " + packagePath + "\n  " + cmd);
				if (!dryRun) shell.exec(cmd, {quiet});
			} else {
				const linkTargetPath = path.relative(path.dirname(installedTargetPath), packagePathsMap.get(targetPackageName));
				if (!quiet) console.info("  Linking: " + targetPackageName + " => " + linkTargetPath);
				if (!dryRun) {
					shell.rm("-rf", installedTargetPath);
					shell.ln("-s", linkTargetPath, installedTargetPath);
				}
			}
		}
	});
}

function installInPackagePath(packagePath, dryRun, quiet) {
	const cmd = "cd " + packagePath + " && npm install";
	if (!quiet) console.info(cmd);
	if (!dryRun) shell.exec(cmd, {quiet});
}

module.exports = function(destPaths, searchPaths, dryRun, recursionDepth, quiet, npmLink, installBefore, unlink) {
	dryRun = dryRun === true;
	quiet = quiet === true;
	npmLink = npmLink === true;
	installBefore = installBefore === true;
	unlink = unlink === true;
	if (dryRun && !quiet) console.info("Simulating: ");
	recursionDepth += 1;
	if (searchPaths === undefined || searchPaths.length < 1) searchPaths = ["."];
	if (unlink) installBefore = true;
	const packagePaths = findPackages(searchPaths, recursionDepth);
	if (npmLink === true) linkRegisterPackages(packagePaths, dryRun, quiet);
	const {packageNames, packagePathsMap} = getPackageNamesSetAndPackagePaths(packagePaths, quiet);
	if (destPaths === undefined) {
		if (fs.existsSync("./package.json")) destPaths = ["."];
		else destPaths = findPackages(["."], recursionDepth);
	}
	if (destPaths.length < 1) destPaths = ["."];
	destPaths.forEach((packagePath) => {
		if (installBefore === true) installInPackagePath(packagePath, dryRun, quiet);
		if (!unlink) linkPackages(packagePath, packageNames, packagePathsMap, dryRun, quiet, npmLink);
	});
};
