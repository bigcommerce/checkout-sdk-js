import CheckoutService from './checkout-service';
import createCheckoutService from './create-checkout-service';
import { getDefaultLogger } from '../common/log';

describe('createCheckoutService()', () => {
    const nodeEnviroment = process.env.NODE_ENV;
    let logger;

    beforeEach(() => {
        logger = getDefaultLogger();
        jest.spyOn(logger, 'warn');
    });

    afterEach(() => {
        process.env.NODE_ENV = nodeEnviroment;
    });

    it('creates an instance of CheckoutService', () => {
        const checkoutClient = jest.fn();
        const checkoutService = createCheckoutService({ client: checkoutClient });

        expect(checkoutService).toEqual(expect.any(CheckoutService));
    });

    it('creates an instance without optional params', () => {
        const checkoutService = createCheckoutService();

        expect(checkoutService).toEqual(expect.any(CheckoutService));
    });

    it('throws if production and protocol is not https', () => {
        process.env.NODE_ENV = 'production';

        createCheckoutService();

        expect(logger.warn).toHaveBeenCalled();
    });
});
