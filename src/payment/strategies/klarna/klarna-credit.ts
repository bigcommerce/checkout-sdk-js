export default interface KlarnaSdk {
    authorize(params: any, callback: (res: KlarnaAuthorizationResponse) => void): void;
    init(params: KlarnaInitParams): void;
    load(params: KlarnaLoadParams, callback?: (res: KlarnaLoadResponse) => void): void;
}

export interface KlarnaInitParams {
    client_token: string;
}

export interface KlarnaLoadParams {
    container: string;
}

export interface KlarnaLoadResponse {
    show_form: boolean;
    error?: {
        invalid_fields: string[];
    };
}

export interface KlarnaAuthorizationResponse {
    authorization_token: string;
    approved: boolean;
    show_form: boolean;
}
