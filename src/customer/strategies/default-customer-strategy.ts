import { CheckoutSelectors } from '../../checkout';
import CustomerCredentials from '../customer-credentials';
import CustomerStrategy from './customer-strategy';

export default class DefaultCustomerStrategy extends CustomerStrategy {
    signIn(credentials: CustomerCredentials, options?: any): Promise<CheckoutSelectors> {
        return this._signInCustomerService.signIn(credentials, options);
    }

    signOut(options?: any): Promise<CheckoutSelectors> {
        return this._signInCustomerService.signOut(options);
    }
}
