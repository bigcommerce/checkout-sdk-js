import { CheckoutStore } from '../../checkout';
import DefaultCustomerStrategy from './default-customer-strategy';
import SignInCustomerService from '../sign-in-customer-service';
import createCheckoutClient from '../../create-checkout-client';
import createCheckoutStore from '../../create-checkout-store';
import createSignInCustomerService from '../../create-sign-in-customer-service';

describe('DefaultCustomerStrategy', () => {
    let store: CheckoutStore;
    let signInCustomerService: SignInCustomerService;

    beforeEach(() => {
        store = createCheckoutStore();
        signInCustomerService = createSignInCustomerService(store, createCheckoutClient());
    });

    it('signs in customer', async () => {
        const strategy = new DefaultCustomerStrategy(store, signInCustomerService);
        const credentials = { email: 'foo@bar.com', password: 'foobar' };
        const options = {};

        jest.spyOn(signInCustomerService, 'signIn')
            .mockReturnValue(Promise.resolve(store.getState()));

        const output = await strategy.signIn(credentials, options);

        expect(signInCustomerService.signIn).toHaveBeenCalledWith(credentials, options);
        expect(output).toEqual(store.getState());
    });

    it('signs out customer', async () => {
        const strategy = new DefaultCustomerStrategy(store, signInCustomerService);
        const options = {};

        jest.spyOn(signInCustomerService, 'signOut')
            .mockReturnValue(Promise.resolve(store.getState()));

        const output = await strategy.signOut(options);

        expect(signInCustomerService.signOut).toHaveBeenCalledWith(options);
        expect(output).toEqual(store.getState());
    });
});
