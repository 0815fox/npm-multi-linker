const fs = require("fs");
const path = require("path");
const shell = require("shelljs");

function findPackages(paths, maxRecursionDepth) {
	return Array.prototype.concat.apply([], paths.map((currentPath) => {
		const baseName = path.basename(currentPath);
		if (baseName === "node_modules") return [];
		try {
			const stats = fs.statSync(currentPath);
			if (stats.isDirectory()) {
				if (maxRecursionDepth <= 0) return [];
				const contents = fs.readdirSync(currentPath);
				return findPackages(contents.map(((content) => path.join(currentPath, content))), maxRecursionDepth-1);
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

function linkRegisterPackages(paths, dryRun, silent) {
	return paths.forEach((registerPath) => {
		const cmd = "cd " + registerPath + ";npm link";
		console.info("Registering " + registerPath + " as linkable module\n  " + cmd);
		if (!dryRun) shell.exec(cmd, {silent})
	});
}

/**
 * For an array of paths, this function returns a set of package names.
 */
function getPackageNamesSetAndPackagePaths(paths) {
	// this will be a set of package names (from the package.json files)
	const packageNames = new Set();
	// this will contain a Map packageName->path
	const packagePaths = new Map();
	paths.forEach((packagePath) => {
		const packageJson = JSON.parse(fs.readFileSync(path.join(packagePath, "package.json")));
		packageNames.add(packageJson.name);
		packagePaths.set(packageJson.name, packagePath);
	});
	return {packageNames, packagePaths};
}

function linkPackages(packagePath, paths, dryRun, silent, nativeLink) {
	const {packageNames, packagePaths} = getPackageNamesSetAndPackagePaths(paths);
	// paths.forEach((packagePath) => {
	packageNames.forEach((targetPackageName) => {
		const installedTargetPath = path.join(".", packagePath, "node_modules", targetPackageName);
		if (fs.existsSync(installedTargetPath)) {
			if (nativeLink) {
				const cmd = "cd " + packagePath + ";npm link " + targetPackageName;
				console.info("Linking " + targetPackageName + " into " + packagePath + "\n  " + cmd);
				if (!dryRun) shell.exec(cmd, {silent});
			} else {
				if (dryRun) {
					console.info("shell.ln(\"-sf\", \"" + installedTargetPath + "\", \"" + packagePaths.get(targetPackageName) + "\"");
				} else {
					shell.rm("-rf", installedTargetPath);
					shell.ln("-s", "../../../" + packagePaths.get(targetPackageName), installedTargetPath);
				}
			}
		}

	});
	// });
}

module.exports = function(destPath, searchPaths, dryRun, maxRecursionDepth, silent, nativeLink) {
	if (maxRecursionDepth === undefined) maxRecursionDepth = Infinity;
	else maxRecursionDepth += 1;
	const packagePaths = findPackages(searchPaths, maxRecursionDepth);
	if (nativeLink === true) linkRegisterPackages(packagePaths, dryRun, silent === true);
	if (typeof(destPath) !== "string") throw new Error("Package path (-d) must be defined.");
	linkPackages(destPath, packagePaths, dryRun, silent === true, nativeLink === true);
};
