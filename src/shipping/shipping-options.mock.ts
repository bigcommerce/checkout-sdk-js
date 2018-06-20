import { ShippingOption } from '../shipping';

export function getShippingOption(): ShippingOption {
    return {
        description: 'Flat Rate',
        id: '0:61d4bb52f746477e1d4fb411221318c3',
        imageUrl: '',
        isRecommended: true,
        cost: 0,
        transitTime: '',
        type: 'shipping_flatrate',
    };
}

export function getShippingOptions(): ShippingOption[] {
    return [getShippingOption()];
}
