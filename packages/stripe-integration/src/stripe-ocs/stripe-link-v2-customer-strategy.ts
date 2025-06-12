import { round } from 'lodash';

import {
    AmountTransformer,
    CustomerInitializeOptions,
    CustomerStrategy,
    InvalidArgumentError,
    isRequestError,
    MissingDataError,
    MissingDataErrorType,
    NotInitializedError,
    NotInitializedErrorType,
    Payment,
    PaymentIntegrationSelectors,
    PaymentIntegrationService,
    PaymentMethodFailedError,
    ShippingOption,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import {
    StripeAdditionalActionRequired,
    StripeError,
    StripeIntegrationService,
    StripeResult,
} from '../stripe-utils';
import { isStripePaymentMethodLike } from '../stripe-utils/is-stripe-payment-method-like';
import {
    StripeClient,
    StripeElement,
    StripeElementEvent,
    StripeElements,
    StripeElementsCreateOptions,
    StripeElementType,
    StripeEventType,
    StripeStringConstants,
} from '../stripe-utils/stripe';
import StripeScriptLoader from '../stripe-utils/stripe-script-loader';

import { expressCheckoutAllowedCountryCodes } from './constants';
import { StripeLinkV2Options, StripeLinkV2ShippingRate } from './stripe-ocs';
import { WithStripeOCSCustomerInitializeOptions } from './stripe-ocs-customer-initialize-options';

export default class StripeLinkV2CustomerStrategy implements CustomerStrategy {
    private _stripeClient?: StripeClient;
    private _stripeElements?: StripeElements;
    private _linkV2Element?: StripeElement;
    private _amountTransformer?: AmountTransformer;

    private _stripePublishableKey?: string;
    private _currencyCode?: string;

    // TODO We'll keep it hardcoded for now as it will be finalized together with onConfirm method
    private _methodId = 'optimized_checkout';
    private _gatewayId = 'stripeocs';

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private scriptLoader: StripeScriptLoader,
        private stripeUPEIntegrationService: StripeIntegrationService,
    ) {}

    async initialize(
        options: CustomerInitializeOptions & WithStripeOCSCustomerInitializeOptions,
    ): Promise<void> {
        console.log('initialize Link V2 [TEST]');
        const { stripeocs } = options || {};

        if (!stripeocs) {
            throw new InvalidArgumentError(
                `Unable to proceed because "options" argument is not provided.`,
            );
        }

        if (!stripeocs.container) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        const { container, buttonHeight } = stripeocs;
        const state = await this.paymentIntegrationService.loadPaymentMethod(this._gatewayId, {
            params: { method: this._methodId, link: 1 },
        });
        const paymentMethod = state.getPaymentMethodOrThrow(this._gatewayId);

        if (!isStripePaymentMethodLike(paymentMethod)) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const { initializationData } = paymentMethod;
        const { stripePublishableKey } = initializationData;

        this._stripePublishableKey = stripePublishableKey;

        this._stripeClient = await this.scriptLoader.getStripeClient(
            this._stripePublishableKey,
            undefined,
            undefined,
            {},
        );

        await this._mountExpressCheckoutElement(container, this._stripeClient, buttonHeight);

        return Promise.resolve();
    }

    signIn() {
        return Promise.resolve();
    }

    signOut() {
        return Promise.resolve();
    }

    executePaymentMethodCheckout() {
        return Promise.resolve();
    }

    deinitialize(): Promise<void> {
        return Promise.resolve();
    }

    private async _mountExpressCheckoutElement(
        container: string,
        stripeExpressCheckoutClient: StripeClient,
        buttonHeight = 40,
    ) {
        const shouldRequireShippingAddress = this._shouldRequireShippingAddress();
        const expressCheckoutOptions: StripeElementsCreateOptions = {
            shippingAddressRequired: shouldRequireShippingAddress,
            ...(shouldRequireShippingAddress
                ? { allowedShippingCountries: await this._getAvailableCountries() }
                : {}),
            ...(shouldRequireShippingAddress
                ? { shippingRates: [{ id: '_', amount: 0, displayName: 'Pending rates' }] }
                : {}),
            billingAddressRequired: true,
            emailRequired: true,
            phoneNumberRequired: true,
            paymentMethods: {
                link: StripeStringConstants.AUTO,
                applePay: StripeStringConstants.NEVER,
                googlePay: StripeStringConstants.NEVER,
                amazonPay: StripeStringConstants.NEVER,
                paypal: StripeStringConstants.NEVER,
            },
            // Minimal buttonHeight value is 40
            buttonHeight,
            automatic_payment_methods: {
                enabled: true,
            },
        };

        const { cartAmount } = this.paymentIntegrationService.getState().getCartOrThrow();

        const elementsOptions: StripeLinkV2Options = {
            mode: 'payment',
            amount: this._toCents(cartAmount),
            currency: this._getCurrency(),
        };

        this._stripeElements = stripeExpressCheckoutClient.elements(elementsOptions);

        this._linkV2Element = this._stripeElements.create(
            StripeElementType.EXPRESS_CHECKOUT,
            expressCheckoutOptions,
        );
        this._linkV2Element.mount(`#${container}`);
        this._initializeEvents(this._linkV2Element);
    }

    /** Events * */

    private _initializeEvents(expressCheckoutElement: StripeElement): void {
        const shouldRequireShippingAddress = this._shouldRequireShippingAddress();

        if (shouldRequireShippingAddress) {
            expressCheckoutElement.on(StripeElementEvent.SHIPPING_ADDRESS_CHANGE, async (event) =>
                this._onShippingAddressChange(event),
            );
            expressCheckoutElement.on(StripeElementEvent.SHIPPING_RATE_CHANGE, async (event) =>
                this._onShippingRateChange(event),
            );
        }

        expressCheckoutElement.on(StripeElementEvent.CONFIRM, async (event) =>
            this._onConfirm(event),
        );
    }

    private async _onShippingAddressChange(event: StripeEventType) {
        if ('address' in event) {
            const shippingAddress = event.address;
            // Depending on the country, some fields can be missing or partially redacted.
            // For example, the shipping address in the US can only contain a city, state, and ZIP code.
            // The full shipping address appears in the confirm event object after the purchase is confirmed in the browser’s payment interface.
            const result = {
                firstName: '',
                lastName: '',
                phone: '',
                company: '',
                address1: '',
                address2: '',
                city: shippingAddress?.city || '',
                countryCode: shippingAddress?.country || '',
                postalCode: shippingAddress?.postal_code || '',
                stateOrProvince: shippingAddress?.state || '',
                stateOrProvinceCode: '',
                customFields: [],
            };

            await this.paymentIntegrationService.updateShippingAddress(result);

            const shippingRates = await this._getAvailableShippingOptions();

            await this._updateDisplayedPrice();

            event.resolve({
                shippingRates,
            });
        }
    }

    private async _onShippingRateChange(event: StripeEventType) {
        if ('shippingRate' in event) {
            const { shippingRate } = event;

            await this._handleShippingOptionChange(shippingRate?.id);

            await this._updateDisplayedPrice();

            event.resolve({});
        }
    }

    /** Confirm methods * */

    private async _onConfirm(event: StripeEventType) {
        const shouldRequireShippingAddress = this._shouldRequireShippingAddress();

        if (
            'billingDetails' in event &&
            'shippingAddress' in event &&
            this._stripeClient &&
            this._stripeElements
        ) {
            const firstName = event.shippingAddress?.name?.split(' ')[0] || event.billingDetails?.name?.split(' ')[0] || '';
            const lastName = event.shippingAddress?.name?.split(' ')[1] || event.billingDetails?.name?.split(' ')[1] || '';

            if (shouldRequireShippingAddress) {
                const shippingAddress = {
                    firstName,
                    lastName,
                    phone: event.billingDetails?.phone || '',
                    company: '',
                    address1: event.shippingAddress?.address?.line1 || '',
                    address2: event.shippingAddress?.address?.line2 || '',
                    city: event.shippingAddress?.address?.city || '',
                    countryCode: event.shippingAddress?.address?.country || '',
                    postalCode: event.shippingAddress?.address?.postal_code || '',
                    stateOrProvince: event.shippingAddress?.address?.state || '',
                    stateOrProvinceCode: event.shippingAddress?.address?.state || '',
                    customFields: [],
                };

                await this.paymentIntegrationService.updateShippingAddress(shippingAddress);
            }

            await this.paymentIntegrationService.updateBillingAddress({
                email: event.billingDetails?.email || '',
                firstName,
                lastName,
                phone: event.billingDetails?.phone || '',
                company: '',
                address1: event.billingDetails?.address?.line1 || '',
                address2: '',
                city: event.billingDetails?.address?.city || '',
                countryCode: event.billingDetails?.address?.country || '',
                postalCode: event.billingDetails?.address?.postal_code || '',
                stateOrProvince: event.billingDetails?.address?.state || '',
                stateOrProvinceCode: event.shippingAddress?.address?.state || '',
                customFields: [],
            });

            await this.paymentIntegrationService.submitOrder();

            const state = await this.paymentIntegrationService.loadPaymentMethod(this._gatewayId, {
                params: { method: this._methodId, link: 1 },
            });

            const { clientToken } = state.getPaymentMethodOrThrow(this._methodId, this._gatewayId);

            if (!clientToken) {
                throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
            }

            const paymentMethod = this._getPaymentPayload(clientToken || '');

            try {
                await this.paymentIntegrationService.submitPayment(paymentMethod);
            } catch (error) {
                await this._processAdditionalAction(error, this._methodId);
            }
        }

        return Promise.resolve();
    }

    private async _processAdditionalAction(
        error: unknown,
        methodId: string,
    ): Promise<PaymentIntegrationSelectors | undefined> {
        if (
            !isRequestError(error) ||
            !this.stripeUPEIntegrationService.isAdditionalActionError(error.body.errors)
        ) {
            throw error;
        }

        if (!this._stripeClient || !this._stripeElements) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        const { data: additionalActionData } = error.body.additional_action_required;
        const { token } = additionalActionData;

        const { paymentIntent } = await this._confirmStripePaymentOrThrow(
            methodId,
            additionalActionData,
        );

        const paymentPayload = this._getPaymentPayload(paymentIntent?.id || token);

        try {
            return await this.paymentIntegrationService.submitPayment(paymentPayload);
        } catch (error) {
            this.stripeUPEIntegrationService.throwPaymentConfirmationProceedMessage();
        }
    }

    private async _confirmStripePaymentOrThrow(
        methodId: string,
        additionalActionData: StripeAdditionalActionRequired['data'],
    ): Promise<StripeResult | never> {
        const { token, redirect_url } = additionalActionData;
        const stripePaymentData = this.stripeUPEIntegrationService.mapStripePaymentData(
            this._stripeElements,
            redirect_url,
        );
        let stripeError: StripeError | undefined;

        try {
            const isPaymentCompleted = await this.stripeUPEIntegrationService.isPaymentCompleted(
                methodId,
                this._stripeClient,
            );

            const confirmationResult = !isPaymentCompleted
                ? await this._stripeClient?.confirmPayment({
                    elements: stripePaymentData.elements,
                    clientSecret: token,
                    redirect: StripeStringConstants.ALWAYS,
                    confirmParams: {
                        return_url: stripePaymentData.confirmParams?.return_url,
                    }
                })
                : await this._stripeClient?.retrievePaymentIntent(token || '');

            stripeError = confirmationResult?.error;

            if (stripeError || !confirmationResult?.paymentIntent) {
                throw new PaymentMethodFailedError();
            }

            return confirmationResult;
        } catch (error: unknown) {
            return this.stripeUPEIntegrationService.throwStripeError(stripeError);
        }
    }

    private _getPaymentPayload(token: string): Payment {
        const cartId = this.paymentIntegrationService.getState().getCart()?.id || '';
        const formattedPayload = {
            cart_id: cartId,
            credit_card_token: { token },
            confirm: false,
            payment_method_id: 'link',
        };

        return {
            methodId: this._methodId,
            paymentData: {
                formattedPayload,
            },
        };
    }

    /** Utils * */

    private _shouldRequireShippingAddress() {
        const { getCartOrThrow } = this.paymentIntegrationService.getState();
        const { lineItems } = getCartOrThrow();

        return !!lineItems.physicalItems.length;
    }

    private async _updateDisplayedPrice() {
        if (this._stripeElements) {
            this._stripeElements.update({
                currency: this._getCurrency(),
                mode: 'payment',
                amount: await this._getTotalPrice(),
            });
        }
    }

    private _getCurrency() {
        if (!this._currencyCode) {
            const { code: currencyCode } = this.paymentIntegrationService
                .getState()
                .getCartOrThrow().currency;

            this._currencyCode = currencyCode.toLowerCase();
        }

        return this._currencyCode;
    }

    private async _getTotalPrice(): Promise<number> {
        await this.paymentIntegrationService.loadCheckout();

        const { getCheckoutOrThrow, getCartOrThrow } = this.paymentIntegrationService.getState();
        const { decimalPlaces } = getCartOrThrow().currency;
        const totalPrice = round(getCheckoutOrThrow().outstandingBalance, decimalPlaces).toFixed(
            decimalPlaces,
        );

        return this._toCents(+totalPrice);
    }

    private async _getAvailableCountries(): Promise<string[]> {
        const countries = await this.paymentIntegrationService.loadShippingCountries();
        const deliverableCountries =
            countries.getShippingCountries()?.map((country) => country.code) || [];

        return deliverableCountries.filter((code) => {
            return expressCheckoutAllowedCountryCodes.includes(code);
        });
    }

    private async _getAvailableShippingOptions(): Promise<StripeLinkV2ShippingRate[] | undefined> {
        const state = this.paymentIntegrationService.getState();
        const consignments = state.getConsignments();

        if (!consignments?.[0]) {
            return;
        }

        const consignment = consignments[0];
        const options = (consignment.availableShippingOptions || []).map(
            this._getStripeShippingOption.bind(this),
        );

        const selectedId = consignment.selectedShippingOption?.id;

        if (!options) {
            return;
        }

        if (!selectedId) {
            await this._handleShippingOptionChange(options[0]?.id);
        } else {
            // Set selected shipping option first in the array, as it will be selected by default
            options.sort((option) => (option.id === selectedId ? -1 : 0));
        }

        return options;
    }

    private _getStripeShippingOption({ id, cost, description }: ShippingOption) {
        return {
            id,
            displayName: description,
            amount: this._toCents(cost),
        };
    }

    private async _handleShippingOptionChange(optionId?: string) {
        if (!optionId || optionId === 'shipping_option_unselected') {
            return;
        }

        return this.paymentIntegrationService.selectShippingOption(optionId);
    }

    private _getAmountTransformer() {
        if (this._amountTransformer) {
            return this._amountTransformer;
        }

        const { getCart } = this.paymentIntegrationService.getState();
        const { currency } = getCart() || {};

        if (currency) {
            const amountTransformer = new AmountTransformer(currency.decimalPlaces);

            return amountTransformer;
        }
    }

    private _toCents(amount: number) {
        const fallbackValue = Math.round(amount * 100);
        const amountTransformer = this._getAmountTransformer();

        if (amountTransformer) {
            return amountTransformer.toInteger(amount);
        }

        return fallbackValue;
    }
}
