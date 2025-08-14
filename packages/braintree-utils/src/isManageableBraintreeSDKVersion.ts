import { BRAINTREE_SDK_SCRIPTS_INTEGRITY } from './braintree-sdk-scripts-integrity';

function isManageableBraintreeSDKVersion(
    version: string,
): version is keyof typeof BRAINTREE_SDK_SCRIPTS_INTEGRITY {
    return version in BRAINTREE_SDK_SCRIPTS_INTEGRITY;
}

export default isManageableBraintreeSDKVersion;
