import { getScriptLoader } from '@bigcommerce/script-loader';
import { noop } from 'lodash';

import {
    InvalidArgumentError,
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
import { BrowserStorage } from '@bigcommerce/checkout-sdk/storage';

import { BraintreeConnect } from '../braintree';
import BraintreeIntegrationService from '../braintree-integration-service';
import BraintreeScriptLoader from '../braintree-script-loader';
import { getConnectMock } from '../mocks/braintree.mock';

import BraintreeAcceleratedCheckoutPaymentStrategy from './braintree-accelerated-checkout-payment-strategy';
import BraintreeAcceleratedCheckoutUtils from './braintree-accelerated-checkout-utils';

describe('BraintreeAcceleratedCheckoutPaymentStrategy', () => {
    let braintreeAcceleratedCheckoutUtils: BraintreeAcceleratedCheckoutUtils;
    let braintreeConnectMock: BraintreeConnect;
    let braintreeIntegrationService: BraintreeIntegrationService;
    let braintreeScriptLoader: BraintreeScriptLoader;
    let browserStorage: BrowserStorage;
    let paymentIntegrationService: PaymentIntegrationService;
    let strategy: BraintreeAcceleratedCheckoutPaymentStrategy;

    const methodId = 'braintreeacceleratedcheckout';
    const deviceSessionId = 'device_session_id_mock';
    const instrumentId = 'asd123';

    const billingAddress = getBillingAddress();
    const shippingAddress = getShippingAddress();

    const defaultInitializationOptions = {
        methodId,
        braintreeacceleratedcheckout: {
            onInit: jest.fn(),
        },
    };

    const executeOptions = {
        payment: {
            methodId,
            paymentData: {},
        },
    };

    const executeOptionsWithVaultedInstrument = {
        payment: {
            methodId,
            paymentData: {
                instrumentId,
            },
        },
    };

    beforeEach(() => {
        browserStorage = new BrowserStorage('braintree-accelerated-checkout-mock');
        braintreeConnectMock = getConnectMock();

        braintreeScriptLoader = new BraintreeScriptLoader(getScriptLoader(), window);
        braintreeIntegrationService = new BraintreeIntegrationService(
            braintreeScriptLoader,
            window,
        );
        paymentIntegrationService = new PaymentIntegrationServiceMock();
        braintreeAcceleratedCheckoutUtils = new BraintreeAcceleratedCheckoutUtils(
            paymentIntegrationService,
            braintreeIntegrationService,
            browserStorage,
        );

        strategy = new BraintreeAcceleratedCheckoutPaymentStrategy(
            paymentIntegrationService,
            braintreeAcceleratedCheckoutUtils,
        );

        jest.spyOn(paymentIntegrationService, 'loadPaymentMethod');
        jest.spyOn(paymentIntegrationService, 'submitOrder');
        jest.spyOn(paymentIntegrationService, 'submitPayment');
        jest.spyOn(
            paymentIntegrationService.getState(),
            'getBillingAddressOrThrow',
        ).mockReturnValue(billingAddress);
        jest.spyOn(paymentIntegrationService.getState(), 'getShippingAddress').mockReturnValue(
            shippingAddress,
        );
        jest.spyOn(
            paymentIntegrationService.getState(),
            'getPaymentProviderCustomerOrThrow',
        ).mockImplementation(jest.fn);

        jest.spyOn(
            braintreeAcceleratedCheckoutUtils,
            'initializeBraintreeConnectOrThrow',
        ).mockImplementation(jest.fn);
        jest.spyOn(
            braintreeAcceleratedCheckoutUtils,
            'getBraintreeConnectOrThrow',
        ).mockImplementation(() => braintreeConnectMock);
        jest.spyOn(braintreeAcceleratedCheckoutUtils, 'getDeviceSessionId').mockImplementation(
            () => deviceSessionId,
        );
        jest.spyOn(braintreeConnectMock, 'ConnectCardComponent').mockImplementation(() => ({
            tokenize: () => ({ nonce: 'nonce' }),
            render: jest.fn(),
        }));
    });

    afterEach(() => {
        jest.clearAllMocks();
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
    });

    describe('#renderBraintreeAXOComponent', () => {
        let container: HTMLElement;
        let callback: (containerId: string) => void = noop;

        const initializationOptions = {
            methodId,
            braintreeacceleratedcheckout: {
                onInit: (renderComponent: (containerId: string) => void) => {
                    callback = renderComponent;
                },
            },
        };

        beforeEach(() => {
            container = document.createElement('div');
            container.id = 'pp-connect-container-id';
            document.body.appendChild(container);
        });

        afterEach(() => {
            document.body.removeChild(container);
        });

        it('throws an error if container id is not provided (or it has a falsy value) in callback call', async () => {
            await strategy.initialize(initializationOptions);

            try {
                callback('');
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('loads braintreeacceleratedcheckout payment method', async () => {
            await strategy.initialize(initializationOptions);

            callback(container.id);

            expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalledWith(methodId);
        });

        it('initializes braintree connect', async () => {
            await strategy.initialize(initializationOptions);

            callback(container.id);

            expect(
                braintreeAcceleratedCheckoutUtils.initializeBraintreeConnectOrThrow,
            ).toHaveBeenCalledWith(methodId);
        });

        it('renders braintree connect card component', async () => {
            const renderMethodMock = jest.fn();

            jest.spyOn(braintreeConnectMock, 'ConnectCardComponent').mockImplementation(() => ({
                render: renderMethodMock,
            }));

            await strategy.initialize(initializationOptions);

            if (container.id) {
                callback(container.id);
            }

            expect(renderMethodMock).toHaveBeenCalledWith(container.id);
        });
    });

    describe('#execute()', () => {
        it('throws an error is payment is not provided', async () => {
            await strategy.initialize(defaultInitializationOptions);

            try {
                await strategy.execute({});
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentArgumentInvalidError);
            }
        });

        it('submits payment and order with prepared data', async () => {
            await strategy.initialize(defaultInitializationOptions);
            await strategy.execute(executeOptions);

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

        it('submits payment and order with stored instrument data', async () => {
            await strategy.initialize(defaultInitializationOptions);
            await strategy.execute(executeOptions);

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

    describe('#prepareVaultedInstrumentPaymentPayload()', () => {
        it('prepares payment payload with BC vaulted instrument', async () => {
            await strategy.initialize(defaultInitializationOptions);
            await strategy.execute(executeOptionsWithVaultedInstrument);

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId: 'braintreeacceleratedcheckout',
                paymentData: {
                    deviceSessionId,
                    instrumentId,
                },
            });
        });

        it('prepares payment payload with PayPal Connect vaulted instrument', async () => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentProviderCustomerOrThrow',
            ).mockImplementation(() => ({
                authenticationState: 'succeeded',
                instruments: [
                    {
                        brand: 'visa',
                        expiryMonth: '12',
                        expiryYear: '33',
                        iin: '411111',
                        last4: '1111',
                        type: 'card',
                        bigpayToken: instrumentId,
                        defaultInstrument: false,
                        provider: methodId,
                        trustedShippingAddress: false,
                        method: methodId,
                    },
                ],
            }));

            await strategy.initialize(defaultInitializationOptions);
            await strategy.execute(executeOptionsWithVaultedInstrument);

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId: 'braintreeacceleratedcheckout',
                paymentData: {
                    deviceSessionId,
                    instrumentId,
                    tokenType: 'paypal_connect',
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

            await strategy.initialize(defaultInitializationOptions);
            await strategy.execute(executeOptions);

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
        it('deinitializes strategy', async () => {
            await expect(strategy.deinitialize()).resolves.not.toThrow();
        });
    });

    describe('#finalize()', () => {
        it('throws error to inform that order finalization is not required', async () => {
            await expect(strategy.finalize()).rejects.toThrow(OrderFinalizationNotRequiredError);
        });
    });
});
