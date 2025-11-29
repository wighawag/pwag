[![npm](https://img.shields.io/npm/v/pwag?style=flat-square)](https://www.npmjs.com/package/pwag)

Adapted from [favgen](https://www.npmjs.com/package/favgen) to include more flexibility on the web manifest file

This is a simple CLI tool to generate an optimized set of favicons and a web manifest from a single input file and a web-config file. Icons are optimized in terms of both size and quantity (nowadays you don't need that many of them). They are produced according to [this article](https://evilmartians.com/chronicles/how-to-favicon-in-2021-six-files-that-fit-most-needs) which served as an inspiration for the tool.

## Command Line Interface

The `pwag` command generates icons and manifest from an input file, and optionally injects PWA meta tags into HTML files:

```bash
npx pwag /path/to/input-image /path/to/web-config.json -o /path/to/output [options]
```

**The script always generates icons and manifest first, then optionally injects PWA meta tags if the `--html` option is provided.**

WebConfig type is found in [src/types.ts](src/types.ts#L1-16)

## Generate Icons and Manifest

The script expect the image path as first arg and the web-config file as scond argument

the tool then generates optimized favicons and web manifest:

### Options

- output directory by providing `-o` option with a path (`static` by default)
- icon prefix by providing `--prefix` option with a name (`favicon` by default)
- colors palette size by providing `--colors` with a number between 2 and 256 (64 by default)
- producing 16x16 .ico file by setting `--include16` flag

Input file can be in any of the following formats: JPEG, PNG, WebP, GIF, AVIF, TIFF or SVG (anything [sharp library](https://sharp.pixelplumbing.com/) accepts).

By default, the following set of favicons is produced:

- `favicon.svg` if input file was SVG and `favicon.png` 32x32 otherwise
- `favicon.ico` 32x32
- `favicon-192.png` 192x192 (for Android devices)
- `favicon-512.png` 192x192 (for Android devices)
- `apple-touch-icon.png` 180x180 (original image is resized to 140x140 and 20px transparent padding is added on each side; rationale for this is given in the article)

Additionally, a sample `manifest.webmanifest` file is produced which shows how favicons for Android devices are supposed to be included.

Besides that, PNG output is optimized by `sharp` (which uses `pngquant`) and SVG output is optimized by [SVGO](https://github.com/svg/svgo).
Also, color palette is reduced to 64 colors by default in order to reduce assets' size.

## Inject PWA Meta Tags

The tool can also inject meta tag in provided html

### HTML Injection Options

- `--html <path>`: **Required** - HTML file path with PWAG-GENERATED markers to inject meta tags into
- `--html-output <path>`: Output HTML file path for template files (preserves original template file specified in --html)
- `--base-url <url>`: Base URL for relative paths
- `--assets-prefix <prefix>`: Assets prefix for different frameworks (default: ".")

### HTML Template Requirements

Your HTML file must contain these markers:

```html
<head>
	<!--PWAG-GENERATED-->
	<!--PWAG-GENERATED-->

	<!-- Other head content -->
</head>
```

The script will replace the content between these markers with the generated PWA tags, preserving the original indentation.

### Examples

```bash
# Generate icons (existing functionality)
npx pwag icon.png web/src/web-config.json -o static

# Inject into HTML file (modifies original)
npx pwag icon.png web/src/web-config.json -o static --html web/build/index.html

# Inject into HTML with options
npx pwag icon.png web/src/web-config.json -o static --html web/build/index.html --assets-prefix "%sveltekit.assets%"

# Generate HTML output (preserves template)
npx pwag icon.png web/src/web-config.json -o static --html web/build/index.html --html-output web/build/index.html
```

This generates comprehensive meta tags including:

- **Basic meta tags**: title, description, theme color
- **Open Graph tags**: for social media sharing
- **Twitter Card tags**: for Twitter sharing
- **Icon links**: favicons, apple-touch-icon, manifest
- **PWA meta tags**: mobile-web-app-capable, application-name
- **Apple specific tags**: apple-mobile-web-app settings
- **Conditional ENSName**: only included if specified in config
- **Preserved indentation**: Both markers maintain original file indentation

## Programmatic API

```js
const { produceIconsAndManifest, injectPWAIntoHTML, injectPWAIntoHTMLWithOutput } = require('pwag');

// Generate icons and manifest
const inputFilePath = 'favicon.svg';
const outputDirPath = 'static';
const subpath = 'pwa';
const prefix = 'favicon'; // default value
const paletteSize = 64; // default value
const include16 = true; // default is false
produceIconsAndManifest(
	{
		outputDirPath: outputDirPath,
		subpath,
		iconFileName: prefix,
		inputFilePath,
		paletteSize,
		include16,
	},
	{},
);

// Inject PWA meta tags into HTML (modifies original)
injectPWAIntoHTML('web/build/index.html', 'web/src/web-config.json', {
	baseUrl: '/app',
	assetsPrefix: '%sveltekit.assets%',
});

// Inject PWA meta tags into HTML (preserves template)
injectPWAIntoHTMLWithOutput(
	'web/src/template.html',
	'web/src/web-config.json',
	'web/build/index.html',
	{
		baseUrl: '/app',
		assetsPrefix: '%sveltekit.assets%',
	},
);
```
