import { createFormPoster, FormPoster } from '@bigcommerce/form-poster';
import { getScriptLoader } from '@bigcommerce/script-loader';
import { EventEmitter } from 'events';

import {
    CustomerInitializeOptions,
    InvalidArgumentError,
    MissingDataError,
    PaymentIntegrationService,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import {
    BraintreeDataCollector,
    BraintreeError,
    BraintreeHostWindow,
    BraintreePaypalCheckout,
    BraintreePaypalCheckoutCreator,
} from '../braintree';
import BraintreeIntegrationService from '../braintree-integration-service';
import BraintreeScriptLoader from '../braintree-script-loader';
import {
    getBraintree,
    getDataCollectorMock,
    getPayPalCheckoutCreatorMock,
    getPaypalCheckoutMock,
} from '../braintree.mock';
import { PaypalButtonOptions, PaypalSDK } from '../paypal';
import { getPaypalSDKMock } from '../paypal.mock';

import BraintreePaypalCustomerInitializeOptions from './braintree-paypal-customer-options';
import BraintreePaypalCustomerStrategy from './braintree-paypal-customer-strategy';

describe('BraintreePaypalCustomerStrategy', () => {
    let dataCollector: BraintreeDataCollector;
    let eventEmitter: EventEmitter;
    let braintreePaypalCheckoutMock: BraintreePaypalCheckout;
    let braintreePaypalCheckoutCreatorMock: BraintreePaypalCheckoutCreator;
    let paymentIntegrationService: PaymentIntegrationService;
    let formPoster: FormPoster;
    let braintreeScriptLoader: BraintreeScriptLoader;
    let braintreeIntegrationService: BraintreeIntegrationService;
    let paypalSdkMock: PaypalSDK;
    let strategy: BraintreePaypalCustomerStrategy;
    let paypalButtonElement: HTMLDivElement;
    let paymentMethodMock: PaymentMethod;

    const defaultButtonContainerId = 'braintree-paypal-button-mock-id';

    const braintreePaypalOptions: BraintreePaypalCustomerInitializeOptions = {
        container: defaultButtonContainerId,
        onError: jest.fn(),
    };

    const initializationOptions: CustomerInitializeOptions = {
        methodId: 'braintreepaypal',
        braintreepaypal: braintreePaypalOptions,
    };

    const getSDKPaypalCheckoutMock = (
        braintreePaypalCheckoutPayloadMock?: BraintreePaypalCheckout,
    ) => {
        if (!braintreePaypalCheckoutPayloadMock) {
            return jest.fn(
                (
                    _options: unknown,
                    _successCallback: unknown,
                    errorCallback: (err: BraintreeError) => void,
                ) => {
                    errorCallback({ type: 'UNKNOWN', code: '234' } as BraintreeError);
                },
            );
        }

        return jest.fn(
            (
                _options: unknown,
                successCallback: (braintreePaypalCheckout: BraintreePaypalCheckout) => void,
            ) => {
                successCallback(braintreePaypalCheckoutPayloadMock);
            },
        );
    };

    beforeEach(() => {
        dataCollector = getDataCollectorMock();
        eventEmitter = new EventEmitter();
        braintreePaypalCheckoutMock = getPaypalCheckoutMock();
        braintreePaypalCheckoutCreatorMock = getPayPalCheckoutCreatorMock(
            braintreePaypalCheckoutMock,
            false,
        );
        paypalSdkMock = getPaypalSDKMock();
        (window as BraintreeHostWindow).paypal = paypalSdkMock;
        paymentIntegrationService = new PaymentIntegrationServiceMock();
        formPoster = createFormPoster();
        braintreeScriptLoader = new BraintreeScriptLoader(getScriptLoader(), window);
        braintreeIntegrationService = new BraintreeIntegrationService(
            braintreeScriptLoader,
            window,
        );
        paymentMethodMock = {
            ...getBraintree(),
            clientToken: 'myToken',
        };

        paypalButtonElement = document.createElement('div');
        paypalButtonElement.id = defaultButtonContainerId;
        document.body.appendChild(paypalButtonElement);

        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethodMock,
        );
        jest.spyOn(braintreeIntegrationService, 'getPaypalCheckout').mockImplementation(
            getSDKPaypalCheckoutMock(braintreePaypalCheckoutMock),
        );
        jest.spyOn(braintreeIntegrationService, 'getClient').mockReturnValue(
            paymentMethodMock.clientToken,
        );
        jest.spyOn(braintreeIntegrationService, 'getDataCollector').mockReturnValue(dataCollector);
        jest.spyOn(braintreeIntegrationService, 'removeElement').mockImplementation(jest.fn());
        jest.spyOn(braintreeScriptLoader, 'loadPaypalCheckout').mockReturnValue(
            braintreePaypalCheckoutCreatorMock,
        );
        jest.spyOn(paypalSdkMock, 'Buttons').mockImplementation((options: PaypalButtonOptions) => {
            eventEmitter.on('createOrder', () => {
                if (typeof options.createOrder === 'function') {
                    options.createOrder().catch(() => {});
                }
            });

            eventEmitter.on('approve', () => {
                if (typeof options.onApprove === 'function') {
                    options.onApprove({ payerId: 'PAYER_ID' }).catch(() => {});
                }
            });

            return {
                isEligible: jest.fn(() => true),
                render: jest.fn(),
            };
        });
        jest.spyOn(formPoster, 'postForm').mockImplementation(() => {});

        strategy = new BraintreePaypalCustomerStrategy(
            paymentIntegrationService,
            formPoster,
            braintreeIntegrationService,
            window,
        );
    });

    afterEach(() => {
        jest.clearAllMocks();

        delete (window as BraintreeHostWindow).paypal;

        if (document.getElementById(defaultButtonContainerId)) {
            document.body.removeChild(paypalButtonElement);
        }
    });

    it('creates an instance of the braintree paypal checkout button strategy', () => {
        expect(strategy).toBeInstanceOf(BraintreePaypalCustomerStrategy);
    });

    describe('#initialize()', () => {
        it('throws error if methodId is not provided', async () => {
            const options = {} as CustomerInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws an error if braintreepaypal is not provided', async () => {
            const options = {
                methodId: 'braintreepaypal',
            } as CustomerInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws an error if container id is not provided', async () => {
            const options = {
                methodId: 'braintreepaypal',
                braintreepaypal: {},
            } as CustomerInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws error if client token is missing', async () => {
            paymentMethodMock.clientToken = undefined;

            try {
                await strategy.initialize(initializationOptions);
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });

        it('throws error if initialization data is missing', async () => {
            paymentMethodMock.initializationData = undefined;

            try {
                await strategy.initialize(initializationOptions);
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });

        it('initializes braintree paypal checkout', async () => {
            braintreeIntegrationService.initialize = jest.fn();
            braintreeIntegrationService.getPaypalCheckout = jest.fn();

            await strategy.initialize(initializationOptions);

            expect(braintreeIntegrationService.initialize).toHaveBeenCalledWith(
                paymentMethodMock.clientToken,
                paymentMethodMock.initializationData,
            );
            expect(braintreeIntegrationService.getPaypalCheckout).toHaveBeenCalled();
        });

        it('calls braintreeSdk with proper options', async () => {
            braintreeIntegrationService.initialize = jest.fn();
            braintreeIntegrationService.getPaypalCheckout = jest.fn();
            paymentMethodMock.initializationData = {
                ...paymentMethodMock.initializationData,
                isCreditEnabled: true,
                currency: 'USD',
                intent: undefined,
            };

            await strategy.initialize(initializationOptions);

            expect(braintreeIntegrationService.getPaypalCheckout).toHaveBeenCalledWith(
                {
                    currency: 'USD',
                    isCreditEnabled: true,
                    intent: undefined,
                },
                expect.any(Function),
                expect.any(Function),
            );
        });

        it('calls onError callback option if the error was caught on paypal checkout creation', async () => {
            braintreeIntegrationService.getPaypalCheckout = getSDKPaypalCheckoutMock();

            await strategy.initialize(initializationOptions);

            expect(initializationOptions.braintreepaypal?.onError).toHaveBeenCalled();
        });

        it('do not renders eligible PayPal checkout button', async () => {
            const renderMock = jest.fn();

            jest.spyOn(paypalSdkMock, 'Buttons').mockReturnValue({
                isEligible: jest.fn(() => false),
                render: renderMock,
            });

            await strategy.initialize(initializationOptions);

            expect(paypalSdkMock.Buttons).toHaveBeenCalledWith({
                env: 'sandbox',
                commit: false,
                fundingSource: paypalSdkMock.FUNDING.PAYPAL,
                style: {
                    height: 40,
                },
                createOrder: expect.any(Function),
                onApprove: expect.any(Function),
            });
            expect(renderMock).not.toHaveBeenCalled();
        });

        it('do not renders button if PayPal disappeared in window', async () => {
            delete (window as BraintreeHostWindow).paypal;
            await strategy.initialize(initializationOptions);

            expect(paypalSdkMock.Buttons).not.toHaveBeenCalled();
            expect(braintreeIntegrationService.removeElement).toHaveBeenCalled();
        });

        it('renders PayPal checkout button', async () => {
            await strategy.initialize(initializationOptions);

            expect(paypalSdkMock.Buttons).toHaveBeenCalledWith({
                env: 'sandbox',
                commit: false,
                fundingSource: paypalSdkMock.FUNDING.PAYPAL,
                style: {
                    height: 40,
                },
                createOrder: expect.any(Function),
                onApprove: expect.any(Function),
            });
        });

        it('renders PayPal checkout button with a customized height', async () => {
            await strategy.initialize({
                ...initializationOptions,
                braintreepaypal: {
                    ...braintreePaypalOptions,
                    buttonHeight: 100,
                },
            });

            expect(paypalSdkMock.Buttons).toHaveBeenCalledWith({
                env: 'sandbox',
                commit: false,
                fundingSource: paypalSdkMock.FUNDING.PAYPAL,
                style: {
                    height: 100,
                },
                createOrder: expect.any(Function),
                onApprove: expect.any(Function),
            });
        });

        it('renders PayPal checkout button in production environment if payment method is in test mode', async () => {
            paymentMethodMock.config.testMode = false;

            await strategy.initialize(initializationOptions);

            expect(paypalSdkMock.Buttons).toHaveBeenCalledWith(
                expect.objectContaining({ env: 'production' }),
            );
        });

        it('loads checkout details when customer is ready to pay', async () => {
            await strategy.initialize(initializationOptions);

            eventEmitter.emit('createOrder');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalledTimes(1);
        });

        it('sets up PayPal payment flow with no address when null is passed', async () => {
            jest.spyOn(paymentIntegrationService.getState(), 'getCustomer').mockReturnValueOnce(
                undefined,
            );

            await strategy.initialize({
                ...initializationOptions,
                braintreepaypal: {
                    ...initializationOptions.braintreepaypal,
                    shippingAddress: null,
                } as BraintreePaypalCustomerInitializeOptions,
            });

            eventEmitter.emit('createOrder');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(braintreePaypalCheckoutMock.createPayment).toHaveBeenCalledWith(
                expect.objectContaining({
                    shippingAddressOverride: undefined,
                }),
            );
        });

        it('sets up PayPal payment flow with current checkout details when customer is ready to pay', async () => {
            await strategy.initialize(initializationOptions);

            eventEmitter.emit('createOrder');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(braintreePaypalCheckoutMock.createPayment).toHaveBeenCalledWith({
                amount: 190,
                currency: 'USD',
                enableShippingAddress: true,
                flow: 'checkout',
                offerCredit: false,
                shippingAddressEditable: false,
                shippingAddressOverride: {
                    city: 'Some City',
                    countryCode: 'US',
                    line1: '12345 Testing Way',
                    line2: '',
                    phone: '555-555-5555',
                    postalCode: '95555',
                    recipientName: 'Test Tester',
                    state: 'CA',
                },
            });
        });

        it('triggers error callback if unable to set up payment flow', async () => {
            const expectedError = new Error('Unable to set up payment flow');

            jest.spyOn(braintreePaypalCheckoutMock, 'createPayment').mockImplementation(() =>
                Promise.reject(expectedError),
            );

            await strategy.initialize(initializationOptions);

            eventEmitter.emit('createOrder');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(braintreePaypalOptions.onError).toHaveBeenCalledWith(expectedError);
        });

        it('tokenizes PayPal payment details when authorization event is triggered', async () => {
            await strategy.initialize(initializationOptions);

            eventEmitter.emit('approve');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(braintreePaypalCheckoutMock.tokenizePayment).toHaveBeenCalledWith({
                payerId: 'PAYER_ID',
            });
        });

        it('posts payment details to server to set checkout data when PayPal payment details are tokenized', async () => {
            await strategy.initialize(initializationOptions);

            eventEmitter.emit('approve');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(formPoster.postForm).toHaveBeenCalledWith(
                '/checkout.php',
                expect.objectContaining({
                    payment_type: 'paypal',
                    provider: 'braintreepaypal',
                    action: 'set_external_checkout',
                    device_data: dataCollector.deviceData,
                    nonce: 'NONCE',
                    billing_address: JSON.stringify({
                        email: 'foo@bar.com',
                        first_name: 'Foo',
                        last_name: 'Bar',
                        address_line_1: '56789 Testing Way',
                        address_line_2: 'Level 2',
                        city: 'Some Other City',
                        state: 'Arizona',
                        country_code: 'US',
                        postal_code: '96666',
                    }),
                    shipping_address: JSON.stringify({
                        email: 'foo@bar.com',
                        first_name: 'Hello',
                        last_name: 'World',
                        address_line_1: '12345 Testing Way',
                        address_line_2: 'Level 1',
                        city: 'Some City',
                        state: 'California',
                        country_code: 'US',
                        postal_code: '95555',
                    }),
                }),
            );
        });

        it('triggers error callback if unable to tokenize payment', async () => {
            const expectedError = new Error('Unable to tokenize');

            jest.spyOn(braintreePaypalCheckoutMock, 'tokenizePayment').mockReturnValue(
                Promise.reject(expectedError),
            );

            await strategy.initialize(initializationOptions);

            eventEmitter.emit('approve');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(braintreePaypalOptions.onError).toHaveBeenCalledWith(expectedError);
        });
    });

    describe('#deinitialize()', () => {
        it('teardowns braintree sdk creator on strategy deinitialize', async () => {
            braintreeIntegrationService.teardown = jest.fn();

            await strategy.initialize(initializationOptions);
            await strategy.deinitialize();

            expect(braintreeIntegrationService.teardown).toHaveBeenCalled();
        });
    });

    describe('#signIn()', () => {
        it('calls default sign in method', async () => {
            const credentials = {
                email: 'test@test.com',
                password: '123',
            };

            await strategy.signIn(credentials);

            expect(paymentIntegrationService.signInCustomer).toHaveBeenCalledWith(
                credentials,
                undefined,
            );
        });
    });

    describe('#signOut()', () => {
        it('calls default sign out method', async () => {
            await strategy.signOut();

            expect(paymentIntegrationService.signOutCustomer).toHaveBeenCalled();
        });
    });

    describe('#executePaymentMethodCheckout()', () => {
        it('calls default continue with checkout callback', async () => {
            const continueWithCheckoutCallback = jest.fn();

            await strategy.executePaymentMethodCheckout({ continueWithCheckoutCallback });

            expect(continueWithCheckoutCallback).toHaveBeenCalled();
        });

        it('makes nothing if continue with checkout callback is not provided', async () => {
            const result = await strategy.executePaymentMethodCheckout();

            expect(result).toBeUndefined();
        });
    });
});
