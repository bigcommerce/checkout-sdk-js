export default interface ExtendInterfaceConfig {
    entries: ExtendInterfaceConfigEntry[];
}

export interface ExtendInterfaceConfigEntry {
    inputPath: string;
    outputPath: string;
    memberPattern: string;
    targetPath: string;
    targetMemberName: string;
}
