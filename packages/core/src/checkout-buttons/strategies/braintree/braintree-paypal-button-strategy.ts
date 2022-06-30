import { FormPoster } from '@bigcommerce/form-poster';

import { Address } from '../../../address';
import { CheckoutActionCreator, CheckoutStore } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType, StandardError } from '../../../common/error/errors';
import { mapToBraintreeShippingAddressOverride, BraintreeError, BraintreePaypalCheckout, BraintreeSDKCreator, BraintreeTokenizePayload } from '../../../payment/strategies/braintree';
import { PaypalAuthorizeData, PaypalHostWindow } from '../../../payment/strategies/paypal';
import { CheckoutButtonInitializeOptions } from '../../checkout-button-options';
import CheckoutButtonStrategy from '../checkout-button-strategy';

import { BraintreePaypalButtonInitializeOptions } from './braintree-paypal-button-options';
import getValidButtonStyle from './get-valid-button-style';
import mapToLegacyBillingAddress from './map-to-legacy-billing-address';
import mapToLegacyShippingAddress from './map-to-legacy-shipping-address';

export default class BraintreePaypalButtonStrategy implements CheckoutButtonStrategy {
    constructor(
        private _store: CheckoutStore,
        private _checkoutActionCreator: CheckoutActionCreator,
        private _braintreeSDKCreator: BraintreeSDKCreator,
        private _formPoster: FormPoster,
        private _window: PaypalHostWindow
    ) {}

    async initialize(options: CheckoutButtonInitializeOptions): Promise<void> {
        const { braintreepaypal, containerId, methodId } = options;
        const { messagingContainerId, onError } = braintreepaypal || {};

        if (!methodId) {
            throw new InvalidArgumentError('Unable to initialize payment because "options.methodId" argument is not provided.');
        }

        if (!containerId) {
            throw new InvalidArgumentError(`Unable to initialize payment because "options.containerId" argument is not provided.`);
        }

        if (!braintreepaypal) {
            throw new InvalidArgumentError(`Unable to initialize payment because "options.braintreepaypal" argument is not provided.`);
        }

        const state = await this._store.dispatch(this._checkoutActionCreator.loadDefaultCheckout());
        const paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(methodId);
        const currency = state.cart.getCartOrThrow()?.currency.code;

        if (!paymentMethod.clientToken) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const paypalCheckoutOptions = { currency };
        const paypalCheckoutSuccessCallback = (braintreePaypalCheckout: BraintreePaypalCheckout) => {
            this._renderPayPalComponents(
                braintreePaypalCheckout,
                braintreepaypal,
                containerId,
                methodId,
                Boolean(paymentMethod.config.testMode)
            );
        };
        const paypalCheckoutErrorCallback = (error: BraintreeError) =>
            this._handleError(error, containerId, messagingContainerId, onError);

        this._braintreeSDKCreator.initialize(paymentMethod.clientToken);
        await this._braintreeSDKCreator.getPaypalCheckout(
            paypalCheckoutOptions,
            paypalCheckoutSuccessCallback,
            paypalCheckoutErrorCallback
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
        testMode: boolean
    ): void {
        const { messagingContainerId } = braintreepaypal;

        this._renderPayPalMessages(messagingContainerId);
        this._renderPayPalButton(braintreePaypalCheckout, braintreepaypal, containerId, methodId, testMode);
    }

    private _renderPayPalButton(
        braintreePaypalCheckout: BraintreePaypalCheckout,
        braintreepaypal: BraintreePaypalButtonInitializeOptions,
        containerId: string,
        methodId: string,
        testMode: boolean
    ): void {
        const { style, shippingAddress, shouldProcessPayment, onAuthorizeError, onPaymentError } = braintreepaypal;

        const { paypal } = this._window;
        const fundingSource = paypal?.FUNDING.PAYPAL;

        if (paypal && fundingSource) {
            const validButtonStyle = style ? getValidButtonStyle(style) : {};

            const paypalButtonRender = paypal.Buttons({
                env: testMode ? 'sandbox' : 'production',
                commit: false,
                fundingSource,
                style: validButtonStyle,
                createOrder: () => this._setupPayment(braintreePaypalCheckout, shippingAddress, onPaymentError),
                onApprove: (authorizeData: PaypalAuthorizeData) =>
                    this._tokenizePayment(authorizeData, braintreePaypalCheckout, methodId, shouldProcessPayment, onAuthorizeError),
            });

            if (paypalButtonRender.isEligible()) {
                paypalButtonRender.render(`#${containerId}`);
            }
        } else {
            this._removeElement(containerId);
        }
    }

    private _renderPayPalMessages(messagingContainerId?: string): void {
        const state = this._store.getState();
        const cart = state.cart.getCartOrThrow();
        const storeConfig = state.config.getStoreConfigOrThrow();

        const isMessageContainerAvailable = messagingContainerId && !!document.getElementById(messagingContainerId);
        const isMessagesRenderingFeatureOn = storeConfig.checkoutSettings.features['PAYPAL-1149.braintree-new-card-below-totals-banner-placement'];

        const { paypal } = this._window;

        if (paypal && isMessagesRenderingFeatureOn && messagingContainerId && isMessageContainerAvailable) {
            const paypalMessagesRender = paypal.Messages({ amount: cart.cartAmount, placement: 'cart' });
            paypalMessagesRender.render(`#${messagingContainerId}`);
        } else {
            this._removeElement(messagingContainerId);
        }
    }

    private async _setupPayment(
        braintreePaypalCheckout: BraintreePaypalCheckout,
        shippingAddress?: Address | null,
        onError?: (error: BraintreeError | StandardError) => void
    ): Promise<string> {
        const state = await this._store.dispatch(this._checkoutActionCreator.loadDefaultCheckout());

        try {
            const checkout = state.checkout.getCheckoutOrThrow();
            const config = state.config.getStoreConfigOrThrow();
            const customer = state.customer.getCustomer();

            const address = shippingAddress || customer?.addresses?.[0];
            const shippingAddressOverride = address ? mapToBraintreeShippingAddressOverride(address) : undefined;

            return await braintreePaypalCheckout.createPayment({
                flow: 'checkout',
                enableShippingAddress: true,
                shippingAddressEditable: false,
                shippingAddressOverride,
                amount: checkout.outstandingBalance,
                currency: config.currency.code,
                offerCredit: false,
            });
        } catch (error) {
            if (onError) {
                onError(error);
            }

            throw error;
        }
    }

    private async _tokenizePayment(
        authorizeData: PaypalAuthorizeData,
        braintreePaypalCheckout: BraintreePaypalCheckout,
        methodId: string,
        shouldProcessPayment?: boolean,
        onError?: (error: BraintreeError | StandardError) => void
    ): Promise<BraintreeTokenizePayload> {
        try {
            const { deviceData } = await this._braintreeSDKCreator.getDataCollector({ paypal: true });
            const tokenizePayload = await braintreePaypalCheckout.tokenizePayment(authorizeData);
            const { details, nonce } = tokenizePayload;

            this._formPoster.postForm('/checkout.php', {
                payment_type: 'paypal',
                provider: methodId,
                action: shouldProcessPayment ? 'process_payment' : 'set_external_checkout',
                nonce,
                device_data: deviceData,
                billing_address: JSON.stringify(mapToLegacyBillingAddress(details)),
                shipping_address: JSON.stringify(mapToLegacyShippingAddress(details)),
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
        onErrorCallback?: (error: BraintreeError) => void
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
