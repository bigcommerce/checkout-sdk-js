import { Address } from '../../address';
import { CheckoutSelectors, CheckoutStore } from '../../checkout';
import ConsignmentActionCreator from '../consignment-action-creator';
import ShippingOptionActionCreator from '../shipping-option-action-creator';

import ShippingStrategy from './shipping-strategy';

export default class DefaultShippingStrategy extends ShippingStrategy {
    constructor(
        store: CheckoutStore,
        private _consignmentActionCreator: ConsignmentActionCreator,
        private _optionActionCreator: ShippingOptionActionCreator
    ) {
        super(store);
    }

    updateAddress(address: Address, options?: any): Promise<CheckoutSelectors> {
        return this._store.dispatch(
            this._consignmentActionCreator.updateAddress(address, options)
        );
    }

    selectOption(addressId: string, optionId: string, options?: any): Promise<CheckoutSelectors> {
        return this._store.dispatch(
            this._optionActionCreator.selectShippingOption(addressId, optionId, options)
        );
    }
}
