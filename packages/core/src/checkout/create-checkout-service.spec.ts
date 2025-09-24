import { createRequestSender } from '@bigcommerce/request-sender';

import { getDefaultLogger, Logger } from '../common/log';
import { getConfig } from '../config/configs.mock';
import { getExtensions } from '../extension/extension.mock';
import { getFormFields } from '../form/form.mock';

import CheckoutInitialState from './checkout-initial-state';
import CheckoutService from './checkout-service';
import { getCheckout } from './checkouts.mock';
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

    it('creates instance with initial data', () => {
        const initialState: CheckoutInitialState = {
            config: getConfig(),
            formFields: getFormFields(),
            checkout: getCheckout(),
            extensions: getExtensions(),
        };
        const checkoutService = createCheckoutService({ initialState });
        const state = checkoutService.getState();

        expect(checkoutService).toBeInstanceOf(CheckoutService);
        expect(state.data.getCheckout()).toEqual(initialState.checkout);
        expect(state.data.getConfig()).toEqual(initialState.config.storeConfig);
        expect(state.data.getCustomerAccountFields()).toEqual(
            initialState.formFields.customerAccount,
        );
        expect(state.data.getExtensions()).toEqual(initialState.extensions);
    });
});
