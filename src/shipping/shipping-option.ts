export default interface ShippingOption {
    description: string;
    id: string;
    isRecommended: boolean;
    imageUrl: string;
    cost: number;
    transitTime: string;
    type: string;
}
