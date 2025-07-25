import { isBraintreeSupportedCardBrand } from '@bigcommerce/checkout-sdk/braintree-utils';

describe('isBraintreeSupportedCardBrand', () => {
   it('returns true if card brand is supported', () => {
       const supportedCardBrand = 'mastercard';
       const unsupportedCardBrand = 'fakebank';

       expect(isBraintreeSupportedCardBrand(supportedCardBrand)).toBe(true);
       expect(isBraintreeSupportedCardBrand(unsupportedCardBrand)).toBe(false);
   });
});
