export default interface ShippingOption {
    description: string;
    id: string;
    isRecommended: boolean;
    imageUrl: string;
    price: number;
    transitTime: string;
    type: string;
}
