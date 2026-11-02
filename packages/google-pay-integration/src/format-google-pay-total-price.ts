import { round } from 'lodash';

/**
 * Formats the total price for Google Pay using the currency decimal places,
 * so the payment sheet shows the same amount that is charged.
 */
export default function formatGooglePayTotalPrice(amount: number, decimalPlaces: number): string {
    return round(amount, decimalPlaces).toFixed(decimalPlaces);
}
