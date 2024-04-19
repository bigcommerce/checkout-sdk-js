export default interface AutoExportConfig {
    entries: AutoExportConfigEntry[];
}

export interface AutoExportConfigEntry {
    inputPath: string;
    outputPath: string;
    memberPattern: string;
}
