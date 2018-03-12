export default interface InternalShippingOption {
    description: string;
    module: string;
    method: number;
    price: number;
    formattedPrice: string;
    id: string;
    selected: boolean;
    isRecommended: boolean;
    imageUrl: string;
    transitTime: string;
}

export interface InternalShippingOptionList {
    [key: string]: InternalShippingOption[];
}
