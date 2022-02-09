interface Item {
    variantId: number;
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
    locationId: number;
    displayName: string;
    collectionUnstructions: string;
    collectionTimeDescription: string;
}

interface Option {
    pickupMethod: PickupMethod;
    itemQuantities: Item;
}

export interface PickupOptionResult {
    options: Option[];
}

export interface PickupOptionRequestBody {
    searchArea: SearchArea;
    consignmentId: string;
}

export interface PickupOptionAPIRequestBody {
    searchArea: SearchArea;
    items: Item[];
}

export interface ConsignmentPickupOption {
    pickupMethodId: number;
}

export interface PickupOptionResponse {
    results: PickupOptionResult[];
}
