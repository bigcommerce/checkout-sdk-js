import { round } from 'lodash';

import {
    CustomerInitializeOptions,
    CustomerStrategy,
    ExecutePaymentMethodCheckoutOptions,
    guard,
    InvalidArgumentError,
    NotImplementedError,
    NotInitializedError,
    NotInitializedErrorType,
    PaymentIntegrationService,
    PaymentMethod,
    PaymentMethodCancelledError,
    PaymentMethodFailedError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import GooglePayCustomerInitializeOptions, {
    WithGooglePayCustomerInitializeOptions,
} from './google-pay-customer-initialize-options';
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

export default class GooglePayCustomerStrategy implements CustomerStrategy {
    private _paymentButton?: HTMLElement;
    private _methodId?: keyof WithGooglePayCustomerInitializeOptions;
    private _countryCode?: string;

    constructor(
        private _paymentIntegrationService: PaymentIntegrationService,
        private _googlePayPaymentProcessor: GooglePayPaymentProcessor,
    ) {}

    async initialize(
        options?: CustomerInitializeOptions & WithGooglePayCustomerInitializeOptions,
    ): Promise<void> {
        if (!options?.methodId || !isGooglePayKey(options.methodId)) {
            throw new InvalidArgumentError(
                'Unable to proceed because "methodId" is not a valid key.',
            );
        }

        this._methodId = options.methodId;

        const googlePayOptions = options[this._getMethodId()];

        if (!googlePayOptions) {
            throw new InvalidArgumentError('Unable to proceed without valid options.');
        }

        let state = this._paymentIntegrationService.getState();
        let paymentMethod: PaymentMethod<GooglePayInitializationData>;

        try {
            paymentMethod = state.getPaymentMethodOrThrow(this._getMethodId());
        } catch (_e) {
            state = await this._paymentIntegrationService.loadPaymentMethod(this._getMethodId());
            paymentMethod = state.getPaymentMethodOrThrow(this._getMethodId());
        }

        this._countryCode = paymentMethod.initializationData?.storeCountry;

        try {
            await this._googlePayPaymentProcessor.initialize(
                () => paymentMethod,
                this._getGooglePayClientOptions(),
            );
        } catch {
            return;
        }

        this._addPaymentButton(googlePayOptions);
    }

    signIn(): Promise<void> {
        return Promise.reject(
            new NotImplementedError(
                'In order to sign in via Google Pay, the shopper must click on "Google Pay" button.',
            ),
        );
    }

    async signOut(): Promise<void> {
        const providerId = this._paymentIntegrationService.getState().getPaymentId()?.providerId;

        if (providerId) {
            await this._googlePayPaymentProcessor.signOut(providerId);
        }
    }

    executePaymentMethodCheckout(options?: ExecutePaymentMethodCheckoutOptions): Promise<void> {
        options?.continueWithCheckoutCallback?.();

        return Promise.resolve();
    }

    deinitialize(): Promise<void> {
        this._paymentButton?.remove();
        this._paymentButton = undefined;
        this._methodId = undefined;

        return Promise.resolve();
    }

    private _getGooglePayClientOptions(): GooglePayPaymentOptions {
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

    private _addPaymentButton({
        container,
        buttonColor,
        buttonType,
        onClick,
        onError,
    }: GooglePayCustomerInitializeOptions): void {
        this._paymentButton =
            this._paymentButton ??
            this._googlePayPaymentProcessor.addPaymentButton(container, {
                buttonColor: buttonColor ?? 'default',
                buttonType: buttonType ?? 'plain',
                onClick: this._handleClick(onError, onClick),
            });
    }

    private _handleClick(
        onError: GooglePayCustomerInitializeOptions['onError'],
        onClick: GooglePayCustomerInitializeOptions['onClick'],
    ): (event: MouseEvent) => unknown {
        return async (event: MouseEvent) => {
            event.preventDefault();

            if (onClick && typeof onClick === 'function') {
                onClick();
            }

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
            this._getMethodId(),
            response,
            siteLink,
        );
    }

    private _getMethodId(): keyof WithGooglePayCustomerInitializeOptions {
        return guard(
            this._methodId,
            () => new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized),
        );
    }
}
