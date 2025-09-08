export default interface AutoExportConfig {
    entries: AutoExportConfigEntry[];
    apiExtractorConfig: ApiExtractorConfig;
}

export interface AutoExportConfigEntry {
    inputPath: string;
    outputPath: string;
    packageOutputPath: string;
    memberPattern: string;
}

export interface ApiExtractorConfig {
    entryPointSourceFile: string;
    mainDtsRollupPath: string;
}
