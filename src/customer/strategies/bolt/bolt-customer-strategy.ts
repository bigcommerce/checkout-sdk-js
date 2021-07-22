import { BillingAddressActionCreator } from '../../../billing';
import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType, NotInitializedError, NotInitializedErrorType, UnhandledExternalError } from '../../../common/error/errors';
import { PaymentMethodActionCreator } from '../../../payment';
import { BoltCheckout, BoltScriptLoader } from '../../../payment/strategies/bolt';
import CustomerAccountRequestBody from '../../customer-account';
import CustomerActionCreator from '../../customer-action-creator';
import CustomerCredentials from '../../customer-credentials';
import { CustomerRequestOptions } from '../../customer-request-options';
import { GuestCredentials } from '../../guest-credentials';
import CustomerStrategy from '../customer-strategy';

export default class BoltCustomerStrategy implements CustomerStrategy {
    private _boltClient?: BoltCheckout;

    constructor(
        private _store: CheckoutStore,
        private _boltScriptLoader: BoltScriptLoader,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _billingAddressActionCreator: BillingAddressActionCreator,
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

    async deinitialize(): Promise<InternalCheckoutSelectors> {
        this._boltClient = undefined;

        return this._store.getState();
    }

    async continueAsGuest(credentials: GuestCredentials, options?: CustomerRequestOptions): Promise<InternalCheckoutSelectors> {
        const { methodId } = options || {};

        if (!methodId) {
            throw new InvalidArgumentError('Unable to proceed because "methodId" argument is not provided.');
        }

        await this._openCustomBoltCheckoutWidget(credentials.email, methodId);

        return this._store.dispatch(this._billingAddressActionCreator.continueAsGuest(credentials, options));
    }

    async signIn(credentials: CustomerCredentials, options?: CustomerRequestOptions): Promise<InternalCheckoutSelectors> {
        const { methodId } = options || {};

        if (!methodId) {
            throw new InvalidArgumentError('Unable to proceed because "methodId" argument is not provided.');
        }

        await this._store.dispatch(this._customerActionCreator.signInCustomer(credentials, options));

        return this._openCustomBoltCheckoutWidget(credentials.email, methodId);
    }

    signOut(options?: CustomerRequestOptions): Promise<InternalCheckoutSelectors> {
        return this._store.dispatch(this._customerActionCreator.signOutCustomer(options));
    }

    async signUp(customerAccount: CustomerAccountRequestBody, options?: CustomerRequestOptions): Promise<InternalCheckoutSelectors> {
        const { methodId } = options || {};

        if (!methodId) {
            throw new InvalidArgumentError('Unable to proceed because "methodId" argument is not provided.');
        }

        await this._store.dispatch(this._customerActionCreator.createCustomer(customerAccount, options));

        return this._openCustomBoltCheckoutWidget(customerAccount.email, methodId);
    }

    private async _openCustomBoltCheckoutWidget(email: string, methodId: string): Promise<InternalCheckoutSelectors> {
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
                    await new Promise(resolve => {
                        const callbacks = {
                            close: resolve,
                        };

                        boltCheckout.openCheckout(email, callbacks);
                    }).catch(error => error);
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
