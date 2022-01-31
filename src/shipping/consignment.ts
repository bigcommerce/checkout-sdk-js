import { Address, AddressRequestBody } from '../address';

import PickupOption from './pickup-option';
import ShippingOption from './shipping-option';

export default interface Consignment {
    id: string;
    shippingAddress: Address;
    handlingCost: number;
    shippingCost: number;
    availableShippingOptions?: ShippingOption[];
    selectedShippingOption?: ShippingOption;
    selectedPickupOption?: PickupOption;
    lineItemIds: string[];
}

export type ConsignmentRequestBody =
    ConsignmentCreateRequestBody |
    ConsignmentUpdateRequestBody |
    ConsignmentShippingOptionRequestBody;

export interface ConsignmentCreateRequestBody {
    shippingAddress: AddressRequestBody;
    lineItems: ConsignmentLineItem[];
    pickupOption?: PickupOption;
}

export interface ConsignmentAssignmentRequestBody {
    shippingAddress: AddressRequestBody;
    lineItems: ConsignmentLineItem[];
    pickupOption?: PickupOption;
}

export interface ConsignmentUpdateRequestBody {
    id: string;
    shippingAddress?: AddressRequestBody;
    lineItems?: ConsignmentLineItem[];
    pickupOption?: PickupOption;
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
