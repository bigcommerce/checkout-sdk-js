import { Address } from '../../address';
import { CheckoutSelectors } from '../../checkout';
import { ReadableDataStore } from '../../../data-store';
import UpdateShippingService from '../update-shipping-service';
import ShippingStrategy from './shipping-strategy';

export default class DefaultShippingStrategy extends ShippingStrategy {
    constructor(
        store: ReadableDataStore<CheckoutSelectors>,
        updateShippingService: UpdateShippingService
    ) {
        super(store, updateShippingService);
    }

    updateAddress(address: Address, options?: any): Promise<CheckoutSelectors> {
        return this._updateShippingService.updateAddress(address, options);
    }

    selectOption(addressId: string, optionId: string, options?: any): Promise<CheckoutSelectors> {
        return this._updateShippingService.selectOption(addressId, optionId, options);
    }
}
