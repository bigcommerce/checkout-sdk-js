import { CheckoutActionCreator, CheckoutStore } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType } from '../../../common/error/errors';
import { AmazonMaxoPaymentProcessor, AmazonMaxoPlacement } from '../../../payment/strategies/amazon-maxo';
import { CheckoutButtonInitializeOptions } from '../../checkout-button-options';
import CheckoutButtonStrategy from '../checkout-button-strategy';

export default class AmazonMaxoButtonStrategy implements CheckoutButtonStrategy {
    private _walletButton?: HTMLElement;

    constructor(
        private _store: CheckoutStore,
        private _checkoutActionCreator: CheckoutActionCreator,
        private _amazonMaxoPaymentProcessor: AmazonMaxoPaymentProcessor
    ) { }

    async initialize(options: CheckoutButtonInitializeOptions): Promise<void> {
            const { containerId, methodId } = options;
            if (!containerId) {
                throw new InvalidArgumentError('Unable to proceed because "containerId" argument is not provided.');
            }
            await this._store.dispatch(this._checkoutActionCreator.loadDefaultCheckout());
            await this._amazonMaxoPaymentProcessor.initialize(methodId);
            this._walletButton = this._createSignInButton(containerId, methodId);
    }

    deinitialize(): Promise<void> {
        if (this._walletButton && this._walletButton.parentNode) {
            this._walletButton.parentNode.removeChild(this._walletButton);
            this._walletButton = undefined;
        }

        return Promise.resolve();
    }

    private _createSignInButton(containerId: string, methodId: string): HTMLElement {
        const container = document.querySelector(`#${containerId}`);

        if (!container) {
            throw new InvalidArgumentError('Unable to create sign-in button without valid container ID.');
        }

        const state = this._store.getState();
        const paymentMethod = state.paymentMethods.getPaymentMethod(methodId);

        const config = state.config.getStoreConfig();

        if (!config) {
            throw new MissingDataError(MissingDataErrorType.MissingCheckoutConfig);
        }

        if (!paymentMethod) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const {
            config: {
                merchantId,
                testMode,
            },
            initializationData: {
                checkoutLanguage,
                ledgerCurrency,
                checkoutSessionMethod,
                region,
                extractAmazonCheckoutSessionId,
            },
        } = paymentMethod;

        if (!merchantId) {
            throw new InvalidArgumentError();
        }

        const amazonButtonOptions = {
            merchantId,
            sandbox: !!testMode,
            checkoutLanguage,
            ledgerCurrency,
            region,
            productType: 'PayAndShip',
            createCheckoutSession: {
                method: checkoutSessionMethod,
                url: `${config.storeProfile.shopPath}/remote-checkout/${methodId}/payment-session`,
                extractAmazonCheckoutSessionId,
            },
            placement: AmazonMaxoPlacement.Cart,
        };

        return this._amazonMaxoPaymentProcessor.createButton(`#${containerId}`, amazonButtonOptions);
    }
}
