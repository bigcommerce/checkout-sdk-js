import { CheckoutStore } from '../../../checkout';
import { MissingDataError, MissingDataErrorType, NotInitializedError, NotInitializedErrorType } from '../../../common/error/errors';
import PaymentMethodActionCreator from '../../payment-method-action-creator';

import { AmazonMaxoButtonParams, AmazonMaxoClient } from './amazon-maxo';
import AmazonMaxoScriptLoader from './amazon-maxo-script-loader';

export default class AmazonMaxoPaymentProcessor {
    private _amazonMaxoClient?: AmazonMaxoClient;
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
        containerId: HTMLElement,
        params: AmazonMaxoButtonParams
    ): HTMLElement {

        console.log(this._store)

        if (!this._amazonMaxoClient) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this._amazonMaxoClient.renderButton(containerId, params);
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
                    .then(response => {
                        if (response) {
                            return;
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
