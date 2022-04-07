import { InternalCheckoutSelectors, ReadableCheckoutStore } from '../../checkout';
import { createDataStoreProjection, DataStoreProjection } from '../../common/data-store';

import PaymentIntegrationSelectors from './payment-integration-selectors';

export default class PaymentIntegrationStoreProjectionFactory {
    constructor(
        private _transformSelectors: (selectors: InternalCheckoutSelectors) => PaymentIntegrationSelectors
    ) {}

    create(store: ReadableCheckoutStore): DataStoreProjection<PaymentIntegrationSelectors> {
        return createDataStoreProjection(store, this._transformSelectors);
    }
}
