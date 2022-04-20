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
    id?: number;
}

export interface GetCountryResponse {
    data: Country[];
}

export interface UnitedStatesCodes {
    name: string;
    abbreviation: string;
}
