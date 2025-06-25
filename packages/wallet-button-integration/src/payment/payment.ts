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
                        location: Array<{ line: string; column: string }>;
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

/**
 *
 * Create Redirect To Checkout Interfaces
 *
 */

export interface CreateRedirectToCheckoutResponse {
    data: {
        cart: {
            createCartRedirectUrls: CreateRedirectToCheckoutResponseBody;
        };
    };
}

export interface CreateRedirectToCheckoutResponseBody {
    redirectUrls: { externalCheckoutUrl: string } | null;
}

export interface QueryParams {
    key: string;
    value: string;
}

export interface RedirectToCheckoutUrlInputData {
    paymentWalletData: {
        providerId: string;
        providerOrderId: string;
    };
    cartEntityId: string;
    queryParams: QueryParams[];
}
