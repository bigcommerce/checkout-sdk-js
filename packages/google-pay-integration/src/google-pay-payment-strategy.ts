import {
    consumePendingAdditionalActionRedirect,
    guard,
    InvalidArgumentError,
    markPendingAdditionalActionRedirect,
    MissingDataError,
    MissingDataErrorType,
    NotInitializedError,
    NotInitializedErrorType,
    Omit,
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentMethodCancelledError,
    PaymentMethodFailedError,
    PaymentRequestOptions,
    PaymentStatusTypes,
    PaymentStrategy,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { DEFAULT_CONTAINER_STYLES, LoadingIndicator } from '@bigcommerce/checkout-sdk/ui';
import { isExperimentEnabled } from '@bigcommerce/checkout-sdk/utility';

import GooglePayPaymentInitializeOptions, {
    WithGooglePayPaymentInitializeOptions,
} from './google-pay-payment-initialize-options';
import GooglePayPaymentProcessor from './google-pay-payment-processor';
import isGooglePayErrorObject from './guards/is-google-pay-error-object';
import isGooglePayKey from './guards/is-google-pay-key';
import {
    CallbackTriggerType,
    ErrorReasonType,
    GooglePayError,
    GooglePayInitializationData,
    GooglePayPaymentOptions,
    HandleCouponsOut,
    IntermediatePaymentData,
    TotalPriceStatusType,
} from './types';

export default class GooglePayPaymentStrategy implements PaymentStrategy {
    private _loadingIndicator: LoadingIndicator;
    private _loadingIndicatorContainer?: string;
    private _paymentButton?: HTMLElement;
    private _clickListener?: (event: MouseEvent) => unknown;
    private _methodId?: keyof WithGooglePayPaymentInitializeOptions;
    private _isDeinitializationBlocked = false;
    private _isContainerMode = false;

    constructor(
        protected _paymentIntegrationService: PaymentIntegrationService,
        protected _googlePayPaymentProcessor: GooglePayPaymentProcessor,
    ) {
        this._loadingIndicator = new LoadingIndicator({
            containerStyles: DEFAULT_CONTAINER_STYLES,
        });
    }

    async initialize(
        options?: PaymentInitializeOptions & WithGooglePayPaymentInitializeOptions,
    ): Promise<void> {
        if (!options?.methodId || !isGooglePayKey(options.methodId)) {
            throw new InvalidArgumentError(
                'Unable to proceed because "methodId" is not a valid key.',
            );
        }

        this._methodId = options.methodId;

        const googlePayOptions = options[this._getMethodId()];

        if (!googlePayOptions?.walletButton && !googlePayOptions?.container) {
            throw new InvalidArgumentError('Unable to proceed without valid options.');
        }

        const {
            walletButton,
            loadingContainerId,
            container,
            buttonColor,
            buttonSizeMode,
            buttonType,
            onInit,
            ...callbacks
        } = googlePayOptions;

        this._loadingIndicatorContainer = loadingContainerId;

        await this._paymentIntegrationService.loadPaymentMethod(this._getMethodId());

        const paymentMethod = this._paymentIntegrationService
            .getState()
            .getPaymentMethodOrThrow<GooglePayInitializationData>(this._getMethodId());

        this._googlePayPaymentProcessor.setIsWebViewExperimentOn(
            !!paymentMethod.initializationData?.isWebViewExperimentOn,
        );
        await this._googlePayPaymentProcessor.initialize(
            () => paymentMethod,
            this._getGooglePayClientOptions(paymentMethod.initializationData?.storeCountry),
        );

        if (container) {
            this._isContainerMode = true;

            const renderButton = () => this._addPaymentButtonToContainer(googlePayOptions);

            if (onInit) {
                onInit(renderButton);
            } else {
                renderButton();
            }
        } else {
            this._addPaymentButton(walletButton!, callbacks);
        }
    }

    async execute({ payment }: OrderRequestBody): Promise<void> {
        if (!payment?.methodId) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        await this._paymentIntegrationService.submitOrder();

        const nonce = await this._googlePayPaymentProcessor.getNonce(payment.methodId);
        const extraData = await this._googlePayPaymentProcessor.extraPaymentData();

        try {
            await this._paymentIntegrationService.submitPayment({
                ...payment,
                paymentData: { nonce, ...extraData },
            });
        } catch (error) {
            // The additional action may resolve entirely in-page (e.g. an
            // iframe challenge), or it may fall back to a full-page browser
            // redirect to the issuer's ACS page. Mark that we may be about
            // to lose the JS session so `finalize()` can recognise the
            // return trip even if the reloaded order/payment status hasn't
            // advanced past its initial state by then.
            markPendingAdditionalActionRedirect(payment.methodId);

            try {
                await this._googlePayPaymentProcessor.processAdditionalAction(
                    error,
                    payment.methodId,
                );
            } catch (additionalActionError) {
                // Not a 3DS/additional-action redirect after all - a hard
                // decline. The Google Pay nonce we just submitted is now
                // spent; BigPay will keep rejecting it on every subsequent
                // attempt. Drop the cached copy so the shopper has to go
                // through the Google Pay button again for a fresh one
                // instead of "Place Order" silently resubmitting a dead
                // token.
                await this._invalidateStalePaymentToken(payment.methodId);

                throw additionalActionError;
            }
        }
    }

    async finalize(options?: PaymentRequestOptions): Promise<void> {
        const state = this._paymentIntegrationService.getState();
        const order = state.getOrder();
        const status = state.getPaymentStatus();

        // On return from a 3DS challenge (e.g. bank ACS redirect), the order
        // may still be awaiting finalization. Ask BigPay for the real outcome
        // instead of silently doing nothing, so a decline/failure surfaces as
        // a `finalizeOrderError` the checkout UI can render, and so the order
        // is not left in a pending state that a later "Place Order" click
        // would resubmit with a stale payment nonce/token.
        //
        // The reported status alone isn't a reliable signal here: Google Pay
        // can still show `INITIALIZE` after returning from a declined 3DS
        // redirect (the update that would normally move it to FINALIZE can
        // lag behind the browser's return), so also treat "we just sent this
        // method through an additional-action redirect" as needing finalize.
        const isReturningFromRedirect = consumePendingAdditionalActionRedirect(options?.methodId);

        if (
            order &&
            (status === PaymentStatusTypes.FINALIZE ||
                (status === PaymentStatusTypes.INITIALIZE && isReturningFromRedirect))
        ) {
            try {
                await this._paymentIntegrationService.finalizeOrder(options);
            } catch (error) {
                // The 3DS challenge was declined. The Google Pay nonce used
                // for this attempt is now spent; drop the cached copy so the
                // shopper has to go through the Google Pay button again for
                // a fresh one instead of "Place Order" silently resubmitting
                // a dead token.
                if (options?.methodId) {
                    await this._invalidateStalePaymentToken(options.methodId);
                }

                throw error;
            }

            return;
        }

        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<void> {
        if (this._isDeinitializationBlocked) {
            return Promise.resolve();
        }

        if (this._isContainerMode) {
            this._paymentButton?.remove();
        } else if (this._clickListener) {
            this._paymentButton?.removeEventListener('click', this._clickListener);
        }

        this._paymentButton = undefined;
        this._clickListener = undefined;
        this._methodId = undefined;
        this._isContainerMode = false;

        return Promise.resolve();
    }

    protected _addPaymentButton(
        walletButton: string,
        callbacks: Omit<GooglePayPaymentInitializeOptions, 'walletButton'>,
    ): void {
        if (this._paymentButton) {
            return;
        }

        const paymentButton = document.getElementById(walletButton);

        if (!paymentButton) {
            throw new InvalidArgumentError('Unable to proceed without a walletButton.');
        }

        this._paymentButton = paymentButton;
        this._clickListener = this._handleClick(callbacks);

        this._paymentButton.addEventListener('click', this._clickListener);
    }

    protected _addPaymentButtonToContainer(
        googlePayOptions: GooglePayPaymentInitializeOptions,
    ): void {
        if (this._paymentButton) {
            return;
        }

        const { container, buttonColor, buttonSizeMode, buttonType, onError } = googlePayOptions;

        if (!container) {
            throw new InvalidArgumentError('Unable to proceed: container ID is not valid.');
        }

        const button = this._googlePayPaymentProcessor.addPaymentButton(container, {
            buttonColor: buttonColor ?? 'default',
            buttonSizeMode: buttonSizeMode ?? 'fill',
            buttonType: buttonType ?? 'pay',
            onClick: this._handleContainerButtonClick(onError),
        });

        if (!button) {
            throw new InvalidArgumentError(
                `Unable to proceed: container element "#${container}" not found in the DOM.`,
            );
        }

        this._paymentButton = button;
    }

    protected _handleContainerButtonClick(
        onError: GooglePayPaymentInitializeOptions['onError'],
    ): (event: MouseEvent) => Promise<void> {
        return async (event: MouseEvent) => {
            event.preventDefault();

            await this._runGooglePayWidgetInteractionWithErrorHandling(onError, async () => {
                this._googlePayPaymentProcessor.setShouldRequestShipping(false);
                await this._googlePayPaymentProcessor.initializeWidget();
                await this._interactWithPaymentSheetAndPay();
            });
        };
    }

    protected _handleClick({
        onPaymentSelect,
        onError,
    }: Omit<GooglePayPaymentInitializeOptions, 'walletButton'>): (event: MouseEvent) => unknown {
        return async (event: MouseEvent) => {
            event.preventDefault();

            // TODO: Dispatch Widget Actions
            await this._runGooglePayWidgetInteractionWithErrorHandling(onError, async () => {
                this._googlePayPaymentProcessor.setShouldRequestShipping(false);
                await this._googlePayPaymentProcessor.initializeWidget();

                await this._interactWithPaymentSheetAndPay();
            });

            onPaymentSelect?.();
        };
    }

    protected async _interactWithPaymentSheetAndPay(): Promise<void> {
        const response = await this._googlePayPaymentProcessor.showPaymentSheet();

        this._toggleBlockDeinitialization(true);
        this._toggleLoadingIndicator(true);

        const methodId = this._getMethodId();

        const state = this._paymentIntegrationService.getState();
        const { features } = state.getStoreConfigOrThrow().checkoutSettings;
        const isGooglePayDontOverrideAddresssExperimentOn = isExperimentEnabled(
            features,
            'PI-5031.google_pay_dont_override_address',
        );

        const billingAddress =
            this._googlePayPaymentProcessor.mapToBillingAddressRequestBody(response);

        if (billingAddress && !isGooglePayDontOverrideAddresssExperimentOn) {
            await this._paymentIntegrationService.updateBillingAddress(billingAddress);
        }

        await this._googlePayPaymentProcessor.setExternalCheckoutXhr(methodId, response);

        await this._paymentIntegrationService.loadPaymentMethod(methodId);

        const freshPaymentMethod = this._paymentIntegrationService
            .getState()
            .getPaymentMethodOrThrow<GooglePayInitializationData>(methodId);

        await this._googlePayPaymentProcessor.initialize(() => freshPaymentMethod);

        try {
            await this.execute({ useStoreCredit: false, payment: { methodId } });

            this._completeCheckoutFlow();
        } catch (error) {
            await this._paymentIntegrationService.loadCheckout();

            throw error;
        }
    }

    protected _completeCheckoutFlow(): void {
        window.location.replace('/checkout/order-confirmation');
        this._toggleLoadingIndicator(false);
        this._toggleBlockDeinitialization(false);
    }

    protected _getMethodId(): keyof WithGooglePayPaymentInitializeOptions {
        return guard(
            this._methodId,
            () => new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized),
        );
    }

    protected async _getIsSignedInOrThrow(): Promise<boolean> {
        try {
            return !!(await this._googlePayPaymentProcessor.getNonce(this._getMethodId()));
        } catch (e) {
            if (
                e instanceof MissingDataError &&
                e.subtype === MissingDataErrorType.MissingPaymentToken
            ) {
                return false;
            }

            throw e;
        }
    }

    protected async _handleOfferTrigger(
        offerData: IntermediatePaymentData['offerData'],
    ): Promise<Partial<HandleCouponsOut>> {
        let isSignedIn = false;
        let errorMessage = 'Sign in to Google Pay first to apply or remove promo codes.';

        try {
            isSignedIn = await this._getIsSignedInOrThrow();
        } catch (error) {
            if (error instanceof MissingDataError) {
                errorMessage = error.message;
            }
        }

        // We can only apply/remove coupons on the payment step only if we are logged into Google Pay, otherwise we will get an error
        if (isSignedIn) {
            const { newOfferInfo, error } = await this._googlePayPaymentProcessor.handleCoupons(
                offerData,
            );

            return {
                newOfferInfo,
                error,
            };
        }

        return {
            error: {
                reason: ErrorReasonType.OFFER_INVALID,
                message: errorMessage,
                intent: CallbackTriggerType.OFFER,
            },
        };
    }

    protected _getGooglePayClientOptions(countryCode?: string): GooglePayPaymentOptions {
        if (this._googlePayPaymentProcessor.isWebViewWithRestrictions()) {
            return {};
        }

        return {
            paymentDataCallbacks: {
                onPaymentDataChanged: async ({ callbackTrigger, offerData }) => {
                    if (
                        callbackTrigger !== CallbackTriggerType.INITIALIZE &&
                        callbackTrigger !== CallbackTriggerType.OFFER
                    ) {
                        return;
                    }

                    const { offerChangeTriggers } =
                        this._googlePayPaymentProcessor.getCallbackTriggers();

                    const { newOfferInfo = undefined, error: couponsError = undefined } =
                        offerChangeTriggers.includes(callbackTrigger)
                            ? await this._handleOfferTrigger(offerData)
                            : {};

                    // We can add another errors if needed 'couponsError || shippingError || anotherError'
                    const error: GooglePayError | undefined = couponsError;

                    await this._paymentIntegrationService.loadCheckout();

                    const { code: currencyCode } = this._paymentIntegrationService
                        .getState()
                        .getCartOrThrow().currency;
                    const totalPrice = this._googlePayPaymentProcessor.getTotalPrice();

                    return {
                        newTransactionInfo: {
                            ...(countryCode && { countryCode }),
                            currencyCode,
                            totalPriceStatus: TotalPriceStatusType.FINAL,
                            totalPrice,
                        },
                        ...(newOfferInfo && {
                            newOfferInfo,
                        }),
                        ...(error && {
                            error,
                        }),
                    };
                },
            },
        };
    }

    private async _runGooglePayWidgetInteractionWithErrorHandling(
        onError: GooglePayPaymentInitializeOptions['onError'],
        interaction: () => Promise<void>,
    ): Promise<void> {
        try {
            await interaction();
        } catch (error) {
            let err: unknown = error;

            this._toggleLoadingIndicator(false);

            if (isGooglePayErrorObject(error)) {
                if (error.statusCode === 'CANCELED') {
                    throw new PaymentMethodCancelledError();
                }

                err = new PaymentMethodFailedError(JSON.stringify(error));
            }

            onError?.(
                new PaymentMethodFailedError(
                    'An error occurred while requesting your Google Pay payment details.',
                ),
            );

            throw err;
        } finally {
            this._toggleBlockDeinitialization(false);
        }
    }

    private _toggleBlockDeinitialization(isBlocked: boolean) {
        this._isDeinitializationBlocked = isBlocked;
    }

    private _toggleLoadingIndicator(isLoading: boolean): void {
        if (isLoading && this._loadingIndicatorContainer) {
            this._loadingIndicator.show(this._loadingIndicatorContainer);
        } else {
            this._loadingIndicator.hide();
        }
    }

    /**
     * Best-effort refresh of the payment method so any spent Google Pay
     * nonce/card summary cached in `initializationData` is replaced with
     * whatever the storefront now reports. If the reload itself fails, the
     * original decline error still takes priority - the stale UI state will
     * simply persist until the next successful reload.
     */
    private async _invalidateStalePaymentToken(methodId: string): Promise<void> {
        try {
            await this._paymentIntegrationService.loadPaymentMethod(methodId);
        } catch {
            // ignore - see comment above
        }
    }
}
