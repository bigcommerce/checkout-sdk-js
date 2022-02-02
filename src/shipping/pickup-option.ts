interface Item {
    variant_id: number;
    quantity: number;
}

interface Radius {
    value: number;
    unit: number;
}

interface Coordinates {
    latitude: number;
    longitude: number;
}

interface SearchArea {
    radius: Radius;
    coordinates: Coordinates;
}

interface PickupMethod {
    id: number;
    location_id: number;
    display_name: string;
    collection_instructions: string;
    collection_time_description: string;
}

interface Option {
    pickup_method: PickupMethod;
    item_quantities: Item;
}

export interface PickupOption {
    options: Option[];
}

export interface PickupOptionRequestBody {
    search_area: SearchArea;
    items: Item[];
}

export interface ConsignmentPickupOption {
    pickupMethodId: number;
}

export interface PickupOptionResponse {
    results: PickupOption[];
}
