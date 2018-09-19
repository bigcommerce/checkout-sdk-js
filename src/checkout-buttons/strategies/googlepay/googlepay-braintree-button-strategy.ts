import { CheckoutStore } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType } from '../../../common/error/errors';
import { PaymentInitializeOptions, PaymentMethod } from '../../../payment';
import { BraintreeSDKCreator } from '../../../payment/strategies/braintree';
import { GooglePayPaymentStrategy, GooglePayScriptLoader } from '../../../payment/strategies/googlepay';
import { CheckoutButtonInitializeOptions, CheckoutButtonOptions } from '../../checkout-button-options';

import CheckoutButtonStrategy from '../checkout-button-strategy';

export default class BraintreeGooglePayButtonStrategy extends CheckoutButtonStrategy {
    private _googlePayPaymentStrategy?: GooglePayPaymentStrategy;
    private _paymentMethod?: PaymentMethod;

    constructor(
        private _store: CheckoutStore,
        private _braintreeSDKCreator: BraintreeSDKCreator,
        private _googlePayScriptLoader: GooglePayScriptLoader
    ) {
        super();
    }

    initialize(options: CheckoutButtonInitializeOptions): Promise<void> {
        if (this._isInitialized) {
            return super.initialize(options);
        }

        const googlePayOptions = options.braintreegooglepay;
        const state = this._store.getState();
        const paymentMethod = this._paymentMethod = state.paymentMethods.getPaymentMethod(options.methodId);

        if (!googlePayOptions) {
            throw new InvalidArgumentError();
        }

        if (!paymentMethod || !paymentMethod.clientToken) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        this._braintreeSDKCreator.initialize(paymentMethod.clientToken);

        return Promise.all([
            this._braintreeSDKCreator.getGooglePaymentComponent(),
            this._googlePayScriptLoader.load(),
        ])
            .then(([sdkCreator, googlePayScriptLoader]) => {
                const button = document.getElementById(googlePayOptions.container);
                const text = document.createElement('p');
                text.innerText = 'HOLA SI';
                if (button) {
                    button.appendChild(text);
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

        this._braintreeSDKCreator.teardown();

        return super.deinitialize(options);
    }

    private _onPaymentSelectComplete(): void {
        return window.location.assign('/checkout.php');
    }

    private _onError(error?: Error): void {
        if (error) {
            throw new Error(error.message);
        }
    }

}
