import { BraintreeFastlaneWindow } from '../types';

import isBraintreeFastlaneWindow from './is-braintree-fastlane-window';

describe('isBraintreeFastlaneWindow', () => {
    it('window has braintreeFastlane option', () => {
        expect(
            isBraintreeFastlaneWindow({ braintreeFastlane: {} } as BraintreeFastlaneWindow),
        ).toBe(true);
    });

    it('window does not have braintreeFastlane option', () => {
        expect(isBraintreeFastlaneWindow({} as Window)).toBe(false);
    });
});
