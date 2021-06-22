import { InternalCheckoutSelectors } from '../../checkout';
import { CustomerContinueOptions, CustomerContinueRequestOptions } from '../customer-continue-request-options';

export default interface CustomerContinueStrategy {
    initialize(options?: CustomerContinueRequestOptions): Promise<InternalCheckoutSelectors>;
    deinitialize(options?: CustomerContinueRequestOptions): Promise<InternalCheckoutSelectors>;
    executeBeforeSignIn(options?: CustomerContinueOptions): Promise<InternalCheckoutSelectors>;
    executeBeforeSignUp(options?: CustomerContinueOptions): Promise<InternalCheckoutSelectors>;
    executeBeforeContinueAsGuest(options?: CustomerContinueOptions): Promise<InternalCheckoutSelectors>;
}
