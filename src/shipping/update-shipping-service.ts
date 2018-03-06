import { Address } from '../address';
import { CheckoutStore, CheckoutSelectors } from '../checkout';
import ShippingAddressActionCreator from './shipping-address-action-creator';
import ShippingOptionActionCreator from './shipping-option-action-creator';
import ShippingActionCreator from './shipping-action-creator';

export default class UpdateShippingService {
    constructor(
        private _store: CheckoutStore,
        private _addressActionCreator: ShippingAddressActionCreator,
        private _optionActionCreator: ShippingOptionActionCreator,
        private _shippingActionCreator: ShippingActionCreator
    ) {}

    updateAddress(address: Address, options?: any): Promise<CheckoutSelectors> {
        return this._store.dispatch(
            this._addressActionCreator.updateAddress(address, options)
        );
    }

    selectOption(addressId: string, optionId: string, options?: any): Promise<CheckoutSelectors> {
        return this._store.dispatch(
            this._optionActionCreator.selectShippingOption(addressId, optionId, options)
        );
    }

    initializeShipping(methodId: string, initializer: () => Promise<any>): Promise<CheckoutSelectors> {
        return this._store.dispatch(
            this._shippingActionCreator.initializeShipping(methodId, initializer)
        );
    }
}
