import { ReadableDataStore } from '@bigcommerce/data-store';
import { InternalAddress } from '../../address';
import { CheckoutSelectors } from '../../checkout';
import UpdateShippingService from '../update-shipping-service';
import ShippingStrategy from './shipping-strategy';

export default class DefaultShippingStrategy extends ShippingStrategy {
    constructor(
        store: ReadableDataStore<CheckoutSelectors>,
        updateShippingService: UpdateShippingService
    ) {
        super(store, updateShippingService);
    }

    updateAddress(address: InternalAddress, options?: any): Promise<CheckoutSelectors> {
        return this._updateShippingService.updateAddress(address, options);
    }

    selectOption(addressId: string, optionId: string, options?: any): Promise<CheckoutSelectors> {
        return this._updateShippingService.selectOption(addressId, optionId, options);
    }
}
