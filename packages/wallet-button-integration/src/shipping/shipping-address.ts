import { GraphQLRequestOptions } from '../graphql-request-options';

export interface UpdateCheckoutShippingAddressResponseBody {
    data: {
        checkout?: {
            updateCheckout?: {
                errors: Array<{ __typename: string }>;
                checkout?: ShippingCheckoutData | null;
            } | null;
        } | null;
    };
}

export interface SelectCheckoutShippingOptionResponseBody {
    data: {
        checkout?: {
            selectCheckoutShippingOption?: {
                checkout?: ShippingCheckoutData | null;
            } | null;
        } | null;
    };
}

export interface ShippingCheckoutData {
    currencyCode: string;
    outstandingBalance?: { value: string | number } | null;
    shippingConsignments?: Array<{
        entityId: string;
        selectedShippingOption?: { entityId: string } | null;
        availableShippingOptions?: Array<{
            entityId: string;
            description: string;
            isRecommended: boolean;
            transitTime?: string | null;
            cost: { value: string | number; formattedV2?: string | null };
        }> | null;
    }> | null;
}

export interface ShippingOptionData {
    entityId: string;
    description: string;
    isRecommended: boolean;
    transitTime?: string | null;
    cost: { value: string | number; formattedV2?: string | null };
}

export interface ShippingAddressUpdateResult {
    consignmentEntityId: string;
    availableShippingOptions: ShippingOptionData[];
    selectedShippingOptionEntityId?: string;
    currencyCode: string;
    totalPrice: string;
}

export interface ShippingLineItem {
    entityId: string;
    quantity: number;
    isShippingRequired?: boolean;
}

export interface ShippingAddressUpdateOptions extends GraphQLRequestOptions {
    consignmentEntityId?: string;
    lineItems?: ShippingLineItem[];
}
