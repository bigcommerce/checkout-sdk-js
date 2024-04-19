import { ShippingOption } from '@bigcommerce/checkout-sdk/payment-integration-api';

export default function getShippingOption(): ShippingOption {
    return {
        additionalDescription: 'Flat rate additional description',
        description: 'Flat Rate',
        id: '0:61d4bb52f746477e1d4fb411221318c3',
        imageUrl: '',
        isRecommended: true,
        cost: 0,
        transitTime: '',
        type: 'shipping_flatrate',
    };
}
