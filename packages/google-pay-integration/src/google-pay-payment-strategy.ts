import { round } from 'lodash';

import {
    guard,
    InvalidArgumentError,
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

import GooglePayPaymentInitializeOptions, {
    WithGooglePayPaymentInitializeOptions,
} from './google-pay-payment-initialize-options';
import GooglePayPaymentProcessor from './google-pay-payment-processor';
import isGooglePayErrorObject from './guards/is-google-pay-error-object';
import isGooglePayKey from './guards/is-google-pay-key';
import {
    CallbackTriggerType,
    GooglePayInitializationData,
    GooglePayPaymentOptions,
    IntermediatePaymentData,
    NewTransactionInfo,
    TotalPriceStatusType,
} from './types';

export default class GooglePayPaymentStrategy implements PaymentStrategy {
    private _paymentButton?: HTMLElement;
    private _clickListener?: (event: MouseEvent) => unknown;
    private _methodId?: keyof WithGooglePayPaymentInitializeOptions;
    private _countryCode?: string;

    constructor(
        protected _paymentIntegrationService: PaymentIntegrationService,
        protected _googlePayPaymentProcessor: GooglePayPaymentProcessor,
    ) {}

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

        const { walletButton, ...callbacks } = googlePayOptions;

        await this._paymentIntegrationService.loadPaymentMethod(this._getMethodId());

        const paymentMethod = this._paymentIntegrationService
            .getState()
            .getPaymentMethodOrThrow<GooglePayInitializationData>(this._getMethodId());

        this._countryCode = paymentMethod.initializationData?.storeCountry;

        await this._googlePayPaymentProcessor.initialize(
            () => paymentMethod,
            this._getGooglePayClientOptions(),
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
            await this._googlePayPaymentProcessor.processAdditionalAction(error);
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

            onPaymentSelect?.();
        };
    }

    protected async _interactWithPaymentSheet(): Promise<void> {
        const response = await this._googlePayPaymentProcessor.showPaymentSheet();
        const billingAddress =
            this._googlePayPaymentProcessor.mapToBillingAddressRequestBody(response);

        if (billingAddress) {
            await this._paymentIntegrationService.updateBillingAddress(billingAddress);
        }

        await this._googlePayPaymentProcessor.setExternalCheckoutXhr(this._getMethodId(), response);

        await this._paymentIntegrationService.loadCheckout();
        await this._paymentIntegrationService.loadPaymentMethod(this._getMethodId());
    }

    protected _getMethodId(): keyof WithGooglePayPaymentInitializeOptions {
        return guard(
            this._methodId,
            () => new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized),
        );
    }

    protected _getGooglePayClientOptions(): GooglePayPaymentOptions {
        return {
            paymentDataCallbacks: {
                onPaymentDataChanged: async ({
                    callbackTrigger,
                }: IntermediatePaymentData): Promise<NewTransactionInfo | void> => {
                    if (callbackTrigger !== CallbackTriggerType.INITIALIZE) {
                        return;
                    }

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
                            ...(this._countryCode && { countryCode: this._countryCode }),
                            currencyCode,
                            totalPriceStatus: TotalPriceStatusType.FINAL,
                            totalPrice,
                        },
                    };
                },
            },
        };
    }
}
