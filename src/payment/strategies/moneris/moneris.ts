export default interface MonerisStylingProps {
    cssBody?: string;
    cssTextbox?: string;
    cssTextboxPan?: string;
    cssTextboxExpiry?: string;
    csstexboxCvd?: string;
}

export interface MonerisResponseData {
    responseCode: string[];
    dataKey: string;
    errorMessage: string;
    bin: string;
}
