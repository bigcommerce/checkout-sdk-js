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
    PaymentMethod,
    PaymentMethodCancelledError,
    PaymentMethodFailedError,
    ShippingOption,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    isStripePaymentMethodLike,
    StripeAdditionalActionRequired,
    StripeCheckoutExpressCheckoutElement,
    StripeCheckoutInstance,
    StripeCheckoutSessionActions,
    StripeCheckoutShippingAddressChangeEvent,
    StripeCheckoutShippingChangeResult,
    StripeCheckoutShippingChangeResultType,
    StripeCheckoutShippingRateChangeEvent,
    StripeClient,
    StripeElement,
    StripeElementEvent,
    StripeElements,
    StripeElementsCreateOptions,
    StripeElementType,
    StripeError,
    StripeEventType,
    StripeInitializationData,
    StripeIntegrationService,
    StripeJsVersion,
    StripeLinkV2Event,
    StripeLinkV2Options,
    StripeLinkV2ShippingRate,
    StripeLoadActionsResultType,
    StripePaymentMethodType,
    StripeResult,
    StripeScriptLoader,
    StripeStringConstants,
} from '@bigcommerce/checkout-sdk/stripe-utils';
import { LoadingIndicator } from '@bigcommerce/checkout-sdk/ui';

import {
    expressCheckoutAllowedCountryCodes,
    stripeAllowedShippingOptionsLength,
} from './constants';
import { WithStripeOCSCustomerInitializeOptions } from './stripe-ocs-customer-initialize-options';

export default class StripeLinkV2CustomerStrategy implements CustomerStrategy {
    private _stripeClient?: StripeClient;
    private _stripeElements?: StripeElements;
    private _stripeCheckout?: StripeCheckoutInstance;
    private _linkV2Element?: StripeElement;
    private _gatewayId?: string;
    private _amountTransformer?: AmountTransformer;
    private _onComplete?: (orderId?: number) => Promise<never>;
    private _filterAvailableShippingOptions?: (
        availableShippingOptions: ShippingOption[],
    ) => Promise<ShippingOption[]>;
    private _loadingIndicatorContainer?: string;
    private _captureMethod?: 'automatic' | 'manual';
    private _currencyCode?: string;
    private _cachedMethodId?: string;

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

        const { gatewayId, container } = stripeocs;

        if (!container || !gatewayId) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        const paymentMethod = await this._getPaymentMethod(gatewayId);
        const { loadingContainerId, buttonHeight, onComplete, filterAvailableShippingOptions } =
            stripeocs;

        this._loadingIndicatorContainer = loadingContainerId;

        this._onComplete = onComplete;
        this._filterAvailableShippingOptions = filterAvailableShippingOptions;

        if (!isStripePaymentMethodLike(paymentMethod)) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const { initializationData, id: methodId, clientToken } = paymentMethod;
        const { captureMethod } = initializationData;

        this._gatewayId = gatewayId;
        this._captureMethod = captureMethod;
        this._stripeClient = await this.scriptLoader.getStripeClient(
            initializationData,
            this.paymentIntegrationService.getState().getCartLocale(),
            StripeJsVersion.CLOVER,
        );

        if (this._isCheckoutSessionToken(clientToken)) {
            await this._mountCheckoutSessionExpressCheckoutElement(
                container,
                this._stripeClient,
                clientToken,
                initializationData,
                buttonHeight,
            );
        } else {
            await this._mountExpressCheckoutElement(container, this._stripeClient, buttonHeight);
        }

        this._initializeEvents(methodId);
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
            paymentMethods: this._getExpressCheckoutPaymentMethods(),
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

        return this._linkV2Element;
    }

    private async _mountCheckoutSessionExpressCheckoutElement(
        container: string,
        stripeClient: StripeClient,
        clientToken: string,
        initializationData: Record<string, any>,
        buttonHeight = 40,
    ) {
        console.log('*** mount with CS');

        this._stripeCheckout = await this.scriptLoader.getStripeCheckout(stripeClient, {
            clientSecret: clientToken,
            adaptivePricing: {
                allowed: !!initializationData?.adaptivePricingEnabled,
            },
        });

        this._stripeCheckout.getExpressCheckoutElement()?.destroy();

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
            paymentMethods: this._getExpressCheckoutPaymentMethods(),
            // Minimal buttonHeight value is 40
            buttonHeight,
        };

        console.log('*** express checkout options:', expressCheckoutOptions);

        try {
            const linkV2Element = this._stripeCheckout.createExpressCheckoutElement({
                // ...expressCheckoutOptions,

                paymentMethods: this._getExpressCheckoutPaymentMethods(),
                // Minimal buttonHeight value is 40
                buttonHeight,
            });

            if (this._shouldRequireShippingAddress()) {
                console.log('*** initializing checkout session shipping events');
                this._initializeCheckoutSessionShippingEvents(linkV2Element);
            }

            this._linkV2Element = linkV2Element;
            this._linkV2Element.mount(`#${container}`);
        } catch (error) {
            console.error('*** Error mounting checkout session express checkout element:', error);
        }

        return this._linkV2Element;
    }

    private _getExpressCheckoutPaymentMethods(): StripeElementsCreateOptions['paymentMethods'] {
        return {
            link: StripeStringConstants.AUTO,
            applePay: StripeStringConstants.NEVER,
            googlePay: StripeStringConstants.NEVER,
            amazonPay: StripeStringConstants.NEVER,
            paypal: StripeStringConstants.NEVER,
            klarna: StripeStringConstants.NEVER,
        };
    }

    /** Events * */

    private _initializeEvents(methodId: string): void {
        if (!this._linkV2Element) {
            return;
        }

        const shouldRequireShippingAddress = this._shouldRequireShippingAddress();

        if (shouldRequireShippingAddress && !this._stripeCheckout) {
            this._linkV2Element.on(StripeElementEvent.SHIPPING_ADDRESS_CHANGE, async (event) =>
                this._onShippingAddressChange(event),
            );
            this._linkV2Element.on(StripeElementEvent.SHIPPING_RATE_CHANGE, async (event) =>
                this._onShippingRateChange(event),
            );
        }

        this._linkV2Element.on(StripeElementEvent.CONFIRM, async (event) =>
            this._stripeCheckout
                ? this._onCheckoutSessionConfirm(event, methodId)
                : this._onConfirm(event, methodId),
        );

        this._linkV2Element.on(StripeElementEvent.CANCEL, this._onCancel);
    }

    private async _onShippingAddressChange(event: StripeEventType): Promise<void> {
        if (!('address' in event)) {
            return;
        }

        await this.paymentIntegrationService.updateShippingAddress(
            this._mapPartialShippingAddress(event.address),
        );

        const shippingRates = await this._getAvailableShippingOptions();

        await this._updateDisplayedPrice();

        if (!shippingRates?.length) {
            event.reject();
        } else {
            event.resolve({
                shippingRates,
            });
        }
    }

    private _mapPartialShippingAddress(shippingAddress?: StripeLinkV2Event['address']) {
        // Depending on the country, some fields can be missing or partially redacted.
        // For example, the shipping address in the US can only contain a city, state, and ZIP code.
        // The full shipping address appears in the confirm event object after the purchase is confirmed in the browser’s payment interface.
        return {
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
            stateOrProvinceCode: shippingAddress?.state || '',
            customFields: [],
        };
    }

    private _initializeCheckoutSessionShippingEvents(
        linkV2Element: StripeCheckoutExpressCheckoutElement,
    ): void {
        linkV2Element.on(StripeElementEvent.SHIPPING_ADDRESS_CHANGE, async (event) =>
            this._onCheckoutSessionShippingAddressChange(event),
        );
        linkV2Element.on(StripeElementEvent.SHIPPING_RATE_CHANGE, async (event) =>
            this._onCheckoutSessionShippingRateChange(event),
        );
    }

    private async _onCheckoutSessionShippingAddressChange({
        address,
        runServerUpdate,
    }: StripeCheckoutShippingAddressChangeEvent): Promise<StripeCheckoutShippingChangeResult> {
        console.log('*** onCheckoutSessionShippingAddressChange event:', address);
        try {
            await this.paymentIntegrationService.updateShippingAddress(
                this._mapPartialShippingAddress(address),
            );

            const shippingRates = await this._getAvailableShippingOptions();

            console.log('*** Available shipping rates:', shippingRates);

            if (!shippingRates?.length) {
                return { type: StripeCheckoutShippingChangeResultType.REJECT };
            }

            await runServerUpdate(() => this._loadCheckoutSessionPaymentMethod());

            return { type: StripeCheckoutShippingChangeResultType.ACCEPT };
        } catch {
            return { type: StripeCheckoutShippingChangeResultType.REJECT };
        }
    }

    private async _onCheckoutSessionShippingRateChange({
        rate,
        runServerUpdate,
    }: StripeCheckoutShippingRateChangeEvent): Promise<StripeCheckoutShippingChangeResult> {
        try {
            console.log('*** Handling shipping rate change for rate:', rate);

            const shippingOptionId = this._getShippingOptionIdByRate(rate);

            if (!shippingOptionId) {
                return { type: StripeCheckoutShippingChangeResultType.REJECT };
            }

            await this._handleShippingOptionChange(shippingOptionId);
            await runServerUpdate(() => this._loadCheckoutSessionPaymentMethod());

            return { type: StripeCheckoutShippingChangeResultType.ACCEPT };
        } catch (e) {
            console.log('*** Error handling shipping rate change', e);
            return { type: StripeCheckoutShippingChangeResultType.REJECT };
        }
    }

    private _getShippingOptionIdByRate({
        displayName,
    }: StripeLinkV2ShippingRate): string | undefined {
        const { availableShippingOptions = [] } =
            this.paymentIntegrationService.getState().getConsignments()?.[0] || {};

        return availableShippingOptions.find(
            ({ description }) => description.trim() === displayName,
        )?.id;
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
            await this.stripeIntegrationService.verifyCheckoutSpamProtection();
            await this._updateShippingAndBillingAddress(event);
            await this.paymentIntegrationService.submitOrder();

            const paymentPayload = this._getPaymentPayload(methodId);

            try {
                await this.paymentIntegrationService.submitPayment(paymentPayload);
            } catch (error) {
                await this._processAdditionalAction(error, methodId);
            }
        }

        return Promise.resolve();
    }

    private async _onCheckoutSessionConfirm(event: StripeEventType, methodId: string) {
        if (!('billingDetails' in event) || !('shippingAddress' in event)) {
            return;
        }

        await this.stripeIntegrationService.verifyCheckoutSpamProtection();
        await this._updateShippingAndBillingAddress(event);
        await this._syncCheckoutSession();

        const stripeActions = await this._getStripeCheckoutActionsOrThrow();

        await this._selectCheckoutSessionShippingOption(stripeActions);
        await this.paymentIntegrationService.submitOrder();

        const { id: checkoutSessionId } = await stripeActions.getSession();

        try {
            await this.paymentIntegrationService.submitPayment(
                this._getPaymentPayload(methodId, checkoutSessionId),
            );
        } catch (error) {
            await this._processCheckoutSessionAdditionalAction(error, event, methodId);
        }
    }

    private async _processCheckoutSessionAdditionalAction(
        error: unknown,
        event: StripeLinkV2Event,
        methodId: string,
    ): Promise<void> {
        if (
            !isRequestError(error) ||
            !this.stripeIntegrationService.isAdditionalActionError(error.body.errors)
        ) {
            throw error;
        }

        const { redirect_url } = error.body.additional_action_required.data;
        const stripeActions = await this._getStripeCheckoutActionsOrThrow();
        const { session, error: stripeError } = await stripeActions.confirm({
            expressCheckoutConfirmEvent: event,
            redirect: StripeStringConstants.IF_REQUIRED,
            returnUrl: redirect_url,
        });

        if (stripeError || !session) {
            throw new PaymentMethodFailedError(stripeError?.message);
        }

        try {
            this._toggleLoadingIndicator(true);
            await this.paymentIntegrationService.submitPayment(
                this._getPaymentPayload(methodId, session.id),
            );
            await this._completeCheckoutFlow();
        } catch {
            this.stripeIntegrationService.throwPaymentConfirmationProceedMessage();
        } finally {
            this._toggleLoadingIndicator(false);
        }
    }

    private async _selectCheckoutSessionShippingOption(
        stripeActions: StripeCheckoutSessionActions,
    ): Promise<void> {
        const { selectedShippingOption } =
            this.paymentIntegrationService.getState().getConsignments()?.[0] || {};

        if (!selectedShippingOption) {
            return;
        }

        const { shippingOptions } = await stripeActions.getSession();
        const shippingRate = shippingOptions.find(
            ({ displayName }) => displayName === selectedShippingOption.description.trim(),
        );

        if (!shippingRate) {
            return;
        }

        const { error } = await stripeActions.updateShippingOption(shippingRate.id);

        if (error) {
            throw new PaymentMethodFailedError(error.message);
        }
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

        const { paymentIntent } = await this._confirmStripePaymentOrThrow(additionalActionData);

        const paymentPayload = this._getPaymentPayload(methodId, paymentIntent?.id || token);

        try {
            this._toggleLoadingIndicator(true);
            await this.paymentIntegrationService.submitPayment(paymentPayload);
            await this._completeCheckoutFlow();
        } catch {
            this.stripeIntegrationService.throwPaymentConfirmationProceedMessage();
        } finally {
            this._toggleLoadingIndicator(false);
        }
    }

    private async _confirmStripePaymentOrThrow(
        additionalActionData: StripeAdditionalActionRequired['data'],
    ): Promise<StripeResult | never> {
        const { token, redirect_url } = additionalActionData;
        const stripePaymentData = this.stripeIntegrationService.mapStripePaymentData(
            this._stripeElements,
            redirect_url,
        );
        let stripeError: StripeError | undefined;

        try {
            const isPaymentCompleted =
                await this.stripeIntegrationService.isPaymentCompletedByToken(
                    token,
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
        } catch {
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
            method: StripePaymentMethodType.Link,
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

    private _isCheckoutSessionToken(clientToken?: string): clientToken is string {
        return !!clientToken?.startsWith('cs_');
    }

    private async _getStripeCheckoutActionsOrThrow(): Promise<StripeCheckoutSessionActions> {
        if (!this._stripeCheckout) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        const { actions, error } = await this._stripeCheckout.loadActions();

        if (!actions || error) {
            throw new PaymentMethodFailedError(error?.message);
        }

        return actions;
    }

    private async _syncCheckoutSession(): Promise<void> {
        const stripeActions = await this._getStripeCheckoutActionsOrThrow();
        const { type, error } = await stripeActions.runServerUpdate(() =>
            this._loadCheckoutSessionPaymentMethod(),
        );

        if (error || type === StripeLoadActionsResultType.ERROR) {
            throw new PaymentMethodFailedError(error?.message);
        }
    }

    private _loadCheckoutSessionPaymentMethod() {
        const gatewayId = this._gatewayId;
        const methodId = this._cachedMethodId;

        if (!gatewayId || !methodId) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        // INFO: to trigger checkout session data update on the BE side we need to make stripe config request
        return this.paymentIntegrationService.loadPaymentMethod(gatewayId, {
            params: { method: methodId },
        });
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

        let { availableShippingOptions = [] } = consignments[0];
        const { selectedShippingOption } = consignments[0];

        if (typeof this._filterAvailableShippingOptions === 'function') {
            try {
                availableShippingOptions = await this._filterAvailableShippingOptions(
                    availableShippingOptions,
                );
            } catch (error) {
                // INFO: fall back to the unfiltered options so the Stripe shipping event still resolves.
                console.error('Failed to filter available shipping options:', error);
            }
        }

        const options = availableShippingOptions.map(this._getStripeShippingOption.bind(this));
        const recommendedShippingOption = availableShippingOptions.find(
            (shippingOption) => shippingOption.isRecommended,
        );
        const isSelectedOptionAvailable = availableShippingOptions.some(
            (shippingOption) => shippingOption.id === selectedShippingOption?.id,
        );
        const selectedId = isSelectedOptionAvailable ? selectedShippingOption?.id : undefined;
        const recommendedId = recommendedShippingOption?.id;

        if (selectedId) {
            // Set selected shipping option first in the array, as it will be selected by default
            options.sort((option) => (option.id === selectedId ? -1 : 0));
        } else if (recommendedId) {
            // Set recommended shipping option first in the array, as it will be selected by default
            options.sort((option) => (option.id === recommendedId ? -1 : 0));
            await this._handleShippingOptionChange(recommendedId);
        } else {
            await this._handleShippingOptionChange(options[0]?.id);
        }

        // Stripe has restricted the number of shipping rates.
        return options.slice(0, stripeAllowedShippingOptionsLength);
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

    private async _getPaymentMethod(
        gatewayId: string,
    ): Promise<PaymentMethod<StripeInitializationData>> {
        let state = this.paymentIntegrationService.getState();
        const stripePaymentMethod =
            state.getPaymentMethod<StripeInitializationData>(
                StripePaymentMethodType.CHECKOUT_SESSION,
                gatewayId,
            ) ||
            state.getPaymentMethod<StripeInitializationData>(
                StripePaymentMethodType.OCS,
                gatewayId,
            );

        if (stripePaymentMethod) {
            this._cachedMethodId = stripePaymentMethod.id;

            if (
                stripePaymentMethod.id !== StripePaymentMethodType.CHECKOUT_SESSION ||
                stripePaymentMethod.clientToken
            ) {
                return stripePaymentMethod;
            }
        }

        if (!this._cachedMethodId) {
            const { initializationData } =
                state.getPaymentMethodOrThrow<StripeInitializationData>(gatewayId);

            this._cachedMethodId = initializationData?.checkoutSessionEnabled
                ? StripePaymentMethodType.CHECKOUT_SESSION
                : StripePaymentMethodType.OCS;
        }

        state = await this.paymentIntegrationService.loadPaymentMethod(gatewayId, {
            params: { method: this._cachedMethodId },
        });

        return state.getPaymentMethodOrThrow(this._cachedMethodId, gatewayId);
    }
}
