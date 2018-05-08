import { InternalAddress } from '../../address';
import { CheckoutStore, InternalCheckoutSelectors } from '../../checkout';
import ShippingAddressActionCreator from '../shipping-address-action-creator';
import ShippingOptionActionCreator from '../shipping-option-action-creator';
import { ShippingRequestOptions } from '../shipping-request-options';

import ShippingStrategy from './shipping-strategy';

export default class DefaultShippingStrategy extends ShippingStrategy {
    constructor(
        store: CheckoutStore,
        private _addressActionCreator: ShippingAddressActionCreator,
        private _optionActionCreator: ShippingOptionActionCreator
    ) {
        super(store);
    }

    updateAddress(address: InternalAddress, options?: ShippingRequestOptions): Promise<InternalCheckoutSelectors> {
        return this._store.dispatch(
            this._addressActionCreator.updateAddress(address, options)
        );
    }

    selectOption(addressId: string, optionId: string, options?: ShippingRequestOptions): Promise<InternalCheckoutSelectors> {
        return this._store.dispatch(
            this._optionActionCreator.selectShippingOption(addressId, optionId, options)
        );
    }
}
