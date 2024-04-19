import { PaymentIntegrationSelectors } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { InternalCheckoutSelectors, ReadableCheckoutStore } from '../checkout';
import { createDataStoreProjection, DataStoreProjection } from '../common/data-store';

export default class PaymentIntegrationStoreProjectionFactory {
    constructor(
        private _transformSelectors: (
            selectors: InternalCheckoutSelectors,
        ) => PaymentIntegrationSelectors,
    ) {}

    create(store: ReadableCheckoutStore): DataStoreProjection<PaymentIntegrationSelectors> {
        return createDataStoreProjection(store, this._transformSelectors);
    }
}
