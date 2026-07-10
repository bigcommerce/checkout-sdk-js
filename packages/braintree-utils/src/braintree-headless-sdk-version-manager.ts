import { BRAINTREE_SDK_DEFAULT_VERSION } from './braintree-sdk-verison';
import { SDKVersionManager } from './types';

export default class BraintreeHeadlessSDKVersionManager implements SDKVersionManager {
    getSDKVersion(): string {
        return BRAINTREE_SDK_DEFAULT_VERSION;
    }
}
