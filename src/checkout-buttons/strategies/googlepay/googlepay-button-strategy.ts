import { FormPoster } from '@bigcommerce/form-poster';

import { CheckoutActionCreator, CheckoutStore } from '../../../checkout';
import { InvalidArgumentError, NotInitializedError, NotInitializedErrorType } from '../../../common/error/errors';
import { bindDecorator as bind } from '../../../common/utility';
import { GooglePayPaymentProcessor } from '../../../payment/strategies/googlepay';
import { CheckoutButtonInitializeOptions } from '../../checkout-button-options';
import CheckoutButtonStrategy from '../checkout-button-strategy';

export default class GooglePayButtonStrategy implements CheckoutButtonStrategy {
    private _methodId?: string;
    private _walletButton?: HTMLElement;

    constructor(
        private _store: CheckoutStore,
        private _formPoster: FormPoster,
        private _checkoutActionCreator: CheckoutActionCreator,
        private _googlePayPaymentProcessor: GooglePayPaymentProcessor
    ) {}

    initialize(options: CheckoutButtonInitializeOptions): Promise<void> {
        const { containerId, methodId } = options;

        if (!containerId || !methodId) {
            throw new InvalidArgumentError('Unable to proceed because "containerId" argument is not provided.');
        }

        this._methodId = methodId;

        return this._store.dispatch(this._checkoutActionCreator.loadDefaultCheckout())
            .then(() => this._googlePayPaymentProcessor.initialize(this._getMethodId()))
            .then(() => {
                this._walletButton = this._createSignInButton(containerId);
            });
    }

    deinitialize(): Promise<void> {
        if (this._walletButton && this._walletButton.parentNode) {
            this._walletButton.parentNode.removeChild(this._walletButton);
            this._walletButton = undefined;
        }

        return this._googlePayPaymentProcessor.deinitialize();
    }

    private _createSignInButton(containerId: string): HTMLElement {
        const container = document.getElementById(containerId);

        if (!container) {
            throw new InvalidArgumentError('Unable to create sign-in button without valid container ID.');
        }

        const googlePayButton = this._googlePayPaymentProcessor.createButton(this._handleWalletButtonClick);

        container.appendChild(googlePayButton);

        return googlePayButton;
    }

    private _getMethodId(): string {
        if (!this._methodId) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this._methodId;
    }

    @bind
    private async _handleWalletButtonClick(event: Event): Promise<void> {
        event.preventDefault();

        try {
            const paymentData = await this._googlePayPaymentProcessor.displayWallet();
            await this._googlePayPaymentProcessor.handleSuccess(paymentData);
            if (paymentData.shippingAddress) {
                await this._googlePayPaymentProcessor.updateShippingAddress(paymentData.shippingAddress);
            }
            await this._onPaymentSelectComplete();
        } catch (error) {
            if (error && error.message !== 'CANCELED') {
                throw error;
            }
        }
    }

    private _onPaymentSelectComplete(): void {
        this._formPoster.postForm('/checkout.php', {
            headers: {
                Accept: 'text/html',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
    }
}
