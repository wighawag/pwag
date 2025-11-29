"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractHost = exports.loadConfig = exports.generatePWATags = exports.injectPWAIntoHTMLWithOutput = exports.injectPWAIntoHTML = exports.produceManifest = exports.produceIcons = void 0;
exports.produceIconsAndManifest = produceIconsAndManifest;
const icon_generator_1 = require("./icon-generator");
Object.defineProperty(exports, "produceIcons", { enumerable: true, get: function () { return icon_generator_1.produceIcons; } });
const manifest_generator_1 = require("./manifest-generator");
Object.defineProperty(exports, "produceManifest", { enumerable: true, get: function () { return manifest_generator_1.produceManifest; } });
const meta_generator_1 = require("./meta-generator");
Object.defineProperty(exports, "injectPWAIntoHTML", { enumerable: true, get: function () { return meta_generator_1.injectPWAIntoHTML; } });
Object.defineProperty(exports, "injectPWAIntoHTMLWithOutput", { enumerable: true, get: function () { return meta_generator_1.injectPWAIntoHTMLWithOutput; } });
Object.defineProperty(exports, "generatePWATags", { enumerable: true, get: function () { return meta_generator_1.generatePWATags; } });
Object.defineProperty(exports, "loadConfig", { enumerable: true, get: function () { return meta_generator_1.loadConfig; } });
Object.defineProperty(exports, "extractHost", { enumerable: true, get: function () { return meta_generator_1.extractHost; } });
async function produceIconsAndManifest(genConfig, webConfig) {
    await (0, icon_generator_1.produceIcons)(genConfig);
    await (0, manifest_generator_1.produceManifest)(genConfig, webConfig);
}
