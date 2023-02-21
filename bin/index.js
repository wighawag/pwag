#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const { Command, InvalidArgumentError } = require('commander');
const PKG = require('../package.json');
const { produceIconsAndManifest } = require('../lib');

const CWD = process.cwd();

const program = new Command();

program.name(PKG.name).description(PKG.description).version(PKG.version);

program
	.description('Produce a set of favicons and a web manifest for pwa.')
	.argument('<inputPath>', 'Input icon path')
	.argument('<webConfigPath>', 'web config')
	.option('-o, --output <path>', 'Output directory path', 'static')
	.option('-s, --subpath <path>', 'sub folder', 'pwa')
	.option('--prefix <name>', 'Icon prefix', 'favicon')
	.option('--colors <number>', 'Color paleete size, between 2 and 256', 64)
	.option('--include16', 'Produce 16x16 .ico file', false)
	.action((filepath, webConfigPath, { output: outputDir, prefix, colors, include16, subpath }) => {
		const colorsPaletteSize = parseInt(colors, 10);
		const isValidPaletteSize =
			Number.isNaN(colorsPaletteSize) || colorsPaletteSize < 2 || colorsPaletteSize > 256;
		if (isValidPaletteSize) {
			throw new InvalidArgumentError('Color palette size must be a number between 2 and 256.');
		}

		const iconFilepath = path.join(CWD, filepath);
		const webConfigFilepath = path.join(CWD, webConfigPath);
		const outputPath = path.isAbsolute(outputDir) ? outputDir : path.join(CWD, outputDir);
		produceIconsAndManifest(
			{
				outputDirPath: outputPath,
				subpath,
				iconFileName: prefix,
				inputFilePath: iconFilepath,
				paletteSize: colorsPaletteSize,
				include16,
			},
			JSON.parse(fs.readFileSync(webConfigFilepath, 'utf-8'))
		);
	});

program.parse();
