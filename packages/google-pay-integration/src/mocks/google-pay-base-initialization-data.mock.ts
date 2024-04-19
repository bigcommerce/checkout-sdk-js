export default function getGooglePayBaseInitializationData() {
    return {
        gateway: 'foo',
        googleMerchantId: 'bar',
        googleMerchantName: 'baz',
        isThreeDSecureEnabled: false,
        platformToken: 'foobar',
    };
}
