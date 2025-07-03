import { round } from 'lodash';

import {
    AmountTransformer,
    CustomerInitializeOptions,
    CustomerStrategy,
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    NotInitializedError,
    NotInitializedErrorType,
    Payment,
    PaymentIntegrationService,
    ShippingOption,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

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

    // We'll keep it hardcoded for now as it will be finalized together with onConfirm method
    private _methodId = 'optimized_checkout';
    private _gatewayId = 'stripeocs';

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private scriptLoader: StripeScriptLoader,
    ) {}

    async initialize(
        options: CustomerInitializeOptions & WithStripeOCSCustomerInitializeOptions,
    ): Promise<void> {
        const { stripeocs } = options || {};

        if (!stripeocs) {
            throw new InvalidArgumentError(
                `Unable to proceed because "options" argument is not provided.`,
            );
        }

        if (!stripeocs.container) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        const state = await this.paymentIntegrationService.loadPaymentMethod(this._gatewayId, {
            params: { method: this._methodId },
        });
        const paymentMethod = state.getPaymentMethodOrThrow(this._gatewayId);
        const { container, buttonHeight } = stripeocs;

        if (!isStripePaymentMethodLike(paymentMethod)) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const { initializationData } = paymentMethod;
        const { stripePublishableKey } = initializationData;

        this._stripePublishableKey = stripePublishableKey;

        this._stripeClient = await this.scriptLoader.getStripeClient(initializationData);

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
        if ('resolve' in event) {
            if (!this._methodId) {
                return event.resolve({});
            }

            const state = this.paymentIntegrationService.getState();

            const { clientToken } = state.getPaymentMethodOrThrow(this._methodId, this._gatewayId);
            const paymentPayload = this._getPaymentPayload(this._methodId, clientToken || '');

            await this.paymentIntegrationService.submitPayment(paymentPayload);

            if (this._stripeClient && this._stripeElements) {
                await this._stripeClient.confirmPayment({
                    // `elements` instance used to create the Express Checkout Element
                    elements: this._stripeElements,
                    // `clientSecret` from the created PaymentIntent
                    clientSecret: this._stripePublishableKey,
                    // TODO update example below
                    confirmParams: {
                        return_url: 'https://example.com/order/123/complete',
                    },
                });
            }

            // const {error} = await stripe.confirmPayment({
            //     // `elements` instance used to create the Express Checkout Element
            //     elements,
            //     // `clientSecret` from the created PaymentIntent
            //     clientSecret,
            //     confirmParams: {
            //         return_url: 'https://example.com/order/123/complete',
            //     },
            // });
            // await this.paymentIntegrationService.submitOrder(order, options);
            // await this.paymentIntegrationService.submitPayment(paymentPayload);
            //
            // const {error: submitError} = await elements.submit();
            event.resolve({});
        }
    }

    private _getPaymentPayload(methodId: string, token: string): Payment {
        const cartId = this.paymentIntegrationService.getState().getCart()?.id || '';
        const formattedPayload = {
            cart_id: cartId,
            credit_card_token: { token },
            confirm: false,
            payment_method_id: this._methodId,
        };

        return {
            methodId,
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
