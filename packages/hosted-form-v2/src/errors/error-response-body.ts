export interface PaymentErrorResponseBody {
    status: string;
    errors: PaymentErrorData[];
    additional_action_required?: AdditionalActionRequired;
}

export interface AdditionalActionRequired {
    type: string;
    data?: { key?: string };
}

export interface PaymentErrorData {
    code: string;
    message?: string;
}
