import { getBoletoComponentState, getComponentState } from '../adyenv3/adyenv3.mock';

import isCardState from './is-card-state';

describe('isCardState', () => {
    it('state is isCardState', () => {
        expect(isCardState(getComponentState())).toBe(true);
    });

    it('state is not isCardState', () => {
        expect(isCardState(getBoletoComponentState())).toBe(false);
    });
});
