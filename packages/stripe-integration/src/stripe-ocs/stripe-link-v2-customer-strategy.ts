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
    PaymentIntegrationService,
    PaymentMethodCancelledError,
    PaymentMethodFailedError,
    ShippingOption,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    isStripePaymentMethodLike,
    StripeAdditionalActionRequired,
    StripeClient,
    StripeElement,
    StripeElementEvent,
    StripeElements,
    StripeElementsCreateOptions,
    StripeElementType,
    StripeError,
    StripeEventType,
    StripeIntegrationService,
    StripeLinkV2Event,
    StripeLinkV2Options,
    StripeLinkV2ShippingRate,
    StripePaymentMethodType,
    StripeResult,
    StripeScriptLoader,
    StripeStringConstants,
} from '@bigcommerce/checkout-sdk/stripe-utils';
import { LoadingIndicator } from '@bigcommerce/checkout-sdk/ui';

import { expressCheckoutAllowedCountryCodes } from './constants';
import { WithStripeOCSCustomerInitializeOptions } from './stripe-ocs-customer-initialize-options';

export default class StripeLinkV2CustomerStrategy implements CustomerStrategy {
    private _stripeClient?: StripeClient;
    private _stripeElements?: StripeElements;
    private _linkV2Element?: StripeElement;
    private _amountTransformer?: AmountTransformer;
    private _onComplete?: (orderId?: number) => Promise<never>;
    private _loadingIndicatorContainer?: string;
    private _captureMethod?: 'automatic' | 'manual';
    private _currencyCode?: string;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private scriptLoader: StripeScriptLoader,
        private stripeIntegrationService: StripeIntegrationService,
        private loadingIndicator: LoadingIndicator,
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

        const { methodId, gatewayId, container } = stripeocs;

        if (!container || !methodId || !gatewayId) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        const state = await this.paymentIntegrationService.loadPaymentMethod(gatewayId, {
            params: { method: methodId },
        });
        const paymentMethod = state.getPaymentMethodOrThrow(methodId, gatewayId);
        const { loadingContainerId, buttonHeight, onComplete } = stripeocs;

        this._loadingIndicatorContainer = loadingContainerId;

        this._onComplete = onComplete;

        if (!isStripePaymentMethodLike(paymentMethod)) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const { initializationData } = paymentMethod;
        const { captureMethod } = initializationData;

        this._captureMethod = captureMethod;
        this._stripeClient = await this.scriptLoader.getStripeClient(
            initializationData,
            state.getLocale(),
        );

        await this._mountExpressCheckoutElement(
            methodId,
            container,
            this._stripeClient,
            buttonHeight,
        );

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

    deinitialize() {
        return Promise.resolve();
    }

    private async _mountExpressCheckoutElement(
        methodId: string,
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
                klarna: StripeStringConstants.NEVER,
            },
            // Minimal buttonHeight value is 40
            buttonHeight,
        };

        const { cartAmount } = this.paymentIntegrationService.getState().getCartOrThrow();

        const elementsOptions: StripeLinkV2Options = {
            mode: 'payment',
            amount: this._toCents(cartAmount),
            currency: this._getCurrency(),
            ...(this._captureMethod ? { captureMethod: this._captureMethod } : {}),
        };

        this._stripeElements = stripeExpressCheckoutClient.elements(elementsOptions);

        this._linkV2Element = this._stripeElements.create(
            StripeElementType.EXPRESS_CHECKOUT,
            expressCheckoutOptions,
        );
        this._linkV2Element.mount(`#${container}`);
        this._initializeEvents(this._linkV2Element, methodId);
    }

    /** Events * */

    private _initializeEvents(expressCheckoutElement: StripeElement, methodId: string): void {
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
            this._onConfirm(event, methodId),
        );

        expressCheckoutElement.on(StripeElementEvent.CANCEL, this._onCancel);
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

    private _onCancel() {
        throw new PaymentMethodCancelledError();
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
    private async _onConfirm(event: StripeEventType, methodId: string) {
        if (
            'billingDetails' in event &&
            'shippingAddress' in event &&
            this._stripeClient &&
            this._stripeElements
        ) {
            await this._updateShippingAndBillingAddress(event);
            await this.paymentIntegrationService.submitOrder();

            const paymentMethod = this._getPaymentPayload(methodId);

            try {
                await this.paymentIntegrationService.submitPayment(paymentMethod);
            } catch (error) {
                await this._processAdditionalAction(error, methodId);
            }
        }

        return Promise.resolve();
    }

    private async _updateShippingAndBillingAddress(event: StripeLinkV2Event) {
        const shouldRequireShippingAddress = this._shouldRequireShippingAddress();

        const firstName =
            event.shippingAddress?.name?.split(' ')[0] ||
            event.billingDetails?.name?.split(' ')[0] ||
            '';
        const lastName =
            event.shippingAddress?.name?.split(' ')[1] ||
            event.billingDetails?.name?.split(' ')[1] ||
            '';

        if (shouldRequireShippingAddress) {
            const shippingAddress = this._mapShippingAddress(
                event.shippingAddress,
                event.billingDetails,
                firstName,
                lastName,
            );

            await this.paymentIntegrationService.updateShippingAddress(shippingAddress);
        }

        const billingAddress = this._mapBillingAddress(
            event.shippingAddress,
            event.billingDetails,
            firstName,
            lastName,
        );

        await this.paymentIntegrationService.updateBillingAddress(billingAddress);
    }

    private _mapShippingAddress(
        shippingAddress: StripeLinkV2Event['shippingAddress'],
        billingDetails: StripeLinkV2Event['billingDetails'],
        firstName: string,
        lastName: string,
    ) {
        return {
            firstName,
            lastName,
            phone: billingDetails?.phone || '',
            company: '',
            address1: shippingAddress?.address?.line1 || '',
            address2: shippingAddress?.address?.line2 || '',
            city: shippingAddress?.address?.city || '',
            countryCode: shippingAddress?.address?.country || '',
            postalCode: shippingAddress?.address?.postal_code || '',
            stateOrProvince: shippingAddress?.address?.state || '',
            stateOrProvinceCode: shippingAddress?.address?.state || '',
            customFields: [],
        };
    }

    private _mapBillingAddress(
        shippingAddress: StripeLinkV2Event['shippingAddress'],
        billingDetails: StripeLinkV2Event['billingDetails'],
        firstName: string,
        lastName: string,
    ) {
        return {
            email: billingDetails?.email || '',
            firstName,
            lastName,
            phone: billingDetails?.phone || '',
            company: '',
            address1: billingDetails?.address?.line1 || '',
            address2: '',
            city: billingDetails?.address?.city || '',
            countryCode: billingDetails?.address?.country || '',
            postalCode: billingDetails?.address?.postal_code || '',
            stateOrProvince: billingDetails?.address?.state || '',
            stateOrProvinceCode: shippingAddress?.address?.state || '',
            customFields: [],
        };
    }

    private async _processAdditionalAction(error: unknown, methodId: string): Promise<void> {
        if (
            !isRequestError(error) ||
            !this.stripeIntegrationService.isAdditionalActionError(error.body.errors)
        ) {
            throw error;
        }

        if (!this._stripeClient || !this._stripeElements) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        const { data: additionalActionData } = error.body.additional_action_required;
        const { token } = additionalActionData;

        const { paymentIntent } = await this._confirmStripePaymentOrThrow(
            additionalActionData,
            methodId,
        );

        const paymentPayload = this._getPaymentPayload(methodId, paymentIntent?.id || token);

        try {
            this._toggleLoadingIndicator(true);
            await this.paymentIntegrationService.submitPayment(paymentPayload);
            await this._completeCheckoutFlow();
        } catch (error) {
            this.stripeIntegrationService.throwPaymentConfirmationProceedMessage();
        } finally {
            this._toggleLoadingIndicator(false);
        }
    }

    private async _confirmStripePaymentOrThrow(
        additionalActionData: StripeAdditionalActionRequired['data'],
        methodId: string,
    ): Promise<StripeResult | never> {
        const { token, redirect_url } = additionalActionData;
        const stripePaymentData = this.stripeIntegrationService.mapStripePaymentData(
            this._stripeElements,
            redirect_url,
        );
        let stripeError: StripeError | undefined;

        try {
            const isPaymentCompleted = await this.stripeIntegrationService.isPaymentCompleted(
                methodId,
                this._stripeClient,
            );

            const confirmationResult = !isPaymentCompleted
                ? await this._stripeClient?.confirmPayment({
                      elements: stripePaymentData.elements,
                      clientSecret: token,
                      redirect: StripeStringConstants.IF_REQUIRED,
                      confirmParams: {
                          return_url: stripePaymentData.confirmParams?.return_url,
                      },
                  })
                : await this._stripeClient?.retrievePaymentIntent(token || '');

            stripeError = confirmationResult?.error;

            if (stripeError || !confirmationResult?.paymentIntent) {
                throw new PaymentMethodFailedError();
            }

            return confirmationResult;
        } catch (error: unknown) {
            return this.stripeIntegrationService.throwStripeError(stripeError);
        }
    }

    private async _completeCheckoutFlow() {
        if (typeof this._onComplete === 'function') {
            return this._onComplete();
        }

        window.location.replace('/order-confirmation');

        return Promise.resolve();
    }

    private _getPaymentPayload(methodId: string, token?: string): Payment {
        const cartId = this.paymentIntegrationService.getState().getCart()?.id || '';
        const formattedPayload = {
            cart_id: cartId,
            ...(token ? { credit_card_token: { token } } : {}),
            confirm: false,
            payment_method_id: StripePaymentMethodType.Link,
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

    private _toggleLoadingIndicator(isLoading: boolean): void {
        if (isLoading && this._loadingIndicatorContainer) {
            this.loadingIndicator.show(this._loadingIndicatorContainer);
        } else {
            this.loadingIndicator.hide();
        }
    }
}
