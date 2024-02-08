import { RequestError } from '@bigcommerce/checkout-sdk/payment-integration-api';

export interface TdOnlineMartHostWindow extends Window {
    customcheckout?(): TDCustomCheckoutSDK;
}

export interface TDCustomCheckoutSDK {
    create(fieldType: FieldType, options?: FieldOptions): TdOnlineMartElement;
    createToken(callback: (result: CreateTokenResponse) => void): void;
}

export interface TdOnlineMartElement {
    mount(cssSelector: string): void;
    unmount(): void;
}

export enum FieldType {
    CARD_NUMBER = 'card-number',
    CVV = 'cvv',
    EXPIRY = 'expiry',
}

interface CreateTokenResponse {
    code: string;
    error?: CreateTokenError;
    token?: string;
    last4?: string;
    expiryMonth?: string;
    expiryYear?: string;
}

export interface CreateTokenError {
    field: string;
    type: string;
    message: string;
}

/* eslint-disable @typescript-eslint/naming-convention */
export interface TdOnlineMartThreeDSErrorBody {
    errors?: Array<{ code: string }>;
    three_ds_result?: {
        acs_url: string;
        payer_auth_request: string;
        merchant_data: string;
    };
}
/* eslint-enable @typescript-eslint/naming-convention */

export type TdOnlineMartAdditionalAction = RequestError<TdOnlineMartThreeDSErrorBody>;

//Note: The style property affects the remote styling of text inside the iframe input. The classes property updates the class list of the element the field is mounted to on your page.
interface FieldOptions {
    placeholder?: string;
    style?: Styles;
    classes?: Classes;
    brands?: string[];
}

interface Classes {
    base?: string;
    complete?: string;
    empty?: string;
    focus?: string;
    error?: string;
}

interface Styles {
    base?: CssStyles;
    complete?: CssStyles;
    empty?: CssStyles;
    error?: CssStyles;
}

interface CssStyles {
    color?: string;
    fontFamily?: string;
    fontSize?: string;
    fontStyle?: string;
    fontWeight?: string;
    textDecoration?: string;
    padding?: string;
    paddingLeft?: string;
    paddingTop?: string;
    paddingRight?: string;
    paddingBottom?: string;
}
