import { createFormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';

import { createCheckoutStore } from '../checkout';

import CheckoutButtonInitializer from './checkout-button-initializer';
import createCheckoutButtonInitializer from './create-checkout-button-initializer';

jest.mock('@bigcommerce/form-poster');
jest.mock('@bigcommerce/request-sender');
jest.mock('../checkout', () => ({
    createCheckoutStore: jest.fn(() => ({
        getState: jest.fn().mockReturnValue({}),
        subscribe: jest.fn(),
    })),
}));
jest.mock('../payment-integration');
jest.mock('./create-checkout-button-registry');

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

        createCheckoutButtonInitializer({ host, locale: 'en' });

        expect(createCheckoutStore).toHaveBeenCalledWith({
            config: {
                meta: {
                    host,
                    locale: 'en',
                },
                errors: {},
                statuses: {},
            },
        });
        expect(createFormPoster).toHaveBeenCalledWith({ host });
        expect(createRequestSender).toHaveBeenCalledWith({ host });
    });
});
