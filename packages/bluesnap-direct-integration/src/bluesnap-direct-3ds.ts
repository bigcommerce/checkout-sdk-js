import {
    guard,
    NotInitializedError,
    NotInitializedErrorType,
    PaymentMethodInvalidError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import BlueSnapDirectScriptLoader from './bluesnap-direct-script-loader';
import { BlueSnapDirectPreviouslyUsedCard, BlueSnapDirectSdk } from './types';

export default class BlueSnapDirect3ds {
    private _blueSnapSdk?: BlueSnapDirectSdk;

    constructor(private _scriptLoader: BlueSnapDirectScriptLoader) {}

    async initialize(testMode = false): Promise<void> {
        this._blueSnapSdk = await this._scriptLoader.load(testMode);
    }

    async initialize3ds(
        token: string,
        cardData: BlueSnapDirectPreviouslyUsedCard,
    ): Promise<string> {
        const blueSnapSdk = this._getBlueSnapSdk();

        return new Promise((resolve, reject) => {
            blueSnapSdk.threeDsPaymentsSetup(token, (sdkResponse) => {
                const code = sdkResponse.code;

                if (code === '1') {
                    return resolve(sdkResponse.threeDSecure.threeDSecureReferenceId);
                }

                return reject(new PaymentMethodInvalidError());
            });

            blueSnapSdk.threeDsPaymentsSubmitData(cardData);
        });
    }

    private _getBlueSnapSdk(): BlueSnapDirectSdk {
        return guard(
            this._blueSnapSdk,
            () => new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized),
        );
    }
}
