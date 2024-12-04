/* eslint-disable @typescript-eslint/naming-convention */
/**
 * A set of stringified CSS to apply to Moneris' IFrame fields.
 * CSS attributes should be converted to string.
 * Please note that ClassNames are not supported.
 *
 * IE:
 * ```js
 * {
 *      cssBody: 'background:white;';
 *      cssTextbox: 'border-width:2px;';
 *      cssTextboxCardNumber: 'width:140px;';
 *      cssTextboxExpiryDate: 'width:40px;';
 *      cssTextboxCVV: 'width:40px;';
 * }
 * ```
 *
 * When using several attributes use semicolon to separate each one.
 * IE: 'background:white;width:40px;'
 */
export default interface MonerisStylingProps {
    /**
     * Stringified CSS to apply to the body of the IFrame.
     */
    cssBody?: string;
    /**
     * Stringified CSS to apply to each of input fields.
     */
    cssTextbox?: string;
    /**
     * Stringified CSS to apply to the card's number field.
     */
    cssTextboxCardNumber?: string;
    /**
     * Stringified CSS to apply to the card's expiry field.
     */
    cssTextboxExpiryDate?: string;
    /**
     * Stringified CSS to apply to the card's CVV field.
     */
    cssTextboxCVV?: string;
    /**
     * Stringified CSS to apply to input labels
     */
    cssInputLabel?: string;
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
    css_input_label: string;
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
