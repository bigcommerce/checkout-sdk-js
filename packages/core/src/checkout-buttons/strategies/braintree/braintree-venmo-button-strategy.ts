import { FormPoster } from '@bigcommerce/form-poster';
import { noop } from 'lodash';

import { DefaultCheckoutButtonHeight } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { BuyNowCartRequestBody, CartRequestSender } from '../../../cart';
import { BuyNowCartCreationError } from '../../../cart/errors';
import { CheckoutStore } from '../../../checkout';
import {
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    UnsupportedBrowserError,
} from '../../../common/error/errors';
import { PaymentMethodActionCreator } from '../../../payment';
import {
    BraintreeError,
    BraintreeSDKCreator,
    BraintreeTokenizePayload,
    BraintreeVenmoCheckout,
} from '../../../payment/strategies/braintree';
import {
    PaypalButtonStyleColorOption,
    PaypalStyleOptions,
} from '../../../payment/strategies/paypal';
import { CheckoutButtonInitializeOptions } from '../../checkout-button-options';
import CheckoutButtonStrategy from '../checkout-button-strategy';
import { CheckoutButtonMethodType } from '../index';

import mapToLegacyBillingAddress from './map-to-legacy-billing-address';
import mapToLegacyShippingAddress from './map-to-legacy-shipping-address';

const getVenmoButtonStyle = (styles: PaypalStyleOptions): Record<string, string> => {
    const { color } = styles;

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
        minHeight: `${DefaultCheckoutButtonHeight}px`,
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
    private _onError = noop;

    constructor(
        private _store: CheckoutStore,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _cartRequestSender: CartRequestSender,
        private _braintreeSDKCreator: BraintreeSDKCreator,
        private _formPoster: FormPoster,
    ) {}

    async initialize(options: CheckoutButtonInitializeOptions): Promise<void> {
        const { braintreevenmo, containerId, methodId } = options;

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.methodId" argument is not provided.',
            );
        }

        const state = await this._store.dispatch(
            this._paymentMethodActionCreator.loadPaymentMethod(methodId),
        );
        // Info: does not use getStoreConfigOrThrow, because storeConfig is not available if
        // cart is empty, so it causes issues on Product Details Page
        const storeConfig = state.config.getStoreConfig();
        const paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(methodId);
        const { clientToken, initializationData } = paymentMethod;
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

        this._onError = braintreevenmo?.onError || this._handleError;

        this._braintreeSDKCreator.initialize(clientToken, storeConfig);
        await this._braintreeSDKCreator.getVenmoCheckout(
            (braintreeVenmoCheckout) =>
                this._handleInitializationVenmoSuccess(
                    braintreeVenmoCheckout,
                    containerId,
                    braintreevenmo?.buyNowInitializeOptions,
                    styles,
                ),
            (error) => this._handleInitializationVenmoError(error, containerId),
        );
    }

    deinitialize(): Promise<void> {
        this._braintreeSDKCreator.teardown();

        return Promise.resolve();
    }

    private _handleError(error: BraintreeError) {
        throw new Error(error.message);
    }

    private _handleInitializationVenmoSuccess(
        braintreeVenmoCheckout: BraintreeVenmoCheckout,
        parentContainerId: string,
        buyNowInitializeOptions?: BuyNowInitializeOptions,
        buttonsStyles?: PaypalStyleOptions,
    ): void {
        return this._renderVenmoButton(
            braintreeVenmoCheckout,
            parentContainerId,
            buyNowInitializeOptions,
            buttonsStyles,
        );
    }

    private _handleInitializationVenmoError(
        error: BraintreeError | UnsupportedBrowserError,
        containerId: string,
    ): void {
        this._removeVenmoContainer(containerId);

        return this._onError(error);
    }

    private _removeVenmoContainer(containerId: string): void {
        const buttonContainer = document.getElementById(containerId);

        if (buttonContainer) {
            buttonContainer.remove();
        }
    }

    private _renderVenmoButton(
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

        venmoButton.addEventListener('click', async () => {
            venmoButton.setAttribute('disabled', 'true');

            const buyBowCart = await this._createBuyNowCart(buyNowInitializeOptions);

            if (braintreeVenmoCheckout.tokenize) {
                braintreeVenmoCheckout.tokenize(
                    async (
                        error: BraintreeError | undefined,
                        payload: BraintreeTokenizePayload,
                    ) => {
                        venmoButton.removeAttribute('disabled');

                        if (error) {
                            return this._onError(error);
                        }

                        await this._handlePostForm(payload, buyBowCart?.id);
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

    private async _createBuyNowCart(buyNowInitializeOptions?: BuyNowInitializeOptions) {
        if (typeof buyNowInitializeOptions?.getBuyNowCartRequestBody === 'function') {
            const cartRequestBody = buyNowInitializeOptions.getBuyNowCartRequestBody();

            if (!cartRequestBody) {
                throw new MissingDataError(MissingDataErrorType.MissingCart);
            }

            try {
                const { body: buyNowCart } = await this._cartRequestSender.createBuyNowCart(
                    cartRequestBody,
                );

                return buyNowCart;
            } catch (error) {
                throw new BuyNowCartCreationError();
            }
        }
    }

    private async _handlePostForm(
        payload: BraintreeTokenizePayload,
        buyNowCartId?: string,
    ): Promise<void> {
        const { deviceData } = await this._braintreeSDKCreator.getDataCollector();
        const { nonce, details } = payload;

        this._formPoster.postForm('/checkout.php', {
            nonce,
            provider: CheckoutButtonMethodType.BRAINTREE_VENMO,
            payment_type: 'paypal',
            device_data: deviceData,
            action: 'set_external_checkout',
            billing_address: JSON.stringify(mapToLegacyBillingAddress(details)),
            shipping_address: JSON.stringify(mapToLegacyShippingAddress(details)),
            ...(buyNowCartId && { cart_id: buyNowCartId }),
        });
    }
}
