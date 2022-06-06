import { PaymentIntegrationSelectors } from '@bigcommerce/checkout-sdk/common-types';
import { createDataStoreProjection,
    DataStoreProjection,
    InternalCheckoutSelectors,
    ReadableCheckoutStore } from '@bigcommerce/checkout-sdk/core';

export default class PaymentIntegrationStoreProjectionFactory {
    constructor(
        private _transformSelectors: (selectors: InternalCheckoutSelectors) => PaymentIntegrationSelectors
    ) {}

    create(store: ReadableCheckoutStore): DataStoreProjection<PaymentIntegrationSelectors> {
        return createDataStoreProjection(store, this._transformSelectors);
    }
}
