import Currency from './currency';

export function getCurrency(): Currency {
    return {
        name: 'US Dollar',
        code: 'USD',
        symbol: '$',
        decimalPlaces: 2,
    };
}
