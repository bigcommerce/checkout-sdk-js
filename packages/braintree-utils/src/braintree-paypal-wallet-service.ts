import {
    PaymentMethodClientUnavailableError,
    StandardError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    AddressRequestBody,
    WalletButtonIntegrationService,
} from '@bigcommerce/checkout-sdk/wallet-button-integration';

import BraintreePaypalWalletError from './braintree-paypal-wallet-error';

import {
    BraintreeError,
    BraintreeIntegrationService,
    BraintreePaypalCheckout,
    BraintreePaypalSdkCreatorConfig,
    BraintreeTokenizationDetails,
    BraintreeTokenizePayload,
    BraintreeVenmoCheckout,
    isBraintreeError,
    PaypalAuthorizeData,
} from './';

export default class BraintreePaypalWalletService {
    private braintreePaypalCheckout?: BraintreePaypalCheckout;
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

    async loadVenmoCheckout(containerId: string): Promise<BraintreeVenmoCheckout> {
        try {
            this.braintreeVenmoCheckout = await this.braintreeIntegrationService.getVenmoCheckout();
        } catch (error) {
            this.removeElement(containerId);

            throw error;
        }

        return this.braintreeVenmoCheckout;
    }

    getBraintreePaypalCheckoutOrThrow(): BraintreePaypalCheckout {
        if (!this.braintreePaypalCheckout) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this.braintreePaypalCheckout;
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
        authorizeData: PaypalAuthorizeData,
        methodId: string,
        cartId: string,
    ): Promise<BraintreeTokenizePayload> {
        const braintreePaypalCheckout = this.getBraintreePaypalCheckoutOrThrow();

        const tokenizePayload = await braintreePaypalCheckout.tokenizePayment(authorizeData);

        return this.redirectToExternalCheckout(tokenizePayload, methodId, cartId);
    }

    async proxyVenmoTokenizationPayment(
        methodId: string,
        cartId: string,
    ): Promise<BraintreeTokenizePayload> {
        const tokenizePayload = await this.tokenizeVenmo();

        return this.redirectToExternalCheckout(tokenizePayload, methodId, cartId);
    }

    /**
     *
     * Utils methods
     *
     */
    removeElement(containerId?: string): void {
        this.braintreeIntegrationService.removeElement(containerId);
    }

    private async redirectToExternalCheckout(
        tokenizePayload: BraintreeTokenizePayload,
        methodId: string,
        cartId: string,
    ): Promise<BraintreeTokenizePayload> {
        const { deviceData } = await this.braintreeIntegrationService.getDataCollector({
            paypal: true,
        });

        const { details, nonce } = tokenizePayload;

        const shippingAddress =
            this.braintreeIntegrationService.mapToLegacyShippingAddress(details);

        await this.walletButtonIntegrationService.addBillingAddress(
            cartId,
            this.mapToBillingAddress(details),
        );

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
                { key: 'nonce', value: nonce },
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

    private mapToBillingAddress(details: BraintreeTokenizationDetails): AddressRequestBody {
        const { billingAddress, email, firstName, lastName, phone, shippingAddress } = details;

        const address = billingAddress || shippingAddress;

        return {
            firstName: firstName || '',
            lastName: lastName || '',
            company: '',
            address1: address?.line1 || '',
            address2: address?.line2 || '',
            city: address?.city || '',
            email: email || '',
            stateOrProvince: address?.state || '',
            stateOrProvinceCode: address?.state || '',
            countryCode: address?.countryCode || '',
            postalCode: address?.postalCode || '',
            phone: phone || '',
            shouldSaveAddress: false,
        };
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
