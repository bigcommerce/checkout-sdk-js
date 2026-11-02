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
}

/**
 * Redirect urls returned when the mutation is asked for the checkout handoff as well.
 */
export interface RedirectUrlsWithCheckoutHandoff extends RedirectUrls {
    externalCheckoutHandoff: CheckoutHandoff | null;
}

export interface CreateRedirectToCheckoutResponse<
    TRedirectUrls extends RedirectUrls = RedirectUrls,
> {
    data: {
        cart: {
            createCartRedirectUrls: CreateRedirectToCheckoutMutationResult<TRedirectUrls>;
        };
    };
}

export interface CreateRedirectToCheckoutMutationResult<
    TRedirectUrls extends RedirectUrls = RedirectUrls,
> {
    errors: CreateRedirectToCheckoutError[];
    redirectUrls: TRedirectUrls | null;
}

export interface CreateRedirectToCheckoutError {
    __typename: string;
    message?: string;
}

export interface CreateRedirectToCheckoutResponseBody<
    TRedirectUrls extends RedirectUrls = RedirectUrls,
> {
    redirectUrls: TRedirectUrls | null;
}

export type CreateRedirectToCheckoutHandoffResponseBody =
    CreateRedirectToCheckoutResponseBody<RedirectUrlsWithCheckoutHandoff>;

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
