import { FormPoster } from '@bigcommerce/form-poster';
import { noop } from 'lodash';

import {
    BraintreeError,
    BraintreeSdk,
    BraintreeTokenizePayload,
    BraintreeVenmoCheckout,
    mapToLegacyBillingAddress,
    mapToLegacyShippingAddress,
    PaypalButtonStyleColorOption,
    PaypalStyleOptions,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    BuyNowCartCreationError,
    BuyNowCartRequestBody,
    Cart,
    CheckoutButtonInitializeOptions,
    CheckoutButtonStrategy,
    DefaultCheckoutButtonHeight,
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    PaymentIntegrationService,
    PaymentMethod,
    UnsupportedBrowserError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import isBraintreeError from '../is-braintree-error';
import { isUnsupportedBrowserError } from '../isUnsupportedBrowserError';

import { WithBraintreeVenmoInitializeOptions } from './braintree-venmo-initialize-options';

const getVenmoButtonStyle = (styles: PaypalStyleOptions): Record<string, string> => {
    const { color, height } = styles;

    const colorParser = (c: string) => {
        if (c === PaypalButtonStyleColorOption.WHITE) {
            return '#FFFFFF';
        }

        return '#3D95CE';
    };

    return {
        backgroundColor: colorParser(color || ''),
        backgroundPosition: '50% 50%',
        backgroundSize: '80px auto',
        backgroundImage: `url("/app/assets/img/payment-providers/venmo-logo-${
            color === PaypalButtonStyleColorOption.WHITE
                ? PaypalButtonStyleColorOption.BLUE
                : PaypalButtonStyleColorOption.WHITE
        }.svg")`,
        backgroundRepeat: 'no-repeat',
        borderRadius: '4px',
        cursor: 'pointer',
        transition: '0.2s ease',
        minHeight: `${height || DefaultCheckoutButtonHeight}px`,
        minWidth: '150px',
        height: '100%',
        width: '100%',
        border: color === PaypalButtonStyleColorOption.WHITE ? '1px solid black' : 'none',
    };
};

const venmoButtonStyleHover = {
    backgroundColor: '#0a7fc2',
};

interface BuyNowInitializeOptions {
    getBuyNowCartRequestBody?(): BuyNowCartRequestBody | void;
}

export default class BraintreeVenmoButtonStrategy implements CheckoutButtonStrategy {
    private onError = noop;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private formPoster: FormPoster,
        private braintreeSdk: BraintreeSdk,
    ) {}

    async initialize(
        options: CheckoutButtonInitializeOptions & WithBraintreeVenmoInitializeOptions,
    ): Promise<void> {
        const { braintreevenmo, containerId, methodId } = options;

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.methodId" argument is not provided.',
            );
        }

        const state = this.paymentIntegrationService.getState();
        const paymentMethod = state.getPaymentMethodOrThrow(methodId);
        const { clientToken, initializationData }: PaymentMethod = paymentMethod;
        const { paymentButtonStyles } = initializationData;
        const { cartButtonStyles } = paymentButtonStyles || {};
        const styles = braintreevenmo?.style || cartButtonStyles;

        if (!clientToken || !initializationData) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        if (!containerId) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.containerId" argument is not provided.`,
            );
        }

        this.onError = braintreevenmo?.onError || this.handleError;
        this.braintreeSdk.initialize(clientToken);

        try {
            const braintreeVenmoCheckout = await this.braintreeSdk.getVenmoCheckoutOrThrow();

            this.renderVenmoButton(
                braintreeVenmoCheckout,
                containerId,
                braintreevenmo?.buyNowInitializeOptions,
                styles,
            );
        } catch (error) {
            if (isBraintreeError(error) || isUnsupportedBrowserError(error)) {
                this.handleInitializationVenmoError(error, containerId);
            }
        }
    }

    async deinitialize(): Promise<void> {
        await this.braintreeSdk.deinitialize();

        return Promise.resolve();
    }

    private handleError(error: BraintreeError) {
        throw new Error(error.message);
    }

    private async createBuyNowCart(
        buyNowInitializeOptions?: BuyNowInitializeOptions,
    ): Promise<Cart | undefined> {
        if (typeof buyNowInitializeOptions?.getBuyNowCartRequestBody === 'function') {
            const cartRequestBody = buyNowInitializeOptions?.getBuyNowCartRequestBody();

            if (!cartRequestBody) {
                throw new MissingDataError(MissingDataErrorType.MissingCart);
            }

            try {
                const buyNowCart = await this.paymentIntegrationService.createBuyNowCart(
                    cartRequestBody,
                );

                return buyNowCart;
            } catch (error) {
                throw new BuyNowCartCreationError();
            }
        }

        return undefined;
    }

    private handleInitializationVenmoError(
        error: BraintreeError | UnsupportedBrowserError,
        containerId: string,
    ): void {
        this.removeVenmoContainer(containerId);

        return this.onError(error);
    }

    private removeVenmoContainer(containerId: string): void {
        const buttonContainer = document.getElementById(containerId);

        if (buttonContainer) {
            buttonContainer.remove();
        }
    }

    private renderVenmoButton(
        braintreeVenmoCheckout: BraintreeVenmoCheckout,
        containerId: string,
        buyNowInitializeOptions?: BuyNowInitializeOptions,
        buttonStyles?: PaypalStyleOptions,
    ): void {
        const venmoButton = document.getElementById(containerId);
        const { color } = buttonStyles || {};

        if (!venmoButton) {
            throw new InvalidArgumentError(
                'Unable to create wallet button without valid container ID.',
            );
        }

        venmoButton.setAttribute('aria-label', 'Venmo');
        Object.assign(venmoButton.style, getVenmoButtonStyle(buttonStyles || {}));

        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        venmoButton.addEventListener('click', async () => {
            venmoButton.setAttribute('disabled', 'true');

            const buyBowCart = await this.createBuyNowCart(buyNowInitializeOptions);

            if (braintreeVenmoCheckout.tokenize) {
                braintreeVenmoCheckout.tokenize(
                    async (
                        error: BraintreeError | undefined,
                        payload: BraintreeTokenizePayload,
                    ) => {
                        venmoButton.removeAttribute('disabled');

                        if (error) {
                            this.onError(error);
                        }

                        await this.handlePostForm(payload, buyBowCart?.id);
                    },
                );
            }
        });

        if (color === PaypalButtonStyleColorOption.BLUE) {
            venmoButton.addEventListener('mouseenter', () => {
                venmoButton.style.backgroundColor = venmoButtonStyleHover.backgroundColor;
            });

            venmoButton.addEventListener('mouseleave', () => {
                venmoButton.style.backgroundColor = getVenmoButtonStyle(
                    buttonStyles || {},
                ).backgroundColor;
            });
        }
    }

    private async handlePostForm(
        payload: BraintreeTokenizePayload,
        buyNowCartId?: string,
    ): Promise<void> {
        const { deviceData } = await this.braintreeSdk.getDataCollectorOrThrow();
        const { nonce, details } = payload;

        this.formPoster.postForm('/checkout.php', {
            nonce,
            provider: 'braintreevenmo',
            payment_type: 'paypal',
            device_data: deviceData,
            action: 'set_external_checkout',
            billing_address: JSON.stringify(mapToLegacyBillingAddress(details)),
            shipping_address: JSON.stringify(mapToLegacyShippingAddress(details)),
            ...(buyNowCartId && { cart_id: buyNowCartId }),
        });
    }
}
