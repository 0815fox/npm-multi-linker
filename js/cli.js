#!/usr/bin/env node

const linker = require("./linker");

const commandLineArgs = require('command-line-args');

const optionDefinitions = [
	{ name: 'dry-run', alias: 'd', type: Boolean },
	{ name: 'npm-link', alias: 'n', type: Boolean },
	{ name: 'package-path', alias: 'p', type: String },
	{ name: 'max-recursion-depth', alias: 'r', type: Number },
	{ name: 'silent', alias: 's', type: Boolean },
];

const options = commandLineArgs(optionDefinitions);

linker(options["package-path"], ["."], options["dry-run"], options["max-recursion-depth"], options["silent"], options["npm-link"]);
