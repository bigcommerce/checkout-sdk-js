import { RequestSender } from '@bigcommerce/request-sender';
import { noop } from 'lodash';

import { AddressRequestBody } from '../../../address';
import { BillingAddressActionCreator } from '../../../billing';
import { Cart } from '../../../cart';
import { Checkout, CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType, NotImplementedError } from '../../../common/error/errors';
import { bindDecorator as bind } from '../../../common/utility';
import { StoreConfig } from '../../../config';
import { OrderActionCreator } from '../../../order';
import { Payment, PaymentActionCreator, PaymentMethod, PaymentMethodActionCreator } from '../../../payment';
import { PaymentMethodCancelledError } from '../../../payment/errors';
import { assertApplePayWindow, ApplePaySessionFactory } from '../../../payment/strategies/apple-pay';
import { ConsignmentActionCreator, ShippingOption } from '../../../shipping';
import { CustomerInitializeOptions, ExecutePaymentMethodCheckoutOptions } from '../../customer-request-options';
import CustomerStrategy from '../customer-strategy';

const validationEndpoint = (bigPayEndpoint: string) => `${bigPayEndpoint}/api/public/v1/payments/applepay/validate_merchant`;

enum DefaultLabels {
    Subtotal = 'Subtotal',
    Shipping = 'Shipping',
}

function isShippingOptions(options: ShippingOption[] | undefined): options is ShippingOption[] {
    return options instanceof Array;
}

export default class ApplePayCustomerStrategy implements CustomerStrategy {
    private _paymentMethod?: PaymentMethod;
    private _applePayButton?: HTMLElement;
    private _onAuthorizeCallback = noop;
    private _onError = noop;
    private _subTotalLabel: string = DefaultLabels.Subtotal;
    private _shippingLabel: string = DefaultLabels.Shipping;

    constructor(
        private _store: CheckoutStore,
        private _requestSender: RequestSender,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _consignmentActionCreator: ConsignmentActionCreator,
        private _billingAddressActionCreator: BillingAddressActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _orderActionCreator: OrderActionCreator,
        private _sessionFactory: ApplePaySessionFactory
    ) {}

    async initialize(options: CustomerInitializeOptions): Promise<InternalCheckoutSelectors> {
        const { methodId, applepay }  = options;

        assertApplePayWindow(window);

        if (!methodId || !applepay) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const {
            container,
            shippingLabel,
            subtotalLabel,
            onError = () => {},
            onPaymentAuthorize,
        } = applepay;

        this._shippingLabel = shippingLabel || DefaultLabels.Shipping;
        this._subTotalLabel = subtotalLabel || DefaultLabels.Subtotal;
        this._onAuthorizeCallback = onPaymentAuthorize;
        this._onError = onError;

        const state = await this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(methodId));
        this._paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(methodId);

        this._applePayButton = this._createButton(container);
        this._applePayButton.addEventListener('click', this._handleWalletButtonClick);

        return this._store.getState();
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        return Promise.resolve(this._store.getState());
    }

    signIn(): Promise<InternalCheckoutSelectors> {
        throw new NotImplementedError(
            'In order to sign in via Apple, the shopper must click on "Apple Pay" button.'
        );
    }

    signOut(): Promise<InternalCheckoutSelectors> {
        throw new NotImplementedError(
            'Need to do signout via apple.'
        );
    }

    executePaymentMethodCheckout(options?: ExecutePaymentMethodCheckoutOptions): Promise<InternalCheckoutSelectors> {
        options?.continueWithCheckoutCallback?.();

        return Promise.resolve(this._store.getState());
    }

    private _createButton(containerId: string): HTMLElement {
        const container = document.getElementById(containerId);

        if (!container) {
            throw new InvalidArgumentError('Unable to create sign-in button without valid container ID.');
        }

        const button = document.createElement('input');
        button.type = 'image';
        button.src = this._paymentMethod?.logoUrl || '';
        button.style.height = '40px';
        button.style.width = '75px';
        container.appendChild(button);

        return button;
    }

    @bind
    private _handleWalletButtonClick(event: Event) {
        event.preventDefault();
        const state = this._store.getState();
        const cart = state.cart.getCartOrThrow();
        const config = state.config.getStoreConfigOrThrow();
        if (!this._paymentMethod || !this._paymentMethod.initializationData) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }
        const request = this._getBaseRequest(cart, config, this._paymentMethod);
        const applePaySession = this._sessionFactory.create(request);
        this._handleApplePayEvents(applePaySession, this._paymentMethod, config);

        applePaySession.begin();
    }

    private _getBaseRequest(
        cart: Cart,
        config: StoreConfig,
        paymentMethod: PaymentMethod
    ): ApplePayJS.ApplePayPaymentRequest {
        const { storeProfile: { storeCountryCode, storeName } } = config;
        const { currency: { code } } = cart;

        const { initializationData : { merchantCapabilities, supportedNetworks } } = paymentMethod;

        return {
            requiredBillingContactFields: ['postalAddress'],
            requiredShippingContactFields: ['email', 'phone', 'postalAddress'],
            countryCode: storeCountryCode,
            currencyCode: code,
            merchantCapabilities,
            supportedNetworks,
            lineItems: [],
            total: {
                label: storeName,
                amount: '0.01',
                type: 'pending',
            },
        };
    }

    private _handleApplePayEvents(
        applePaySession: ApplePaySession,
        paymentMethod: PaymentMethod,
        config: StoreConfig
    ) {
        applePaySession.onvalidatemerchant = async event => {
            try {
                const { body: merchantSession } = await this._onValidateMerchant(paymentMethod, event);
                applePaySession.completeMerchantValidation(merchantSession);
            } catch (err) {
                this._onError(err);
            }
        };

        applePaySession.onshippingcontactselected = async event =>
            this._handleShippingContactSelected(applePaySession, config, event);

        applePaySession.onshippingmethodselected = async event =>
            this._handleShippingMethodSelected(applePaySession, config, event);

        applePaySession.oncancel = () => {
            throw new PaymentMethodCancelledError('Continue with applepay');
        };

        applePaySession.onpaymentauthorized = async event =>
            this._onPaymentAuthorized(event, applePaySession, paymentMethod);
    }

    private async _handleShippingContactSelected(
        applePaySession: ApplePaySession,
        config: StoreConfig,
        event: ApplePayJS.ApplePayShippingContactSelectedEvent
    ) {
        const shippingAddress = this._transformContactToAddress(event.shippingContact);

        try {
            await this._store.dispatch(
                this._consignmentActionCreator.updateAddress(shippingAddress)
            );
        } catch (error) {
            applePaySession.abort();

            return this._onError(error);
        }

        const { storeProfile: { storeName } } = config;
        let state = this._store.getState();
        const { currency: { decimalPlaces } } = state.cart.getCartOrThrow();
        let checkout = state.checkout.getCheckoutOrThrow();
        const availableOptions = checkout.consignments[0].availableShippingOptions;
        const shippingOptions = availableOptions?.map(option => ({
            label: option.description,
            amount: `${option.cost.toFixed(decimalPlaces)}`,
            detail: option.additionalDescription,
            identifier: option.id,
        }));

        if (!isShippingOptions(availableOptions)) {
            throw new Error('Shipping options not available.');
        } else {
            const recommendedOption = availableOptions.find(
                option => option.isRecommended
            );

            const optionId = recommendedOption ? recommendedOption.id : availableOptions[0].id;
            try {
                await this._updateShippingOption(optionId);
            } catch (error) {
                return this._onError(error);
            }
        }

        state = this._store.getState();
        checkout = state.checkout.getCheckoutOrThrow();

        applePaySession.completeShippingContactSelection({
            newShippingMethods: shippingOptions,
            newTotal: {
                type: 'final',
                label: storeName,
                amount: `${checkout.grandTotal.toFixed(decimalPlaces)}`,
            },
            newLineItems: this._getUpdatedLineItems(checkout, decimalPlaces),
        });
    }

    private async _handleShippingMethodSelected(
        applePaySession: ApplePaySession,
        config: StoreConfig,
        event: ApplePayJS.ApplePayShippingMethodSelectedEvent
    ) {
        const { storeProfile: { storeName } } = config;
        const { shippingMethod: { identifier: optionId } } = event;
        try {
            await this._updateShippingOption(optionId);
        } catch (error) {
            applePaySession.abort();

            return this._onError(error);
        }

        const state = this._store.getState();
        const { currency: { decimalPlaces } } = state.cart.getCartOrThrow();
        const checkout = state.checkout.getCheckoutOrThrow();

        applePaySession.completeShippingMethodSelection({
            newTotal: {
                type: 'final',
                label: storeName,
                amount: `${checkout.grandTotal.toFixed(decimalPlaces)}`,
            },
            newLineItems: this._getUpdatedLineItems(checkout, decimalPlaces),
        });
    }

    private _getUpdatedLineItems(checkout: Checkout, decimalPlaces: number): ApplePayJS.ApplePayLineItem[] {
        const lineItems: ApplePayJS.ApplePayLineItem[] = [
            { label: this._subTotalLabel, amount: `${checkout.subtotal.toFixed(decimalPlaces)}`},
        ];

        checkout.taxes.forEach(tax =>
            lineItems.push({ label: tax.name, amount: `${tax.amount.toFixed(decimalPlaces)}` }));
        lineItems.push({ label: this._shippingLabel, amount: `${checkout.shippingCostTotal.toFixed(decimalPlaces)}`});

        return lineItems;
    }

    private async _updateShippingOption(optionId: string) {
        return await this._store.dispatch(
            this._consignmentActionCreator.selectShippingOption(optionId)
        );
    }

    private async _onValidateMerchant(paymentData: PaymentMethod, event: ApplePayJS.ApplePayValidateMerchantEvent) {
        const body = [
            `validationUrl=${event.validationURL}`,
            `merchantIdentifier=${paymentData.initializationData.merchantId}`,
            `displayName=${paymentData.initializationData.storeName}`,
            `domainName=${window.location.hostname}`,
        ].join('&');

        return this._requestSender.post(validationEndpoint(paymentData.initializationData.paymentsUrl), {
            credentials: false,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-XSRF-TOKEN': null,
            },
            body,
        });
    }

    private async _onPaymentAuthorized(
        event: ApplePayJS.ApplePayPaymentAuthorizedEvent,
        applePaySession: ApplePaySession,
        paymentMethod: PaymentMethod
    ) {
        const { token, billingContact, shippingContact } = event.payment;
        const payment: Payment = {
            methodId: paymentMethod.id,
            paymentData: {
                formattedPayload: {
                    apple_pay_token: {
                        payment_data: token.paymentData,
                        payment_method: token.paymentMethod,
                        transaction_id: token.transactionIdentifier,
                    },
                },
            },
        };

        const transformedBillingAddress = this._transformContactToAddress(billingContact);
        const transformedShippingAddress = this._transformContactToAddress(shippingContact);
        const emailAddress = shippingContact?.emailAddress;

        try {
            await this._store.dispatch(
                this._billingAddressActionCreator.updateAddress({ ...transformedBillingAddress, email: emailAddress })
            );

            await this._store.dispatch(
                this._consignmentActionCreator.updateAddress(transformedShippingAddress)
            );

            await this._store.dispatch(this._orderActionCreator.submitOrder(
                {
                    useStoreCredit: false,
                })
            );
            await this._store.dispatch(this._paymentActionCreator.submitPayment(payment));
            applePaySession.completePayment(ApplePaySession.STATUS_SUCCESS);

            return this._onAuthorizeCallback();
        } catch (error) {
            applePaySession.completePayment(ApplePaySession.STATUS_FAILURE);

            return this._onError(error);
        }
    }

    private _transformContactToAddress(contact?: ApplePayJS.ApplePayPaymentContact): AddressRequestBody {
        return {
            firstName: contact?.givenName || '',
            lastName: contact?.familyName || '',
            city: contact?.locality || '',
            company: '',
            address1: contact?.addressLines && contact?.addressLines[0] || '',
            address2: contact?.addressLines && contact?.addressLines[1] || '',
            postalCode: contact?.postalCode || '',
            countryCode: contact?.countryCode || '',
            phone: contact?.phoneNumber || '',
            stateOrProvince: contact?.administrativeArea || '',
            stateOrProvinceCode: contact?.administrativeArea || '',
            customFields: [],
        };
    }
}
