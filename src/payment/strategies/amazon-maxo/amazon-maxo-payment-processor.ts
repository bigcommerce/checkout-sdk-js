import { CheckoutStore } from '../../../checkout';
import { MissingDataError, MissingDataErrorType, NotInitializedError, NotInitializedErrorType } from '../../../common/error/errors';
import PaymentMethodActionCreator from '../../payment-method-action-creator';

import { AmazonMaxoButtonParams, AmazonMaxoSDK } from './amazon-maxo';
import AmazonMaxoScriptLoader from './amazon-maxo-script-loader';

export default class AmazonMaxoPaymentProcessor {
    //private _amazonMaxoClient?: AmazonMaxoClient;
    private _amazonMaxoSDK?: AmazonMaxoSDK;
    private _methodId?: string;

    constructor(
        private _store: CheckoutStore,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _amazonMaxoScriptLoader: AmazonMaxoScriptLoader,
    ) { }

    initialize(methodId: string): Promise<void> {
        this._methodId = methodId;

        return this._configureWallet();
    }

    createButton(
        containerId: string,
        params: AmazonMaxoButtonParams
    ): HTMLElement {

        if (!this._amazonMaxoSDK) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this._amazonMaxoSDK.Pay.renderButton(containerId, params);
    }

    deinitialize(): Promise<void> {
        return new Promise(() => { });
    }

    private _configureWallet(): Promise<void> {
        const methodId = this._getMethodId();

        return this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(methodId))
            .then(state => {
                const paymentMethod = state.paymentMethods.getPaymentMethod(methodId);

                if (!paymentMethod) {
                    throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
                }

                return this._amazonMaxoScriptLoader.load(paymentMethod)
                    .then( (amazonMaxoClient) => {
                        if (amazonMaxoClient) {
                            this._amazonMaxoSDK = amazonMaxoClient;
                        }
                    })
            });
    }

    private _getMethodId(): string {
        if (!this._methodId) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this._methodId;
    }
}
