import {
    NotInitializedError,
    NotInitializedErrorType,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { UnifiedCheckoutSDK } from './cybersource-unified-checkout';
import CybersourceUnifiedCheckoutScriptLoader from './cybersource-unified-checkout-script-loader';

export default class CybersourceUnifiedCheckoutClient {
    private _sdk?: UnifiedCheckoutSDK;

    constructor(private _scriptLoader: CybersourceUnifiedCheckoutScriptLoader) {}

    async load(testMode?: boolean): Promise<void> {
        this._sdk = await this._scriptLoader.load(testMode);
    }

    initialize(captureContext: string, containerId: string): void {
        this._getSDK().setup({ captureContext, targetId: containerId });
    }

    createTransientToken(): Promise<string> {
        return this._getSDK().createTransientToken();
    }

    teardown(): void {
        this._sdk?.teardown();
        this._sdk = undefined;
    }

    private _getSDK(): UnifiedCheckoutSDK {
        if (!this._sdk) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this._sdk;
    }
}
