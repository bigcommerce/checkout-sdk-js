import { round } from 'lodash';

import {
    guard,
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    NotInitializedError,
    NotInitializedErrorType,
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentMethodCancelledError,
    PaymentMethodFailedError,
    PaymentStrategy,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { DEFAULT_CONTAINER_STYLES, LoadingIndicator } from '@bigcommerce/checkout-sdk/ui';

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

        if (!googlePayOptions?.walletButton) {
            throw new InvalidArgumentError('Unable to proceed without valid options.');
        }

        const { walletButton, loadingContainerId, ...callbacks } = googlePayOptions;

        this._loadingIndicatorContainer = loadingContainerId;

        await this._paymentIntegrationService.loadPaymentMethod(this._getMethodId());

        const paymentMethod = this._paymentIntegrationService
            .getState()
            .getPaymentMethodOrThrow<GooglePayInitializationData>(this._getMethodId());

        await this._googlePayPaymentProcessor.initialize(
            () => paymentMethod,
            this._getGooglePayClientOptions(paymentMethod.initializationData?.storeCountry),
        );

        this._addPaymentButton(walletButton, callbacks);
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
            await this._googlePayPaymentProcessor.processAdditionalAction(error, payment.methodId);
        }
    }

    finalize(): Promise<void> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<void> {
        if (this._clickListener) {
            this._paymentButton?.removeEventListener('click', this._clickListener);
        }

        this._paymentButton = undefined;
        this._clickListener = undefined;
        this._methodId = undefined;

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

    protected _handleClick({
        onPaymentSelect,
        onError,
    }: Omit<GooglePayPaymentInitializeOptions, 'walletButton'>): (event: MouseEvent) => unknown {
        return async (event: MouseEvent) => {
            event.preventDefault();

            // TODO: Dispatch Widget Actions
            try {
                await this._googlePayPaymentProcessor.initializeWidget();
                await this._interactWithPaymentSheet();
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
            }

            onPaymentSelect?.();
        };
    }

    protected async _interactWithPaymentSheet(): Promise<void> {
        const response = await this._googlePayPaymentProcessor.showPaymentSheet();

        this._toggleLoadingIndicator(true);

        const billingAddress =
            this._googlePayPaymentProcessor.mapToBillingAddressRequestBody(response);

        if (billingAddress) {
            await this._paymentIntegrationService.updateBillingAddress(billingAddress);
        }

        await this._googlePayPaymentProcessor.setExternalCheckoutXhr(this._getMethodId(), response);

        await this._paymentIntegrationService.loadCheckout();
        await this._paymentIntegrationService.loadPaymentMethod(this._getMethodId());
        this._toggleLoadingIndicator(false);
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
        return {
            paymentDataCallbacks: {
                onPaymentDataChanged: async ({ callbackTrigger, offerData }) => {
                    const state = this._paymentIntegrationService.getState();
                    // TODO remove this experiment usage after we make sure that coupons handling works fine
                    const isGooglePayCouponsExperimentOn =
                        state.getStoreConfigOrThrow().checkoutSettings.features[
                            'PI-2875.googlepay_coupons_handling'
                        ] || false;

                    if (
                        callbackTrigger !== CallbackTriggerType.INITIALIZE &&
                        (!isGooglePayCouponsExperimentOn ||
                            callbackTrigger !== CallbackTriggerType.OFFER)
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

                    const { getCheckoutOrThrow, getCartOrThrow } =
                        this._paymentIntegrationService.getState();
                    const { code: currencyCode, decimalPlaces } = getCartOrThrow().currency;
                    const totalPrice = round(
                        getCheckoutOrThrow().outstandingBalance,
                        decimalPlaces,
                    ).toFixed(decimalPlaces);

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

    private _toggleLoadingIndicator(isLoading: boolean): void {
        if (isLoading && this._loadingIndicatorContainer) {
            this._loadingIndicator.show(this._loadingIndicatorContainer);
        } else {
            this._loadingIndicator.hide();
        }
    }
}
