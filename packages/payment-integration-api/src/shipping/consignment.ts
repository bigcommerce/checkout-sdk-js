import { Address } from '../address';

import { ConsignmentPickupOption } from './pickup-option';
import ShippingOption from './shipping-option';

export default interface Consignment {
    id: string;
    address: Address;
    shippingAddress: Address;
    handlingCost: number;
    shippingCost: number;
    availableShippingOptions?: ShippingOption[];
    selectedShippingOption?: ShippingOption;
    selectedPickupOption?: ConsignmentPickupOption;
    lineItemIds: string[];
}
