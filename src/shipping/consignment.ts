import { Address, AddressRequestBody } from '../address';

import ShippingOption from './shipping-option';

export default interface Consignment {
    id: string;
    shippingAddress: Address;
    handlingCost: number;
    shippingCost: number;
    availableShippingOptions?: ShippingOption[];
    selectedShippingOption?: ShippingOption;
    lineItemIds: string[];
}

export type ConsignmentRequestBody =
    ConsignmentCreateRequestBody |
    ConsignmentUpdateRequestBody |
    ConsignmentShippingOptionRequestBody;

export interface ConsignmentCreateRequestBody {
    shippingAddress: AddressRequestBody;
    lineItems: ConsignmentLineItem[];
}

export interface ConsignmentAssignmentRequestBody {
    shippingAddress: AddressRequestBody;
    lineItems: ConsignmentLineItem[];
}

export interface ConsignmentUpdateRequestBody {
    id: string;
    shippingAddress?: AddressRequestBody;
    lineItems?: ConsignmentLineItem[];
}

export interface ConsignmentMeta {
    id: string;
}

export interface ConsignmentShippingOptionRequestBody {
    id: string;
    shippingOptionId: string;
}

export type ConsignmentsRequestBody = ConsignmentCreateRequestBody[];

export interface ConsignmentLineItem {
    itemId: string | number;
    quantity: number;
}
