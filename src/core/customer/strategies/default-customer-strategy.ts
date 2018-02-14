import { CheckoutSelectors } from '../../checkout';
import { ReadableDataStore } from '../../../data-store';
import CustomerCredentials from '../customer-credentials';
import CustomerStrategy from './customer-strategy';
import SignInCustomerService from '../sign-in-customer-service';

export default class DefaultCustomerStrategy extends CustomerStrategy {
    signIn(credentials: CustomerCredentials, options?: any): Promise<CheckoutSelectors> {
        return this._signInCustomerService.signIn(credentials, options);
    }

    signOut(options?: any): Promise<CheckoutSelectors> {
        return this._signInCustomerService.signOut(options);
    }
}
