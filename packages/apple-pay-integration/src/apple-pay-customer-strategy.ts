import { RequestSender } from '@bigcommerce/request-sender';
import { noop } from 'lodash';

import { BraintreeIntegrationService } from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    AddressRequestBody,
    Cart,
    Checkout,
    CustomerInitializeOptions,
    CustomerStrategy,
    ExecutePaymentMethodCheckoutOptions,
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    NotImplementedError,
    Payment,
    PaymentIntegrationService,
    PaymentMethod,
    PaymentMethodCancelledError,
    ShippingOption,
    StoreConfig,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { ApplePayGatewayType } from './apple-pay';
import { WithApplePayCustomerInitializeOptions } from './apple-pay-customer-initialize-options';
import ApplePaySessionFactory, { assertApplePayWindow } from './apple-pay-session-factory';

const validationEndpoint = (bigPayEndpoint: string) =>
    `${bigPayEndpoint}/api/public/v1/payments/applepay/validate_merchant`;

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
    private _onClick = noop;
    private _subTotalLabel: string = DefaultLabels.Subtotal;
    private _shippingLabel: string = DefaultLabels.Shipping;
    private _hasApplePaySession = false;

    constructor(
        private _requestSender: RequestSender,
        private _paymentIntegrationService: PaymentIntegrationService,
        private _sessionFactory: ApplePaySessionFactory,
        private _braintreeIntegrationService: BraintreeIntegrationService,
    ) {}

    async initialize(
        options: CustomerInitializeOptions & WithApplePayCustomerInitializeOptions,
    ): Promise<void> {
        const { methodId, applepay } = options;

        assertApplePayWindow(window);

        if (!methodId || !applepay) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const {
            container,
            shippingLabel,
            subtotalLabel,
            onError = noop,
            onClick = noop,
            onPaymentAuthorize,
        } = applepay;

        this._shippingLabel = shippingLabel || DefaultLabels.Shipping;
        this._subTotalLabel = subtotalLabel || DefaultLabels.Subtotal;
        this._onAuthorizeCallback = onPaymentAuthorize;
        this._onError = onError;
        this._onClick = onClick;

        let state = this._paymentIntegrationService.getState();

        try {
            this._paymentMethod = state.getPaymentMethodOrThrow(methodId);
        } catch (_e) {
            state = await this._paymentIntegrationService.loadPaymentMethod(methodId);
            this._paymentMethod = state.getPaymentMethodOrThrow(methodId);
        }

        await this._paymentIntegrationService.verifyCheckoutSpamProtection();

        this._applePayButton = this._createButton(container);
        this._applePayButton.addEventListener('click', this._handleWalletButtonClick.bind(this));

        if (this._paymentMethod.initializationData?.gateway === ApplePayGatewayType.BRAINTREE) {
            await this._initializeBraintreeIntegrationService();
        }
    }

    deinitialize(): Promise<void> {
        return Promise.resolve();
    }

    signIn(): Promise<void> {
        throw new NotImplementedError(
            'In order to sign in via Apple, the shopper must click on "Apple Pay" button.',
        );
    }

    signOut(): Promise<void> {
        throw new NotImplementedError('Need to do signout via apple.');
    }

    executePaymentMethodCheckout(options?: ExecutePaymentMethodCheckoutOptions): Promise<void> {
        options?.continueWithCheckoutCallback?.();

        return Promise.resolve();
    }

    private _createButton(containerId: string): HTMLElement {
        const container = document.getElementById(containerId);

        if (!container) {
            throw new InvalidArgumentError(
                'Unable to create sign-in button without valid container ID.',
            );
        }

        const button = document.createElement('button');

        button.setAttribute('type', 'button');
        button.setAttribute('aria-label', 'Apple Pay');
        container.appendChild(button);

        return button;
    }

    private _handleWalletButtonClick(event: Event) {
        event.preventDefault();

        if (this._hasApplePaySession) {
            return;
        }

        this._onClick();

        const state = this._paymentIntegrationService.getState();
        const cart = state.getCartOrThrow();
        const config = state.getStoreConfigOrThrow();
        const checkout = state.getCheckoutOrThrow();

        if (!this._paymentMethod || !this._paymentMethod.initializationData) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const request = this._getBaseRequest(cart, checkout, config, this._paymentMethod);
        const applePaySession = this._sessionFactory.create(request);

        this._handleApplePayEvents(applePaySession, this._paymentMethod, config);

        applePaySession.begin();
        this._hasApplePaySession = true;
    }

    private _getBaseRequest(
        cart: Cart,
        checkout: Checkout,
        config: StoreConfig,
        paymentMethod: PaymentMethod,
    ): ApplePayJS.ApplePayPaymentRequest {
        const {
            storeProfile: { storeCountryCode, storeName },
        } = config;
        const {
            currency: { code, decimalPlaces },
        } = cart;

        const {
            initializationData: { merchantCapabilities, supportedNetworks },
        } = paymentMethod;

        const requiresShipping = cart.lineItems.physicalItems.length > 0;
        const total: ApplePayJS.ApplePayLineItem = requiresShipping
            ? {
                  label: storeName,
                  amount: `${checkout.grandTotal.toFixed(decimalPlaces)}`,
                  type: 'pending',
              }
            : {
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
                {
                    label: this._subTotalLabel,
                    amount: `${checkout.subtotal.toFixed(decimalPlaces)}`,
                },
            ];

            checkout.taxes.forEach((tax) =>
                lineItems.push({
                    label: tax.name,
                    amount: `${tax.amount.toFixed(decimalPlaces)}`,
                }),
            );

            request.lineItems = lineItems;
        }

        return request;
    }

    private _handleApplePayEvents(
        applePaySession: ApplePaySession,
        paymentMethod: PaymentMethod,
        config: StoreConfig,
    ) {
        applePaySession.onvalidatemerchant = async (event) => {
            try {
                const { body: merchantSession } = await this._onValidateMerchant(
                    paymentMethod,
                    event,
                );

                applePaySession.completeMerchantValidation(merchantSession);
            } catch (err) {
                this._onError(err);
            }
        };

        applePaySession.onshippingcontactselected = async (event) =>
            this._handleShippingContactSelected(applePaySession, config, event);

        applePaySession.onshippingmethodselected = async (event) =>
            this._handleShippingMethodSelected(applePaySession, config, event);

        applePaySession.oncancel = async () => {
            this._hasApplePaySession = false;

            try {
                const url = `/remote-checkout/${paymentMethod.id}/signout`;

                await this._requestSender.get(url);

                return await this._paymentIntegrationService.loadCheckout();
            } catch (error) {
                return this._onError(new PaymentMethodCancelledError());
            }
        };

        applePaySession.onpaymentauthorized = async (event) =>
            this._onPaymentAuthorized(event, applePaySession, paymentMethod);
    }

    private async _handleShippingContactSelected(
        applePaySession: ApplePaySession,
        config: StoreConfig,
        event: ApplePayJS.ApplePayShippingContactSelectedEvent,
    ) {
        const shippingAddress = this._transformContactToAddress(event.shippingContact);

        try {
            await this._paymentIntegrationService.updateShippingAddress(shippingAddress);
        } catch (error) {
            applePaySession.abort();
            this._hasApplePaySession = false;

            return this._onError(error);
        }

        const {
            storeProfile: { storeName },
        } = config;
        let state = this._paymentIntegrationService.getState();
        const {
            currency: { decimalPlaces },
        } = state.getCartOrThrow();
        let checkout = state.getCheckoutOrThrow();
        const selectionShippingOptionId = checkout.consignments[0].selectedShippingOption?.id;
        const availableOptions = checkout.consignments[0].availableShippingOptions;
        const selectedOption = availableOptions?.find(({ id }) => id === selectionShippingOptionId);
        const unselectedOptions = availableOptions?.filter(
            (option) => option.id !== selectionShippingOptionId,
        );
        const shippingOptions: ApplePayJS.ApplePayShippingMethod[] = selectedOption
            ? [
                  {
                      label: selectedOption.description,
                      amount: `${selectedOption.cost.toFixed(decimalPlaces)}`,
                      detail: selectedOption.additionalDescription,
                      identifier: selectedOption.id,
                  },
              ]
            : [];

        if (unselectedOptions) {
            [
                ...unselectedOptions.filter((option) => option.isRecommended),
                ...unselectedOptions.filter((option) => !option.isRecommended),
            ].forEach((option) =>
                shippingOptions.push({
                    label: option.description,
                    amount: `${option.cost.toFixed(decimalPlaces)}`,
                    detail: option.additionalDescription,
                    identifier: option.id,
                }),
            );
        }

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
                [],
            );

            return;
        }

        const recommendedOption = availableOptions.find((option) => option.isRecommended);

        const optionId = recommendedOption ? recommendedOption.id : availableOptions[0].id;
        const selectedOptionId = selectedOption ? selectedOption.id : optionId;

        try {
            await this._updateShippingOption(selectedOptionId);
        } catch (error) {
            return this._onError(error);
        }

        state = this._paymentIntegrationService.getState();
        checkout = state.getCheckoutOrThrow();

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
        event: ApplePayJS.ApplePayShippingMethodSelectedEvent,
    ) {
        const {
            storeProfile: { storeName },
        } = config;
        const {
            shippingMethod: { identifier: optionId },
        } = event;

        try {
            await this._updateShippingOption(optionId);
        } catch (error) {
            applePaySession.abort();
            this._hasApplePaySession = false;

            return this._onError(error);
        }

        const state = this._paymentIntegrationService.getState();
        const {
            currency: { decimalPlaces },
        } = state.getCartOrThrow();
        const checkout = state.getCheckoutOrThrow();

        applePaySession.completeShippingMethodSelection({
            newTotal: {
                type: 'final',
                label: storeName,
                amount: `${checkout.grandTotal.toFixed(decimalPlaces)}`,
            },
            newLineItems: this._getUpdatedLineItems(checkout, decimalPlaces),
        });
    }

    private _getUpdatedLineItems(
        checkout: Checkout,
        decimalPlaces: number,
    ): ApplePayJS.ApplePayLineItem[] {
        const lineItems: ApplePayJS.ApplePayLineItem[] = [
            {
                label: this._subTotalLabel,
                amount: `${checkout.subtotal.toFixed(decimalPlaces)}`,
            },
        ];

        checkout.taxes.forEach((tax) =>
            lineItems.push({
                label: tax.name,
                amount: `${tax.amount.toFixed(decimalPlaces)}`,
            }),
        );
        lineItems.push({
            label: this._shippingLabel,
            amount: `${checkout.shippingCostTotal.toFixed(decimalPlaces)}`,
        });

        return lineItems;
    }

    private async _updateShippingOption(optionId: string) {
        return this._paymentIntegrationService.selectShippingOption(optionId);
    }

    private async _onValidateMerchant(
        paymentData: PaymentMethod,
        event: ApplePayJS.ApplePayValidateMerchantEvent,
    ) {
        const body = [
            `validationUrl=${event.validationURL}`,
            `merchantIdentifier=${paymentData.initializationData.merchantId}`,
            `displayName=${paymentData.initializationData.storeName}`,
            `domainName=${window.location.hostname}`,
        ].join('&');

        return this._requestSender.post(
            validationEndpoint(paymentData.initializationData.paymentsUrl),
            {
                credentials: false,
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-XSRF-TOKEN': null,
                },
                body,
            },
        );
    }

    private async _onPaymentAuthorized(
        event: ApplePayJS.ApplePayPaymentAuthorizedEvent,
        applePaySession: ApplePaySession,
        paymentMethod: PaymentMethod,
    ) {
        const { token, billingContact, shippingContact } = event.payment;
        const state = this._paymentIntegrationService.getState();
        const cart = state.getCartOrThrow();
        const requiresShipping = cart.lineItems.physicalItems.length > 0;

        let deviceSessionId: string | undefined;

        if (paymentMethod.initializationData?.gateway === ApplePayGatewayType.BRAINTREE) {
            deviceSessionId = await this._getBraintreeDeviceData();
        }

        const payment: Payment = {
            methodId: paymentMethod.id,
            paymentData: {
                deviceSessionId,
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
        const phone = shippingContact?.phoneNumber || '';

        try {
            await this._paymentIntegrationService.updateBillingAddress({
                ...transformedBillingAddress,
                email: emailAddress,
                phone,
            });

            if (requiresShipping) {
                await this._paymentIntegrationService.updateShippingAddress(
                    transformedShippingAddress,
                );
            }

            await this._paymentIntegrationService.submitOrder({
                useStoreCredit: false,
            });

            await this._paymentIntegrationService.submitPayment(payment);
            applePaySession.completePayment(ApplePaySession.STATUS_SUCCESS);

            return this._onAuthorizeCallback();
        } catch (error) {
            applePaySession.completePayment(ApplePaySession.STATUS_FAILURE);

            return this._onError(error);
        }
    }

    private _transformContactToAddress(
        contact?: ApplePayJS.ApplePayPaymentContact,
    ): AddressRequestBody {
        return {
            firstName: contact?.givenName || '',
            lastName: contact?.familyName || '',
            city: contact?.locality || '',
            company: '',
            address1: (contact?.addressLines && contact.addressLines[0]) || '',
            address2: (contact?.addressLines && contact.addressLines[1]) || '',
            postalCode: contact?.postalCode || '',
            countryCode: contact?.countryCode || '',
            phone: contact?.phoneNumber || '',
            stateOrProvince: contact?.administrativeArea || '',
            stateOrProvinceCode: contact?.administrativeArea || '',
            customFields: [],
        };
    }

    private async _getBraintreeDeviceData() {
        const braintreePaymentMethod = this._paymentIntegrationService
            .getState()
            .getPaymentMethod(ApplePayGatewayType.BRAINTREE);

        if (braintreePaymentMethod?.clientToken) {
            const data = await this._braintreeIntegrationService.getDataCollector();

            return data.deviceData;
        }
    }

    private async _initializeBraintreeIntegrationService() {
        try {
            await this._paymentIntegrationService.loadPaymentMethod(ApplePayGatewayType.BRAINTREE);

            const state = this._paymentIntegrationService.getState();

            const storeConfig = state.getStoreConfigOrThrow();

            const braintreePaymentMethod: PaymentMethod = state.getPaymentMethodOrThrow(
                ApplePayGatewayType.BRAINTREE,
            );

            if (!braintreePaymentMethod.clientToken || !braintreePaymentMethod.initializationData) {
                throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
            }

            this._braintreeIntegrationService.initialize(
                braintreePaymentMethod.clientToken,
                storeConfig,
            );
        } catch (_) {
            return noop();
        }
    }
}
