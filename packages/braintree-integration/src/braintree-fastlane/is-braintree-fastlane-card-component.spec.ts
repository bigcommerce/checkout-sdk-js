import { BraintreeFastlaneCardComponent } from '@bigcommerce/checkout-sdk/braintree-utils';

import isBraintreeFastlaneCardComponent from './is-braintree-fastlane-card-component';

describe('isBraintreeFastlaneCardComponent()', () => {
    it('returns true if braintreeCreditCardComponent has getPaymentToken property', () => {
        const braintreeCardComponentMock: BraintreeFastlaneCardComponent = {
            render: jest.fn(),
            getPaymentToken: jest.fn(),
        };

        expect(isBraintreeFastlaneCardComponent(braintreeCardComponentMock)).toBe(true);
    });
});
