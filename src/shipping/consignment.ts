import { Address } from '../address';

import ShippingOption from './shipping-option';

export default interface Consignment {
    id: string;
    shippingAddress: Address;
    handlingCost: number;
    shippingCost: number;
    availableShippingOptions: ShippingOption[];
    selectedShippingOptionId?: string;
    lineItemIds?: string[];
}

export interface ConsignmentRequestBody {
    id?: string;
    shippingOptionId?: string;
    shippingAddress?: Address;
    lineItems?: ConsignmentLineItem[];
}

export type ConsignmentsRequestBody = ConsignmentRequestBody[];

export interface ConsignmentLineItem {
    itemId: string | number;
    quantity: number;
}
