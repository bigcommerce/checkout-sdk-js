import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType, NotInitializedError, NotInitializedErrorType, UnhandledExternalError } from '../../../common/error/errors';
import { PaymentMethodActionCreator } from '../../../payment';
import { BoltCheckout, BoltScriptLoader } from '../../../payment/strategies/bolt';
import CustomerActionCreator from '../../customer-action-creator';
import CustomerCredentials from '../../customer-credentials';
import { CustomerContinueOptions, CustomerRequestOptions } from '../../customer-request-options';
import CustomerStrategy from '../customer-strategy';

export default class BoltCustomerStrategy implements CustomerStrategy {
    private _boltClient?: BoltCheckout;

    constructor(
        private _store: CheckoutStore,
        private _boltScriptLoader: BoltScriptLoader,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _customerActionCreator: CustomerActionCreator
    ) {}

    async initialize(options: CustomerRequestOptions): Promise<InternalCheckoutSelectors> {
        const { methodId } = options;

        if (!methodId) {
            throw new InvalidArgumentError('Unable to proceed because "methodId" argument is not provided.');
        }

        const state = await this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethods());

        const paymentMethod = state.paymentMethods.getPaymentMethod(methodId);

        if (!paymentMethod || !paymentMethod.initializationData.publishableKey) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const { developerConfig, publishableKey } = paymentMethod.initializationData;

        this._boltClient = await this._boltScriptLoader.load(publishableKey, paymentMethod.config.testMode, developerConfig);

        return this._store.getState();
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        this._boltClient = undefined;

        return Promise.resolve(this._store.getState());
    }

    signIn(credentials: CustomerCredentials, options?: CustomerRequestOptions): Promise<InternalCheckoutSelectors> {
        const { methodId } = options || {};

        if (!methodId) {
            throw new InvalidArgumentError('Unable to proceed because "methodId" argument is not provided.');
        }

        return this._store.dispatch(this._customerActionCreator.signInCustomer(credentials, options));
    }

    signOut(options?: CustomerRequestOptions): Promise<InternalCheckoutSelectors> {
        return this._store.dispatch(this._customerActionCreator.signOutCustomer(options));
    }

    customerContinue(options?: CustomerContinueOptions): Promise<InternalCheckoutSelectors> {
        const { methodId, fallback } = options || {};

        if (!methodId) {
            throw new InvalidArgumentError('Unable to proceed because "methodId" argument is not provided.');
        }

        if (!fallback) {
            throw new InvalidArgumentError('Unable to proceed because "fallback" argument is not provided.');
        }

        const state = this._store.getState();
        const customer = state.customer.getCustomer();
        const billingAddress = state.billingAddress.getBillingAddress();
        const email = customer?.email || billingAddress?.email;

        console.log({ email });

        if (!email) {
            fallback();

            return Promise.resolve(this._store.getState());
        }

        return this._openCustomBoltCheckoutWidget(email, methodId, fallback);
    }

    private async _openCustomBoltCheckoutWidget(email: string, methodId: string, fallback: () => void): Promise<InternalCheckoutSelectors> {
        const boltCheckout = this._boltClient;
        const state = this._store.getState();
        const paymentMethod = state.paymentMethods.getPaymentMethod(methodId);

        try {
            if (!boltCheckout) {
                throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
            }

            if (!paymentMethod) {
                throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
            }

            if (paymentMethod.initializationData?.customContinueFlowEnabled) {
                const hasBoltAccount = await boltCheckout.hasBoltAccount(email);

                if (hasBoltAccount) {
                    const callbacks = {
                        close: () => {
                            console.log('Modal window closed');
                            fallback();
                        },
                    };

                    await boltCheckout.openCheckout(email, callbacks);
                }
            }
        } catch (error) {
            if (error.name !== 'MissingDataError' && error.name !== 'NotInitializedError') {
                throw new UnhandledExternalError(error.message);
            }

            throw error;
        }

        return this._store.getState();
    }
}
