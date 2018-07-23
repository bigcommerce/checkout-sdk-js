import { AddressRequestBody } from '../../address';
import { CheckoutStore, InternalCheckoutSelectors } from '../../checkout';
import ConsignmentActionCreator from '../consignment-action-creator';
import { ShippingRequestOptions } from '../shipping-request-options';

import ShippingStrategy from './shipping-strategy';

export default class DefaultShippingStrategy extends ShippingStrategy {
    constructor(
        store: CheckoutStore,
        private _consignmentActionCreator: ConsignmentActionCreator
    ) {
        super(store);
    }

    updateAddress(address: AddressRequestBody, options?: ShippingRequestOptions): Promise<InternalCheckoutSelectors> {
        return this._store.dispatch(
            this._consignmentActionCreator.updateAddress(address, options)
        );
    }

    selectOption(optionId: string, options?: ShippingRequestOptions): Promise<InternalCheckoutSelectors> {
        return this._store.dispatch(
            this._consignmentActionCreator.selectShippingOption(optionId, options)
        );
    }
}
