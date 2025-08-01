/* eslint-disable @typescript-eslint/naming-convention */
export default interface KlarnaPayments {
    authorize(
        options: KlarnaAuthorizeOptions,
        data: KlarnaUpdateSessionParams,
        callback: (res: KlarnaAuthorizationResponse) => void,
    ): void;
    init(params: KlarnaInitParams): void;
    load(params: KlarnaLoadParams, callback: (res: KlarnaLoadResponse) => void): void;
}

export interface KlarnaAuthorizeOptions {
    instance_id?: string;
    payment_method_category: string;
}

export interface KlarnaInitParams {
    client_token: string;
}

export interface KlarnaLoadParams {
    container: string;
    payment_method_category?: string;
    payment_method_categories?: string;
    instance_id?: string;
    preferred_payment_method?: string;
}

export interface KlarnaLoadResponse {
    show_form: boolean;
    error?: {
        invalid_fields: string[];
    };
}

export interface KlarnaAuthorizationResponse {
    authorization_token?: string;
    approved: boolean;
    show_form?: boolean;
    error?: {
        invalid_fields: string[];
    };
}

export type KlarnaUpdateSessionParams = Partial<{
    billing_address: KlarnaAddress;
    shipping_address: KlarnaAddress;
}>;

export interface KlarnaAddress {
    street_address: string;
    street_address2?: string;
    city: string;
    country: string;
    given_name: string;
    family_name: string;
    phone?: string;
    postal_code: string;
    region: string;
    email?: string;
    organization_name?: string;
}
export interface KlarnaInitializationData {
    enableBillie?: string;
}
