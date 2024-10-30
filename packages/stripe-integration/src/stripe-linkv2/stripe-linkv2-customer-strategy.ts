import { round } from 'lodash';

import {
    createCurrencyService,
    CurrencyService,
    CustomerInitializeOptions,
    CustomerStrategy,
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    PaymentIntegrationService,
    ShippingOption,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { isStripeUPEPaymentMethodLike } from '../stripe-upe/is-stripe-upe-payment-method-like';
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
    StripeLinkV2ShippingRates,
} from './types';

export default class StripeLinkV2CustomerStrategy implements CustomerStrategy {
    private _stripeExpressCheckoutClient?: StripeExpressCheckoutClient;
    private _stripeElements?: StripeExpressCheckoutElements;
    private _expressCheckoutElement?: StripeExpressCheckoutElement;
    private _currencyService?: CurrencyService;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private scriptLoader: StripeUPEScriptLoader,
    ) {}

    async initialize(
        options: CustomerInitializeOptions & WithStripeUPECustomerInitializeOptions,
    ): Promise<void> {
        if (!options.stripeupe || !options.methodId) {
            throw new InvalidArgumentError(
                `Unable to proceed because "options" argument is not provided.`,
            );
        }

        const { container, isLoading } = options.stripeupe;

        Object.entries(options.stripeupe).forEach(([key, value]) => {
            if (!value) {
                throw new InvalidArgumentError(
                    `Unable to proceed because "${key}" argument is not provided.`,
                );
            }
        });

        const state = this.paymentIntegrationService.getState();
        const paymentMethod = state.getPaymentMethodOrThrow(options.methodId);

        if (!isStripeUPEPaymentMethodLike(paymentMethod)) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentToken);
        }

        const {
            initializationData: { stripePublishableKey },
        } = paymentMethod;

        console.log('stripePublishableKey', stripePublishableKey);

        // this._stripeUPEClient = await this.scriptLoader.getStripeLinkV2Client(stripePublishableKey);
        this._stripeExpressCheckoutClient = await this.scriptLoader.getStripeLinkV2Client(
            'pk_test_iyRKkVUt0YWpJ3Lq7mfsw3VW008KiFDH4s',
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

        const { cartAmount: amount } = this.paymentIntegrationService.getState().getCartOrThrow();
        const elementsOptions: StripeExpressCheckoutOptions = {
            mode: 'payment',
            amount: amount * 100,
            currency: this.getCurrency(),
        };

        this._stripeElements = stripeExpressCheckoutClient.elements(elementsOptions);
        // this._stripeElements = await this.scriptLoader.getElements(stripeUPEClient, elementsOptions);

        this._expressCheckoutElement = this._stripeElements.create(
            StripeElementType.EXPRESS_CHECKOUT,
            expressCheckoutOptions,
        );
        this._expressCheckoutElement.mount(`#${container}`);

        this._expressCheckoutElement.on('click', async (event: StripeLinkV2Event) =>
            this.onClick(event),
        );
        this._expressCheckoutElement.on('shippingaddresschange', async (event: StripeLinkV2Event) =>
            this.onShippingAddressChange(event),
        );
    }

    /** Events * */

    private async onClick(event: StripeLinkV2Event) {
        if (!('resolve' in event)) {
            return;
        }

        const countries = await this.paymentIntegrationService.loadShippingCountries();
        const allowedShippingCountries = countries
            .getShippingCountries()
            ?.map((country) => country.code);

        event.resolve({
            allowedShippingCountries,
            shippingAddressRequired: true,
            shippingRates: [
                { id: 'mock', amount: 40, displayName: 'Mock should not be displayed' },
            ],
            billingAddressRequired: true,
            emailRequired: true,
            phoneNumberRequired: true,
        });
    }

    private async onShippingAddressChange(event: StripeLinkV2Event) {
        if (!('resolve' in event)) {
            return;
        }

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
        const totalPrice = this.getTotalPrice();

        if (this._stripeElements) {
            this._stripeElements.update({
                currency: this.getCurrency(),
                mode: 'payment',
                amount: Math.round(+totalPrice * 100),
            });
        }

        event.resolve({
            shippingRates,
        });
    }

    /** Utils * */

    private getCurrency() {
        // TODO update currency returning
        return 'usd';
    }

    private getTotalPrice(): string {
        const { getCheckoutOrThrow, getCartOrThrow } = this.paymentIntegrationService.getState();
        const { decimalPlaces } = getCartOrThrow().currency;
        const totalPrice = round(getCheckoutOrThrow().outstandingBalance, decimalPlaces).toFixed(
            decimalPlaces,
        );

        return totalPrice;
    }

    private async getAvailableShippingOptions(): Promise<StripeLinkV2ShippingRates[] | undefined> {
        const state = this.paymentIntegrationService.getState();
        const storeConfig = state.getStoreConfigOrThrow();
        const consignments = state.getConsignments();

        if (!this._currencyService) {
            this._currencyService = createCurrencyService(storeConfig);
        }

        console.log('consignments', consignments);

        if (!consignments?.[0]) {
            // Info: we can not return an empty data because shippingOptions should contain at least one element, it caused a developer exception
            return;
        }

        const consignment = consignments[0];

        const availableShippingOptions = (consignment.availableShippingOptions || []).map(
            this._getStripeShippingOption.bind(this),
        );

        console.log('availableShippingOptions', availableShippingOptions);

        if (availableShippingOptions.length) {
            if (!consignment.selectedShippingOption?.id && availableShippingOptions[0]) {
                await this.handleShippingOptionChange(availableShippingOptions[0].id);
            }
        }

        return availableShippingOptions;
    }

    private _getStripeShippingOption({ id, cost, description }: ShippingOption) {
        return {
            id,
            displayName: description,
            amount: cost * 100,
        };
    }

    private async handleShippingOptionChange(optionId: string) {
        if (optionId === 'shipping_option_unselected') {
            return;
        }

        return this.paymentIntegrationService.selectShippingOption(optionId);
    }
}
