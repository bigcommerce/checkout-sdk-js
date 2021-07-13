import { InternalCheckoutSelectors } from '../../checkout';
import CustomerCredentials from '../customer-credentials';
import { CustomerContinueOptions, CustomerInitializeOptions, CustomerRequestOptions } from '../customer-request-options';

export default interface CustomerStrategy {
    signIn(credentials: CustomerCredentials, options?: CustomerRequestOptions): Promise<InternalCheckoutSelectors>;

    signOut(options?: CustomerRequestOptions): Promise<InternalCheckoutSelectors>;

    customerContinue(options?: CustomerContinueOptions): Promise<InternalCheckoutSelectors>;

    initialize(options?: CustomerInitializeOptions): Promise<InternalCheckoutSelectors>;

    deinitialize(options?: CustomerRequestOptions): Promise<InternalCheckoutSelectors>;
}
