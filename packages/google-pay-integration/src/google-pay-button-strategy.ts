import {
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

import { WithGooglePayButtonInitializeOptions } from './google-pay-button-initialize-options';
import GooglePayPaymentProcessor from './google-pay-payment-processor';
import isGooglePayErrorObject from './guards/is-google-pay-error-object';
import isGooglePayKey from './guards/is-google-pay-key';
import { GooglePayButtonOptions, GooglePayInitializationData } from './types';

export default class GooglePayButtonStrategy implements CheckoutButtonStrategy {
    private _paymentButton?: HTMLElement;
    private _methodId?: keyof WithGooglePayButtonInitializeOptions;

    constructor(
        private _paymentIntegrationService: PaymentIntegrationService,
        private _googlePayPaymentProcessor: GooglePayPaymentProcessor,
    ) {}

    async initialize({
        methodId,
        containerId,
        ...rest
    }: CheckoutButtonInitializeOptions & WithGooglePayButtonInitializeOptions): Promise<void> {
        if (!isGooglePayKey(methodId)) {
            throw new InvalidArgumentError(
                'Unable to proceed because "methodId" is not a valid key.',
            );
        }

        this._methodId = methodId;

        const googlePayOptions = rest[this._getMethodId()];

        await this._paymentIntegrationService.loadDefaultCheckout();
        await this._googlePayPaymentProcessor.initialize(() =>
            this._paymentIntegrationService
                .getState()
                .getPaymentMethodOrThrow<GooglePayInitializationData>(this._getMethodId()),
        );

        this._addPaymentButton(containerId, googlePayOptions);
    }

    deinitialize(): Promise<void> {
        this._paymentButton?.remove();
        this._paymentButton = undefined;
        this._methodId = undefined;

        return Promise.resolve();
    }

    private _addPaymentButton(
        walletButton: string,
        {
            buttonColor,
            buttonType,
        }: Pick<GooglePayButtonOptions, 'buttonColor' | 'buttonType'> = {},
    ): void {
        this._paymentButton =
            this._paymentButton ??
            this._googlePayPaymentProcessor.addPaymentButton(walletButton, {
                buttonColor: buttonColor ?? 'default',
                buttonType: buttonType ?? 'plain',
                onClick: this._handleClick(),
            });
    }

    private _handleClick(): (event: MouseEvent) => unknown {
        return async (event: MouseEvent) => {
            event.preventDefault();

            // TODO: Dispatch Widget Actions
            try {
                await this._interactWithPaymentSheet();
            } catch (error) {
                if (isGooglePayErrorObject(error)) {
                    if (error.statusCode === 'CANCELED') {
                        throw new PaymentMethodCancelledError();
                    }

                    throw new PaymentMethodFailedError(JSON.stringify(error));
                }

                throw error;
            }
        };
    }

    private async _interactWithPaymentSheet(): Promise<void> {
        await this._paymentIntegrationService.loadCheckout();

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

    private _getMethodId(): keyof WithGooglePayButtonInitializeOptions {
        return guard(
            this._methodId,
            () => new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized),
        );
    }
}
