import { InternalAddress } from '../address';
import { CheckoutStore, CheckoutSelectors } from '../checkout';
import ShippingAddressActionCreator from './shipping-address-action-creator';
import ShippingOptionActionCreator from './shipping-option-action-creator';

export default class UpdateShippingService {
    constructor(
        private _store: CheckoutStore,
        private _addressActionCreator: ShippingAddressActionCreator,
        private _optionActionCreator: ShippingOptionActionCreator
    ) {}

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
