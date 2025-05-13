import { round } from 'lodash';

import {
    createCurrencyService,
    CurrencyService,
    CustomerInitializeOptions,
    CustomerStrategy,
    Payment,
    InvalidArgumentError,
    // MissingDataError,
    // MissingDataErrorType,
    PaymentIntegrationService,
    ShippingOption,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

// import { isStripeUPEPaymentMethodLike } from '../stripe-upe/is-stripe-upe-payment-method-like';
import { StripeElementType, StripeStringConstants } from '../stripe-upe/stripe-upe';
import StripeUPEScriptLoader from '../stripe-upe/stripe-upe-script-loader';
import { WithStripeUPECustomerInitializeOptions } from '../stripe-upe/stripeupe-customer-initialize-options';

import {
    StripeExpressCheckoutClient,
    StripeExpressCheckoutElement,
    StripeExpressCheckoutElementCreateOptions,
    StripeExpressCheckoutElements,
    StripeExpressCheckoutOptions,
    StripeLinkV2Event,
    StripeLinkV2ShippingRate,
} from './types';

export default class StripeLinkV2CustomerStrategy implements CustomerStrategy {
    private _stripeExpressCheckoutClient?: StripeExpressCheckoutClient;
    private _stripeElements?: StripeExpressCheckoutElements;
    private _expressCheckoutElement?: StripeExpressCheckoutElement;

    private _currencyService?: CurrencyService;
    private _stripePublishableKey: string | undefined;
    private _currencyCode: string | undefined;

    private _methodId = 'card';
    private _gatewayId = 'stripeupe';

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private scriptLoader: StripeUPEScriptLoader,
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

        const state = this.paymentIntegrationService.getState();

        console.log(state);

        const stripePublishableKey = undefined;
        // TODO uncomment below lines on finalizing
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
        this._stripePublishableKey =
            stripePublishableKey || 'pk_test_iyRKkVUt0YWpJ3Lq7mfsw3VW008KiFDH4s';

        this._stripeExpressCheckoutClient = await this.scriptLoader.getStripeLinkV2Client(
            this._stripePublishableKey,
        );

        this.mountExpressCheckoutElement(container, this._stripeExpressCheckoutClient);

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

    private mountExpressCheckoutElement(
        container: string,
        stripeExpressCheckoutClient: StripeExpressCheckoutClient,
    ) {
        const expressCheckoutOptions: StripeExpressCheckoutElementCreateOptions = {
            paymentMethods: {
                link: StripeStringConstants.AUTO,
                applePay: StripeStringConstants.NEVER,
                googlePay: StripeStringConstants.NEVER,
                amazonPay: StripeStringConstants.NEVER,
                paypal: StripeStringConstants.NEVER,
            },
            buttonHeight: 40,
        };

        const { cartAmount } = this.paymentIntegrationService.getState().getCartOrThrow();

        const elementsOptions: StripeExpressCheckoutOptions = {
            mode: 'payment',
            amount: this.toCents(cartAmount),
            currency: this.getCurrency(),
        };

        this._stripeElements = stripeExpressCheckoutClient.elements(elementsOptions);

        this._expressCheckoutElement = this._stripeElements.create(
            StripeElementType.EXPRESS_CHECKOUT,
            expressCheckoutOptions,
        );
        this._expressCheckoutElement.mount(`#${container}`);
        this.initializeEvents(this._expressCheckoutElement);
    }

    /** Events * */

    private initializeEvents(expressCheckoutElement: StripeExpressCheckoutElement): void {
        expressCheckoutElement.on('click', async (event) => this.onClick(event));
        expressCheckoutElement.on('shippingaddresschange', async (event) =>
            this.onShippingAddressChange(event),
        );
        expressCheckoutElement.on('shippingratechange', async (event) =>
            this.onShippingRateChange(event),
        );
        expressCheckoutElement.on('confirm', async (event) => this.onConfirm(event));
    }

    private async onClick(event: StripeLinkV2Event) {
        const countries = await this.paymentIntegrationService.loadShippingCountries();
        const allowedShippingCountries = countries
            .getShippingCountries()
            ?.map((country) => country.code);

        event.resolve({
            allowedShippingCountries,
            shippingAddressRequired: true,
            shippingRates: [{ id: '_', amount: 0, displayName: 'Pending rates' }],
            billingAddressRequired: true,
            emailRequired: true,
            phoneNumberRequired: true,
        });
    }

    private async onShippingAddressChange(event: StripeLinkV2Event) {
        const shippingAddress = event.address;
        const result = {
            firstName: '',
            lastName: '',
            phone: '',
            company: '',
            address1: shippingAddress?.line1 || '',
            address2: shippingAddress?.line2 || '',
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

        if (this._stripeExpressCheckoutClient && this._stripeElements) {
            await this._stripeExpressCheckoutClient.confirmPayment({
                // `elements` instance used to create the Express Checkout Element
                elements: this._stripeElements,
                // `clientSecret` from the created PaymentIntent
                clientSecret: this._stripePublishableKey,
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

    private async getAvailableShippingOptions(): Promise<StripeLinkV2ShippingRate[] | undefined> {
        const state = this.paymentIntegrationService.getState();
        const storeConfig = state.getStoreConfigOrThrow();
        const consignments = state.getConsignments();

        if (!this._currencyService) {
            this._currencyService = createCurrencyService(storeConfig);
        }

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
            await this.handleShippingOptionChange(options[0].id);
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
        return amount * 100;
    }
}
