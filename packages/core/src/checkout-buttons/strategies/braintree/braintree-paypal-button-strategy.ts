import { FormPoster } from '@bigcommerce/form-poster';

import { Cart, CartRequestSender } from '../../../cart';
import { BuyNowCartCreationError } from '../../../cart/errors';
import { CheckoutActionCreator, CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import {
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    StandardError,
} from '../../../common/error/errors';
import PaymentMethod from '../../../payment/payment-method';
import {
    BraintreeError,
    BraintreePaypalCheckout,
    BraintreePaypalSdkCreatorConfig,
    BraintreeSDKCreator,
    BraintreeTokenizePayload,
    mapToBraintreeShippingAddressOverride,
} from '../../../payment/strategies/braintree';
import { PaypalAuthorizeData, PaypalHostWindow } from '../../../payment/strategies/paypal';
import { CheckoutButtonInitializeOptions } from '../../checkout-button-options';
import CheckoutButtonStrategy from '../checkout-button-strategy';

import { BraintreePaypalButtonInitializeOptions } from './braintree-paypal-button-options';
import getValidButtonStyle from './get-valid-button-style';
import mapToLegacyBillingAddress from './map-to-legacy-billing-address';
import mapToLegacyShippingAddress from './map-to-legacy-shipping-address';

type BuyNowInitializeOptions = Pick<
    BraintreePaypalButtonInitializeOptions,
    'buyNowInitializeOptions'
>;

export default class BraintreePaypalButtonStrategy implements CheckoutButtonStrategy {
    private _buyNowCart?: Cart;

    constructor(
        private _store: CheckoutStore,
        private _checkoutActionCreator: CheckoutActionCreator,
        private _cartRequestSender: CartRequestSender,
        private _braintreeSDKCreator: BraintreeSDKCreator,
        private _formPoster: FormPoster,
        private _window: PaypalHostWindow,
    ) {}

    async initialize(options: CheckoutButtonInitializeOptions): Promise<void> {
        const { braintreepaypal, containerId, methodId } = options;
        const { messagingContainerId, onError } = braintreepaypal || {};

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.methodId" argument is not provided.',
            );
        }

        if (!containerId) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.containerId" argument is not provided.`,
            );
        }

        if (!braintreepaypal) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.braintreepaypal" argument is not provided.`,
            );
        }

        let state: InternalCheckoutSelectors;
        let paymentMethod: PaymentMethod;
        let currencyCode: string;

        if (braintreepaypal.buyNowInitializeOptions) {
            state = this._store.getState();
            paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(methodId);

            if (!braintreepaypal.currencyCode) {
                throw new InvalidArgumentError(
                    `Unable to initialize payment because "options.braintreepaypal.currencyCode" argument is not provided.`,
                );
            }

            currencyCode = braintreepaypal.currencyCode;
        } else {
            state = await this._store.dispatch(this._checkoutActionCreator.loadDefaultCheckout());
            paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(methodId);
            currencyCode = state.cart.getCartOrThrow().currency.code;
        }

        const { clientToken, initializationData } = paymentMethod;

        if (!clientToken || !initializationData) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const paypalCheckoutOptions: Partial<BraintreePaypalSdkCreatorConfig> = {
            currency: currencyCode,
            intent: initializationData.intent,
            isCreditEnabled: initializationData.isCreditEnabled,
        };

        const paypalCheckoutSuccessCallback = (
            braintreePaypalCheckout: BraintreePaypalCheckout,
        ) => {
            this._renderPayPalComponents(
                braintreePaypalCheckout,
                braintreepaypal,
                containerId,
                methodId,
                Boolean(paymentMethod.config.testMode),
            );
        };
        const paypalCheckoutErrorCallback = (error: BraintreeError) =>
            this._handleError(error, containerId, messagingContainerId, onError);

        this._braintreeSDKCreator.initialize(clientToken, initializationData);
        await this._braintreeSDKCreator.getPaypalCheckout(
            paypalCheckoutOptions,
            paypalCheckoutSuccessCallback,
            paypalCheckoutErrorCallback,
        );
    }

    deinitialize(): Promise<void> {
        this._braintreeSDKCreator.teardown();

        return Promise.resolve();
    }

    private _renderPayPalComponents(
        braintreePaypalCheckout: BraintreePaypalCheckout,
        braintreepaypal: BraintreePaypalButtonInitializeOptions,
        containerId: string,
        methodId: string,
        testMode: boolean,
    ): void {
        const { messagingContainerId } = braintreepaypal;

        this._renderPayPalMessages(messagingContainerId);
        this._renderPayPalButton(
            braintreePaypalCheckout,
            braintreepaypal,
            containerId,
            methodId,
            testMode,
        );
    }

    private _renderPayPalButton(
        braintreePaypalCheckout: BraintreePaypalCheckout,
        braintreepaypal: BraintreePaypalButtonInitializeOptions,
        containerId: string,
        methodId: string,
        testMode: boolean,
    ): void {
        const { style, shouldProcessPayment, onAuthorizeError } = braintreepaypal;

        const { paypal } = this._window;
        const fundingSource = paypal?.FUNDING.PAYPAL;

        if (paypal && fundingSource) {
            const validButtonStyle = style ? getValidButtonStyle(style) : {};

            const paypalButtonRender = paypal.Buttons({
                env: testMode ? 'sandbox' : 'production',
                commit: false,
                fundingSource,
                style: validButtonStyle,
                createOrder: () =>
                    this._setupPayment(braintreePaypalCheckout, braintreepaypal, methodId),
                onApprove: (authorizeData: PaypalAuthorizeData) =>
                    this._tokenizePayment(
                        authorizeData,
                        braintreePaypalCheckout,
                        methodId,
                        shouldProcessPayment,
                        onAuthorizeError,
                    ),
            });

            if (paypalButtonRender.isEligible()) {
                paypalButtonRender.render(`#${containerId}`);
            }
        } else {
            this._removeElement(containerId);
        }
    }

    private _renderPayPalMessages(messagingContainerId?: string): void {
        const isMessageContainerAvailable =
            messagingContainerId && Boolean(document.getElementById(messagingContainerId));
        const { paypal } = this._window;

        if (paypal && isMessageContainerAvailable) {
            const state = this._store.getState();
            const cart = state.cart.getCartOrThrow();

            const paypalMessagesRender = paypal.Messages({
                amount: cart.cartAmount,
                placement: 'cart',
            });

            paypalMessagesRender.render(`#${messagingContainerId}`);
        } else {
            this._removeElement(messagingContainerId);
        }
    }

    private async _setupPayment(
        braintreePaypalCheckout: BraintreePaypalCheckout,
        braintreepaypal: BraintreePaypalButtonInitializeOptions,
        methodId: string,
    ): Promise<string> {
        const { buyNowInitializeOptions, shippingAddress, onPaymentError } = braintreepaypal;
        let state: InternalCheckoutSelectors;

        try {
            this._buyNowCart = await this._createBuyNowCart({ buyNowInitializeOptions });

            if (this._buyNowCart) {
                state = this._store.getState();
            } else {
                state = await this._store.dispatch(
                    this._checkoutActionCreator.loadDefaultCheckout(),
                );
            }

            const customer = state.customer.getCustomer();
            const paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(methodId);

            const amount = this._buyNowCart
                ? this._buyNowCart.cartAmount
                : state.checkout.getCheckoutOrThrow().outstandingBalance;
            const currencyCode =
                braintreepaypal.currencyCode ?? state.config.getStoreConfigOrThrow().currency.code;

            const address = shippingAddress || customer?.addresses[0];
            const shippingAddressOverride = address
                ? mapToBraintreeShippingAddressOverride(address)
                : undefined;

            return await braintreePaypalCheckout.createPayment({
                flow: 'checkout',
                enableShippingAddress: true,
                shippingAddressEditable: false,
                shippingAddressOverride,
                amount,
                currency: currencyCode,
                offerCredit: false,
                intent: paymentMethod.initializationData?.intent,
            });
        } catch (error) {
            if (onPaymentError) {
                onPaymentError(error);
            }

            throw error;
        }
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

    private async _tokenizePayment(
        authorizeData: PaypalAuthorizeData,
        braintreePaypalCheckout: BraintreePaypalCheckout,
        methodId: string,
        shouldProcessPayment?: boolean,
        onError?: (error: BraintreeError | StandardError) => void,
    ): Promise<BraintreeTokenizePayload> {
        try {
            const { deviceData } = await this._braintreeSDKCreator.getDataCollector({
                paypal: true,
            });
            const tokenizePayload = await braintreePaypalCheckout.tokenizePayment(authorizeData);
            const { details, nonce } = tokenizePayload;
            const buyNowCartId = this._buyNowCart?.id;

            this._formPoster.postForm('/checkout.php', {
                payment_type: 'paypal',
                provider: methodId,
                action: shouldProcessPayment ? 'process_payment' : 'set_external_checkout',
                nonce,
                device_data: deviceData,
                billing_address: JSON.stringify(mapToLegacyBillingAddress(details)),
                shipping_address: JSON.stringify(mapToLegacyShippingAddress(details)),
                ...(buyNowCartId && { cart_id: buyNowCartId }),
            });

            return tokenizePayload;
        } catch (error) {
            if (onError) {
                onError(error);
            }

            throw error;
        }
    }

    private _handleError(
        error: BraintreeError,
        buttonContainerId: string,
        messagingContainerId?: string,
        onErrorCallback?: (error: BraintreeError) => void,
    ): void {
        this._removeElement(buttonContainerId);
        this._removeElement(messagingContainerId);

        if (onErrorCallback) {
            onErrorCallback(error);
        }
    }

    private _removeElement(elementId?: string): void {
        const element = elementId && document.getElementById(elementId);

        if (element) {
            element.remove();
        }
    }
}
