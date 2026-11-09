export interface PaymentErrorResponseBody {
    status: string;
    errors: PaymentErrorData[];
    additional_action_required?: {
        type: string;
        data?: { key?: string };
    };
}

export interface PaymentErrorData {
    code: string;
    message?: string;
}
