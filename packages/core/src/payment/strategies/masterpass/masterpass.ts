/**
 * The name of the masterpass script that is hosted by the browser window
 */
export interface MasterpassHostWindow extends Window {
    /**
     *  Use this to refer to the loaded masterpass client script instance
     */
    masterpass?: Masterpass;
}

/**
 * Methods loaded by the masterpass script
 */
export interface Masterpass {
    /**
     * Proceed to checkout with the given parameters
     */
    checkout(options: MasterpassCheckoutOptions): void;
}

/**
 * Payload that must be passed to masterpass script to start a checkout
 */
export interface MasterpassCheckoutOptions {
    /**
     * Merchant checkout identifier received when merchant onboarded for masterpass
     */
    checkoutId: string;
    /**
     * Card types accepted by merchant
     */
    allowedCardTypes: string[];
    /**
     * Shopping cart subtotal
     */
    amount: string;
    /**
     * Currency code for cart
     */
    currency: string;
    /**
     * Merchant Cart identifier
     */
    cartId: string;
    /**
     * This optional parameter can be used to override the callbackUrl specified in the Merchant Portal.
     */
    callbackUrl?: string;

    /**
     * Set to "true" if you don't require shipping address for checkout; default is false
     */
    suppressShippingAddress?: boolean;
}
