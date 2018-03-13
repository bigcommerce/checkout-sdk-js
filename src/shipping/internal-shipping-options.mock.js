import { getCart } from '../cart/internal-carts.mock';
import { getQuote } from '../quote/internal-quotes.mock';

export function getShippingOptions() {
    return {
        '55c96cda6f04c': [
            getFlatRateOption(),
        ],
    };
}

export function getFlatRateOption() {
    return {
        description: 'Flat Rate',
        module: 'shipping_flatrate',
        method: 2,
        price: 0,
        formattedPrice: '$0.00',
        id: '0:61d4bb52f746477e1d4fb411221318c3',
        isRecommended: true,
        selected: true,
        imageUrl: '',
        transitTime: '',
    };
}

export function getShippingOptionsState() {
    return {
        meta: {},
        data: getShippingOptions(),
    };
}

export function getShippingOptionResponseBody() {
    return {
        data: {
            quote: getQuote(),
            cart: getCart(),
            shippingOptions: getShippingOptions(),
        },
        meta: {},
    };
}
