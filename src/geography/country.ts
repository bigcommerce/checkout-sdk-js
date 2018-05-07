export default interface Country {
    code: string;
    name: string;
    hasPostalCodes: boolean;
    subdivisions: State[];
}

export interface State {
    code: string;
    name: string;
}
