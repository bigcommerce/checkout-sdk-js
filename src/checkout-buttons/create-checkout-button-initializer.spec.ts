import { createFormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';

import CheckoutButtonInitializer from './checkout-button-initializer';
import createCheckoutButtonInitializer from './create-checkout-button-initializer';

jest.mock('@bigcommerce/form-poster');
jest.mock('@bigcommerce/request-sender');

describe('createCheckoutButtonInitializer()', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('creates instance of `CheckoutButtonInitializer`', () => {
        const initializer = createCheckoutButtonInitializer();

        expect(initializer).toBeInstanceOf(CheckoutButtonInitializer);
    });

    it('configures instance with host URL', () => {
        const host = 'https://foobar.com';

        createCheckoutButtonInitializer({ host });

        expect(createFormPoster).toHaveBeenCalledWith({ host });
        expect(createRequestSender).toHaveBeenCalledWith({ host });
    });
});
