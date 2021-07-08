import { InternalCheckoutSelectors } from '../../checkout';
import CustomerAccountRequestBody from '../customer-account';
import CustomerCredentials from '../customer-credentials';
import { CustomerInitializeOptions, CustomerRequestOptions } from '../customer-request-options';
import { GuestCredentials } from '../guest-credentials';

export default interface CustomerStrategy {
    continueAsGuest(credentials: GuestCredentials, options?: CustomerRequestOptions): Promise<InternalCheckoutSelectors>;

    signIn(credentials: CustomerCredentials, options?: CustomerRequestOptions): Promise<InternalCheckoutSelectors>;

    signOut(options?: CustomerRequestOptions): Promise<InternalCheckoutSelectors>;

    signUp(customerAccount: CustomerAccountRequestBody, options?: CustomerRequestOptions): Promise<InternalCheckoutSelectors>;

    initialize(options?: CustomerInitializeOptions): Promise<InternalCheckoutSelectors>;

    deinitialize(options?: CustomerRequestOptions): Promise<InternalCheckoutSelectors>;
}
