import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { MissingDataError, MissingDataErrorType, NotInitializedError, NotInitializedErrorType } from '../../../common/error/errors';
import { BoltCheckout, BoltScriptLoader } from '../../../payment/strategies/bolt';
import { CustomerContinueOptions, CustomerContinueRequestOptions } from '../../customer-continue-request-options';
import CustomerContinueStrategy from '../customer-continue-strategy';

export default class BoltCustomerContinueStrategy implements CustomerContinueStrategy {
    private _boltClient?: BoltCheckout;

    constructor(
        private _store: CheckoutStore,
        private _boltScriptLoader: BoltScriptLoader
    ) {}

    async initialize(options: CustomerContinueRequestOptions): Promise<InternalCheckoutSelectors> {
        const { methodId } = options;

        const state = this._store.getState();
        const paymentMethod = state.paymentMethods.getPaymentMethod(methodId);

        if (!paymentMethod || !paymentMethod.initializationData.publishableKey) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const { developerConfig, publishableKey } = paymentMethod.initializationData;

        this._boltClient = await this._boltScriptLoader.load(publishableKey, paymentMethod.config.testMode, developerConfig);

        return Promise.resolve(this._store.getState());
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        this._boltClient = undefined;

        return Promise.resolve(this._store.getState());
    }

    executeBeforeSignIn(options: CustomerContinueOptions) {
        return this.openCustomBoltCheckoutWidget(options);
    }

    executeBeforeSignUp(options: CustomerContinueOptions) {
        return this.openCustomBoltCheckoutWidget(options);
    }

    executeBeforeContinueAsGuest(options: CustomerContinueOptions) {
        return this.openCustomBoltCheckoutWidget(options);
    }

    private async openCustomBoltCheckoutWidget(options: CustomerContinueOptions): Promise<InternalCheckoutSelectors> {
        const { email, fallback, methodId } = options;

        const state = this._store.getState();
        const paymentMethod = state.paymentMethods.getPaymentMethod(methodId);

        try {
            if (!fallback) {
                throw new MissingDataError(MissingDataErrorType.MissingFallback);
            }

            if (!email) {
                throw new MissingDataError(MissingDataErrorType.MissingCustomerEmail);
            }

            if (!this._boltClient) {
                throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
            }

            if (!paymentMethod) {
                throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
            }

            if (paymentMethod.initializationData?.withCustomContinueFlow) {
                const callbacks = {
                    success: () => {},
                    close: fallback,
                };

                await this._boltClient.setClientCustomCallbacks(callbacks);
                const result = await this._boltClient.openCheckout(email);

                if (result?.has_bolt_account === false) {
                    fallback();
                }
            } else {
                fallback();
            }
        } catch (error) {
            fallback();
            throw error;
        }

        return Promise.resolve(this._store.getState());
    }
}
