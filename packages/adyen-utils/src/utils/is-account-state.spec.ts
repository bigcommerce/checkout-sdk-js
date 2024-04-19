import { getAccountComponentState, getBoletoComponentState } from '../adyenv3/adyenv3.mock';

import isAccountState from './is-account-state';

describe('isAccountState', () => {
    it('state is isAccountState', () => {
        expect(isAccountState(getAccountComponentState())).toBe(true);
    });

    it('state is not isAccountState', () => {
        expect(isAccountState(getBoletoComponentState())).toBe(false);
    });
});
