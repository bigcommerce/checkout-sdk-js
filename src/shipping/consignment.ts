import { Address } from '../address';

import ShippingOption from './shipping-option';

export default interface Consignment {
    id: string;
    shippingAddress: Address;
    selectedShippingOptionId: string;
    shippingCost: number;
    lineItemIds: string[];
    availableShippingOptions?: ShippingOption[];
}
