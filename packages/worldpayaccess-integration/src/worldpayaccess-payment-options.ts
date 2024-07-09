export interface WorldpayAccessAdditionalAction {
    additional_action_required: {
        data: {
            redirect_url: string;
        };
    };
    provider_data: {
        data: string;
        source_id: string;
    };
}

export interface WorldpayAccess3DSOptions {
    acs_url: string;
    merchant_data: string;
    payer_auth_request: string;
}

export interface WorldpayAccessPaymentInitializeOptions {
    /**
     * A callback that gets called when the iframe is ready to be added to the
     * current page. It is responsible for determining where the iframe should
     * be inserted in the DOM.
     *
     * @param iframe - The iframe element containing the payment web page
     * provided by the strategy.
     * @param cancel - A function, when called, will cancel the payment
     * process and remove the iframe.
     */
    onLoad(iframe: HTMLIFrameElement, cancel: () => void): void;
}

export interface WithWorldpayAccessPaymentInitializeOptions {
    /**
     * The options that are required to initialize the Apple Pay payment
     * method. They can be omitted unless you need to support Apple Pay.
     */
    worldpay?: WorldpayAccessPaymentInitializeOptions;
}
