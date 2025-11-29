export type WebConfig = {
	name: string;
	title: string;
	description: string;
	display: string;
	canonicalURL: string;
	ENSName?: string;
	themeColor: string;
	appleStatusBarStyle: string;
	icon: string;
	maskableIcons: {
		src: string;
		type: string;
		sizes: string;
	}[];
};

export type WebManifest = {
	name: string;
	short_name?: string;
	description?: string;
	dir?: string;
	lang?: string;
	display?: string;
	orientation?: string;
	scope?: string;
	start_url?: string;
	background_color?: string;
	theme_color?: string;
	icons: {
		src: string;
		type: string;
		sizes: string;
	}[];
};

export type GenManifestConfig = { outputDirPath: string; subpath?: string; iconFileName?: string };
export type GenIconConfig = GenManifestConfig & {
	inputFilePath: string;
	paletteSize?: number;
	include16?: boolean;
};

export interface InjectOptions {
	baseUrl?: string;
	assetsPrefix?: string;
	htmlOutput?: string;
}
