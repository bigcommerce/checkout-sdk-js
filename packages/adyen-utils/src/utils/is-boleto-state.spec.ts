import { getAccountComponentState, getBoletoComponentState } from '../adyenv3/adyenv3.mock';

import isBoletoState from './is-boleto-state';

describe('isBoletoState', () => {
    it('state is isBoletoState', () => {
        expect(isBoletoState(getBoletoComponentState())).toBe(true);
    });

    it('state is not isBoletoState', () => {
        expect(isBoletoState(getAccountComponentState())).toBe(false);
    });
});
