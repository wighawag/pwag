import { WebConfig, InjectOptions } from './types';
declare function extractHost(canonicalURL: string): string;
declare function generatePWATags(config: WebConfig, options?: InjectOptions): string;
declare function loadConfig(configPath: string): WebConfig;
export declare function injectPWAIntoHTML(htmlFilePath: string, configFilePath: string, options?: InjectOptions): void;
export declare function injectPWAIntoHTMLWithOutput(htmlFilePath: string, configFilePath: string, outputFilePath: string, options?: InjectOptions): void;
export { generatePWATags, loadConfig, extractHost };
export type { InjectOptions } from './types';
