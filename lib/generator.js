"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const sharp_1 = __importDefault(require("sharp"));
const to_ico_1 = __importDefault(require("to-ico"));
const svgo_1 = require("svgo");
const is_svg_1 = __importDefault(require("is-svg"));
const baseIconConfigs = [
    {
        name: "favicon.svg",
    },
    {
        // no colors palette size otherwise its color profile is off
        // which causes problems with converting to ico
        name: "favicon.ico",
        pxSize: 32,
    },
    {
        name: "favicon-192.png",
        pxSize: 192,
        colorsPaletteSize: 64,
    },
    {
        name: "favicon-512.png",
        pxSize: 512,
        colorsPaletteSize: 64,
    },
    {
        name: "apple-touch-icon.png",
        pxSize: 180,
        colorsPaletteSize: 64,
        padding: 20,
    },
];
function buildPng(rawBuffer, { pxSize, colorsPaletteSize, padding }) {
    const outputIcon = (0, sharp_1.default)(rawBuffer)
        .resize(pxSize, pxSize)
        .png({ compressionLevel: 9, colors: colorsPaletteSize });
    return padding
        ? outputIcon.extend({
            top: padding,
            left: padding,
            bottom: padding,
            right: padding,
            background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        : outputIcon;
}
function getPngBuffer(rawBuffer, cfg) {
    return buildPng(rawBuffer, cfg).toBuffer();
}
function getIcoBuffer(rawBuffer, cfg) {
    return buildPng(rawBuffer, cfg)
        .toBuffer()
        .then((buf) => (0, to_ico_1.default)(buf, { resize: true }));
}
function getSvgBuffer(rawBuffer) {
    const optimizedSvg = (0, svgo_1.optimize)(rawBuffer, {
        multipass: true,
    });
    if (optimizedSvg.error !== undefined) {
        throw Error(optimizedSvg.error);
    }
    return Buffer.from(optimizedSvg.data);
}
function getIconBuffer(rawBuffer, cfg) {
    const iconName = cfg.name;
    const iconExtension = path_1.default.extname(iconName);
    switch (iconExtension) {
        case ".svg":
            return getSvgBuffer(rawBuffer);
        case ".png":
            return getPngBuffer(rawBuffer, cfg);
        case ".ico":
            return getIcoBuffer(rawBuffer, cfg);
        default:
            throw Error(`Extension ${iconExtension} is not recognized.`);
    }
}
async function produceIcons(inputFilePath, outputDirPath, prefix = "favicon", paletteSize = 64, include16 = false) {
    await promises_1.default.access(inputFilePath);
    try {
        await promises_1.default.access(outputDirPath);
    }
    catch (e) {
        if (e instanceof Error && e.message.includes("ENOENT")) {
            promises_1.default.mkdir(outputDirPath);
        }
        else {
            throw e;
        }
    }
    const rawIconBuf = await promises_1.default.readFile(inputFilePath);
    const isSvgBuf = (0, is_svg_1.default)(rawIconBuf);
    let iconConfigs = baseIconConfigs.map((cfg) => {
        const mappedCfg = { ...cfg };
        if (!isSvgBuf && mappedCfg.name.endsWith(".svg")) {
            mappedCfg.name = mappedCfg.name.replace(".svg", ".png");
            mappedCfg.pxSize = 32;
        }
        mappedCfg.name = mappedCfg.name.replace("favicon", prefix);
        if (mappedCfg.name.endsWith(".png")) {
            mappedCfg.colorsPaletteSize = paletteSize;
        }
        return mappedCfg;
    });
    if (include16) {
        const ico = iconConfigs.find((cfg) => cfg.name.endsWith(".ico"));
        const icoNameWithoutExt = ico.name.slice(0, -4);
        iconConfigs.push({ ...ico, name: `${icoNameWithoutExt}-32.ico` });
        iconConfigs.push({
            ...ico,
            name: `${icoNameWithoutExt}-16.ico`,
            pxSize: 16,
        });
        iconConfigs = iconConfigs.filter((cfg) => cfg !== ico);
    }
    const iconsGenerationSeries = iconConfigs.map(async (cfg) => {
        const iconName = cfg.name.replace("favicon", prefix);
        const iconCfg = cfg.name.endsWith("png")
            ? { ...cfg, colorsPaletteSize: paletteSize, name: iconName }
            : { ...cfg, name: iconName };
        const outputBuffer = await getIconBuffer(rawIconBuf, iconCfg);
        return promises_1.default.writeFile(path_1.default.join(outputDirPath, iconCfg.name), outputBuffer);
    });
    await Promise.all(iconsGenerationSeries);
    const manifestFile = {
        icons: [
            { src: `/${prefix}-192.png`, type: "image/png", sizes: "192x192" },
            { src: `/${prefix}-512.png`, type: "image/png", sizes: "512x512" },
        ],
    };
    const manifestText = JSON.stringify(manifestFile, null, 2);
    promises_1.default.writeFile(path_1.default.join(outputDirPath, "manifest.webmanifest"), manifestText);
}
exports.default = produceIcons;
