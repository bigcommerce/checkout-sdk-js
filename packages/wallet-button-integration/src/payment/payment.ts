/**
 *
 * Create Payment Order Interfaces
 *
 */

export interface CreatePaymentOrderIntentResponse {
    data: {
        payment: {
            paymentWallet: {
                createPaymentWalletIntent: {
                    errors: Array<{
                        message: string;
                    }>;
                    paymentWalletIntentData: CreatePaymentOrderIntentResponseBody;
                };
            };
        };
    };
}

export interface CreatePaymentOrderIntentResponseBody {
    approvalUrl: string;
    orderId: string;
    initializationEntityId: string;
}

export interface CreatePaymentOrderIntentInputData {
    cartEntityId: string;
    paymentWalletEntityId: string;
}
