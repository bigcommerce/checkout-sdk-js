import { InternalAddress } from '../../address';
import { CheckoutSelectors, CheckoutStore } from '../../checkout';
import ShippingAddressActionCreator from '../shipping-address-action-creator';
import ShippingOptionActionCreator from '../shipping-option-action-creator';

import ShippingStrategy from './shipping-strategy';

export default class DefaultShippingStrategy extends ShippingStrategy {
    constructor(
        store: CheckoutStore,
        private _addressActionCreator: ShippingAddressActionCreator,
        private _optionActionCreator: ShippingOptionActionCreator
    ) {
        super(store);
    }

    updateAddress(address: InternalAddress, options?: any): Promise<CheckoutSelectors> {
        return this._store.dispatch(
            this._addressActionCreator.updateAddress(address, options)
        );
    }

    selectOption(addressId: string, optionId: string, options?: any): Promise<CheckoutSelectors> {
        return this._store.dispatch(
            this._optionActionCreator.selectShippingOption(addressId, optionId, options)
        );
    }
}
