import {
    BRAINTREE_SDK_DEFAULT_VERSION,
    BRAINTREE_SDK_STABLE_VERSION,
} from './braintree-sdk-verison';
import isManageableBraintreeSDKVersion from './isManageableBraintreeSDKVersion';

describe('isManageableBraintreeSDKVersion', () => {
    it('returns true if default braintree version', () => {
        expect(isManageableBraintreeSDKVersion(BRAINTREE_SDK_DEFAULT_VERSION)).toBe(true);
    });

    it('returns true if stable braintree version', () => {
        expect(isManageableBraintreeSDKVersion(BRAINTREE_SDK_STABLE_VERSION)).toBe(true);
    });

    it('returns false if non-supported braintree version', () => {
        expect(isManageableBraintreeSDKVersion('3.123.4')).toBe(false);
    });
});
