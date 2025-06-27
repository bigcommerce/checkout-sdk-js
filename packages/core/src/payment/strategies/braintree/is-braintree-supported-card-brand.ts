import { BraintreeSupportedCardBrands } from './braintree-payment-options';

export const isBraintreeSupportedCardBrand = (
    cardBrand: string,
): cardBrand is BraintreeSupportedCardBrands => {
    const supportedCardBrands = Object.values(BraintreeSupportedCardBrands);

    return supportedCardBrands.includes(cardBrand as BraintreeSupportedCardBrands);
};
