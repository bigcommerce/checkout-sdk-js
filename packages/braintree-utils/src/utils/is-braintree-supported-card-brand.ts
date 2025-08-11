import { BraintreeSupportedCardBrands } from '../types';

export const isBraintreeSupportedCardBrand = (
    cardBrand: string,
): cardBrand is BraintreeSupportedCardBrands => {
    const supportedCardBrands = Object.values(BraintreeSupportedCardBrands);

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return supportedCardBrands.includes(cardBrand as BraintreeSupportedCardBrands);
};

export default isBraintreeSupportedCardBrand;
