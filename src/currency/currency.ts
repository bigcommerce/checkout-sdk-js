export default interface Currency {
    name: string;
    code: string;
    symbol: string;
    decimalPlaces: number;
}

export interface CurrencyConfig {
    decimalPlaces: number;
    decimalSeparator: string;
    symbolLocation: string;
    symbol: string;
    thousandsSeparator: string;
}
