import { createRequestSender } from '@bigcommerce/request-sender';
import { CheckoutClient, CheckoutSelectors, CheckoutStore } from './checkout';
import { DataStore } from '../data-store';
import { CustomerActionCreator, SignInCustomerService } from './customer';

export default function createSignInCustomerService(
    store: CheckoutStore,
    client: CheckoutClient
): SignInCustomerService {
    return new SignInCustomerService(
        store,
        new CustomerActionCreator(client)
    );
}
