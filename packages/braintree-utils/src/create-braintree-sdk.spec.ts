import BraintreeSdk from './braintree-sdk';
import createBraintreeSdk from './create-braintree-sdk';

describe('createBraintreeSdk', () => {
    it('instantiates braintree sdk', () => {
        expect(createBraintreeSdk()).toBeInstanceOf(BraintreeSdk);
    });
});
