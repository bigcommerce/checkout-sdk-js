import { Address } from '../address';

import ShippingOption from './shipping-option';

export default interface Consignment {
    id: string;
    shippingCost: number;
    shippingAddress: Address;
    availableShippingOptions: ShippingOption[];
    selectedShippingOptionId: string;
    lineItemIds?: string[];
}

export interface ConsignmentRequestBody {
    shippingAddress: Address;
    lineItems?: ConsignmentLineItem[];
}

export type ConsignmentsRequestBody = ConsignmentRequestBody[];

export interface ConsignmentLineItem {
    itemId: string | number;
    quantity: number;
}
