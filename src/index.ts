import { produceIcons } from './icon-generator';
import { produceManifest } from './manifest-generator';
import {
	injectPWAIntoHTML,
	injectPWAIntoHTMLWithOutput,
	generatePWATags,
	loadConfig,
	extractHost,
} from './meta-generator';
import { GenIconConfig, WebConfig, InjectOptions } from './types';

export async function produceIconsAndManifest(genConfig: GenIconConfig, webConfig: WebConfig) {
	await produceIcons(genConfig);
	await produceManifest(genConfig, webConfig);
}

export {
	produceIcons,
	produceManifest,
	injectPWAIntoHTML,
	injectPWAIntoHTMLWithOutput,
	generatePWATags,
	loadConfig,
	extractHost,
};

// Re-export types for convenience
export type { InjectOptions } from './types';
