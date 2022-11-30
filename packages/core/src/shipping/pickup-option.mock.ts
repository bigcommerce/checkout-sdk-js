import {
    PickupOptionAPIRequestBody,
    PickupOptionRequestBody,
    PickupOptionResponse,
    PickupOptionResult,
    RadiusUnit,
} from './pickup-option';

import { PickupOptionState } from '.';

export function getApiQueryForPickupOptions(): PickupOptionAPIRequestBody {
    return {
        searchArea: {
            radius: {
                value: 1.4,
                unit: RadiusUnit.KM,
            },
            coordinates: {
                latitude: 1.4,
                longitude: 1.4,
            },
        },
        items: [
            {
                variantId: 71,
                quantity: 1,
            },
        ],
    };
}

export function getQueryForPickupOptions(): PickupOptionRequestBody {
    return {
        consignmentId: '55c96cda6f04c',
        searchArea: {
            radius: {
                value: 1.4,
                unit: RadiusUnit.KM,
            },
            coordinates: {
                latitude: 1.4,
                longitude: 1.4,
            },
        },
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

const query = getQueryForPickupOptions();
const keyString = btoa(`${query.consignmentId}-${JSON.stringify(query.searchArea)}`);

export function getPickupOptionsState(): PickupOptionState {
    return {
        data: {
            [keyString]: [getPickupOptions()],
        },
        errors: {},
        statuses: {},
    };
}
