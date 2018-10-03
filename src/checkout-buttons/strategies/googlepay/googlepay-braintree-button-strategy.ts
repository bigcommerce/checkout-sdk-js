import { FormPoster } from '@bigcommerce/form-poster';

import { CheckoutStore } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType } from '../../../common/error/errors';
import { PaymentInitializeOptions, PaymentMethod } from '../../../payment';
import { GooglePayPaymentStrategy, GooglePayScriptLoader } from '../../../payment/strategies/googlepay';
import { CheckoutButtonInitializeOptions, CheckoutButtonOptions } from '../../checkout-button-options';

import CheckoutButtonStrategy from '../checkout-button-strategy';

export default class GooglePayBraintreeButtonStrategy extends CheckoutButtonStrategy {
    private _paymentMethod?: PaymentMethod;

    constructor(
        private _store: CheckoutStore,
        private _formPoster: FormPoster,
        private _googlePayScriptLoader: GooglePayScriptLoader,
        private _googlePayPaymentStrategy: GooglePayPaymentStrategy
    ) {
        super();
    }

    initialize(options: CheckoutButtonInitializeOptions): Promise<void> {
        if (this._isInitialized) {
            return super.initialize(options);
        }

        const googlePayOptions = options.googlepaybraintree;
        const state = this._store.getState();
        const paymentMethod = this._paymentMethod = state.paymentMethods.getPaymentMethod(options.methodId);

        if (!googlePayOptions) {
            throw new InvalidArgumentError();
        }

        if (!paymentMethod || !paymentMethod.clientToken) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        return this._googlePayScriptLoader.load()
            .then(googlePayScriptLoader => {
                const googlepayClient = new googlePayScriptLoader.payments.api.PaymentsClient({
                    environment: googlePayOptions.environment,
                });
                const buttonGooglePay = googlepayClient.createButton({
                    onClick: () => {},
                    buttonColor: googlePayOptions.buttonColor,
                    buttonType: googlePayOptions.buttonType,
                });
                const button = document.getElementById(googlePayOptions.container);
                if (button) {
                    button.innerHTML = buttonGooglePay;
                }
                if (this._googlePayPaymentStrategy) {
                    const paymentOptions: PaymentInitializeOptions = {
                        methodId: options.methodId,
                        googlepay: {
                            walletButton: googlePayOptions.container,
                            onPaymentSelect: this._onPaymentSelectComplete,
                            onError: this._onError,
                        },
                    };
                    this._googlePayPaymentStrategy.initialize(paymentOptions);
                }
            })
            .then(() => super.initialize(options));
    }

    deinitialize(options: CheckoutButtonOptions): Promise<void> {
        if (!this._isInitialized) {
            return super.deinitialize(options);
        }

        this._paymentMethod = undefined;

        return super.deinitialize(options);
    }

    private _onPaymentSelectComplete(): void {
        this._formPoster.postForm('/checkout.php', {
            headers: {
                Accept: 'text/html',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            params: {
                fromGooglePay: true,
            },
        });
    }

    private _onError(error?: Error): void {
        if (error) {
            throw new Error(error.message);
        }
    }

}
