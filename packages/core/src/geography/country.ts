export default interface Country {
    code: string;
    name: string;
    hasPostalCodes: boolean;
    subdivisions: Region[];
    requiresState: boolean;
}

export interface Region {
    code: string;
    name: string;
}
