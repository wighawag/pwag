import { produceIcons } from './icon-generator';
import { produceManifest } from './manifest-generator';
import { injectPWAIntoHTML, injectPWAIntoHTMLWithOutput, generatePWATags, loadConfig, extractHost } from './meta-generator';
import { GenIconConfig, WebConfig } from './types';
export declare function produceIconsAndManifest(genConfig: GenIconConfig, webConfig: WebConfig): Promise<void>;
export { produceIcons, produceManifest, injectPWAIntoHTML, injectPWAIntoHTMLWithOutput, generatePWATags, loadConfig, extractHost, };
export type { InjectOptions } from './types';
