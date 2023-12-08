import { BraintreeConnectWindow } from '../braintree';

import isBraintreeConnectWindow from './is-braintree-connect-window';

describe('isBraintreeConnectWindow', () => {
    it('window has braintreeConnect option', () => {
        expect(isBraintreeConnectWindow({ braintreeConnect: {} } as BraintreeConnectWindow)).toBe(
            true,
        );
    });

    it('window does not have braintreeConnect option', () => {
        expect(isBraintreeConnectWindow({} as Window)).toBe(false);
    });
});
