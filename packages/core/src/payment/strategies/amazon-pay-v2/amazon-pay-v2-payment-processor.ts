import { PaymentMethod } from '../..';
import { AmazonPayV2ButtonInitializeOptions } from '../../../checkout-buttons/strategies/amazon-pay-v2';
import { NotInitializedError, NotInitializedErrorType } from '../../../common/error/errors';

import { AmazonPayV2ChangeActionType, AmazonPayV2SDK } from './amazon-pay-v2';
import AmazonPayV2ScriptLoader from './amazon-pay-v2-script-loader';

export default class AmazonPayV2PaymentProcessor {
    private _amazonPayV2SDK?: AmazonPayV2SDK;

    constructor(
        private _amazonPayV2ScriptLoader: AmazonPayV2ScriptLoader
    ) { }

    async initialize(paymentMethod: PaymentMethod): Promise<void> {
        this._amazonPayV2SDK = await this._amazonPayV2ScriptLoader.load(paymentMethod);
    }

    deinitialize(): Promise<void> {
        this._amazonPayV2SDK = undefined;

        return Promise.resolve();
    }

    bindButton(buttonId: string, sessionId: string, changeAction: AmazonPayV2ChangeActionType): void {
        this._getAmazonPayV2SDK().Pay.bindChangeAction(`#${buttonId}`, {
            amazonCheckoutSessionId: sessionId,
            changeAction,
        });
    }

    createButton(containerId: string, options: AmazonPayV2ButtonInitializeOptions): HTMLElement {
        return this._getAmazonPayV2SDK().Pay.renderButton(containerId, options);
    }

    async signout(): Promise<void> {
        if (this._amazonPayV2SDK) {
            this._amazonPayV2SDK.Pay.signout();
        }

        return Promise.resolve();
    }

    private _getAmazonPayV2SDK(): AmazonPayV2SDK {
        if (!this._amazonPayV2SDK) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this._amazonPayV2SDK;
    }
}
