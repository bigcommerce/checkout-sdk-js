import {
    PaymentMethodClientUnavailableError,
    StandardError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { WalletButtonIntegrationService } from '@bigcommerce/checkout-sdk/wallet-button-integration';

import BraintreePaypalWalletError from './braintree-paypal-wallet-error';

import {
    BraintreeError,
    BraintreeIntegrationService,
    BraintreePaypalCheckout,
    BraintreePaypalSdkCreatorConfig,
    BraintreeTokenizePayload,
    isBraintreeError,
    PaypalAuthorizeData,
} from './';

export default class BraintreePaypalWalletService {
    private braintreePaypalCheckout?: BraintreePaypalCheckout;

    constructor(
        private walletButtonIntegrationService: WalletButtonIntegrationService,
        private braintreeIntegrationService: BraintreeIntegrationService,
    ) {}

    /**
     *
     * Braintree SDK methods
     *
     */
    initialize(clientToken: string): void {
        this.braintreeIntegrationService.initialize(clientToken);
    }

    async loadPaypalCheckout(
        options: BraintreePaypalSdkCreatorConfig,
        containerId: string,
        onError?: (error: BraintreeError | StandardError) => void,
    ): Promise<BraintreePaypalCheckout> {
        this.braintreePaypalCheckout = await new Promise<BraintreePaypalCheckout>(
            (resolve, reject) => {
                void this.braintreeIntegrationService.getPaypalCheckout(
                    options,
                    resolve,
                    (error: BraintreeError) => {
                        this.removeElement(containerId);

                        if (onError && isBraintreeError(error)) {
                            onError(error);
                        }

                        reject(error);
                    },
                );
            },
        );

        return this.braintreePaypalCheckout!;
    }

    getBraintreePaypalCheckoutOrThrow(): BraintreePaypalCheckout {
        if (!this.braintreePaypalCheckout) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this.braintreePaypalCheckout;
    }

    async teardown(): Promise<void> {
        await this.braintreeIntegrationService.teardown();
    }

    /**
     *
     * Payment tokenizing and redirect methods
     *
     */
    async proxyTokenizationPayment(
        authorizeData: PaypalAuthorizeData,
        methodId: string,
        cartId: string,
    ): Promise<BraintreeTokenizePayload> {
        const braintreePaypalCheckout = this.getBraintreePaypalCheckoutOrThrow();

        const { deviceData } = await this.braintreeIntegrationService.getDataCollector({
            paypal: true,
        });

        const tokenizePayload = await braintreePaypalCheckout.tokenizePayment(authorizeData);
        const { details, nonce } = tokenizePayload;

        const billingAddress = this.braintreeIntegrationService.mapToLegacyBillingAddress(details);
        const shippingAddress =
            this.braintreeIntegrationService.mapToLegacyShippingAddress(details);

        const inputData = {
            paymentWalletData: {
                providerId: methodId,
                providerOrderId: nonce,
            },
            cartEntityId: cartId,
            queryParams: [
                { key: 'payment_type', value: 'paypal' },
                { key: 'action', value: 'set_external_checkout' },
                { key: 'provider', value: methodId },
                {
                    key: 'billing_address',
                    value: encodeURIComponent(JSON.stringify(billingAddress)),
                },
                {
                    key: 'shipping_address',
                    value: encodeURIComponent(JSON.stringify(shippingAddress)),
                },
                ...(deviceData ? [{ key: 'device_data', value: deviceData }] : []),
            ],
        };

        const response = await this.walletButtonIntegrationService.getRedirectToCheckoutUrl(
            inputData,
        );

        const externalCheckoutUrl = response.body.redirectUrls?.externalCheckoutUrl;

        if (!externalCheckoutUrl) {
            throw new BraintreePaypalWalletError();
        }

        window.location.assign(externalCheckoutUrl);

        return tokenizePayload;
    }

    /**
     *
     * Utils methods
     *
     */
    removeElement(containerId?: string): void {
        this.braintreeIntegrationService.removeElement(containerId);
    }
}
