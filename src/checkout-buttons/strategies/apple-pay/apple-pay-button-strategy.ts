import { RequestSender } from '@bigcommerce/request-sender';
import { noop } from 'lodash';

import { AddressRequestBody } from '../../../address';
import { BillingAddressActionCreator } from '../../../billing';
import { Cart } from '../../../cart';
import { Checkout, CheckoutActionCreator, CheckoutStore } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType } from '../../../common/error/errors';
import { bindDecorator as bind } from '../../../common/utility';
import { StoreConfig } from '../../../config';
import { OrderActionCreator } from '../../../order';
import { Payment, PaymentActionCreator, PaymentMethod, PaymentMethodActionCreator } from '../../../payment';
import { PaymentMethodCancelledError } from '../../../payment/errors';
import { assertApplePayWindow, ApplePaySessionFactory } from '../../../payment/strategies/apple-pay';
import { RemoteCheckoutActionCreator } from '../../../remote-checkout';
import { ConsignmentActionCreator, ShippingOption } from '../../../shipping';
import { CheckoutButtonInitializeOptions } from '../../checkout-button-options';
import CheckoutButtonStrategy from '../checkout-button-strategy';

const validationEndpoint = (bigPayEndpoint: string) => `${bigPayEndpoint}/api/public/v1/payments/applepay/validate_merchant`;

enum DefaultLabels {
    Subtotal = 'Subtotal',
    Shipping = 'Shipping',
}

function isShippingOptions(options: ShippingOption[] | undefined): options is ShippingOption[] {
    return options instanceof Array;
}

export default class ApplePayButtonStrategy implements CheckoutButtonStrategy {
    private _paymentMethod?: PaymentMethod;
    private _applePayButton?: HTMLElement;
    private _onAuthorizeCallback = noop;
    private _subTotalLabel: string = DefaultLabels.Subtotal;
    private _shippingLabel: string = DefaultLabels.Shipping;

    constructor(
        private _store: CheckoutStore,
        private _checkoutActionCreator: CheckoutActionCreator,
        private _requestSender: RequestSender,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _consignmentActionCreator: ConsignmentActionCreator,
        private _billingAddressActionCreator: BillingAddressActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _remoteCheckoutActionCreator: RemoteCheckoutActionCreator,
        private _orderActionCreator: OrderActionCreator,
        private _sessionFactory: ApplePaySessionFactory
    ) {}

    async initialize(options: CheckoutButtonInitializeOptions): Promise<void> {

        const { methodId, containerId , applepay}  = options;

        assertApplePayWindow(window);

        if (!methodId || !applepay) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const {
            buttonClassName,
            onPaymentAuthorize,
        } = applepay;

        this._onAuthorizeCallback = onPaymentAuthorize;

        await this._store.dispatch(this._checkoutActionCreator.loadDefaultCheckout());

        const state = await this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(methodId));
        this._paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(methodId);

        this._applePayButton = this._createButton(containerId, buttonClassName);
        this._applePayButton.addEventListener('click', this._handleWalletButtonClick);

        return Promise.resolve();
    }

    deinitialize(): Promise<void> {
        return Promise.resolve();
    }

    private _createButton(containerId: string, buttonClassName: string = 'apple-pay-checkout-button'): HTMLElement {
        const container = document.getElementById(containerId);
        if (!container) {
            throw new InvalidArgumentError('Unable to create wallet button without valid container ID.');
        }

        document.body.classList.add('apple-pay-supported');
        const button = document.createElement('div');
        button.classList.add(buttonClassName);
        button.setAttribute('role', 'button');
        button.setAttribute('aria-label', 'Apple Pay button');
        container.appendChild(button);

        return button;
    }

    @bind
    private _handleWalletButtonClick(event: Event) {
        event.preventDefault();
        const state = this._store.getState();
        const cart = state.cart.getCartOrThrow();
        const config = state.config.getStoreConfigOrThrow();
        const checkout = state.checkout.getCheckoutOrThrow();

        if (!this._paymentMethod || !this._paymentMethod.initializationData) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }
        const request = this._getBaseRequest(cart, checkout, config, this._paymentMethod);
        const applePaySession = this._sessionFactory.create(request);
        this._handleApplePayEvents(applePaySession, this._paymentMethod, config);

        applePaySession.begin();
    }

    private _getBaseRequest(
        cart: Cart,
        checkout: Checkout,
        config: StoreConfig,
        paymentMethod: PaymentMethod
    ): ApplePayJS.ApplePayPaymentRequest {
        const { storeProfile: { storeCountryCode, storeName } } = config;
        const { currency: { code, decimalPlaces} } = cart;

        const { initializationData : { merchantCapabilities, supportedNetworks } } = paymentMethod;

        const requiresShipping = cart.lineItems.physicalItems.length > 0;
        const total: ApplePayJS.ApplePayLineItem = requiresShipping ? {
            label: storeName,
            amount: `${checkout.grandTotal.toFixed(decimalPlaces)}`,
            type: 'pending',
        } : {
            label: storeName,
            amount: `${checkout.grandTotal.toFixed(decimalPlaces)}`,
            type: 'final',
        };

        const request: ApplePayJS.ApplePayPaymentRequest = {
            requiredBillingContactFields: ['postalAddress'],
            requiredShippingContactFields: ['email', 'phone'],
            countryCode: storeCountryCode,
            currencyCode: code,
            merchantCapabilities,
            supportedNetworks,
            lineItems: [],
            total,
        };

        if (requiresShipping) {
            request.requiredShippingContactFields?.push('postalAddress');
        } else {
            const lineItems: ApplePayJS.ApplePayLineItem[] = [
                { label: this._subTotalLabel, amount: `${checkout.subtotal.toFixed(decimalPlaces)}`},
            ];

            checkout.taxes.forEach(tax =>
                lineItems.push({ label: tax.name, amount: `${tax.amount.toFixed(decimalPlaces)}` }));

            request.lineItems = lineItems;
        }

        return request;
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
            } catch (error) {
                throw new Error('Merchant validation failed');
            }
        };

        applePaySession.onshippingcontactselected = async event =>
            this._handleShippingContactSelected(applePaySession, config, event);

        applePaySession.onshippingmethodselected = async event =>
            this._handleShippingMethodSelected(applePaySession, config, event);

        applePaySession.oncancel = async () => {
            try {
                await this._store.dispatch(this._remoteCheckoutActionCreator.signOut(paymentMethod.id));

                return this._store.dispatch(this._checkoutActionCreator.loadCurrentCheckout());
            } catch (error) {
                throw new PaymentMethodCancelledError();
            }
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

            throw new Error('Shipping address update failed');
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
        }

        if (availableOptions.length === 0) {
            applePaySession.completeShippingContactSelection(
                ApplePaySession.STATUS_INVALID_SHIPPING_POSTAL_ADDRESS,
                [],
                {
                    type: 'pending',
                    label: storeName,
                    amount: `${checkout.grandTotal.toFixed(decimalPlaces)}`,
                },
                []
            );

            return;
        }

        const recommendedOption = availableOptions.find(
            option => option.isRecommended
        );

        const optionId = recommendedOption ? recommendedOption.id : availableOptions[0].id;
        try {
            await this._updateShippingOption(optionId);
        } catch (error) {
            throw new Error('Shipping options update failed');
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

            throw new Error('Shipping option selection update failed.');
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
        const state = this._store.getState();
        const cart = state.cart.getCartOrThrow();
        const requiresShipping = cart.lineItems.physicalItems.length > 0;
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

            if (requiresShipping) {
                await this._store.dispatch(
                    this._consignmentActionCreator.updateAddress(transformedShippingAddress)
                );
            }

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

            throw new Error('Payment cannot complete');
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
