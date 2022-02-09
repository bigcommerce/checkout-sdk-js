import { PickupOptionState } from '.';
import { PickupOptionAPIRequestBody, PickupOptionRequestBody, PickupOptionResponse, PickupOptionResult } from './pickup-option';

export function getApiQueryForPickupOptions(): PickupOptionAPIRequestBody {
    return {
        searchArea: {
            radius: {
                value: 1.4,
                unit: 0,
            },
            coordinates: {
                latitude: 1.4,
                longitude: 1.4,
            },
        },
        items: [{
            variantId: 71,
            quantity: 1,
        }],
    };
}

export function getQueryForPickupOptions(): PickupOptionRequestBody {
    return {
        searchArea: {
            radius: {
                value: 1.4,
                unit: 0,
            },
            coordinates: {
                latitude: 1.4,
                longitude: 1.4,
            },
        },
        consignmentId: '55c96cda6f04c',
    };
}

export function getPickupOptions(): PickupOptionResult {
    return {
        options: [
            {
                pickupMethod: {
                    id: 1,
                    locationId: 1,
                    displayName: 'test',
                    collectionInstructions: 'none',
                    collectionTimeDescription: 'desc',
                },
                itemQuantities: {
                    variantId: 1,
                    quantity: 1,
                },
            },
        ],
    };
}

export function getPickupOptionsResponseBody(): PickupOptionResponse {
    return {
        results: [getPickupOptions()],
    };
}

export function getPickupOptionsState(): PickupOptionState {
    return {
        data: [getPickupOptions()],
        errors: {},
        statuses: {},
    };
}
