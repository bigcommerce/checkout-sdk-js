import { noop } from 'rxjs';

import { PaymentMethodFailedError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import {
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    NotInitializedError,
    NotInitializedErrorType,
} from '../../../common/error/errors';
import { PaymentMethodActionCreator } from '../../../payment';
import { PaymentMethodInvalidError } from '../../../payment/errors';
import { BoltCheckout, BoltScriptLoader } from '../../../payment/strategies/bolt';
import CustomerActionCreator from '../../customer-action-creator';
import CustomerCredentials from '../../customer-credentials';
import {
    CheckoutPaymentMethodExecutedOptions,
    CustomerInitializeOptions,
    CustomerRequestOptions,
    ExecutePaymentMethodCheckoutOptions,
} from '../../customer-request-options';
import CustomerStrategy from '../customer-strategy';

export default class BoltCustomerStrategy implements CustomerStrategy {
    private _boltClient?: BoltCheckout;

    constructor(
        private _store: CheckoutStore,
        private _boltScriptLoader: BoltScriptLoader,
        private _customerActionCreator: CustomerActionCreator,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
    ) {}

    async initialize(options: CustomerInitializeOptions): Promise<InternalCheckoutSelectors> {
        const { methodId, bolt } = options;
        const { onInit } = bolt || {};

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to proceed because "methodId" argument is not provided.',
            );
        }

        const state = await this._store.dispatch(
            this._paymentMethodActionCreator.loadPaymentMethods(),
        );

        const paymentMethod = state.paymentMethods.getPaymentMethod(methodId);

        if (!paymentMethod || !paymentMethod.initializationData.publishableKey) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const { developerConfig, publishableKey } = paymentMethod.initializationData;

        this._boltClient = await this._boltScriptLoader.loadBoltClient(
            publishableKey,
            paymentMethod.config.testMode,
            developerConfig,
        );

        if (onInit && typeof onInit === 'function') {
            const email = this._getCustomerEmail();
            const hasBoltAccount = await this._hasBoltAccount(email);

            onInit(hasBoltAccount, email);
        }

        return this._store.getState();
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        this._boltClient = undefined;

        return Promise.resolve(this._store.getState());
    }

    signIn(
        credentials: CustomerCredentials,
        options?: CustomerRequestOptions,
    ): Promise<InternalCheckoutSelectors> {
        return this._store.dispatch(
            this._customerActionCreator.signInCustomer(credentials, options),
        );
    }

    signOut(options?: CustomerRequestOptions): Promise<InternalCheckoutSelectors> {
        return this._store.dispatch(this._customerActionCreator.signOutCustomer(options));
    }

    async executePaymentMethodCheckout(options?: ExecutePaymentMethodCheckoutOptions) {
        const {
            continueWithCheckoutCallback = noop,
            checkoutPaymentMethodExecuted,
            methodId,
        } = options || {};
        const email = this._getCustomerEmail();

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to proceed because "methodId" argument is not provided.',
            );
        }

        if (continueWithCheckoutCallback && typeof continueWithCheckoutCallback !== 'function') {
            throw new InvalidArgumentError(
                'Unable to proceed because "continueWithCheckoutCallback" argument is not provided and it must be a function.',
            );
        }

        if (!email) {
            continueWithCheckoutCallback();

            return Promise.resolve(this._store.getState());
        }

        return this._openBoltCheckoutModal(
            email,
            methodId,
            continueWithCheckoutCallback,
            checkoutPaymentMethodExecuted,
        );
    }

    private async _openBoltCheckoutModal(
        email: string,
        methodId: string,
        continueWithCheckoutCallback: () => void,
        checkoutPaymentMethodExecuted?: (payload: CheckoutPaymentMethodExecutedOptions) => void,
    ): Promise<InternalCheckoutSelectors> {
        const boltClient = this._getBoltClient();
        const state = this._store.getState();
        const paymentMethod = state.paymentMethods.getPaymentMethod(methodId);

        try {
            if (paymentMethod?.initializationData?.embeddedOneClickEnabled) {
                const hasBoltAccount = await this._hasBoltAccount(email);

                if (hasBoltAccount) {
                    const callbacks = {
                        close: () => {
                            continueWithCheckoutCallback();
                        },
                    };

                    await boltClient.openCheckout(email, callbacks);
                } else {
                    continueWithCheckoutCallback();
                }

                if (typeof checkoutPaymentMethodExecuted === 'function') {
                    checkoutPaymentMethodExecuted({ hasBoltAccount });
                }
            } else {
                continueWithCheckoutCallback();
            }
        } catch (error) {
            if (error.name !== 'MissingDataError' && error.name !== 'NotInitializedError') {
                throw new PaymentMethodFailedError(error.message);
            }

            throw error;
        }

        return this._store.getState();
    }

    private _getBoltClient() {
        const boltClient = this._boltClient;

        if (!boltClient) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return boltClient;
    }

    private async _hasBoltAccount(email: string) {
        const boltClient = this._getBoltClient();

        try {
            return await boltClient.hasBoltAccount(email);
        } catch {
            throw new PaymentMethodInvalidError();
        }
    }

    private _getCustomerEmail() {
        const state = this._store.getState();
        const customer = state.customer.getCustomer();
        const billingAddress = state.billingAddress.getBillingAddress();

        return customer?.email || billingAddress?.email || '';
    }
}
