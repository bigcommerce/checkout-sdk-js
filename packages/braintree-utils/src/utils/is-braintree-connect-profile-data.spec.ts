import { getBraintreeConnectProfileDataMock } from '../';

import isBraintreeConnectProfileData from './is-braintree-connect-profile-data';

describe('isBraintreeConnectProfileData()', () => {
    it('returns true if profile data belong to connect', () => {
        const profileDataMock = getBraintreeConnectProfileDataMock();

        expect(isBraintreeConnectProfileData(profileDataMock)).toBe(true);
    });

    it('returns false if profile data is not provided', () => {
        const profileDataMock = undefined;

        expect(isBraintreeConnectProfileData(profileDataMock)).toBe(false);
    });
});
