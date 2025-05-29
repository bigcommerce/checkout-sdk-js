import { round } from 'lodash';

import {
    CustomerInitializeOptions,
    CustomerStrategy,
    InvalidArgumentError,
    Payment,
    // MissingDataError,
    // MissingDataErrorType,
    PaymentIntegrationService,
    ShippingOption,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

// import { isStripeUPEPaymentMethodLike } from '../stripe-upe/is-stripe-upe-payment-method-like';
import { WithStripeUPECustomerInitializeOptions } from '../stripe-upe/stripeupe-customer-initialize-options';
import {
    StripeElementType,
    StripeLinkV2Client,
    StripeLinkV2Element,
    StripeLinkV2ElementCreateOptions,
    StripeLinkV2ElementEvent,
    StripeLinkV2Elements,
    StripeLinkV2Event,
    StripeLinkV2Options,
    StripeLinkV2ShippingRate,
    StripeStringConstants,
} from '../stripe-utils/stripe';
import StripeScriptLoader from '../stripe-utils/stripe-script-loader';

import { expressCheckoutAllowedCountryCodes } from './constants';

export default class StripeLinkV2CustomerStrategy implements CustomerStrategy {
    private _stripeLinkV2Client?: StripeLinkV2Client;
    private _stripeElements?: StripeLinkV2Elements;
    private _linkV2Element?: StripeLinkV2Element;

    private _stripePublishableKey: string | undefined;
    private _currencyCode: string | undefined;

    private _methodId = 'card';
    private _gatewayId = 'stripeupe';

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private scriptLoader: StripeScriptLoader,
    ) {}

    async initialize(
        options: CustomerInitializeOptions & WithStripeUPECustomerInitializeOptions,
    ): Promise<void> {
        if (!options.stripe_link_v2) {
            throw new InvalidArgumentError(
                `Unable to proceed because "options" argument is not provided.`,
            );
        }

        const { container, isLoading } = options.stripe_link_v2;

        Object.entries(options.stripe_link_v2).forEach(([key, value]) => {
            if (!value) {
                throw new InvalidArgumentError(
                    `Unable to proceed because "${key}" argument is not provided.`,
                );
            }
        });

        const stripePublishableKey = 'key';
        // TODO uncomment below lines on finalizing

        // const state = this.paymentIntegrationService.getState();
        // const paymentMethod = state.getPaymentMethodOrThrow(this._methodId, this._gatewayId);
        //
        // if (!isStripeUPEPaymentMethodLike(paymentMethod)) {
        //     throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        // }
        //
        // const {
        //     initializationData: { stripePublishableKey },
        // } = paymentMethod;

        // TODO remove mock below on finalizing
        this._stripePublishableKey = stripePublishableKey;

        this._stripeLinkV2Client = await this.scriptLoader.getStripeLinkV2Client(
            this._stripePublishableKey,
        );

        await this.mountExpressCheckoutElement(container, this._stripeLinkV2Client);

        if (isLoading) {
            isLoading(false);
        }

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

    private async mountExpressCheckoutElement(
        container: string,
        stripeExpressCheckoutClient: StripeLinkV2Client,
    ) {
        const shouldRequireShippingAddress = this.shouldRequireShippingAddress();
        const expressCheckoutOptions: StripeLinkV2ElementCreateOptions = {
            shippingAddressRequired: shouldRequireShippingAddress,
            ...(shouldRequireShippingAddress
                ? { allowedShippingCountries: await this.getAvailableCountries() }
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
            buttonHeight: 40,
        };

        const { cartAmount } = this.paymentIntegrationService.getState().getCartOrThrow();

        const elementsOptions: StripeLinkV2Options = {
            mode: 'payment',
            amount: this.toCents(cartAmount),
            currency: this.getCurrency(),
        };

        this._stripeElements = stripeExpressCheckoutClient.elements(elementsOptions);

        this._linkV2Element = this._stripeElements.create(
            StripeElementType.EXPRESS_CHECKOUT,
            expressCheckoutOptions,
        );
        this._linkV2Element.mount(`#${container}`);
        this.initializeEvents(this._linkV2Element);
    }

    /** Events * */

    private initializeEvents(expressCheckoutElement: StripeLinkV2Element): void {
        const shouldRequireShippingAddress = this.shouldRequireShippingAddress();

        if (shouldRequireShippingAddress) {
            expressCheckoutElement.on(
                StripeLinkV2ElementEvent.SHIPPING_ADDRESS_CHANGE,
                async (event) => this.onShippingAddressChange(event),
            );
            expressCheckoutElement.on(
                StripeLinkV2ElementEvent.SHIPPING_RATE_CHANGE,
                async (event) => this.onShippingRateChange(event),
            );
        }

        expressCheckoutElement.on(StripeLinkV2ElementEvent.CONFIRM, async (event) =>
            this.onConfirm(event),
        );
    }

    private async onShippingAddressChange(event: StripeLinkV2Event) {
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

        const shippingRates = await this.getAvailableShippingOptions();

        await this.updateDisplayedPrice();

        event.resolve({
            shippingRates,
        });
    }

    private async onShippingRateChange(event: StripeLinkV2Event) {
        const { shippingRate } = event;

        await this.handleShippingOptionChange(shippingRate?.id);

        await this.updateDisplayedPrice();

        event.resolve({});
    }

    /** Confirm methods * */

    private async onConfirm(event: StripeLinkV2Event) {
        if (!this._methodId) {
            return event.resolve({});
        }

        const state = this.paymentIntegrationService.getState();

        const { clientToken } = state.getPaymentMethodOrThrow(this._methodId, this._gatewayId);
        const paymentPayload = this._getPaymentPayload(this._methodId, clientToken || '');

        await this.paymentIntegrationService.submitPayment(paymentPayload);

        if (this._stripeLinkV2Client && this._stripeElements) {
            await this._stripeLinkV2Client.confirmPayment({
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

    private shouldRequireShippingAddress() {
        const { getCartOrThrow } = this.paymentIntegrationService.getState();
        const { lineItems } = getCartOrThrow();

        return !!lineItems.physicalItems.length;
    }

    private async updateDisplayedPrice() {
        if (this._stripeElements) {
            this._stripeElements.update({
                currency: this.getCurrency(),
                mode: 'payment',
                amount: await this.getTotalPrice(),
            });
        }
    }

    private getCurrency() {
        if (!this._currencyCode) {
            const { code: currencyCode } = this.paymentIntegrationService
                .getState()
                .getCartOrThrow().currency;

            this._currencyCode = currencyCode.toLowerCase();
        }

        return this._currencyCode;
    }

    private async getTotalPrice(): Promise<number> {
        await this.paymentIntegrationService.loadCheckout();

        const { getCheckoutOrThrow, getCartOrThrow } = this.paymentIntegrationService.getState();
        const { decimalPlaces } = getCartOrThrow().currency;
        const totalPrice = round(getCheckoutOrThrow().outstandingBalance, decimalPlaces).toFixed(
            decimalPlaces,
        );

        return this.toCents(+totalPrice);
    }

    private async getAvailableCountries(): Promise<string[]> {
        const countries = await this.paymentIntegrationService.loadShippingCountries();
        const deliverableCountries =
            countries.getShippingCountries()?.map((country) => country.code) || [];

        return deliverableCountries?.filter((code) => {
            return expressCheckoutAllowedCountryCodes.includes(code);
        });
    }

    private async getAvailableShippingOptions(): Promise<StripeLinkV2ShippingRate[] | undefined> {
        const state = this.paymentIntegrationService.getState();
        const consignments = state.getConsignments();

        if (!consignments?.[0]) {
            // Info: we can not return an empty data because shippingOptions should contain at least one element, it caused a developer exception
            return;
        }

        const consignment = consignments[0];
        const options = (consignment.availableShippingOptions || []).map(
            this.getStripeShippingOption.bind(this),
        );

        const selectedId = consignment.selectedShippingOption?.id ?? null;

        if (!options) {
            return;
        }

        if (!selectedId) {
            await this.handleShippingOptionChange(options[0]?.id);
        } else {
            // Set selected shipping option first in the array, as it will be selected by default
            options.sort((option) => (option.id === selectedId ? -1 : 0));
        }

        return options;
    }

    private getStripeShippingOption({ id, cost, description }: ShippingOption) {
        return {
            id,
            displayName: description,
            amount: this.toCents(cost),
        };
    }

    private async handleShippingOptionChange(optionId?: string) {
        if (!optionId || optionId === 'shipping_option_unselected') {
            return;
        }

        return this.paymentIntegrationService.selectShippingOption(optionId);
    }

    private toCents(amount: number) {
        return Math.round(amount * 100);
    }
}
