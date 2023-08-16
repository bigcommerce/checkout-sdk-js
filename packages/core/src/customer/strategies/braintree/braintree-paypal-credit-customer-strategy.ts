import { FormPoster } from '@bigcommerce/form-poster';

import { CheckoutActionCreator, CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import mapToLegacyBillingAddress from '../../../checkout-buttons/strategies/braintree/map-to-legacy-billing-address';
import mapToLegacyShippingAddress from '../../../checkout-buttons/strategies/braintree/map-to-legacy-shipping-address';
import {
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
} from '../../../common/error/errors';
import { PaymentMethodActionCreator } from '../../../payment';
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
    PaypalHostWindow,
    PaypalStyleOptions,
} from '../../../payment/strategies/paypal';
import CustomerActionCreator from '../../customer-action-creator';
import CustomerCredentials from '../../customer-credentials';
import {
    CustomerInitializeOptions,
    CustomerRequestOptions,
    ExecutePaymentMethodCheckoutOptions,
} from '../../customer-request-options';
import CustomerStrategy from '../customer-strategy';

import BraintreePaypalCreditCustomerInitializeOptions from './braintree-paypal-credit-customer-options';

export default class BraintreePaypalCreditCustomerStrategy implements CustomerStrategy {
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
        const { braintreepaypalcredit, methodId } = options;
        const { container = 40 } = braintreepaypalcredit || {};

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.methodId" argument is not provided.',
            );
        }

        if (!braintreepaypalcredit) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.braintreepaypalcredit" argument is not provided.`,
            );
        }

        if (!container) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "braintreepaypalcredit.container" argument is not provided.`,
            );
        }

        const state = await this._store.dispatch(
            this._paymentMethodActionCreator.loadPaymentMethod(methodId),
        );
        const paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(methodId);
        const { clientToken, initializationData } = paymentMethod;
        const { paymentButtonStyles } = initializationData || {};
        const { checkoutTopButtonStyles } = paymentButtonStyles || {};

        if (!clientToken || !initializationData) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const currencyCode = state.cart.getCartOrThrow().currency.code;
        const paypalCheckoutOptions: Partial<BraintreePaypalSdkCreatorConfig> = {
            currency: currencyCode,
            intent: initializationData.intent,
            isCreditEnabled: initializationData.isCreditEnabled,
        };

        const paypalCheckoutCallback = (braintreePaypalCheckout: BraintreePaypalCheckout) =>
            this._renderPayPalButton(
                braintreePaypalCheckout,
                braintreepaypalcredit,
                methodId,
                Boolean(paymentMethod.config.testMode),
                { ...checkoutTopButtonStyles, height: 36 },
            );
        const paypalCheckoutErrorCallback = (error: BraintreeError) =>
            this._handleError(error, braintreepaypalcredit);

        this._braintreeSDKCreator.initialize(clientToken, initializationData);
        await this._braintreeSDKCreator.getPaypalCheckout(
            paypalCheckoutOptions,
            paypalCheckoutCallback,
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
        braintreepaypalcredit: BraintreePaypalCreditCustomerInitializeOptions,
        methodId: string,
        testMode: boolean,
        buttonStyles: PaypalStyleOptions,
    ): void {
        const { container } = braintreepaypalcredit;
        const { paypal } = this._window;

        let hasRenderedSmartButton = false;

        if (paypal) {
            const fundingSources = [paypal.FUNDING.PAYLATER, paypal.FUNDING.CREDIT];

            fundingSources.forEach((fundingSource) => {
                if (!hasRenderedSmartButton) {
                    const paypalButtonRender = paypal.Buttons({
                        env: testMode ? 'sandbox' : 'production',
                        commit: false,
                        fundingSource,
                        style: buttonStyles,
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
                                braintreepaypalcredit,
                                methodId,
                            ),
                    });

                    if (paypalButtonRender.isEligible()) {
                        paypalButtonRender.render(`#${container}`);
                        hasRenderedSmartButton = true;
                    }
                }
            });
        }

        if (!paypal || !hasRenderedSmartButton) {
            this._removeElement(container);
        }
    }

    private async _setupPayment(
        braintreePaypalCheckout: BraintreePaypalCheckout,
        braintreepaypalcredit: BraintreePaypalCreditCustomerInitializeOptions,
        methodId: string,
    ): Promise<string | undefined> {
        try {
            const state = await this._store.dispatch(
                this._checkoutActionCreator.loadDefaultCheckout(),
            );

            const customer = state.customer.getCustomer();
            const amount = state.checkout.getCheckoutOrThrow().outstandingBalance;
            const currencyCode = state.cart.getCartOrThrow().currency.code;
            const paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(methodId);
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
                currency: currencyCode,
                offerCredit: true,
                intent: paymentMethod.initializationData?.intent,
            });
        } catch (error) {
            this._handleError(error, braintreepaypalcredit);
        }
    }

    private async _tokenizePayment(
        authorizeData: PaypalAuthorizeData,
        braintreePaypalCheckout: BraintreePaypalCheckout,
        braintreepaypalcredit: BraintreePaypalCreditCustomerInitializeOptions,
        methodId: string,
    ): Promise<BraintreeTokenizePayload | undefined> {
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
            this._handleError(error, braintreepaypalcredit);
        }
    }

    private _handleError(
        error: BraintreeError,
        braintreepaypalcredit: BraintreePaypalCreditCustomerInitializeOptions,
    ): void {
        const { container, onError } = braintreepaypalcredit;

        this._removeElement(container);

        if (onError) {
            onError(error);
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
