import { CheckoutStore } from '../../../checkout';
import { MissingDataError, MissingDataErrorType, NotInitializedError, NotInitializedErrorType } from '../../../common/error/errors';
import PaymentMethodActionCreator from '../../payment-method-action-creator';

import { AmazonPayv2ButtonParams, AmazonPayv2SDK } from './amazon-payv2';
import AmazonPayv2ScriptLoader from './amazon-payv2-script-loader';

export default class AmazonPayv2PaymentProcessor {
    private _amazonPayv2SDK?: AmazonPayv2SDK;
    private _methodId?: string;

    constructor(
        private _store: CheckoutStore,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _amazonPayv2ScriptLoader: AmazonPayv2ScriptLoader
    ) { }

    initialize(methodId: string): Promise<void> {
        this._methodId = methodId;

        return this._configureWallet();
    }

    createButton(containerId: string, params: AmazonPayv2ButtonParams): HTMLElement {
        if (!this._amazonPayv2SDK) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this._amazonPayv2SDK.Pay.renderButton(containerId, params);
    }

    private async _configureWallet(): Promise<void> {
        const methodId = this._getMethodId();
        const state = await this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(methodId));
        const paymentMethod = state.paymentMethods.getPaymentMethod(methodId);

        if (!paymentMethod) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const amazonPayv2Client = await this._amazonPayv2ScriptLoader.load(paymentMethod);
        this._amazonPayv2SDK = amazonPayv2Client;
    }

    private _getMethodId(): string {
        if (!this._methodId) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this._methodId;
    }
}
