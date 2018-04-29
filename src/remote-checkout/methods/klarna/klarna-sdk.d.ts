declare namespace Klarna {
    interface InitParams {
        client_token: string;
    }

    interface LoadParams {
        container: string;
    }

    interface Sdk {
        authorize(params: any, callback: (res: AuthorizationResponse) => void): void;
        init(params: InitParams): void;
        load(params: LoadParams, callback?: (res: LoadResponse) => void): void;
    }

    interface LoadResponse {
        show_form: boolean;
        error?: {
            invalid_fields: string[];
        };
    }

    interface AuthorizationResponse {
        authorization_token: string;
        approved: boolean;
        show_form: boolean;
    }
}
