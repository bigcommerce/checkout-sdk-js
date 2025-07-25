import { BraintreeSupportedCardBrands } from '@bigcommerce/checkout-sdk/braintree-utils';


export const isBraintreeSupportedCardBrand = (
    cardBrand: string,
): cardBrand is BraintreeSupportedCardBrands => {
    const supportedCardBrands = Object.values(BraintreeSupportedCardBrands);

    return supportedCardBrands.includes(cardBrand as BraintreeSupportedCardBrands);
};

export default isBraintreeSupportedCardBrand;
