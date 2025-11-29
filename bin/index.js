#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const { Command, InvalidArgumentError } = require('commander');
const PKG = require('../package.json');
const { produceIconsAndManifest, injectPWAIntoHTML, injectPWAIntoHTMLWithOutput } = require('../lib');

const CWD = process.cwd();

const program = new Command();

program.name(PKG.name).description(PKG.description).version(PKG.version);

// Main command - supports icon generation and optional HTML meta tag injection
program
	.description('Produce a set of favicons and a web manifest for pwa, and optionally inject PWA meta tags into HTML files.')
	.argument('<inputPath>', 'Input icon path')
	.argument('<webConfigPath>', 'web config file path')
	.option('-o, --output <path>', 'Output directory path for icons', 'static')
	.option('-s, --subpath <path>', 'sub folder', 'pwa')
	.option('--prefix <name>', 'Icon prefix', 'favicon')
	.option('--colors <number>', 'Color paleete size, between 2 and 256', 64)
	.option('--include16', 'Produce 16x16 .ico file', false)
	.option('--html <path>', 'HTML file path with PWAG-GENERATED markers to inject meta tags into')
	.option('--html-output <path>', 'Output HTML file path (preserves original template file)')
	.option('--base-url <url>', 'Base URL for relative paths (HTML injection only)')
	.option('--assets-prefix <prefix>', 'Assets prefix for different frameworks (HTML injection only, default: ".")')
	.action((inputPath, webConfigPath, options) => {
		const webConfigFilepath = path.join(CWD, webConfigPath);
		const webConfig = JSON.parse(fs.readFileSync(webConfigFilepath, 'utf-8'));
		
		// Always generate icons and manifest
		const colorsPaletteSize = parseInt(options.colors, 10);
		const isValidPaletteSize =
			Number.isNaN(colorsPaletteSize) || colorsPaletteSize < 2 || colorsPaletteSize > 256;
		if (isValidPaletteSize) {
			throw new InvalidArgumentError('Color palette size must be a number between 2 and 256.');
		}

		const iconFilepath = path.join(CWD, inputPath);
		const outputPath = path.isAbsolute(options.output) ? options.output : path.join(CWD, options.output);
		
		produceIconsAndManifest(
			{
				outputDirPath: outputPath,
				subpath: options.subpath,
				iconFileName: options.prefix,
				inputFilePath: iconFilepath,
				paletteSize: colorsPaletteSize,
				include16: options.include16,
			},
			webConfig
		);

		// If --html option is provided, also inject meta tags
		if (options.html) {
			// --html-output can only be used with --html
			if (options.htmlOutput) {
				const htmlFilePath = path.join(CWD, options.html);
				const htmlOutputPath = path.join(CWD, options.htmlOutput);
				
				// Output to a different file (template mode)
				injectPWAIntoHTMLWithOutput(
					htmlFilePath,
					webConfigFilepath,
					htmlOutputPath,
					{
						baseUrl: options.baseUrl,
						assetsPrefix: options.assetsPrefix || '.'
					}
				);
			} else {
				const htmlFilePath = path.join(CWD, options.html);
				
				// Modify the original file
				injectPWAIntoHTML(
					htmlFilePath,
					webConfigFilepath,
					{
						baseUrl: options.baseUrl,
						assetsPrefix: options.assetsPrefix || '.'
					}
				);
			}
		}
	});

program.parse();
