export default interface ExtendInterfaceConfig {
    entries: ExtendInterfaceConfigEntry[];
}

export interface ExtendInterfaceConfigEntry {
    inputPath: string;
    outputPath: string;
    outputMemberName: string;
    memberPattern: string;
    targetPath: string;
    targetMemberName: string;
}
