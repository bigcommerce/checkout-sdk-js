import {
    BuyNowCartCreationError,
    Cart,
    CheckoutButtonInitializeOptions,
    CheckoutButtonStrategy,
    guard,
    InvalidArgumentError,
    NotInitializedError,
    NotInitializedErrorType,
    PaymentIntegrationService,
    PaymentMethod,
    PaymentMethodCancelledError,
    PaymentMethodFailedError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import {
    GooglePayButtonInitializeOptions,
    WithGooglePayButtonInitializeOptions,
} from './google-pay-button-initialize-option';
import GooglePayCustomerInitializeOptions from './google-pay-customer-initialize-options';
import { WithGooglePayPaymentInitializeOptions } from './google-pay-payment-initialize-options';
import GooglePayPaymentProcessor from './google-pay-payment-processor';
import isGooglePayErrorObject from './guards/is-google-pay-error-object';
import isGooglePayKey from './guards/is-google-pay-key';
import {
    ErrorReasonType,
    GooglePayBuyNowInitializeOptions,
    GooglePayCardDataResponse,
    GooglePayError,
    GooglePayInitializationData,
    GooglePayPaymentAuthorizationResult,
    GooglePayPaymentDataRequest,
    GooglePayPaymentOptions,
    ShippingOptionParameters,
    TotalPriceStatusType,
} from './types';

export default class GooglePayButtonStrategy implements CheckoutButtonStrategy {
    private _paymentButton?: HTMLElement;
    private _methodId?: keyof WithGooglePayPaymentInitializeOptions;
    private _buyNowCart?: Cart;
    private _currencyCode?: string;
    private _buyNowInitializeOptions?: GooglePayBuyNowInitializeOptions;
    private _countryCode?: string;
    private _onPaymentAuthorize?: GooglePayButtonInitializeOptions['onPaymentAuthorize'];

    constructor(
        private _paymentIntegrationService: PaymentIntegrationService,
        private _googlePayPaymentProcessor: GooglePayPaymentProcessor,
    ) {}

    async initialize(
        options: CheckoutButtonInitializeOptions & WithGooglePayButtonInitializeOptions,
    ): Promise<void> {
        if (!options.methodId || !isGooglePayKey(options.methodId)) {
            throw new InvalidArgumentError(
                'Unable to proceed because "methodId" is not a valid key.',
            );
        }

        this._methodId = options.methodId;

        if (!options.containerId) {
            throw new InvalidArgumentError(
                'Unable to proceed because "containerId" is not a valid key.',
            );
        }

        const googlePayOptions = options[this._getMethodOrThrow()];

        if (!googlePayOptions) {
            throw new InvalidArgumentError('Unable to proceed without valid options.');
        }

        const {
            buyNowInitializeOptions,
            currencyCode,
            buttonColor,
            buttonType,
            onError,
            filterAvailableShippingOptions,
            onPaymentAuthorize,
        } = googlePayOptions;

        let state = this._paymentIntegrationService.getState();
        let paymentMethod: PaymentMethod<GooglePayInitializationData>;

        try {
            paymentMethod = state.getPaymentMethodOrThrow(this._getMethodOrThrow());
        } catch {
            state = await this._paymentIntegrationService.loadPaymentMethod(
                this._getMethodOrThrow(),
            );
            paymentMethod = state.getPaymentMethodOrThrow(this._getMethodOrThrow());
        }

        this._countryCode = paymentMethod.initializationData?.storeCountry;
        this._googlePayPaymentProcessor.setIsWebViewExperimentOn(
            !!paymentMethod.initializationData?.isWebViewExperimentOn,
        );

        if (!this._googlePayPaymentProcessor.isWebViewWithRestrictions()) {
            this._onPaymentAuthorize = onPaymentAuthorize;
        }

        this._googlePayPaymentProcessor.setShouldPlaceOrderInModal(!!this._onPaymentAuthorize);
        this._googlePayPaymentProcessor.setFilterAvailableShippingOptions(
            filterAvailableShippingOptions,
        );

        if (buyNowInitializeOptions) {
            if (!currencyCode) {
                throw new InvalidArgumentError(
                    `Unable to initialize payment because "options.currencyCode" argument is not provided.`,
                );
            }

            this._currencyCode = currencyCode;
            this._buyNowInitializeOptions = buyNowInitializeOptions;

            await this._googlePayPaymentProcessor.initialize(
                () => paymentMethod,
                this._getGooglePayClientOptions(),
                !!buyNowInitializeOptions,
                currencyCode,
            );
        } else {
            await this._paymentIntegrationService.loadDefaultCheckout();
            await this._googlePayPaymentProcessor.initialize(
                () => paymentMethod,
                this._getGooglePayClientOptions(),
            );
        }

        this._paymentButton =
            this._paymentButton ??
            this._googlePayPaymentProcessor.addPaymentButton(options.containerId, {
                buttonColor: buttonColor ?? 'default',
                buttonType: buttonType ?? 'plain',
                onClick: this._handleClick(onError),
            });
    }

    deinitialize(): Promise<void> {
        this._paymentButton?.remove();
        this._paymentButton = undefined;
        this._methodId = undefined;
        this._onPaymentAuthorize = undefined;

        return Promise.resolve();
    }

    private _handleClick(
        onError: GooglePayCustomerInitializeOptions['onError'],
    ): (event: MouseEvent) => Promise<void> {
        return async (event: MouseEvent) => {
            event.preventDefault();

            try {
                if (this._buyNowInitializeOptions) {
                    await this._createBuyNowCartOrThrow(this._buyNowInitializeOptions);
                } else {
                    await this._paymentIntegrationService.loadDefaultCheckout();
                }

                await this._googlePayPaymentProcessor.initializeWidget();
                await this._interactWithPaymentSheet();
            } catch (error) {
                let err: unknown = error;

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
        };
    }

    private async _interactWithPaymentSheet(): Promise<void> {
        const response = await this._googlePayPaymentProcessor.showPaymentSheet();

        if (this._onPaymentAuthorize) {
            this._onPaymentAuthorize(
                this._paymentIntegrationService.getState().getOrder()?.orderId,
            );

            return;
        }

        const siteLink =
            window.location.pathname === '/embedded-checkout'
                ? this._paymentIntegrationService.getState().getStoreConfigOrThrow().links.siteLink
                : undefined;

        await this._updateAddresses(response);

        await this._googlePayPaymentProcessor.setExternalCheckoutForm(
            this._getMethodOrThrow(),
            response,
            siteLink,
        );
    }

    private async _updateAddresses(response: GooglePayCardDataResponse): Promise<void> {
        const billingAddress =
            this._googlePayPaymentProcessor.mapToBillingAddressRequestBody(response);
        const shippingAddress =
            this._googlePayPaymentProcessor.mapToShippingAddressRequestBody(response);

        if (billingAddress) {
            await this._paymentIntegrationService.updateBillingAddress(billingAddress);
        }

        if (shippingAddress && !this._buyNowCart?.lineItems.digitalItems.length) {
            await this._paymentIntegrationService.updateShippingAddress(shippingAddress);
        }
    }

    private async _handlePaymentAuthorized(
        response: GooglePayCardDataResponse,
    ): Promise<GooglePayPaymentAuthorizationResult> {
        const methodId = this._getMethodOrThrow();

        try {
            await this._updateAddresses(response);
            await this._googlePayPaymentProcessor.setExternalCheckoutXhr(methodId, response);
            await this._paymentIntegrationService.loadPaymentMethod(methodId);
            await this._paymentIntegrationService.submitOrder({ useStoreCredit: false });

            const nonce = await this._googlePayPaymentProcessor.getNonce(methodId);
            const extraData = await this._googlePayPaymentProcessor.extraPaymentData();
            const payment = { methodId, paymentData: { nonce, ...extraData } };

            try {
                await this._paymentIntegrationService.submitPayment(payment);
            } catch (error) {
                await this._googlePayPaymentProcessor.processAdditionalAction(error, methodId);
            }

            return { transactionState: 'SUCCESS' };
        } catch {
            return {
                transactionState: 'ERROR',
                error: {
                    intent: 'PAYMENT_AUTHORIZATION',
                    message: 'Unable to place the order. Please try again.',
                    reason: ErrorReasonType.PAYMENT_DATA_INVALID,
                },
            };
        }
    }

    private _getGooglePayClientOptions(): GooglePayPaymentOptions | undefined {
        if (this._googlePayPaymentProcessor.isWebViewWithRestrictions()) {
            return {};
        }

        return {
            paymentDataCallbacks: {
                onPaymentDataChanged: async ({
                    callbackTrigger,
                    shippingAddress,
                    shippingOptionData,
                    offerData,
                }) => {
                    const {
                        availableTriggers,
                        addressChangeTriggers,
                        shippingOptionsChangeTriggers,
                        offerChangeTriggers,
                    } = this._googlePayPaymentProcessor.getCallbackTriggers();

                    if (!availableTriggers.includes(callbackTrigger)) {
                        return;
                    }

                    const availableShippingOptions = addressChangeTriggers.includes(callbackTrigger)
                        ? await this._googlePayPaymentProcessor.handleShippingAddressChange(
                              shippingAddress,
                          )
                        : undefined;

                    if (shippingOptionsChangeTriggers.includes(callbackTrigger)) {
                        await this._googlePayPaymentProcessor.handleShippingOptionChange(
                            shippingOptionData.id,
                        );
                    }

                    const { newOfferInfo, error: couponsError } = offerChangeTriggers.includes(
                        callbackTrigger,
                    )
                        ? await this._googlePayPaymentProcessor.handleCoupons(offerData)
                        : {};

                    // We can add another errors if needed 'couponsError || shippingError || anotherError'
                    const error: GooglePayError | undefined = couponsError;

                    if (this._buyNowInitializeOptions) {
                        return this._getBuyNowTransactionInfo(
                            availableShippingOptions,
                            newOfferInfo,
                            error,
                        );
                    }

                    return this._getTransactionInfo(availableShippingOptions, newOfferInfo, error);
                },
                ...(this._onPaymentAuthorize && {
                    onPaymentAuthorized: async (response: GooglePayCardDataResponse) =>
                        this._handlePaymentAuthorized(response),
                }),
            },
        };
    }

    private async _createBuyNowCartOrThrow(
        buyNowInitializeOptions?: GooglePayBuyNowInitializeOptions,
    ): Promise<void> {
        if (typeof buyNowInitializeOptions?.getBuyNowCartRequestBody === 'function') {
            const cartRequestBody = buyNowInitializeOptions.getBuyNowCartRequestBody();

            try {
                this._buyNowCart = await this._paymentIntegrationService.createBuyNowCart(
                    cartRequestBody,
                );

                await this._paymentIntegrationService.loadCheckout(this._buyNowCart.id);
            } catch (error) {
                if (typeof error === 'string') {
                    throw new BuyNowCartCreationError(error);
                }

                throw error;
            }
        }
    }

    private _getBuyNowTransactionInfo(
        availableShippingOptions?: ShippingOptionParameters,
        newOfferInfo?: GooglePayPaymentDataRequest['offerInfo'],
        error?: GooglePayError,
    ) {
        if (!this._buyNowCart) {
            return;
        }

        const { cartAmount } = this._buyNowCart;

        const totalPrice = this._googlePayPaymentProcessor.getTotalPrice();

        return {
            newTransactionInfo: {
                ...(this._countryCode && { countryCode: this._countryCode }),
                currencyCode: this._getCurrencyCodeOrThrow(),
                totalPrice: totalPrice || String(cartAmount),
                totalPriceStatus: TotalPriceStatusType.FINAL,
            },
            ...(availableShippingOptions && {
                newShippingOptionParameters: availableShippingOptions,
            }),
            ...(newOfferInfo && {
                newOfferInfo,
            }),
            ...(error && {
                error,
            }),
        };
    }

    private async _getTransactionInfo(
        availableShippingOptions?: ShippingOptionParameters,
        newOfferInfo?: GooglePayPaymentDataRequest['offerInfo'],
        error?: GooglePayError,
    ) {
        await this._paymentIntegrationService.loadCheckout();

        const totalPrice = this._googlePayPaymentProcessor.getTotalPrice();
        const { code: currencyCode } = this._paymentIntegrationService
            .getState()
            .getCartOrThrow().currency;

        return {
            newTransactionInfo: {
                ...(this._countryCode && { countryCode: this._countryCode }),
                currencyCode,
                totalPriceStatus: TotalPriceStatusType.FINAL,
                totalPrice,
            },
            ...(availableShippingOptions && {
                newShippingOptionParameters: availableShippingOptions,
            }),
            ...(newOfferInfo && {
                newOfferInfo,
            }),
            ...(error && {
                error,
            }),
        };
    }

    private _getMethodOrThrow(): keyof WithGooglePayButtonInitializeOptions {
        return guard(
            this._methodId,
            () => new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized),
        );
    }

    private _getCurrencyCodeOrThrow(): string {
        return guard(
            this._currencyCode,
            () =>
                new InvalidArgumentError(
                    'Unable to initialize payment because "options.currencyCode" argument is not provided.',
                ),
        );
    }
}
