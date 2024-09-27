import { getBoletoComponentState, getComponentCCEventState } from '../adyenv3/adyenv3.mock';

import isCardState from './is-card-state';

describe('isCardState', () => {
    it('state is isCardState', () => {
        expect(isCardState(getComponentCCEventState())).toBe(true);
    });

    it('state is not isCardState', () => {
        expect(isCardState(getBoletoComponentState())).toBe(false);
    });
});
