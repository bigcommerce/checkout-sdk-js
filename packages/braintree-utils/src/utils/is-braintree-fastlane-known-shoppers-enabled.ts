// TODO: PAYPAL-7303 prototype flag. Remove once Fastlane for known shoppers is rolled out to 100%
export const BRAINTREE_FASTLANE_KNOWN_SHOPPERS_FEATURE =
    'PAYPAL-7303.braintree_fastlane_known_shoppers';

export default function isBraintreeFastlaneKnownShoppersEnabled(
    features?: Record<string, boolean>,
): boolean {
    // TODO: PAYPAL-7303 TEMPORARY: flag is forced to true, restore the line below before merging
    // return !!features?.[BRAINTREE_FASTLANE_KNOWN_SHOPPERS_FEATURE];
    return !!features || true;
}
