import { Address, AddressRequestBody } from '../address';

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

export type ConsignmentRequestBody =
    ConsignmentCreateRequestBody |
    ConsignmentUpdateRequestBody |
    ConsignmentShippingOptionRequestBody;

export interface ConsignmentCreateRequestBody {
    address?: AddressRequestBody;
    shippingAddress?: AddressRequestBody;
    lineItems: ConsignmentLineItem[];
    pickupOption?: ConsignmentPickupOption;
}

export interface ConsignmentAssignmentBaseRequestBodyWithAddress {
    address: AddressRequestBody;
    lineItems: ConsignmentLineItem[];
    pickupOption?: ConsignmentPickupOption;
}

export interface ConsignmentAssignmentBaseRequestBodyWithShippingAddress {
    shippingAddress: AddressRequestBody;
    lineItems: ConsignmentLineItem[];
    pickupOption?: ConsignmentPickupOption;
}

export type ConsignmentAssignmentRequestBody =
    ConsignmentAssignmentBaseRequestBodyWithShippingAddress | ConsignmentAssignmentBaseRequestBodyWithAddress;

export interface ConsignmentUpdateRequestBody {
    id: string;
    address?: AddressRequestBody;
    shippingAddress?: AddressRequestBody;
    lineItems?: ConsignmentLineItem[];
    pickupOption?: ConsignmentPickupOption;
    shippingOptionId?: string;
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
