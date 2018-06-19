import { getCart } from '../cart/internal-carts.mock';
import { getQuote } from '../quote/internal-quotes.mock';

import InternalShippingOption, { InternalShippingOptionList } from './internal-shipping-option';

export function getShippingOptions(): InternalShippingOptionList {
    return {
        '55c96cda6f04c': [
            getFlatRateOption(),
        ],
    };
}

export function getFlatRateOption(): InternalShippingOption {
    return {
        description: 'Flat Rate',
        module: 'shipping_flatrate',
        price: 0,
        id: '0:61d4bb52f746477e1d4fb411221318c3',
        isRecommended: true,
        selected: true,
        imageUrl: '',
        transitTime: '',
    };
}

export function getShippingOptionsState() {
    return {
        data: getShippingOptions(),
        errors: {},
        meta: {},
        statuses: {},
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
