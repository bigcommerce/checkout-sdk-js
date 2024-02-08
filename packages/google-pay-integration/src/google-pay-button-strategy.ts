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
    CallbackTriggerType,
    GooglePayBuyNowInitializeOptions,
    GooglePayInitializationData,
    GooglePayPaymentOptions,
    IntermediatePaymentData,
    NewTransactionInfo,
    TotalPriceStatusType,
} from './types';

export default class GooglePayButtonStrategy implements CheckoutButtonStrategy {
    private _methodId?: keyof WithGooglePayPaymentInitializeOptions;
    private _buyNowCart?: Cart;
    private _currencyCode?: string;

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

        if (buyNowInitializeOptions) {
            if (!currencyCode) {
                throw new InvalidArgumentError(
                    `Unable to initialize payment because "options.currencyCode" argument is not provided.`,
                );
            }

            this._currencyCode = currencyCode;

            await this._googlePayPaymentProcessor.initialize(
                () =>
                    this._paymentIntegrationService
                        .getState()
                        .getPaymentMethodOrThrow<GooglePayInitializationData>(
                            this._getMethodOrThrow(),
                        ),
                this._getGooglePayClientOptions(googlePayOptions),
                !!buyNowInitializeOptions,
                currencyCode,
            );
        } else {
            await this._paymentIntegrationService.loadDefaultCheckout();
            await this._googlePayPaymentProcessor.initialize(
                () =>
                    this._paymentIntegrationService
                        .getState()
                        .getPaymentMethodOrThrow<GooglePayInitializationData>(
                            this._getMethodOrThrow(),
                        ),
                this._getGooglePayClientOptions(googlePayOptions),
            );
        }

        this._googlePayPaymentProcessor.addPaymentButton(options.containerId, {
            buttonColor: buttonColor ?? 'default',
            buttonType: buttonType ?? 'plain',
            onClick: this._handleClick(onError),
        });
    }

    deinitialize(): Promise<void> {
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

        if (shippingAddress) {
            await this._paymentIntegrationService.updateShippingAddress(shippingAddress);
        }

        await this._googlePayPaymentProcessor.setExternalCheckoutForm(
            this._getMethodOrThrow(),
            response,
            siteLink,
        );
    }

    private _getGooglePayClientOptions(
        googlePayOptions: GooglePayButtonInitializeOptions,
    ): GooglePayPaymentOptions | undefined {
        return {
            paymentDataCallbacks: {
                onPaymentDataChanged: async ({
                    callbackTrigger,
                }: IntermediatePaymentData): Promise<NewTransactionInfo | void> => {
                    if (callbackTrigger !== CallbackTriggerType.INITIALIZE) {
                        return;
                    }

                    try {
                        this._buyNowCart = await this._createBuyNowCartOrThrow(
                            googlePayOptions.buyNowInitializeOptions,
                        );

                        if (this._buyNowCart) {
                            const { id, cartAmount } = this._buyNowCart;

                            await this._paymentIntegrationService.loadCheckout(id);

                            return {
                                newTransactionInfo: {
                                    currencyCode: this._getCurrencyCodeOrThrow(),
                                    totalPrice: String(cartAmount),
                                    totalPriceStatus: TotalPriceStatusType.FINAL,
                                },
                            };
                        }
                    } catch (error) {
                        throw new BuyNowCartCreationError(error);
                    }
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
