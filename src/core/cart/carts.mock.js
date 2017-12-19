import { getOrderSummary } from '../order/order-summaries.mock';

export function getCart() {
    return getOrderSummary();
}

export function getCartMeta() {
    return {
        request: {
            geoCountryCode: 'AU',
            deviceSessionId: 'a37230e9a8e4ea2d7765e2f3e19f7b1d',
            sessionHash: 'cfbbbac580a920b395571fe086db1e06',
        },
    };
}

export function getCartResponseBody() {
    return {
        data: {
            cart: getCart(),
        },
        meta: getCartMeta(),
    };
}

export function getCartState() {
    return {
        data: getCart(),
        meta: getCartMeta(),
    };
}
