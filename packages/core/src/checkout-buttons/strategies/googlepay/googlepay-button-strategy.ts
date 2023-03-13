import { FormPoster } from '@bigcommerce/form-poster';

import {
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    NotInitializedError,
    NotInitializedErrorType,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { CheckoutButtonMethodType } from '../';
import { Cart, CartRequestSender } from '../../../cart';
import { BuyNowCartCreationError } from '../../../cart/errors';
import { CheckoutActionCreator, CheckoutStore } from '../../../checkout';
import { SDK_VERSION_HEADERS } from '../../../common/http-request';
import { bindDecorator as bind } from '../../../common/utility';
import { GooglePayPaymentProcessor } from '../../../payment/strategies/googlepay';
import { getShippableItemsCount } from '../../../shipping';
import { CheckoutButtonInitializeOptions } from '../../checkout-button-options';
import CheckoutButtonStrategy from '../checkout-button-strategy';

import { GooglePayButtonInitializeOptions } from './googlepay-button-options';

type BuyNowInitializeOptions = Pick<GooglePayButtonInitializeOptions, 'buyNowInitializeOptions'>;

export default class GooglePayButtonStrategy implements CheckoutButtonStrategy {
    private _methodId?: string;
    private _walletButton?: HTMLElement;
    private _buyNowCart?: Cart;

    constructor(
        private _store: CheckoutStore,
        private _formPoster: FormPoster,
        private _checkoutActionCreator: CheckoutActionCreator,
        private _googlePayPaymentProcessor: GooglePayPaymentProcessor,
        private _cartRequestSender: CartRequestSender,
    ) {}

    async initialize(options: CheckoutButtonInitializeOptions): Promise<void> {
        const { containerId, methodId, currencyCode } = options;

        const googlePayOptions = this._getGooglePayOptions(options);

        if (!containerId || !methodId) {
            throw new InvalidArgumentError(
                'Unable to proceed because "containerId" argument is not provided.',
            );
        }

        this._methodId = methodId;

        const hasBuyNowCartOptions = Boolean(googlePayOptions?.buyNowInitializeOptions);

        if (hasBuyNowCartOptions) {
            if (!currencyCode) {
                throw new InvalidArgumentError(
                    `Unable to initialize payment because "options.currencyCode" argument is not provided.`,
                );
            }
        } else {
            await this._store.dispatch(this._checkoutActionCreator.loadDefaultCheckout());
        }

        this._googlePayPaymentProcessor.updateBuyNowFlowFlag(hasBuyNowCartOptions);
        await this._googlePayPaymentProcessor.initialize(this._getMethodId());

        this._walletButton = this._createSignInButton(containerId, googlePayOptions, currencyCode);
    }

    deinitialize(): Promise<void> {
        if (this._walletButton && this._walletButton.parentNode) {
            this._walletButton.parentNode.removeChild(this._walletButton);
            this._walletButton = undefined;
        }

        return this._googlePayPaymentProcessor.deinitialize();
    }

    private _createSignInButton(
        containerId: string,
        buttonOptions: GooglePayButtonInitializeOptions,
        currencyCode?: string,
    ): HTMLElement {
        const container = document.getElementById(containerId);
        const { buttonType, buttonColor, buyNowInitializeOptions } = buttonOptions;

        if (!container) {
            throw new InvalidArgumentError(
                'Unable to create sign-in button without valid container ID.',
            );
        }

        const handleValidButtonClick = (event: Event) =>
            this._handleWalletButtonClick(event, { buyNowInitializeOptions }, currencyCode);

        const googlePayButton = this._googlePayPaymentProcessor.createButton(
            handleValidButtonClick,
            buttonType,
            buttonColor,
        );

        container.appendChild(googlePayButton);

        return googlePayButton;
    }

    private _getMethodId(): string {
        if (!this._methodId) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this._methodId;
    }

    private _getGooglePayOptions(
        options: CheckoutButtonInitializeOptions,
    ): GooglePayButtonInitializeOptions {
        if (
            options.methodId === CheckoutButtonMethodType.GOOGLEPAY_ADYENV2 &&
            options.googlepayadyenv2
        ) {
            return options.googlepayadyenv2;
        }

        if (
            options.methodId === CheckoutButtonMethodType.GOOGLEPAY_ADYENV3 &&
            options.googlepayadyenv3
        ) {
            return options.googlepayadyenv3;
        }

        if (
            options.methodId === CheckoutButtonMethodType.GOOGLEPAY_AUTHORIZENET &&
            options.googlepayauthorizenet
        ) {
            return options.googlepayauthorizenet;
        }

        if (options.methodId === CheckoutButtonMethodType.GOOGLEPAY_BNZ && options.googlepaybnz) {
            return options.googlepaybnz;
        }

        if (
            options.methodId === CheckoutButtonMethodType.GOOGLEPAY_BRAINTREE &&
            options.googlepaybraintree
        ) {
            return options.googlepaybraintree;
        }

        if (
            options.methodId === CheckoutButtonMethodType.GOOGLEPAY_CHECKOUTCOM &&
            options.googlepaycheckoutcom
        ) {
            return options.googlepaycheckoutcom;
        }

        if (
            options.methodId === CheckoutButtonMethodType.GOOGLEPAY_CYBERSOURCEV2 &&
            options.googlepaycybersourcev2
        ) {
            return options.googlepaycybersourcev2;
        }

        if (
            options.methodId === CheckoutButtonMethodType.GOOGLEPAY_ORBITAL &&
            options.googlepayorbital
        ) {
            return options.googlepayorbital;
        }

        if (
            options.methodId === CheckoutButtonMethodType.GOOGLEPAY_STRIPE &&
            options.googlepaystripe
        ) {
            return options.googlepaystripe;
        }

        if (
            options.methodId === CheckoutButtonMethodType.GOOGLEPAY_STRIPEUPE &&
            options.googlepaystripeupe
        ) {
            return options.googlepaystripeupe;
        }

        if (
            options.methodId === CheckoutButtonMethodType.GOOGLEPAY_WORLDPAYACCESS &&
            options.googlepayworldpayaccess
        ) {
            return options.googlepayworldpayaccess;
        }

        throw new InvalidArgumentError();
    }

    private async _createBuyNowCart({ buyNowInitializeOptions }: BuyNowInitializeOptions) {
        if (typeof buyNowInitializeOptions?.getBuyNowCartRequestBody === 'function') {
            const cartRequestBody = buyNowInitializeOptions.getBuyNowCartRequestBody();

            if (!cartRequestBody) {
                throw new MissingDataError(MissingDataErrorType.MissingCart);
            }

            try {
                const { body: cart } = await this._cartRequestSender.createBuyNowCart(
                    cartRequestBody,
                );

                return cart;
            } catch (error) {
                throw new BuyNowCartCreationError();
            }
        }
    }

    @bind
    private async _handleWalletButtonClick(
        event: Event,
        { buyNowInitializeOptions }: BuyNowInitializeOptions,
        currencyCode?: string,
    ): Promise<void> {
        event.preventDefault();

        this._buyNowCart = await this._createBuyNowCart({ buyNowInitializeOptions });

        const cart = this._buyNowCart || this._store.getState().cart.getCartOrThrow();
        const hasPhysicalItems = getShippableItemsCount(cart) > 0;

        if (this._buyNowCart && currencyCode) {
            const payloadToUpdate = {
                currencyCode,
                totalPrice: String(cart.cartAmount),
            };

            this._googlePayPaymentProcessor.updatePaymentDataRequest(payloadToUpdate);

            await this._store.dispatch(
                this._checkoutActionCreator.loadCheckout(this._buyNowCart.id),
            );
        }

        try {
            const paymentData = await this._googlePayPaymentProcessor.displayWallet();

            await this._googlePayPaymentProcessor.handleSuccess(paymentData);

            if (hasPhysicalItems && paymentData.shippingAddress) {
                await this._googlePayPaymentProcessor.updateShippingAddress(
                    paymentData.shippingAddress,
                );
            }

            await this._onPaymentSelectComplete();
        } catch (error) {
            if (error && error.message !== 'CANCELED') {
                throw error;
            }
        }
    }

    private _onPaymentSelectComplete(): void {
        const buyNowCartId = this._buyNowCart?.id;

        this._formPoster.postForm('/checkout.php', {
            headers: {
                Accept: 'text/html',
                'Content-Type': 'application/x-www-form-urlencoded',
                ...SDK_VERSION_HEADERS,
            },
            ...(buyNowCartId && {
                action: 'set_external_checkout',
                provider: this._methodId,
                cart_id: buyNowCartId,
            }),
        });
    }
}
