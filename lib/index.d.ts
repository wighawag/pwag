import { produceIcons } from './icon-generator';
import { produceManifest } from './manifest-generator';
import { GenIconConfig, WebConfig } from './types';
export declare function produceIconsAndManifest(genConfig: GenIconConfig, webConfig: WebConfig): Promise<void>;
export { produceIcons, produceManifest };
