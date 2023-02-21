import { produceIcons } from './icon-generator';
import { produceManifest } from './manifest-generator';
import { GenIconConfig, WebConfig } from './types';

export async function produceIconsAndManifest(genConfig: GenIconConfig, webConfig: WebConfig) {
	await produceIcons(genConfig);
	await produceManifest(genConfig, webConfig);
}

export { produceIcons, produceManifest };
