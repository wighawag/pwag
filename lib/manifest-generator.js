"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.produceManifest = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
async function produceManifest(genConfig, webConfig) {
    // compute relative path from genConfig.subpath which indicate the subpath at which the webmanifest is hosted
    const segments = genConfig.subpath ? genConfig.subpath.replace(/^\/|\/$/g, '').split('/') : [];
    const relativePath = segments.length > 0 ? segments.map(() => '..').join('/') : '.';
    // the write folder is the combination of the outputDirPath and the subpath
    const writeFolder = genConfig.subpath
        ? path_1.default.join(genConfig.outputDirPath, genConfig.subpath)
        : genConfig.outputDirPath;
    const prefix = genConfig.iconFileName || 'favicon';
    const manifestFile = {
        name: webConfig.name,
        description: webConfig.description,
        display: webConfig.display || 'fullscreen',
        scope: `${relativePath}/`,
        start_url: `${relativePath}/`,
        background_color: webConfig.themeColor,
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
    promises_1.default.writeFile(path_1.default.join(writeFolder, 'manifest.webmanifest'), manifestText);
}
exports.produceManifest = produceManifest;
