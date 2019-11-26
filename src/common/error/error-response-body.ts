type ErrorResponseBody = StorefrontErrorResponseBody |
    InternalErrorResponseBody |
    PaymentErrorResponseBody;

export interface StorefrontErrorResponseBody {
    title: string;
    type: string;
    status: number;
    detail?: string;
    code?: string;
    instance?: string;
}

export interface InternalErrorResponseBody {
    title: string;
    status: number;
    type: string;
    code?: number;
    detail?: string;
    instance?: string;
    errors: string[];
}

export interface PaymentErrorResponseBody {
    status: string;
    errors: PaymentErrorData[];
}

export interface PaymentErrorData {
    code: string;
    message?: string;
}

export default ErrorResponseBody;
