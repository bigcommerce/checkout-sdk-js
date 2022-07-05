import { Currency } from 'packages/payment-integration/src/currency';

export function getCurrency(): Currency {
    return {
        name: 'US Dollar',
        code: 'USD',
        symbol: '$',
        decimalPlaces: 2,
    };
}
