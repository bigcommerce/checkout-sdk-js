import { round } from 'lodash';

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
    CallbackTriggerType,
    GooglePayBuyNowInitializeOptions,
    GooglePayInitializationData,
    GooglePayPaymentOptions,
    IntermediatePaymentData,
    NewTransactionInfo,
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
    ): (event: MouseEvent) => unknown {
        return async (event: MouseEvent) => {
            event.preventDefault();

            try {
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
                }: IntermediatePaymentData): Promise<NewTransactionInfo | void> => {
                    if (callbackTrigger !== CallbackTriggerType.INITIALIZE) {
                        return;
                    }

                    if (this._buyNowInitializeOptions) {
                        return this._getBuyNowTransactionInfo();
                    }

                    return this._getTransactionInfo();
                },
            },
        };
    }

    private async _createBuyNowCartOrThrow(
        buyNowInitializeOptions?: GooglePayBuyNowInitializeOptions,
    ): Promise<Cart | undefined> {
        if (typeof buyNowInitializeOptions?.getBuyNowCartRequestBody === 'function') {
            const cartRequestBody = buyNowInitializeOptions.getBuyNowCartRequestBody();

            try {
                return await this._paymentIntegrationService.createBuyNowCart(cartRequestBody);
            } catch (error) {
                throw new BuyNowCartCreationError();
            }
        }
    }

    private async _getBuyNowTransactionInfo() {
        try {
            this._buyNowCart = await this._createBuyNowCartOrThrow(this._buyNowInitializeOptions);

            if (this._buyNowCart) {
                const { id, cartAmount } = this._buyNowCart;

                await this._paymentIntegrationService.loadCheckout(id);

                return {
                    newTransactionInfo: {
                        ...(this._countryCode && { countryCode: this._countryCode }),
                        currencyCode: this._getCurrencyCodeOrThrow(),
                        totalPrice: String(cartAmount),
                        totalPriceStatus: TotalPriceStatusType.FINAL,
                    },
                };
            }
        } catch (error) {
            throw new BuyNowCartCreationError(error);
        }
    }

    private async _getTransactionInfo() {
        await this._paymentIntegrationService.loadCheckout();

        const { getCheckoutOrThrow, getCartOrThrow } = this._paymentIntegrationService.getState();
        const { code: currencyCode, decimalPlaces } = getCartOrThrow().currency;
        const totalPrice = round(getCheckoutOrThrow().outstandingBalance, decimalPlaces).toFixed(
            decimalPlaces,
        );

        return {
            newTransactionInfo: {
                ...(this._countryCode && { countryCode: this._countryCode }),
                currencyCode,
                totalPriceStatus: TotalPriceStatusType.FINAL,
                totalPrice,
            },
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
