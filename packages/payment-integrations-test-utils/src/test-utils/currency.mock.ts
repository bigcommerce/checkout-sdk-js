import { Currency } from '@bigcommerce/checkout-sdk/payment-integration-api';

export function getCurrency(): Currency {
    return {
        name: 'US Dollar',
        code: 'USD',
        symbol: '$',
        decimalPlaces: 2,
    };
}
