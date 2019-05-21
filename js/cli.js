#!/usr/bin/env node

const linker = require("./linker");

const commandLineArgs = require('command-line-args');

const optionDefinitions = [
	{ name: 'dry-run', alias: 'd', type: Boolean },
	{ name: 'install-before', alias: 'i', type: Boolean },
	{ name: 'npm-link', alias: 'n', type: Boolean },
	{ name: 'package-path', alias: 'p', type: String, multiple: true, defaultOption: true },
	{ name: 'quiet', alias: 'q', type: Boolean },
	{ name: 'recursion-depth', alias: 'r', type: Number },
	{ name: 'search-path', alias: 's', type: String, multiple: true },
	{ name: 'unlink', alias: 'u', type: Boolean },
];

const options = commandLineArgs(optionDefinitions);

let recursionDepth = options.hasOwnProperty("recursion-depth")?(options["recursion-depth"] || Infinity):2;

linker(options["package-path"], options["search-path"], options["dry-run"], recursionDepth, options["quiet"], options["npm-link"], options["install-before"], options["unlink"]);
