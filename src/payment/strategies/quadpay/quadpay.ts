export interface QuadpayHostWindow extends Window {
    Quadpay?: Quadpay;
}

export interface Quadpay {
    Checkout: QuadpayCheckout;
}

export interface QuadpayCheckout {
    attachButton(buttonId: string, payload: QuadpayPayload): void;
    init(payload: QuadpayPayload): void;
}

export interface QuadpayPayload {
    /**
     * Callback function that is called when the lightbox flow is completed.
     * This function must handle the checkoutId submission.
     */
    onComplete?(response: QuadpayResponse): void;
    /**
     * Callback function that is called before the lightbox flow is started.
     * This function must handle the post to get a checkoutId.
     */
    onCheckout?(resolve: (response: QuadpayPostResponse) => void): void;
}

export const enum QuadpayModalEvent {
    CancelCheckout = 'cancelled',
    CheckoutApproved = 'approved',
    CheckoutDeclined = 'declined',
    CheckoutReferred = 'referred',
}

/**
 * Response format returned by onCheckout function or checkoutUri.
 */
export interface QuadpayPostResponse {
    id: string;
    redirect_uri: string;
    uri: string;
}
/**
 * Response format sent to onComplete function or redirectUri.
 */
export interface QuadpayResponse {
    checkoutId?: string;
    customerId?: string;
    state: string;
}
