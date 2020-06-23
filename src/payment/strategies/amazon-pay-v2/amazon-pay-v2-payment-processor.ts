import { CheckoutStore } from '../../../checkout';
import { MissingDataError, MissingDataErrorType, NotInitializedError, NotInitializedErrorType } from '../../../common/error/errors';
import PaymentMethodActionCreator from '../../payment-method-action-creator';

import { AmazonPayV2ButtonParams, AmazonPayV2ChangeActionType, AmazonPayV2SDK } from './amazon-pay-v2';
import AmazonPayV2ScriptLoader from './amazon-pay-v2-script-loader';

export default class AmazonPayV2PaymentProcessor {
    private _amazonPayV2SDK?: AmazonPayV2SDK;
    private _methodId?: string;

    constructor(
        private _store: CheckoutStore,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _amazonPayV2ScriptLoader: AmazonPayV2ScriptLoader
    ) { }

    initialize(methodId: string): Promise<void> {
        this._methodId = methodId;

        return this._configureWallet();
    }

    deinitialize(): Promise<void> {
        this._amazonPayV2SDK = undefined;

        return Promise.resolve();
    }

    bindButton(buttonId: string, sessionId: string, changeAction: AmazonPayV2ChangeActionType): void {
        if (!this._amazonPayV2SDK) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        this._amazonPayV2SDK.Pay.bindChangeAction(`#${buttonId}`, {
            amazonCheckoutSessionId: sessionId,
            changeAction,
        });
    }

    createButton(containerId: string, params: AmazonPayV2ButtonParams): HTMLElement {
        if (!this._amazonPayV2SDK) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this._amazonPayV2SDK.Pay.renderButton(containerId, params);
    }

    async signout(methodId: string): Promise<void> {
        this._methodId = methodId;

        if (!this._amazonPayV2SDK) {
            await this._configureWallet();

            return this.signout(methodId);
        } else {
            this._amazonPayV2SDK.Pay.signout();
        }

        return Promise.resolve();
    }

    private async _configureWallet(): Promise<void> {
        const methodId = this._getMethodId();
        const state = await this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(methodId));
        const paymentMethod = state.paymentMethods.getPaymentMethod(methodId);

        if (!paymentMethod) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        this._amazonPayV2SDK = await this._amazonPayV2ScriptLoader.load(paymentMethod);
    }

    private _getMethodId(): string {
        if (!this._methodId) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this._methodId;
    }
}
