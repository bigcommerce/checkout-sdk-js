export interface PaymentErrorResponseBody {
    status: string;
    errors: PaymentErrorData[];
}

export interface PaymentErrorData {
    code: string;
    message?: string;
}
