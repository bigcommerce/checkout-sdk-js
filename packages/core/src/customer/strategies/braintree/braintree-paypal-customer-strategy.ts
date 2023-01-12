import { FormPoster } from '@bigcommerce/form-poster';

import { CheckoutActionCreator, CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import mapToLegacyBillingAddress from '../../../checkout-buttons/strategies/braintree/map-to-legacy-billing-address';
import mapToLegacyShippingAddress from '../../../checkout-buttons/strategies/braintree/map-to-legacy-shipping-address';
import {
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    StandardError,
} from '../../../common/error/errors';
import { PaymentMethodActionCreator } from '../../../payment';
import {
    BraintreeError,
    BraintreePaypalCheckout,
    BraintreeSDKCreator,
    BraintreeTokenizePayload,
    mapToBraintreeShippingAddressOverride,
} from '../../../payment/strategies/braintree';
import { PaypalAuthorizeData, PaypalHostWindow } from '../../../payment/strategies/paypal';
import CustomerActionCreator from '../../customer-action-creator';
import CustomerCredentials from '../../customer-credentials';
import {
    CustomerInitializeOptions,
    CustomerRequestOptions,
    ExecutePaymentMethodCheckoutOptions,
} from '../../customer-request-options';
import CustomerStrategy from '../customer-strategy';

import BraintreePaypalCustomerInitializeOptions from './braintree-paypal-customer-options';

export default class BraintreePaypalCustomerStrategy implements CustomerStrategy {
    constructor(
        private _store: CheckoutStore,
        private _checkoutActionCreator: CheckoutActionCreator,
        private _customerActionCreator: CustomerActionCreator,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _braintreeSDKCreator: BraintreeSDKCreator,
        private _formPoster: FormPoster,
        private _window: PaypalHostWindow,
    ) {}

    async initialize(options: CustomerInitializeOptions): Promise<InternalCheckoutSelectors> {
        const { braintreepaypal, methodId } = options;
        const { container, onError } = braintreepaypal || {};

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.methodId" argument is not provided.',
            );
        }

        if (!container) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.container" argument is not provided.`,
            );
        }

        if (!braintreepaypal) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.braintreepaypal" argument is not provided.`,
            );
        }

        const state = await this._store.dispatch(
            this._paymentMethodActionCreator.loadPaymentMethod(methodId),
        );
        const paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(methodId);

        if (!paymentMethod.clientToken) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const currencyCode = state.cart.getCartOrThrow().currency.code;
        const paypalCheckoutOptions = { currency: currencyCode };
        const paypalCheckoutSuccessCallback = (
            braintreePaypalCheckout: BraintreePaypalCheckout,
        ) => {
            this._renderPayPalButton(
                braintreePaypalCheckout,
                braintreepaypal,
                container,
                methodId,
                Boolean(paymentMethod.config.testMode),
            );
        };
        const paypalCheckoutErrorCallback = (error: BraintreeError) =>
            this._handleError(error, container, onError);

        this._braintreeSDKCreator.initialize(paymentMethod.clientToken);
        await this._braintreeSDKCreator.getPaypalCheckout(
            paypalCheckoutOptions,
            paypalCheckoutSuccessCallback,
            paypalCheckoutErrorCallback,
        );

        return this._store.getState();
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        this._braintreeSDKCreator.teardown();

        return Promise.resolve(this._store.getState());
    }

    signIn(
        credentials: CustomerCredentials,
        options?: CustomerRequestOptions,
    ): Promise<InternalCheckoutSelectors> {
        return this._store.dispatch(
            this._customerActionCreator.signInCustomer(credentials, options),
        );
    }

    signOut(options?: CustomerRequestOptions): Promise<InternalCheckoutSelectors> {
        return this._store.dispatch(this._customerActionCreator.signOutCustomer(options));
    }

    executePaymentMethodCheckout(
        options?: ExecutePaymentMethodCheckoutOptions,
    ): Promise<InternalCheckoutSelectors> {
        options?.continueWithCheckoutCallback?.();

        return Promise.resolve(this._store.getState());
    }

    private _renderPayPalButton(
        braintreePaypalCheckout: BraintreePaypalCheckout,
        braintreepaypal: BraintreePaypalCustomerInitializeOptions,
        containerId: string,
        methodId: string,
        testMode: boolean,
    ): void {
        const { paypal } = this._window;
        const fundingSource = paypal?.FUNDING.PAYPAL;

        if (paypal && fundingSource) {
            const paypalButtonRender = paypal.Buttons({
                env: testMode ? 'sandbox' : 'production',
                commit: false,
                fundingSource,
                style: {
                    height: 40,
                },
                createOrder: () => this._setupPayment(braintreePaypalCheckout, braintreepaypal),
                onApprove: (authorizeData: PaypalAuthorizeData) =>
                    this._tokenizePayment(
                        authorizeData,
                        braintreePaypalCheckout,
                        methodId,
                        braintreepaypal,
                    ),
            });

            if (paypalButtonRender.isEligible()) {
                paypalButtonRender.render(`#${containerId}`);
            }
        } else {
            this._removeElement(containerId);
        }
    }

    private async _setupPayment(
        braintreePaypalCheckout: BraintreePaypalCheckout,
        braintreepaypal: BraintreePaypalCustomerInitializeOptions,
    ): Promise<string | void> {
        try {
            const state = await this._store.dispatch(
                this._checkoutActionCreator.loadDefaultCheckout(),
            );

            const amount = state.checkout.getCheckoutOrThrow().outstandingBalance;
            const currency = state.cart.getCartOrThrow().currency.code;
            const customer = state.customer.getCustomer();
            const address = customer?.addresses[0];
            const shippingAddressOverride = address
                ? mapToBraintreeShippingAddressOverride(address)
                : undefined;

            return await braintreePaypalCheckout.createPayment({
                flow: 'checkout',
                enableShippingAddress: true,
                shippingAddressEditable: false,
                shippingAddressOverride,
                amount,
                currency,
                offerCredit: false,
            });
        } catch (error) {
            const { container, onError } = braintreepaypal;
            this._handleError(error, container, onError);
        }
    }

    private async _tokenizePayment(
        authorizeData: PaypalAuthorizeData,
        braintreePaypalCheckout: BraintreePaypalCheckout,
        methodId: string,
        braintreepaypal: BraintreePaypalCustomerInitializeOptions,
    ): Promise<BraintreeTokenizePayload | void> {
        try {
            const { deviceData } = await this._braintreeSDKCreator.getDataCollector({
                paypal: true,
            });
            const tokenizePayload = await braintreePaypalCheckout.tokenizePayment(authorizeData);
            const { details, nonce } = tokenizePayload;

            this._formPoster.postForm('/checkout.php', {
                payment_type: 'paypal',
                provider: methodId,
                action: 'set_external_checkout',
                nonce,
                device_data: deviceData,
                billing_address: JSON.stringify(mapToLegacyBillingAddress(details)),
                shipping_address: JSON.stringify(mapToLegacyShippingAddress(details)),
            });

            return tokenizePayload;
        } catch (error) {
            const { container, onError } = braintreepaypal;
            this._handleError(error, container, onError);
        }
    }

    private _handleError(
        error: BraintreeError | StandardError,
        buttonContainerId: string,
        onErrorCallback?: (error: BraintreeError | StandardError) => void,
    ): void {
        this._removeElement(buttonContainerId);

        if (onErrorCallback) {
            onErrorCallback(error);
        } else {
            throw error;
        }
    }

    private _removeElement(elementId?: string): void {
        const element = elementId && document.getElementById(elementId);

        if (element) {
            element.remove();
        }
    }
}
