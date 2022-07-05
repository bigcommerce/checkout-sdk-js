import { Currency } from "@bigcommerce/checkout-sdk/payment-integration";

export function getCurrency(): Currency {
    return {
        name: "US Dollar",
        code: "USD",
        symbol: "$",
        decimalPlaces: 2,
    };
}
