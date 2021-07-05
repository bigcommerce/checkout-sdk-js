export default interface MonerisStylingProps {
    cssBody?: string;
    cssTextbox?: string;
    cssTextboxPan?: string;
    cssTextboxExpiry?: string;
    csstexboxCvd?: string;
}

export interface MoneriesHostedFieldsQueryParams {
    id: string;
    pmmsg: boolean;
    css_body: string;
    css_textbox: string;
    css_textbox_pan: string;
    enable_exp: number;
    css_textbox_exp: string;
    enable_cvd: number;
    css_textbox_cvd: string;
    display_labels: number;
    pan_label: string;
    exp_label: string;
    cvd_label: string;
}

export interface MonerisResponseData {
    responseCode: string[];
    dataKey: string;
    errorMessage: string;
    bin: string;
}

export interface MonerisInitializationData {
    profileId: string;
    creditCardLabel?: string;
    expiryDateLabel?: string;
    cvdLabel?: string;
}
