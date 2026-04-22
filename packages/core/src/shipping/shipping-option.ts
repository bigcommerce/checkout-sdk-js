export default interface ShippingOption {
    additionalDescription: string;
    description: string;
    id: string;
    isRecommended: boolean;
    imageUrl: string;
    cost: number;
    costAfterDiscount: number;
    transitTime: string;
    type: string;
}
