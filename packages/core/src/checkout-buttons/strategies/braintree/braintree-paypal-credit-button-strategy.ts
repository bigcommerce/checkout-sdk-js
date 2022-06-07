import { FormPoster } from '@bigcommerce/form-poster';

import { Address } from '../../../address';
import { CheckoutActionCreator, CheckoutStore } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType, StandardError } from '../../../common/error/errors';
import { mapToBraintreeShippingAddressOverride, BraintreeError, BraintreePaypalCheckout, BraintreeSDKCreator, BraintreeTokenizePayload } from '../../../payment/strategies/braintree';
import { PaypalAuthorizeData, PaypalButtonStyleLabelOption, PaypalHostWindow } from '../../../payment/strategies/paypal';
import { CheckoutButtonInitializeOptions } from '../../checkout-button-options';
import CheckoutButtonStrategy from '../checkout-button-strategy';

import { BraintreePaypalCreditButtonInitializeOptions } from './braintree-paypal-credit-button-options';
import getValidButtonStyle from './get-valid-button-style';
import mapToLegacyBillingAddress from './map-to-legacy-billing-address';
import mapToLegacyShippingAddress from './map-to-legacy-shipping-address';

export default class BraintreePaypalCreditButtonStrategy implements CheckoutButtonStrategy {
    constructor(
        private _store: CheckoutStore,
        private _checkoutActionCreator: CheckoutActionCreator,
        private _braintreeSDKCreator: BraintreeSDKCreator,
        private _formPoster: FormPoster,
        private _window: PaypalHostWindow
    ) {}

    async initialize(options: CheckoutButtonInitializeOptions): Promise<void> {
        const { braintreepaypalcredit, containerId, methodId } = options;

        if (!methodId) {
            throw new InvalidArgumentError('Unable to initialize payment because "options.methodId" argument is not provided.');
        }

        if (!containerId) {
            throw new InvalidArgumentError(`Unable to initialize payment because "options.containerId" argument is not provided.`);
        }

        if (!braintreepaypalcredit) {
            throw new InvalidArgumentError(`Unable to initialize payment because "options.braintreepaypalcredit" argument is not provided.`);
        }

        const state = await this._store.dispatch(this._checkoutActionCreator.loadDefaultCheckout());
        const paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(options.methodId);
        const currency = state.cart.getCartOrThrow()?.currency.code;

        if (!paymentMethod.clientToken) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const paypalCheckoutOptions = { currency };
        const paypalCheckoutCallback = (braintreePaypalCheckout: BraintreePaypalCheckout) =>
            this._renderPayPalButton(
                braintreePaypalCheckout,
                braintreepaypalcredit,
                containerId,
                methodId,
                Boolean(paymentMethod.config.testMode)
            );
        const paypalCheckoutErrorCallback = (error: BraintreeError) =>
            this._handleError(error, containerId, braintreepaypalcredit.onError);

        this._braintreeSDKCreator.initialize(paymentMethod.clientToken);
        await this._braintreeSDKCreator.getPaypalCheckout(
            paypalCheckoutOptions,
            paypalCheckoutCallback,
            paypalCheckoutErrorCallback
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
        testMode: boolean
    ): void {
        const { style, shippingAddress, shouldProcessPayment, onAuthorizeError, onPaymentError } = braintreepaypalcredit;
        const { paypal } = this._window;

        let hasRenderedSmartButton = false;

        if (paypal) {
            const fundingSources = [paypal.FUNDING.PAYLATER, paypal.FUNDING.CREDIT];
            const commonButtonStyle = style ? getValidButtonStyle(style) : {};

            fundingSources.forEach(fundingSource => {
                const buttonStyle = fundingSource === paypal.FUNDING.CREDIT
                    ? { label: PaypalButtonStyleLabelOption.CREDIT, ...commonButtonStyle }
                    : commonButtonStyle;

                if (!hasRenderedSmartButton) {
                    const paypalButtonRender = paypal.Buttons({
                        env: testMode ? 'sandbox' : 'production',
                        commit: false,
                        fundingSource,
                        style: buttonStyle,
                        createOrder: () => this._setupPayment(braintreePaypalCheckout, shippingAddress, onPaymentError),
                        onApprove: (authorizeData: PaypalAuthorizeData) =>
                            this._tokenizePayment(authorizeData, braintreePaypalCheckout, methodId, shouldProcessPayment, onAuthorizeError),
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
                offerCredit: true,
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
        containerId: string,
        onErrorCallback?: (error: BraintreeError) => void
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
