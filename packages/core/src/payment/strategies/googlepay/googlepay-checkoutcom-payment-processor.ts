import { some } from 'lodash';

import { InternalCheckoutSelectors } from '../../../checkout';
import { RequestError } from '../../../common/error/errors';
import { PaymentInitializeOptions } from '../../payment-request-options';

import { GooglePayProviderProcessor } from './googlepay';

export default class GooglePayCheckoutcomPaymentProcessor implements GooglePayProviderProcessor {
    initialize(_options: PaymentInitializeOptions): Promise<void> {
        return Promise.resolve();
    }

    async processAdditionalAction(error: unknown): Promise<InternalCheckoutSelectors> {
        if (
            !(error instanceof RequestError) ||
            !some(error.body.errors, { code: 'three_d_secure_required' })
        ) {
            return Promise.reject(error);
        }

        const redirectUrl = error.body.three_ds_result.acs_url;

        return this._performRedirect(redirectUrl);
    }

    private _performRedirect(redirectUrl: string): Promise<InternalCheckoutSelectors> {
        return new Promise(() => {
            window.location.assign(redirectUrl);
        });
    }
}
