import createBraintreeSdk from './create-braintree-sdk';
import BraintreeSdk from './braintree-sdk';

describe('createBraintreeSdk', () => {
    it('instantiates braintree sdk', () => {
        expect(createBraintreeSdk()).toBeInstanceOf(BraintreeSdk);
    });
});
