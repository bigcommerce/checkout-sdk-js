import { BraintreeConnectCardComponent } from '@bigcommerce/checkout-sdk/braintree-utils';

import isBraintreeConnectCardComponent from './is-braintree-connect-card-component';

describe('isBraintreeConnectCardComponent()', () => {
    it('returns true if braintreeCreditCardComponent has tokenize property', () => {
        const braintreeCardComponentMock: BraintreeConnectCardComponent = {
            render: jest.fn(),
            tokenize: jest.fn(),
        };

        expect(isBraintreeConnectCardComponent(braintreeCardComponentMock)).toBe(true);
    });
});
