export default interface CreateEnumConfig {
    entries: CreateEnumConfigEntry[];
}

export interface CreateEnumConfigEntry {
    inputPaths: string[];
    inputMemberPattern: string;
    outputPath: string;
    outputMemberName: string;
}
