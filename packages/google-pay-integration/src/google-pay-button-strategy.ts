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

import { WithGooglePayButtonInitializeOptions } from './google-pay-button-initialize-option';
import GooglePayCustomerInitializeOptions from './google-pay-customer-initialize-options';
import { WithGooglePayPaymentInitializeOptions } from './google-pay-payment-initialize-options';
import GooglePayPaymentProcessor from './google-pay-payment-processor';
import isGooglePayErrorObject from './guards/is-google-pay-error-object';
import isGooglePayKey from './guards/is-google-pay-key';
import {
    GooglePayBuyNowInitializeOptions,
    GooglePayError,
    GooglePayInitializationData,
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

        const { buyNowInitializeOptions, currencyCode, buttonColor, buttonType, onError } =
            googlePayOptions;

        let state = this._paymentIntegrationService.getState();
        let paymentMethod: PaymentMethod<GooglePayInitializationData>;

        try {
            paymentMethod = state.getPaymentMethodOrThrow(this._getMethodOrThrow());
        } catch (_e) {
            state = await this._paymentIntegrationService.loadPaymentMethod(
                this._getMethodOrThrow(),
            );
            paymentMethod = state.getPaymentMethodOrThrow(this._getMethodOrThrow());
        }

        this._countryCode = paymentMethod.initializationData?.storeCountry;

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
        const billingAddress =
            this._googlePayPaymentProcessor.mapToBillingAddressRequestBody(response);
        const shippingAddress =
            this._googlePayPaymentProcessor.mapToShippingAddressRequestBody(response);
        const siteLink =
            window.location.pathname === '/embedded-checkout'
                ? this._paymentIntegrationService.getState().getStoreConfigOrThrow().links.siteLink
                : undefined;

        if (billingAddress) {
            await this._paymentIntegrationService.updateBillingAddress(billingAddress);
        }

        if (shippingAddress && !this._buyNowCart?.lineItems.digitalItems.length) {
            await this._paymentIntegrationService.updateShippingAddress(shippingAddress);
        }

        await this._googlePayPaymentProcessor.setExternalCheckoutForm(
            this._getMethodOrThrow(),
            response,
            siteLink,
        );
    }

    private _getGooglePayClientOptions(): GooglePayPaymentOptions | undefined {
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
                    let error: GooglePayError | undefined;

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

                    const { newOfferInfo = undefined, error: couponsError = undefined } =
                        offerChangeTriggers.includes(callbackTrigger)
                            ? await this._googlePayPaymentProcessor.handleCoupons(offerData, true)
                            : {};

                    if (couponsError) {
                        error = couponsError;
                    }

                    if (this._buyNowInitializeOptions) {
                        return this._getBuyNowTransactionInfo(
                            availableShippingOptions,
                            newOfferInfo,
                            error,
                        );
                    }

                    return this._getTransactionInfo(availableShippingOptions, newOfferInfo, error);
                },
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
