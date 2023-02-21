"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.produceManifest = exports.produceIcons = exports.produceIconsAndManifest = void 0;
const icon_generator_1 = require("./icon-generator");
Object.defineProperty(exports, "produceIcons", { enumerable: true, get: function () { return icon_generator_1.produceIcons; } });
const manifest_generator_1 = require("./manifest-generator");
Object.defineProperty(exports, "produceManifest", { enumerable: true, get: function () { return manifest_generator_1.produceManifest; } });
async function produceIconsAndManifest(genConfig, webConfig) {
    await (0, icon_generator_1.produceIcons)(genConfig);
    await (0, manifest_generator_1.produceManifest)(genConfig, webConfig);
}
exports.produceIconsAndManifest = produceIconsAndManifest;
