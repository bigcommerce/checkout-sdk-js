import { createFormPoster, FormPoster } from '@bigcommerce/form-poster';
import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    BraintreeDataCollector,
    BraintreeHostWindow,
    BraintreeScriptLoader,
    BraintreeSdk,
    BraintreeVisaCheckout,
    getBraintree,
    getDataCollectorMock,
    getDeviceDataMock,
    getVisaCheckoutMock,
    getVisaCheckoutSDKMock,
    VisaCheckoutHostWindow,
    VisaCheckoutSDK,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    CustomerInitializeOptions,
    InvalidArgumentError,
    MissingDataError,
    PaymentIntegrationService,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BraintreeVisaCheckoutCustomerStrategy from './braintree-visa-checkout-customer-strategy';
import { WithBraintreeVisaCheckoutCustomerInitializeOptions } from './braintree-visa-customer-initialize-options';

describe('BraintreeVisaCheckoutCustomerStrategy', () => {
    let strategy: BraintreeVisaCheckoutCustomerStrategy;
    let paymentIntegrationService: PaymentIntegrationService;
    let braintreeSdk: BraintreeSdk;
    let braintreeScriptLoader: BraintreeScriptLoader;
    let formPoster: FormPoster;
    let paymentMethodMock: PaymentMethod;
    let braintreeVisaCheckout: BraintreeVisaCheckout;
    let mockWindow: VisaCheckoutHostWindow;
    let visaCheckoutSDKMock: VisaCheckoutSDK;
    let braintreeVisaCheckoutButtonElement: HTMLDivElement;
    let dataCollector: BraintreeDataCollector;

    const defaultContainerId = 'braintree-visa-checkout-button-mock-id';

    const initializationOptions: CustomerInitializeOptions &
        WithBraintreeVisaCheckoutCustomerInitializeOptions = {
        methodId: 'braintreevisacheckout',
        braintreevisacheckout: {
            container: 'braintree-visa-checkout-button-mock-id',
            onError: jest.fn(),
        },
    };

    beforeEach(() => {
        mockWindow = {} as VisaCheckoutHostWindow & BraintreeHostWindow;

        dataCollector = getDataCollectorMock();

        visaCheckoutSDKMock = getVisaCheckoutSDKMock();

        paymentMethodMock = {
            ...getBraintree(),
            clientToken: 'myVisaCheckoutToken',
        };

        braintreeVisaCheckoutButtonElement = document.createElement('div');
        braintreeVisaCheckoutButtonElement.id = defaultContainerId;
        document.body.appendChild(braintreeVisaCheckoutButtonElement);

        braintreeVisaCheckout = getVisaCheckoutMock();

        paymentIntegrationService = new PaymentIntegrationServiceMock();
        formPoster = createFormPoster();

        braintreeScriptLoader = new BraintreeScriptLoader(getScriptLoader(), mockWindow);
        braintreeSdk = new BraintreeSdk(braintreeScriptLoader);

        strategy = new BraintreeVisaCheckoutCustomerStrategy(
            paymentIntegrationService,
            formPoster,
            braintreeSdk,
        );

        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethodMock,
        );
        // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        jest.spyOn(paymentIntegrationService, 'loadCheckout').mockReturnValue(true);

        jest.spyOn(braintreeSdk, 'initialize');
        jest.spyOn(braintreeSdk, 'deinitialize');
        // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        jest.spyOn(braintreeSdk, 'getBraintreeVisaCheckout').mockReturnValue(braintreeVisaCheckout);
        // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        jest.spyOn(braintreeSdk, 'getDataCollectorOrThrow').mockReturnValue(dataCollector);

        // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        jest.spyOn(braintreeSdk, 'getVisaCheckoutSdk').mockImplementation(() => {
            mockWindow.V = visaCheckoutSDKMock;

            return mockWindow.V;
        });

        jest.spyOn(formPoster, 'postForm').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('#initialize()', () => {
        it('renders visa checkout button', async () => {
            await strategy.initialize(initializationOptions);

            expect(braintreeVisaCheckout.createInitOptions).toHaveBeenCalled();
            expect(mockWindow.V?.init).toHaveBeenCalled();
        });

        it('do not render the visa button if there is no element with the containerId identifier in the DOM', async () => {
            try {
                await strategy.initialize({
                    ...initializationOptions,
                    // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    braintreevisacheckout: {},
                });
            } catch (error) {
                expect(error).toBeInstanceOf(Error);

                if (error instanceof Error) {
                    expect(error.message).toBe(
                        'Unable to proceed because the provided container ID is not valid.',
                    );
                }
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

        it('throws error if methodId is missing', async () => {
            try {
                await strategy.initialize({
                    // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    braintreevisacheckout: {
                        ...initializationOptions.braintreevisacheckout,
                    },
                });
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('initializes braintree integration service', async () => {
            await strategy.initialize(initializationOptions);

            expect(braintreeSdk.initialize).toHaveBeenCalledWith(paymentMethodMock.clientToken);
        });

        it('initializes braintree visa checkout', async () => {
            await strategy.initialize(initializationOptions);

            expect(braintreeSdk.getBraintreeVisaCheckout).toHaveBeenCalled();
        });

        it('call the createInitOptions and init functions with the proper options', async () => {
            const properOptions = {
                paymentRequest: {
                    currencyCode: 'USD',
                    subtotal: '190',
                },
                settings: {
                    locale: 'en_US',
                    shipping: {
                        collectShipping: true,
                    },
                },
            };

            await strategy.initialize(initializationOptions);

            expect(braintreeVisaCheckout.createInitOptions).toHaveBeenCalledWith(properOptions);
            expect(mockWindow.V?.init).toHaveBeenCalledWith(properOptions);
        });

        it('visa Checkout tokenization', async () => {
            // TODO: remove rule and update test with related type (PAYPAL-4383)
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            visaCheckoutSDKMock.on = jest.fn((type, callback) => {
                // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                return type === 'payment.success' ? callback('data') : undefined;
            });

            await strategy.initialize(initializationOptions);

            expect(braintreeVisaCheckout.tokenize).toHaveBeenCalled();
            expect(braintreeSdk.getDataCollectorOrThrow).toHaveBeenCalled();
        });

        it('registers the error and success callbacks', async () => {
            // TODO: remove rule and update test with related type (PAYPAL-4383)

            visaCheckoutSDKMock.on = jest.fn((_, callback) => {
                // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                callback();
            });
            await strategy.initialize(initializationOptions);

            expect(visaCheckoutSDKMock.on).toHaveBeenCalledWith(
                'payment.success',
                expect.any(Function),
            );
            expect(visaCheckoutSDKMock.on).toHaveBeenCalledWith(
                'payment.error',
                expect.any(Function),
            );
        });

        describe('when payment.success', () => {
            beforeEach(() => {
                // TODO: remove rule and update test with related type (PAYPAL-4383)
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                visaCheckoutSDKMock.on = jest.fn((type, callback) => {
                    // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    return type === 'payment.success' ? callback('data') : undefined;
                });
            });

            it('posts payment details to server to set checkout data when Visa Checkout payment details are tokenized', async () => {
                const mappedToBCAddress = JSON.stringify({
                    email: 'test@example.com',
                    first_name: 'John',
                    last_name: 'Doe',
                    phone_number: '04877789875',
                    address_line_1: '51 Main St.',
                    address_line_2: 'Ultimo',
                    city: 'Sydney',
                    state: 'NSW',
                    country_code: 'ES',
                    postal_code: '2008',
                });

                await strategy.initialize(initializationOptions);

                await new Promise((resolve) => process.nextTick(resolve));

                expect(formPoster.postForm).toHaveBeenCalledWith(
                    '/checkout.php',
                    expect.objectContaining({
                        action: 'set_external_checkout',
                        billing_address: mappedToBCAddress,
                        card_information: JSON.stringify({ type: 'Visa', number: '11' }),
                        device_data: getDeviceDataMock(),
                        nonce: 'my-nonce',
                        payment_type: 'type1',
                        provider: 'braintreevisacheckout',
                        shipping_address: mappedToBCAddress,
                    }),
                );
            });

            it('reloads quote and payment method', async () => {
                await strategy.initialize(initializationOptions);

                await new Promise((resolve) => process.nextTick(resolve));

                expect(paymentIntegrationService.loadCheckout).toHaveBeenCalled();
            });

            it('payment error triggers onError from the options', async () => {
                const errorMock = new Error();

                // TODO: remove rule and update test with related type (PAYPAL-4383)
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                visaCheckoutSDKMock.on = jest.fn((type, callback) =>
                    // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    type === 'payment.error' ? callback('data', errorMock) : undefined,
                );

                await strategy.initialize(initializationOptions);

                expect(initializationOptions.braintreevisacheckout?.onError).toHaveBeenCalledWith(
                    errorMock,
                );
            });
        });
    });

    describe('#signIn()', () => {
        beforeEach(async () => {
            await strategy.initialize(initializationOptions);
        });

        it('throws error if trying to sign in programmatically', () => {
            expect(() => strategy.signIn()).toThrow();
        });
    });

    describe('#signOut()', () => {
        it('throws error if trying to sign out programmatically', async () => {
            await strategy.signOut();

            expect(paymentIntegrationService.signOutCustomer).toHaveBeenCalled();
        });
    });

    describe('#deinitialize()', () => {
        it('deinitializes strategy', async () => {
            const result = await strategy.deinitialize();

            expect(result).toBeUndefined();
            expect(braintreeSdk.deinitialize).toHaveBeenCalled();
        });
    });

    describe('#executePaymentMethodCheckout', () => {
        it('runs continue callback automatically on execute payment method checkout', async () => {
            const mockCallback = jest.fn();

            await strategy.executePaymentMethodCheckout({
                continueWithCheckoutCallback: mockCallback,
            });

            expect(mockCallback.mock.calls).toHaveLength(1);
        });
    });
});
