import { CheckoutActionCreator, CheckoutStore } from '../../../checkout';
import { InvalidArgumentError } from '../../../common/error/errors';
import { AmazonPayV2PaymentProcessor, AmazonPayV2Placement } from '../../../payment/strategies/amazon-pay-v2';
import { CheckoutButtonInitializeOptions } from '../../checkout-button-options';
import CheckoutButtonStrategy from '../checkout-button-strategy';

export default class AmazonPayV2ButtonStrategy implements CheckoutButtonStrategy {
    private _walletButton?: HTMLElement;

    constructor(
        private _store: CheckoutStore,
        private _checkoutActionCreator: CheckoutActionCreator,
        private _amazonPayV2PaymentProcessor: AmazonPayV2PaymentProcessor
    ) { }

    async initialize(options: CheckoutButtonInitializeOptions): Promise<void> {
        const { methodId, containerId, amazonpay } = options;

        if (!methodId || !containerId) {
            throw new InvalidArgumentError('Unable to proceed because "methodId" or "containerId" argument is not provided.');
        }

        const { paymentMethods: { getPaymentMethodOrThrow } } = this._store.getState();

        await this._amazonPayV2PaymentProcessor.initialize(getPaymentMethodOrThrow(methodId));

        if (!amazonpay) {
            await this._store.dispatch(this._checkoutActionCreator.loadDefaultCheckout());
        }

        this._walletButton =
            this._amazonPayV2PaymentProcessor.renderAmazonPayButton({
                checkoutState: this._store.getState(),
                containerId,
                methodId,
                options: amazonpay,
                placement: AmazonPayV2Placement.Cart,
            });
    }

    deinitialize(): Promise<void> {
        if (this._walletButton && this._walletButton.parentNode) {
            this._walletButton.parentNode.removeChild(this._walletButton);
            this._walletButton = undefined;
        }

        return Promise.resolve();
    }
}
