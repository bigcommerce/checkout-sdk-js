import { PaymentMethodClientUnavailableError } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { WalletButtonIntegrationService } from '@bigcommerce/checkout-sdk/wallet-button-integration';

import BraintreePaypalWalletError from './braintree-paypal-wallet-error';

import {
    BraintreeError,
    BraintreeIntegrationService,
    BraintreeTokenizePayload,
    BraintreeVenmoCheckout,
} from './';

export default class BraintreeVenmoWalletService {
    private braintreeVenmoCheckout?: BraintreeVenmoCheckout;

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

    async loadVenmoCheckout(containerId: string): Promise<BraintreeVenmoCheckout> {
        try {
            this.braintreeVenmoCheckout = await this.braintreeIntegrationService.getVenmoCheckout();
        } catch (error) {
            this.removeElement(containerId);

            throw error;
        }

        return this.braintreeVenmoCheckout;
    }

    getBraintreeVenmoCheckoutOrThrow(): BraintreeVenmoCheckout {
        if (!this.braintreeVenmoCheckout) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this.braintreeVenmoCheckout;
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
        methodId: string,
        cartId: string,
    ): Promise<BraintreeTokenizePayload> {
        const tokenizePayload = await this.tokenizeVenmo();

        const { deviceData } = await this.braintreeIntegrationService.getDataCollector({
            paypal: true,
        });

        const { details, nonce } = tokenizePayload;

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

    private tokenizeVenmo(): Promise<BraintreeTokenizePayload> {
        const braintreeVenmoCheckout = this.getBraintreeVenmoCheckoutOrThrow();

        return new Promise<BraintreeTokenizePayload>((resolve, reject) => {
            braintreeVenmoCheckout.tokenize(
                (error: BraintreeError | undefined, payload: BraintreeTokenizePayload) => {
                    if (error) {
                        return reject(error);
                    }

                    resolve(payload);
                },
            );
        });
    }
}
