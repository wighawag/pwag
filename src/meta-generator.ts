import fs from 'fs';
import { WebConfig, InjectOptions } from './types';

function extractHost(canonicalURL: string): string {
	try {
		const url = new URL(canonicalURL);
		return `${url.protocol}//${url.host}`;
	} catch (error) {
		console.error(`Invalid canonicalURL: ${canonicalURL}`);
		return canonicalURL;
	}
}

function generatePWATags(config: WebConfig, options: InjectOptions = {}): string {
	const { baseUrl, assetsPrefix = '.' } = options;

	const host = extractHost(config.canonicalURL);
	const previewImage = `${host}/preview.png`;

	// Auto-detect icon type from the config icon path
	const iconExtension = config.icon.toLowerCase().endsWith('.png') ? 'png' : 'svg';

	const tags: string[] = [];

	// Basic meta tags
	tags.push(`<title>${config.title}</title>`);
	tags.push(`<meta name="title" content="${config.title}" />`);
	tags.push(`<meta name="description" content="${config.description}" />`);

	// Conditional ENSName tag
	if (config.ENSName) {
		tags.push(`<meta name="Dwebsite" content="${config.ENSName}" />`);
	}

	// Open Graph tags
	tags.push(`<meta property="og:type" content="website" />`);
	tags.push(`<meta property="og:url" content="${host}/" />`);
	tags.push(`<meta property="og:title" content="${config.title}" />`);
	tags.push(`<meta property="og:description" content="${config.description}" />`);
	tags.push(`<meta property="og:image" content="${previewImage}" />`);

	// Twitter Card tags
	tags.push(`<meta property="twitter:card" content="summary_large_image" />`);
	tags.push(`<meta property="twitter:url" content="${host}/" />`);
	tags.push(`<meta property="twitter:title" content="${config.title}" />`);
	tags.push(`<meta property="twitter:description" content="${config.description}" />`);
	tags.push(`<meta property="twitter:image" content="${previewImage}" />`);

	// Icon links
	if (baseUrl) {
		const basePath = baseUrl.replace(/^\//, ''); // Remove leading slash
		tags.push(
			`<link rel="icon" href="${assetsPrefix}/${basePath}/icon.${iconExtension}" type="image/${iconExtension}" />`,
		);
		tags.push(
			`<link rel="icon" href="${assetsPrefix}/${basePath}/pwa/favicon.ico" sizes="any" /><!-- 32×32 -->`,
		);
		tags.push(
			`<link rel="apple-touch-icon" href="${assetsPrefix}/${basePath}/pwa/apple-touch-icon.png" /><!-- 180×180 -->`,
		);
		tags.push(
			`<link rel="manifest" href="${assetsPrefix}/${basePath}/pwa/manifest.webmanifest" />`,
		);
	} else {
		tags.push(
			`<link rel="icon" href="${assetsPrefix}/icon.${iconExtension}" type="image/${iconExtension}" />`,
		);
		tags.push(
			`<link rel="icon" href="${assetsPrefix}/pwa/favicon.ico" sizes="any" /><!-- 32×32 -->`,
		);
		tags.push(
			`<link rel="apple-touch-icon" href="${assetsPrefix}/pwa/apple-touch-icon.png" /><!-- 180×180 -->`,
		);
		tags.push(`<link rel="manifest" href="${assetsPrefix}/pwa/manifest.webmanifest" />`);
	}

	// Additional PWA meta tags
	tags.push(`<!-- extra info -->`);
	tags.push(`<meta name="theme-color" content="${config.themeColor}" />`);
	tags.push(`<meta name="mobile-web-app-capable" content="yes" />`);
	tags.push(`<meta name="application-name" content="${config.name}" />`);

	// Apple specific tags
	tags.push(`<!-- apple -->`);
	tags.push(`<meta name="apple-mobile-web-app-capable" content="yes" />`);
	tags.push(
		`<meta name="apple-mobile-web-app-status-bar-style" content="${config.appleStatusBarStyle}" />`,
	);
	tags.push(`<meta name="apple-mobile-web-app-title" content="${config.name}" />`);

	return tags.join('\n');
}

function loadConfig(configPath: string): WebConfig {
	try {
		const configContent = fs.readFileSync(configPath, 'utf-8');
		return JSON.parse(configContent) as WebConfig;
	} catch (error) {
		console.error(`Error loading config from ${configPath}:`, error);
		process.exit(1);
	}
}

export function injectPWAIntoHTML(
	htmlFilePath: string,
	configFilePath: string,
	options: InjectOptions = {},
): void {
	try {
		// Load config
		const config = loadConfig(configFilePath);

		// Read HTML file
		if (!fs.existsSync(htmlFilePath)) {
			console.error(`HTML file not found: ${htmlFilePath}`);
			process.exit(1);
		}

		const htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');

		// Check for PWAG-GENERATED markers
		const startMarker = '<!--PWAG-GENERATED-->';
		const endMarker = '<!--PWAG-GENERATED-->';

		const startIndex = htmlContent.indexOf(startMarker);
		const endIndex = htmlContent.indexOf(endMarker, startIndex + startMarker.length);

		if (startIndex === -1 || endIndex === -1) {
			console.error('PWAG-GENERATED markers not found in HTML file');
			process.exit(1);
		}

		// Detect indentation from the start marker
		const beforeStartMarker = htmlContent.substring(0, startIndex);
		const lastNewlineIndex = beforeStartMarker.lastIndexOf('\n');
		let indentation = '';

		if (lastNewlineIndex !== -1) {
			const lineStart = lastNewlineIndex + 1;
			const markerStart = startIndex;
			indentation = beforeStartMarker.substring(lineStart, markerStart);
		}

		// Generate new content with preserved indentation
		const pwaTags = generatePWATags(config, options);
		const indentedPwaTags = pwaTags
			.split('\n')
			.map((line) => indentation + line)
			.join('\n');
		const newContent = `${startMarker}\n${indentedPwaTags}\n${indentation}${endMarker}`;

		// Replace content between markers
		const beforeMarker = htmlContent.substring(0, startIndex);
		const afterMarker = htmlContent.substring(endIndex + endMarker.length);

		const updatedContent = beforeMarker + newContent + afterMarker;

		// Write back to file
		fs.writeFileSync(htmlFilePath, updatedContent, 'utf-8');

		console.log(`Successfully injected PWA tags into ${htmlFilePath}`);
	} catch (error) {
		console.error('Error injecting PWA tags:', error);
		process.exit(1);
	}
}

export function injectPWAIntoHTMLWithOutput(
	htmlFilePath: string,
	configFilePath: string,
	outputFilePath: string,
	options: InjectOptions = {},
): void {
	try {
		// Load config
		const config = loadConfig(configFilePath);

		// Read HTML file
		if (!fs.existsSync(htmlFilePath)) {
			console.error(`HTML file not found: ${htmlFilePath}`);
			process.exit(1);
		}

		const htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');

		// Check for PWAG-GENERATED markers
		const startMarker = '<!--PWAG-GENERATED-->';
		const endMarker = '<!--PWAG-GENERATED-->';

		const startIndex = htmlContent.indexOf(startMarker);
		const endIndex = htmlContent.indexOf(endMarker, startIndex + startMarker.length);

		if (startIndex === -1 || endIndex === -1) {
			console.error('PWAG-GENERATED markers not found in HTML file');
			process.exit(1);
		}

		// Detect indentation from the start marker
		const beforeStartMarker = htmlContent.substring(0, startIndex);
		const lastNewlineIndex = beforeStartMarker.lastIndexOf('\n');
		let indentation = '';

		if (lastNewlineIndex !== -1) {
			const lineStart = lastNewlineIndex + 1;
			const markerStart = startIndex;
			indentation = beforeStartMarker.substring(lineStart, markerStart);
		}

		// Generate new content with preserved indentation
		const pwaTags = generatePWATags(config, options);
		const indentedPwaTags = pwaTags
			.split('\n')
			.map((line) => indentation + line)
			.join('\n');
		const newContent = `${startMarker}\n${indentedPwaTags}\n${indentation}${endMarker}`;

		// Replace content between markers
		const beforeMarker = htmlContent.substring(0, startIndex);
		const afterMarker = htmlContent.substring(endIndex + endMarker.length);

		const updatedContent = beforeMarker + newContent + afterMarker;

		// Write to output file
		fs.writeFileSync(outputFilePath, updatedContent, 'utf-8');

		console.log(`Successfully injected PWA tags into ${outputFilePath}`);
	} catch (error) {
		console.error('Error injecting PWA tags:', error);
		process.exit(1);
	}
}

export { generatePWATags, loadConfig, extractHost };

export type { InjectOptions } from './types';
