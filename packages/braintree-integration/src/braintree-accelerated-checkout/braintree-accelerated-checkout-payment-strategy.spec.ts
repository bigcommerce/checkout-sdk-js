import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    InvalidArgumentError,
    MissingDataError,
    OrderFinalizationNotRequiredError,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getBillingAddress,
    getShippingAddress,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import { BraintreeConnect } from '../braintree';
import BraintreeIntegrationService from '../braintree-integration-service';
import BraintreeScriptLoader from '../braintree-script-loader';
import {
    getBraintreeAcceleratedCheckoutPaymentMethod,
    getConnectMock,
} from '../mocks/braintree.mock';

import BraintreeAcceleratedCheckoutPaymentStrategy from './braintree-accelerated-checkout-payment-strategy';

describe('BraintreeAcceleratedCheckoutPaymentStrategy', () => {
    let braintreeConnectMock: BraintreeConnect;
    let braintreeIntegrationService: BraintreeIntegrationService;
    let braintreeScriptLoader: BraintreeScriptLoader;
    let paymentIntegrationService: PaymentIntegrationService;
    let strategy: BraintreeAcceleratedCheckoutPaymentStrategy;

    const container = '#braintree-cc-component-container';
    const methodId = 'braintreeacceleratedcheckout';
    const initializationOptions = {
        methodId,
        braintreeacceleratedcheckout: {
            container,
        },
    };

    const paymentMethod = getBraintreeAcceleratedCheckoutPaymentMethod();
    const billingAddress = getBillingAddress();
    const shippingAddress = getShippingAddress();

    const execureOptions = {
        payment: {
            methodId,
            paymentData: {},
        },
    };

    beforeEach(() => {
        braintreeConnectMock = getConnectMock();

        braintreeScriptLoader = new BraintreeScriptLoader(getScriptLoader(), window);
        braintreeIntegrationService = new BraintreeIntegrationService(
            braintreeScriptLoader,
            window,
        );
        paymentIntegrationService = new PaymentIntegrationServiceMock();

        strategy = new BraintreeAcceleratedCheckoutPaymentStrategy(
            paymentIntegrationService,
            braintreeIntegrationService,
        );

        jest.spyOn(paymentIntegrationService, 'loadPaymentMethod');
        jest.spyOn(paymentIntegrationService, 'submitOrder');
        jest.spyOn(paymentIntegrationService, 'submitPayment');
        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethod,
        );
        jest.spyOn(
            paymentIntegrationService.getState(),
            'getBillingAddressOrThrow',
        ).mockReturnValue(billingAddress);
        jest.spyOn(paymentIntegrationService.getState(), 'getShippingAddress').mockReturnValue(
            shippingAddress,
        );

        jest.spyOn(braintreeIntegrationService, 'initialize');
        jest.spyOn(braintreeIntegrationService, 'getBraintreeConnect').mockImplementation(
            () => braintreeConnectMock,
        );
        jest.spyOn(braintreeConnectMock, 'ConnectCardComponent').mockImplementation(() => ({
            tokenize: () => ({ nonce: 'nonce' }),
            render: jest.fn(),
        }));
    });

    describe('#initialize()', () => {
        it('throws an error if methodId is not provided', async () => {
            const options = {} as PaymentInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws an error if option.braintreeacceleratedcheckout is not provided', async () => {
            const options = {
                methodId,
            } as PaymentInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws an error if option.braintreeacceleratedcheckout.container is not provided', async () => {
            const options = {
                methodId,
                braintreeacceleratedcheckout: {},
            } as PaymentInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('loads braintreeacceleratedcheckout payment method', async () => {
            await strategy.initialize(initializationOptions);

            expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalledWith(methodId);
        });

        it('throws an error if client token does not exist in payment method', async () => {
            const state = paymentIntegrationService.getState();
            const invalidPaymentMethod = {
                ...paymentMethod,
                clientToken: '',
            };

            jest.spyOn(state, 'getPaymentMethodOrThrow').mockReturnValue(invalidPaymentMethod);

            try {
                await strategy.initialize(initializationOptions);
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });

        it('throws an error if initialization data does not exist in payment method', async () => {
            const state = paymentIntegrationService.getState();
            const invalidPaymentMethod = {
                ...paymentMethod,
                initializationData: null,
            };

            jest.spyOn(state, 'getPaymentMethodOrThrow').mockReturnValue(invalidPaymentMethod);

            try {
                await strategy.initialize(initializationOptions);
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });

        it('loads braintree connect', async () => {
            await strategy.initialize(initializationOptions);

            expect(braintreeIntegrationService.initialize).toHaveBeenCalledWith(
                paymentMethod.clientToken,
                paymentMethod.initializationData,
            );
            expect(braintreeIntegrationService.getBraintreeConnect).toHaveBeenCalled();
        });

        it('renders braintree connect card component', async () => {
            const renderMethodMock = jest.fn();

            jest.spyOn(braintreeConnectMock, 'ConnectCardComponent').mockImplementation(() => ({
                render: renderMethodMock,
            }));

            await strategy.initialize(initializationOptions);

            expect(renderMethodMock).toHaveBeenCalledWith(container);
        });
    });

    describe('#execute()', () => {
        it('throws an error is payment is not provided', async () => {
            await strategy.initialize(initializationOptions);

            try {
                await strategy.execute({});
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentArgumentInvalidError);
            }
        });

        it('submits payment and order with prepared data', async () => {
            await strategy.initialize(initializationOptions);
            await strategy.execute(execureOptions);

            expect(paymentIntegrationService.submitOrder).toHaveBeenCalledWith({}, undefined);
            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId: 'braintreeacceleratedcheckout',
                paymentData: {
                    shouldSaveInstrument: false,
                    shouldSetAsDefaultInstrument: false,
                    nonce: 'nonce',
                },
            });
        });
    });

    describe('#preparePaymentPayload()', () => {
        it('collects an tokenizes data from braintree connect card component', async () => {
            const tokenizeMethodMock = jest.fn().mockReturnValue({ nonce: 'nonce' });

            jest.spyOn(braintreeConnectMock, 'ConnectCardComponent').mockImplementation(() => ({
                tokenize: tokenizeMethodMock,
                render: jest.fn,
            }));

            await strategy.initialize(initializationOptions);
            await strategy.execute(execureOptions);

            expect(tokenizeMethodMock).toHaveBeenCalledWith({
                billingAddress: {
                    streetAddress: '12345 Testing Way',
                    locality: 'Some City',
                    region: 'CA',
                    postalCode: '95555',
                    countryCodeAlpha2: 'US',
                },
                shippingAddress: {
                    streetAddress: '12345 Testing Way',
                    locality: 'Some City',
                    region: 'CA',
                    postalCode: '95555',
                    countryCodeAlpha2: 'US',
                },
            });
        });
    });

    describe('#deinitialize()', () => {
        it('runs teardown process for braintree connect', async () => {
            jest.spyOn(braintreeIntegrationService, 'teardown');

            await strategy.initialize(initializationOptions);
            await strategy.deinitialize();

            expect(braintreeIntegrationService.teardown).toHaveBeenCalled();
        });
    });

    describe('#finalize()', () => {
        it('throws error to inform that order finalization is not required', async () => {
            await expect(strategy.finalize()).rejects.toThrow(OrderFinalizationNotRequiredError);
        });
    });
});
