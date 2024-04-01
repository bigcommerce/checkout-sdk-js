import { getBraintreeFastlaneProfileDataMock } from '../';

import isBraintreeFastlaneProfileData from './is-braintree-fastlane-profile-data';

describe('isBraintreeFastlaneProfileData()', () => {
    it('returns true if profile data belong to fastlane', () => {
        const profileDataMock = getBraintreeFastlaneProfileDataMock();

        expect(isBraintreeFastlaneProfileData(profileDataMock)).toBe(true);
    });

    it('returns false if profile data is not provided', () => {
        const profileDataMock = undefined;

        expect(isBraintreeFastlaneProfileData(profileDataMock)).toBe(false);
    });
});
