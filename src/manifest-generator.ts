import fs from 'fs/promises';
import path from 'path';
import { GenManifestConfig, WebConfig, WebManifest } from './types';

export async function produceManifest(genConfig: GenManifestConfig, webConfig: WebConfig) {
	// compute relative path from genConfig.subpath which indicate the subpath at which the webmanifest is hosted
	const segments = genConfig.subpath ? genConfig.subpath.replace(/^\/|\/$/g, '').split('/') : [];
	const relativePath = segments.length > 0 ? segments.map(() => '..').join('/') : '.';

	// the write folder is the combination of the outputDirPath and the subpath
	const writeFolder = genConfig.subpath
		? path.join(genConfig.outputDirPath, genConfig.subpath)
		: genConfig.outputDirPath;

	const prefix = genConfig.iconFileName || 'favicon';
	const manifestFile: WebManifest = {
		name: webConfig.name, // mandatory as per the spec
		description: webConfig.description, // optional
		display: webConfig.display || 'fullscreen', // fullscreen is probably prefered in most cases
		scope: `${relativePath}/`, // the scope need to be adapted if we are in a subpath + we keep it relative so it works on IPFS
		start_url: `${relativePath}/`, // the start_url need to be adapted if we are in a subpath + we keep it relative so it works on IPFS
		background_color: webConfig.themeColor, // same as themeColor, any use case for a different background color ?
		theme_color: webConfig.themeColor,
		icons: [
			// the icon generator only generate 2 variants
			{ src: `${relativePath}/${prefix}-192.png`, type: 'image/png', sizes: '192x192' },
			{ src: `${relativePath}/${prefix}-512.png`, type: 'image/png', sizes: '512x512' },
		],
	};
	if (webConfig.maskableIcons) {
		manifestFile.icons = [
			...manifestFile.icons,
			// we add the maskable icons defined in the config. These are hand-made. any tool to auto-generate them too ?
			...webConfig.maskableIcons.map((v) => ({ ...v, purpose: 'maskable' })),
		];
	}
	const manifestText = JSON.stringify(manifestFile, null, 2);
	fs.writeFile(path.join(writeFolder, 'manifest.webmanifest'), manifestText);
}
