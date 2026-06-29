/**
 *
 * Create Redirect To Checkout Interfaces
 *
 */

export interface RedirectUrls {
    externalCheckoutUrl: string;
}

export interface CreateRedirectToCheckoutResponse {
    data: {
        cart: {
            createCartRedirectUrls: CreateRedirectToCheckoutMutationResult;
        };
    };
}

export interface CreateRedirectToCheckoutMutationResult {
    errors: CreateRedirectToCheckoutError[];
    redirectUrls: RedirectUrls | null;
}

export interface CreateRedirectToCheckoutError {
    __typename: string;
    message?: string;
}

export interface CreateRedirectToCheckoutResponseBody {
    redirectUrls: RedirectUrls | null;
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
