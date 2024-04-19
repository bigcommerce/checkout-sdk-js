export default interface InternalShippingOption {
    description: string;
    module: string;
    price: number;
    id: string;
    selected: boolean;
    isRecommended: boolean;
    imageUrl: string;
    transitTime: string;
}

export interface InternalShippingOptionList {
    [key: string]: InternalShippingOption[];
}
