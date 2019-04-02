export interface ZipHostWindow extends Window {
    Zip?: Zip;
}

export interface Zip {
    Checkout: ZipCheckout;
}

export interface ZipCheckout {
    attachButton(buttonId: string, payload: ZipPayload): void;
    init(payload: ZipPayload): void;
}

export interface ZipPayload {
    /**
     * Callback function that is called when the lightbox flow is completed.
     * This function must handle the checkoutId submission.
     */
    onComplete?(response: ZipResponse): void;
    /**
     * Callback function that is called before the lightbox flow is started.
     * This function must handle the post to get a checkoutId.
     */
    onCheckout?(resolve: (response: ZipPostResponse) => void): void;
}

export const enum ZipModalEvent {
    CancelCheckout = 'cancelled',
    CheckoutApproved = 'approved',
    CheckoutDeclined = 'declined',
    CheckoutReferred = 'referred',
}

/**
 * Response format returned by onCheckout function or checkoutUri.
 */
export interface ZipPostResponse {
    id: string;
    redirect_uri: string;
    uri: string;
}
/**
 * Response format sent to onComplete function or redirectUri.
 */
export interface ZipResponse {
    checkoutId?: string;
    customerId?: string;
    state: string;
}
