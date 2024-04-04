import { BraintreeConnectProfileData, BraintreeFastlaneProfileData } from '../';

export default function isBraintreeConnectProfileData(
    profileData: BraintreeFastlaneProfileData | BraintreeConnectProfileData | undefined,
): profileData is BraintreeConnectProfileData {
    if (!profileData) {
        return false;
    }

    return (
        profileData.hasOwnProperty('addresses') &&
        profileData.hasOwnProperty('cards') &&
        profileData.hasOwnProperty('phones') &&
        profileData.hasOwnProperty('connectCustomerId') &&
        profileData.hasOwnProperty('connectCustomerAuthAssertionToken') &&
        profileData.hasOwnProperty('name')
    );
}
