import { Address } from '../address';

import ShippingOption from './shipping-option';

export default interface Consignment {
    id: string;
    shippingAddress: Address;
    handlingCost: number;
    shippingCost: number;
    availableShippingOptions?: ShippingOption[];
    selectedShippingOption?: ShippingOption;
    lineItemIds?: string[];
}

export type ConsignmentRequestBody =
    ConsignmentDataRequestBody |
    ConsignmentShippingOptionRequestBody;

export interface ConsignmentDataRequestBody {
    id?: string;
    shippingAddress?: Address;
    lineItems?: ConsignmentLineItem[];
}

export interface ConsignmentShippingOptionRequestBody {
    id?: string;
    shippingOptionId?: string;
}

export type ConsignmentsRequestBody = ConsignmentDataRequestBody[];

export interface ConsignmentLineItem {
    itemId: string | number;
    quantity: number;
}
