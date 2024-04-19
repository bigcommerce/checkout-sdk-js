import { BraintreeConnectProfileData, BraintreeFastlaneProfileData } from '../';

export default function isBraintreeFastlaneProfileData(
    profileData: BraintreeFastlaneProfileData | BraintreeConnectProfileData | undefined,
): profileData is BraintreeFastlaneProfileData {
    if (!profileData) {
        return false;
    }

    return (
        profileData.hasOwnProperty('shippingAddress') &&
        profileData.hasOwnProperty('card') &&
        profileData.hasOwnProperty('fastlaneCustomerId') &&
        profileData.hasOwnProperty('fastlaneCustomerAuthAssertionToken') &&
        profileData.hasOwnProperty('name')
    );
}
