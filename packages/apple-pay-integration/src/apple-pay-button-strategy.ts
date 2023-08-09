import { RequestSender } from '@bigcommerce/request-sender';
import { noop } from 'lodash';

import {
    AddressRequestBody,
    BuyNowCartCreationError,
    Cart,
    Checkout,
    CheckoutButtonInitializeOptions,
    CheckoutButtonStrategy,
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    Payment,
    PaymentIntegrationService,
    PaymentMethod,
    PaymentMethodCancelledError,
    ShippingOption,
    StoreConfig,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import ApplePayButtonInitializeOptions, {
    WithApplePayButtonInitializeOptions,
} from './apple-pay-button-initialize-options';
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

export default class ApplePayButtonStrategy implements CheckoutButtonStrategy {
    private _paymentMethod?: PaymentMethod;
    private _applePayButton?: HTMLElement;
    private _requiresShipping?: boolean;
    private _buyNowInitializeOptions?: ApplePayButtonInitializeOptions['buyNowInitializeOptions'];
    private _onAuthorizeCallback = noop;
    private _subTotalLabel: string = DefaultLabels.Subtotal;
    private _shippingLabel: string = DefaultLabels.Shipping;

    constructor(
        private _requestSender: RequestSender,
        private _paymentIntegrationService: PaymentIntegrationService,
        private _sessionFactory: ApplePaySessionFactory,
    ) {}

    async initialize(
        options: CheckoutButtonInitializeOptions & WithApplePayButtonInitializeOptions,
    ): Promise<void> {
        const { methodId, containerId, applepay } = options;

        assertApplePayWindow(window);

        if (!methodId || !applepay) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const { buttonClassName, onPaymentAuthorize, buyNowInitializeOptions, requiresShipping } =
            applepay;

        this._requiresShipping = requiresShipping;

        this._buyNowInitializeOptions = buyNowInitializeOptions;

        this._onAuthorizeCallback = onPaymentAuthorize;

        if (!buyNowInitializeOptions) {
            await this._paymentIntegrationService.loadDefaultCheckout();
        }

        await this._paymentIntegrationService.loadPaymentMethod(methodId);

        const state = this._paymentIntegrationService.getState();

        console.log('BEFORE PAYMENT METHOD');

        this._paymentMethod = state.getPaymentMethodOrThrow(methodId);

        console.log('CONFIG', state.getStoreConfigOrThrow());
        console.log('PAYMENT METHOD', this._paymentMethod);

        console.log('AFTER PAYMENT METHOD');

        // await this._paymentIntegrationService.verifyCheckoutSpamProtection();

        this._applePayButton = this._createButton(containerId, buttonClassName);
        this._applePayButton.addEventListener('click', this._handleWalletButtonClick.bind(this));

        return Promise.resolve();
    }

    deinitialize(): Promise<void> {
        return Promise.resolve();
    }

    private _createButton(
        containerId: string,
        buttonClassName = 'apple-pay-checkout-button',
    ): HTMLElement {
        const container = document.getElementById(containerId);

        if (!container) {
            throw new InvalidArgumentError(
                'Unable to create wallet button without valid container ID.',
            );
        }

        document.body.classList.add('apple-pay-supported');

        const button = document.createElement('div');

        button.setAttribute('class', buttonClassName);
        button.setAttribute('role', 'button');
        button.setAttribute('aria-label', 'Apple Pay button');
        container.appendChild(button);

        return button;
    }

    private async _handleWalletButtonClick(event: Event) {
        event.preventDefault();

        if (!this._paymentMethod || !this._paymentMethod.initializationData) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        if (
            this._buyNowInitializeOptions &&
            typeof this._buyNowInitializeOptions.getBuyNowCartRequestBody === 'function'
        ) {
            const {
                countryCode,
                currencyCode,
                merchantCapabilities,
                supportedNetworks,
                storeName,
            } = this._paymentMethod.initializationData;

            const request = this._getRequestWithEmptyTotal(
                countryCode,
                currencyCode,
                supportedNetworks,
                merchantCapabilities,
            );

            if (this._requiresShipping) {
                request.requiredShippingContactFields?.push('postalAddress');
            }

            const applePaySession = this._sessionFactory.create(request);

            this._handleApplePayEvents(applePaySession, this._paymentMethod, storeName);

            applePaySession.begin();
        } else {
            const state = this._paymentIntegrationService.getState();
            const cart = state.getCartOrThrow();
            const config = state.getStoreConfigOrThrow();
            const checkout = state.getCheckoutOrThrow();
            const request = this._getBaseRequest(cart, checkout, config, this._paymentMethod);
            const applePaySession = this._sessionFactory.create(request);

            this._handleApplePayEvents(
                applePaySession,
                this._paymentMethod,
                config.storeProfile.storeName,
            );

            applePaySession.begin();
        }
    }

    private _getRequestWithEmptyTotal(
        countryCode: string,
        currencyCode: string,
        supportedNetworks: string[],
        merchantCapabilities: ApplePayJS.ApplePayMerchantCapability[],
    ): ApplePayJS.ApplePayPaymentRequest {
        return {
            countryCode,
            currencyCode,
            supportedNetworks,
            merchantCapabilities,
            total: { label: '', amount: '0', type: 'pending' },
            requiredBillingContactFields: ['postalAddress'],
            requiredShippingContactFields: ['email', 'phone'],
        };
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
        storeName: string,
    ) {
        applePaySession.onvalidatemerchant = async (event) => {
            try {
                const { body: merchantSession } = await this._onValidateMerchant(
                    paymentMethod,
                    event,
                );

                applePaySession.completeMerchantValidation(merchantSession);
            } catch (error) {
                throw new Error('Merchant validation failed');
            }
        };

        if (this._buyNowInitializeOptions && !this._requiresShipping) {
            applePaySession.onpaymentmethodselected = async () => {
                await this._createBuyNowCart();
                this._handlePaymentMethodSelected(applePaySession);
            };
        }

        applePaySession.onshippingcontactselected = async (event) => {
            if (this._buyNowInitializeOptions && this._requiresShipping) {
                await this._createBuyNowCart();
            }

            await this._handleShippingContactSelected(applePaySession, storeName, event);
        };

        applePaySession.onshippingmethodselected = async (event) => {
            await this._handleShippingMethodSelected(applePaySession, storeName, event);
        };

        applePaySession.oncancel = async () => {
            try {
                const url = `/remote-checkout/${paymentMethod.id}/signout`;

                await this._requestSender.get(url);

                return await this._paymentIntegrationService.loadCheckout();
            } catch (error) {
                throw new PaymentMethodCancelledError();
            }
        };

        applePaySession.onpaymentauthorized = async (event) =>
            this._onPaymentAuthorized(event, applePaySession, paymentMethod);
    }

    private async _createBuyNowCart() {
        try {
            const cartRequestBody = this._buyNowInitializeOptions?.getBuyNowCartRequestBody?.();

            if (!cartRequestBody) {
                throw new MissingDataError(MissingDataErrorType.MissingCart);
            }

            const buyNowCart = await this._paymentIntegrationService.createBuyNowCart(
                cartRequestBody,
            );

            await this._paymentIntegrationService.loadCheckout(buyNowCart.id);
        } catch (error) {
            throw new BuyNowCartCreationError();
        }
    }

    private _handlePaymentMethodSelected(applePaySession: ApplePaySession) {
        const state = this._paymentIntegrationService.getState();
        const cart = state.getCartOrThrow();
        const config = state.getStoreConfigOrThrow();
        const checkout = state.getCheckoutOrThrow();

        if (!this._paymentMethod || !this._paymentMethod.initializationData) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const request = this._getBaseRequest(cart, checkout, config, this._paymentMethod);

        delete request.total.type;

        applePaySession.completePaymentMethodSelection({
            newTotal: request.total,
            newLineItems: request.lineItems,
        });
    }

    private async _handleShippingContactSelected(
        applePaySession: ApplePaySession,
        storeName: string,
        event: ApplePayJS.ApplePayShippingContactSelectedEvent,
    ) {
        const shippingAddress = this._transformContactToAddress(event.shippingContact);

        try {
            await this._paymentIntegrationService.updateShippingAddress(shippingAddress);
        } catch (error) {
            applePaySession.abort();

            throw new Error('Shipping address update failed');
        }

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
            throw new Error('Shipping options update failed');
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
        storeName: string,
        event: ApplePayJS.ApplePayShippingMethodSelectedEvent,
    ) {
        const {
            shippingMethod: { identifier: optionId },
        } = event;

        try {
            await this._updateShippingOption(optionId);
        } catch (error) {
            applePaySession.abort();

            throw new Error('Shipping option selection update failed.');
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

            throw new Error('Payment cannot complete');
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
}
