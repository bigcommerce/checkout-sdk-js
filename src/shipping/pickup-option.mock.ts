import { PickupOptionState } from '.';
import { PickupOptionRequestBody, PickupOptionResponse, PickupOptionResult } from './pickup-option';

export function getQueryForPickupOptions(): PickupOptionRequestBody {
    return {
        search_area: {
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
            variant_id: 1,
            quantity: 1,
        }],
    };
}

export function getPickupOptions(): PickupOptionResult {
    return {
        options: [
            {
                pickup_method: {
                    id: 1,
                    location_id: 1,
                    display_name: 'test',
                    collection_instructions: 'none',
                    collection_time_description: 'desc',
                },
                item_quantities: {
                    variant_id: 1,
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
