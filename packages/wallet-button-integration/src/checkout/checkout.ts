/**
 *
 * Create Redirect To Checkout Interfaces
 *
 */

export enum CheckoutHandoffMethod {
    Post = 'POST',
    Redirect = 'REDIRECT',
}

export interface CheckoutHandoffField {
    name: string;
    value: string;
}

/**
 * How to hand the shopper to checkout. `externalCheckoutUrl` only describes a navigation, which is not
 * enough for a payment method whose payload cannot travel in a URL.
 */
export interface CheckoutHandoff {
    url: string;
    method: CheckoutHandoffMethod;
    fields: CheckoutHandoffField[];
}

export interface RedirectUrls {
    externalCheckoutUrl: string;
    externalCheckoutHandoff: CheckoutHandoff;
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
