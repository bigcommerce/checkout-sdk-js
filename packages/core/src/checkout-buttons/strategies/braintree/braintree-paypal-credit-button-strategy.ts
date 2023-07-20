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
import {
    PaypalAuthorizeData,
    PaypalButtonStyleLabelOption,
    PaypalHostWindow,
} from '../../../payment/strategies/paypal';
import { CheckoutButtonInitializeOptions } from '../../checkout-button-options';
import CheckoutButtonStrategy from '../checkout-button-strategy';

import { BraintreePaypalCreditButtonInitializeOptions } from './braintree-paypal-credit-button-options';
import getValidButtonStyle from './get-valid-button-style';
import mapToLegacyBillingAddress from './map-to-legacy-billing-address';
import mapToLegacyShippingAddress from './map-to-legacy-shipping-address';

type BuyNowInitializeOptions = Pick<
    BraintreePaypalCreditButtonInitializeOptions,
    'buyNowInitializeOptions'
>;

export default class BraintreePaypalCreditButtonStrategy implements CheckoutButtonStrategy {
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
        const { braintreepaypalcredit, containerId, methodId } = options;

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

        if (!braintreepaypalcredit) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.braintreepaypalcredit" argument is not provided.`,
            );
        }

        let state: InternalCheckoutSelectors;
        let paymentMethod: PaymentMethod;
        let currencyCode: string;

        if (braintreepaypalcredit.buyNowInitializeOptions) {
            state = this._store.getState();
            paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(methodId);

            if (!braintreepaypalcredit.currencyCode) {
                throw new InvalidArgumentError(
                    `Unable to initialize payment because "options.braintreepaypalcredit.currencyCode" argument is not provided.`,
                );
            }

            currencyCode = braintreepaypalcredit.currencyCode;
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

        const paypalCheckoutCallback = (braintreePaypalCheckout: BraintreePaypalCheckout) =>
            this._renderPayPalButton(
                braintreePaypalCheckout,
                braintreepaypalcredit,
                containerId,
                methodId,
                Boolean(paymentMethod.config.testMode),
            );
        const paypalCheckoutErrorCallback = (error: BraintreeError) =>
            this._handleError(error, containerId, braintreepaypalcredit.onError);

        this._braintreeSDKCreator.initialize(clientToken, initializationData);
        await this._braintreeSDKCreator.getPaypalCheckout(
            paypalCheckoutOptions,
            paypalCheckoutCallback,
            paypalCheckoutErrorCallback,
        );
    }

    deinitialize(): Promise<void> {
        this._braintreeSDKCreator.teardown();

        return Promise.resolve();
    }

    private _renderPayPalButton(
        braintreePaypalCheckout: BraintreePaypalCheckout,
        braintreepaypalcredit: BraintreePaypalCreditButtonInitializeOptions,
        containerId: string,
        methodId: string,
        testMode: boolean,
    ): void {
        const { style, shouldProcessPayment, onAuthorizeError } = braintreepaypalcredit;
        const { paypal } = this._window;

        let hasRenderedSmartButton = false;

        if (paypal) {
            const fundingSources = [paypal.FUNDING.PAYLATER, paypal.FUNDING.CREDIT];
            const commonButtonStyle = style ? getValidButtonStyle(style) : {};

            fundingSources.forEach((fundingSource) => {
                const buttonStyle =
                    fundingSource === paypal.FUNDING.CREDIT
                        ? { label: PaypalButtonStyleLabelOption.CREDIT, ...commonButtonStyle }
                        : commonButtonStyle;

                if (!hasRenderedSmartButton) {
                    const paypalButtonRender = paypal.Buttons({
                        env: testMode ? 'sandbox' : 'production',
                        commit: false,
                        fundingSource,
                        style: buttonStyle,
                        createOrder: () =>
                            this._setupPayment(
                                braintreePaypalCheckout,
                                braintreepaypalcredit,
                                methodId,
                            ),
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
                        hasRenderedSmartButton = true;
                    }
                }
            });
        }

        if (!paypal || !hasRenderedSmartButton) {
            this._removeElement(containerId);
        }
    }

    private async _setupPayment(
        braintreePaypalCheckout: BraintreePaypalCheckout,
        braintreepaypalcredit: BraintreePaypalCreditButtonInitializeOptions,
        methodId: string,
    ): Promise<string> {
        const { onPaymentError, shippingAddress, buyNowInitializeOptions } = braintreepaypalcredit;
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
                braintreepaypalcredit.currencyCode ??
                state.config.getStoreConfigOrThrow().currency.code;

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
                offerCredit: true,
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
                const { body: buyNowCart } = await this._cartRequestSender.createBuyNowCart(
                    cartRequestBody,
                );

                return buyNowCart;
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
        containerId: string,
        onErrorCallback?: (error: BraintreeError) => void,
    ): void {
        this._removeElement(containerId);

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
