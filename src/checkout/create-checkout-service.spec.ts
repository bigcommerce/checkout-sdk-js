import { createRequestSender } from '@bigcommerce/request-sender';

import { getDefaultLogger, Logger } from '../common/log';

import CheckoutService from './checkout-service';
import createCheckoutService from './create-checkout-service';

jest.mock('@bigcommerce/request-sender');

describe('createCheckoutService()', () => {
    const nodeEnviroment = process.env.NODE_ENV;
    let logger: Logger;

    beforeEach(() => {
        logger = getDefaultLogger();
        jest.spyOn(logger, 'warn');
    });

    afterEach(() => {
        process.env.NODE_ENV = nodeEnviroment;

        jest.clearAllMocks();
    });

    it('creates an instance of CheckoutService', () => {
        const checkoutService = createCheckoutService();

        expect(checkoutService).toBeInstanceOf(CheckoutService);
    });

    it('configures instance with host URL', () => {
        const host = 'https://foobar.com';

        createCheckoutService({ host });

        expect(createRequestSender).toHaveBeenCalledWith({ host });
    });

    it('throws if production and protocol is not https', () => {
        process.env.NODE_ENV = 'production';

        createCheckoutService();

        expect(logger.warn).toHaveBeenCalled();
    });
});
