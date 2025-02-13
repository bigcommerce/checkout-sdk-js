import { createFormPoster, FormPoster } from '@bigcommerce/form-poster';
import { getScriptLoader } from '@bigcommerce/script-loader';
import { EventEmitter } from 'events';

import {
    BraintreeDataCollector,
    BraintreeError,
    BraintreeHostWindow,
    BraintreeIntegrationService,
    BraintreePaypalCheckout,
    BraintreePaypalCheckoutCreator,
    BraintreeScriptLoader,
    getBraintree,
    getDataCollectorMock,
    getPayPalCheckoutCreatorMock,
    getPaypalCheckoutMock,
    PaypalButtonOptions,
    PaypalSDK,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    BuyNowCartCreationError,
    BuyNowCartRequestBody,
    Cart,
    CartSource,
    CheckoutButtonInitializeOptions,
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    PaymentIntegrationService,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getBuyNowCart,
    getCart,
    getCustomer,
    getShippingAddress,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import { getPaypalSDKMock } from '../mocks/paypal.mock';

import BraintreePaypalButtonInitializeOptions, {
    WithBraintreePaypalButtonInitializeOptions,
} from './braintree-paypal-button-initialize-options';
import BraintreePaypalButtonStrategy from './braintree-paypal-button-strategy';

describe('BraintreePaypalButtonStrategy', () => {
    let buyNowCart: Cart;
    let cart: Cart;
    let dataCollector: BraintreeDataCollector;
    let eventEmitter: EventEmitter;
    let braintreeIntegrationService: BraintreeIntegrationService;
    let braintreePaypalCheckoutMock: BraintreePaypalCheckout;
    let braintreePaypalCheckoutCreatorMock: BraintreePaypalCheckoutCreator;
    let braintreeScriptLoader: BraintreeScriptLoader;
    let formPoster: FormPoster;
    let paymentIntegrationService: PaymentIntegrationService;
    let paymentMethod: PaymentMethod;
    let paypalButtonElement: HTMLDivElement;
    let paypalMessageElement: HTMLDivElement;
    let paypalSdkMock: PaypalSDK;
    let strategy: BraintreePaypalButtonStrategy;

    const defaultButtonContainerId = 'braintree-paypal-button-mock-id';
    const defaultMessageContainerId = 'braintree-paypal-message-mock-id';

    const braintreePaypalOptions: BraintreePaypalButtonInitializeOptions = {
        messagingContainerId: defaultMessageContainerId, // only available on cart page
        shouldProcessPayment: false,
        style: { height: 45 },
        onAuthorizeError: jest.fn(),
        onPaymentError: jest.fn(),
        onError: jest.fn(),
        onEligibilityFailure: jest.fn(),
    };

    const buyNowCartRequestBody: BuyNowCartRequestBody = {
        source: CartSource.BuyNow,
        lineItems: [
            {
                productId: 1,
                quantity: 2,
                optionSelections: {
                    optionId: 11,
                    optionValue: 11,
                },
            },
        ],
    };

    const initializationOptions: CheckoutButtonInitializeOptions &
        WithBraintreePaypalButtonInitializeOptions = {
        methodId: 'braintreepaypal',
        containerId: defaultButtonContainerId,
        braintreepaypal: braintreePaypalOptions,
    };

    const buyNowInitializationOptions: CheckoutButtonInitializeOptions = {
        methodId: 'braintreepaypal',
        containerId: defaultButtonContainerId,
        braintreepaypal: {
            ...braintreePaypalOptions,
            currencyCode: 'USD',
            buyNowInitializeOptions: {
                getBuyNowCartRequestBody: jest.fn().mockReturnValue(buyNowCartRequestBody),
            },
        },
    };

    const getSDKPayPalCheckoutMockWithErrorCallbackCall = () => {
        return jest.fn(
            (
                _options: unknown,
                _successCallback: unknown,
                errorCallback: (err: BraintreeError) => void,
            ) => {
                errorCallback({ type: 'UNKNOWN', code: '234' } as BraintreeError);

                return Promise.resolve(braintreePaypalCheckoutMock);
            },
        );
    };

    const getSDKPaypalCheckoutMockWithSuccessCallbackCall = (
        braintreePaypalCheckoutPayloadMock: BraintreePaypalCheckout,
    ) => {
        return jest.fn(
            (
                _options: unknown,
                successCallback: (braintreePaypalCheckout: BraintreePaypalCheckout) => void,
            ) => {
                successCallback(braintreePaypalCheckoutPayloadMock);

                return Promise.resolve(braintreePaypalCheckoutMock);
            },
        );
    };

    beforeEach(() => {
        buyNowCart = getBuyNowCart();
        cart = getCart();
        dataCollector = getDataCollectorMock();
        eventEmitter = new EventEmitter();
        paymentMethod = {
            ...getBraintree(),
            clientToken: 'myToken',
        };
        paypalSdkMock = getPaypalSDKMock();
        (window as BraintreeHostWindow).paypal = paypalSdkMock;
        braintreePaypalCheckoutMock = getPaypalCheckoutMock();
        braintreePaypalCheckoutCreatorMock = getPayPalCheckoutCreatorMock(
            braintreePaypalCheckoutMock,
            false,
        );

        paypalButtonElement = document.createElement('div');
        paypalButtonElement.id = defaultButtonContainerId;
        document.body.appendChild(paypalButtonElement);

        paypalMessageElement = document.createElement('div');
        paypalMessageElement.id = defaultMessageContainerId;
        document.body.appendChild(paypalMessageElement);

        formPoster = createFormPoster();
        paymentIntegrationService = new PaymentIntegrationServiceMock();
        braintreeScriptLoader = new BraintreeScriptLoader(getScriptLoader(), window);
        braintreeIntegrationService = new BraintreeIntegrationService(
            braintreeScriptLoader,
            window,
        );

        strategy = new BraintreePaypalButtonStrategy(
            paymentIntegrationService,
            formPoster,
            braintreeIntegrationService,
            window,
        );

        jest.spyOn(formPoster, 'postForm').mockImplementation(() => {});
        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethod,
        );
        jest.spyOn(paymentIntegrationService.getState(), 'getCartOrThrow').mockReturnValue(cart);
        jest.spyOn(paymentIntegrationService.getState(), 'getCustomer').mockReturnValue(
            getCustomer(),
        );
        jest.spyOn(paymentIntegrationService, 'loadDefaultCheckout').mockImplementation(jest.fn());

        jest.spyOn(braintreeIntegrationService, 'getPaypalCheckout').mockImplementation(
            getSDKPaypalCheckoutMockWithSuccessCallbackCall(braintreePaypalCheckoutMock),
        );

        jest.spyOn(braintreeIntegrationService, 'getDataCollector').mockResolvedValue(
            dataCollector,
        );
        jest.spyOn(braintreeIntegrationService, 'removeElement').mockImplementation(jest.fn());
        jest.spyOn(braintreeScriptLoader, 'loadPaypalCheckout').mockResolvedValue(
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

            eventEmitter.on('click', () => {
                if (typeof options.onClick === 'function') {
                    options.onClick();
                }
            });

            return {
                close: jest.fn(),
                isEligible: jest.fn(() => true),
                render: jest.fn(),
            };
        });

        jest.spyOn(paypalSdkMock, 'Messages').mockImplementation(() => ({
            render: jest.fn(),
        }));
    });

    afterEach(() => {
        jest.clearAllMocks();

        delete (window as BraintreeHostWindow).paypal;

        if (document.getElementById(defaultButtonContainerId)) {
            document.body.removeChild(paypalButtonElement);
        }

        if (document.getElementById(defaultMessageContainerId)) {
            document.body.removeChild(paypalMessageElement);
        }
    });

    it('creates an instance of the braintree paypal button button strategy', () => {
        expect(strategy).toBeInstanceOf(BraintreePaypalButtonStrategy);
    });

    describe('#initialize()', () => {
        it('throws error if methodId is not provided', async () => {
            const options = {} as CheckoutButtonInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws an error if braintreepaypal is not provided', async () => {
            const options = {
                methodId: 'braintreepaypal',
                containerId: defaultButtonContainerId,
            } as CheckoutButtonInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws an error if container id is not provided', async () => {
            const options = {
                methodId: 'braintreepaypal',
                containerId: '',
                braintreepaypal: {},
            } as CheckoutButtonInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws an error if braintreepaypal.currencyCode is not provided (BuyNow flow)', async () => {
            try {
                await strategy.initialize({
                    methodId: 'braintreepaypal',
                    containerId: defaultButtonContainerId,
                    braintreepaypal: {
                        ...braintreePaypalOptions,
                        buyNowInitializeOptions: {
                            getBuyNowCartRequestBody: jest.fn(),
                        },
                    },
                });
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('does not load default checkout for BuyNowFlow', async () => {
            await strategy.initialize(buyNowInitializationOptions);

            expect(paymentIntegrationService.loadDefaultCheckout).not.toHaveBeenCalled();
        });

        it('throws error if client token is missing', async () => {
            paymentMethod.clientToken = undefined;

            try {
                await strategy.initialize(initializationOptions);
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });

        it('throws error if initialization data is missing', async () => {
            paymentMethod.initializationData = undefined;

            try {
                await strategy.initialize(initializationOptions);
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });

        it('initializes braintree integration service', async () => {
            braintreeIntegrationService.initialize = jest.fn();
            braintreeIntegrationService.getPaypalCheckout = jest.fn();

            await strategy.initialize(initializationOptions);

            expect(braintreeIntegrationService.initialize).toHaveBeenCalledWith(
                paymentMethod.clientToken,
            );
        });

        it('initializes braintree paypal checkout with proper options', async () => {
            braintreeIntegrationService.initialize = jest.fn();
            braintreeIntegrationService.getPaypalCheckout = jest.fn();
            paymentMethod.initializationData = {
                ...paymentMethod.initializationData,
                isCreditEnabled: false,
                currency: 'USD',
                intent: undefined,
            };

            await strategy.initialize(initializationOptions);

            expect(braintreeIntegrationService.initialize).toHaveBeenCalledWith(
                paymentMethod.clientToken,
            );
            expect(braintreeIntegrationService.getPaypalCheckout).toHaveBeenCalledWith(
                {
                    currency: 'USD',
                    isCreditEnabled: false,
                    intent: undefined,
                },
                expect.any(Function),
                expect.any(Function),
            );
        });

        it('calls onError callback option on paypal checkout creation failure', async () => {
            braintreeIntegrationService.getPaypalCheckout =
                getSDKPayPalCheckoutMockWithErrorCallbackCall();

            await strategy.initialize(initializationOptions);

            expect(initializationOptions.braintreepaypal?.onError).toHaveBeenCalled();
        });

        it('throws an error if buy now cart request body data is not provided', async () => {
            const buyNowInitializationOptions: CheckoutButtonInitializeOptions = {
                methodId: 'braintreepaypal',
                containerId: defaultButtonContainerId,
                braintreepaypal: {
                    ...braintreePaypalOptions,
                    currencyCode: 'USD',
                    buyNowInitializeOptions: {
                        getBuyNowCartRequestBody: jest.fn().mockReturnValue(undefined),
                    },
                },
            };

            await strategy.initialize(buyNowInitializationOptions);

            eventEmitter.emit('createOrder');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(braintreePaypalOptions.onPaymentError).toHaveBeenCalledWith(
                new MissingDataError(MissingDataErrorType.MissingCart),
            );
        });

        it('throws an error if there was an issue with buy now cart creation (Buy Now flow)', async () => {
            jest.spyOn(paymentIntegrationService, 'createBuyNowCart').mockReturnValue(
                Promise.reject(new Error()),
            );

            await strategy.initialize(buyNowInitializationOptions);

            eventEmitter.emit('createOrder');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(braintreePaypalOptions.onPaymentError).toHaveBeenCalledWith(
                new BuyNowCartCreationError(),
            );
        });

        it('creates order with Buy Now cart id (Buy Now flow)', async () => {
            jest.spyOn(paymentIntegrationService, 'createBuyNowCart').mockReturnValue(
                Promise.resolve(buyNowCart),
            );

            await strategy.initialize(buyNowInitializationOptions);

            eventEmitter.emit('createOrder');

            await new Promise((resolve) => process.nextTick(resolve));

            eventEmitter.emit('approve');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(formPoster.postForm).toHaveBeenCalledWith(
                '/checkout.php',
                expect.objectContaining({
                    cart_id: buyNowCart.id,
                }),
            );
        });

        it('renders Braintree PayPal message', async () => {
            await strategy.initialize(initializationOptions);

            expect(paypalSdkMock.Messages).toHaveBeenCalledWith({
                amount: cart.cartAmount,
                placement: 'cart',
            });
        });

        it('renders Braintree PayPal button', async () => {
            await strategy.initialize(initializationOptions);

            expect(paypalSdkMock.Buttons).toHaveBeenCalledWith({
                createOrder: expect.any(Function),
                env: 'sandbox',
                fundingSource: paypalSdkMock.FUNDING.PAYPAL,
                onApprove: expect.any(Function),
                style: {
                    shape: 'rect',
                    height: 45,
                },
            });
        });

        it('removes Braintree PayPal button and message containers when paypal is not available in window', async () => {
            delete (window as BraintreeHostWindow).paypal;

            await strategy.initialize(initializationOptions);

            expect(braintreeIntegrationService.removeElement).toHaveBeenCalledWith(
                defaultMessageContainerId,
            );
            expect(braintreeIntegrationService.removeElement).toHaveBeenCalledWith(
                defaultButtonContainerId,
            );
        });

        it('does not render Braintree PayPal button and calls onEligibilityFailure callback', async () => {
            const renderMock = jest.fn();

            jest.spyOn(paypalSdkMock, 'Buttons').mockImplementation(() => {
                return {
                    isEligible: jest.fn(() => false),
                    render: renderMock,
                    close: jest.fn(),
                };
            });

            await strategy.initialize(initializationOptions);

            expect(paypalSdkMock.Buttons).toHaveBeenCalledWith({
                createOrder: expect.any(Function),
                env: 'sandbox',
                fundingSource: paypalSdkMock.FUNDING.PAYPAL,
                onApprove: expect.any(Function),
                style: {
                    shape: 'rect',
                    height: 45,
                },
            });

            expect(braintreePaypalOptions.onEligibilityFailure).toHaveBeenCalled();
            expect(renderMock).not.toHaveBeenCalled();
        });

        it('renders Braintree PayPal button in production environment if payment method is in test mode', async () => {
            paymentMethod.config.testMode = false;

            await strategy.initialize(initializationOptions);

            expect(paypalSdkMock.Buttons).toHaveBeenCalledWith(
                expect.objectContaining({ env: 'production' }),
            );
        });

        it('sets up PayPal payment flow with provided address', async () => {
            await strategy.initialize({
                ...initializationOptions,
                braintreepaypal: {
                    ...initializationOptions.braintreepaypal,
                    shippingAddress: {
                        ...getShippingAddress(),
                        address1: 'a1',
                        address2: 'a2',
                        city: 'c',
                        countryCode: 'AU',
                        phone: '0123456',
                        postalCode: '2000',
                        stateOrProvinceCode: 'NSW',
                        firstName: 'foo',
                        lastName: 'bar',
                    },
                },
            });

            eventEmitter.emit('createOrder');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(braintreePaypalCheckoutMock.createPayment).toHaveBeenCalledWith(
                expect.objectContaining({
                    shippingAddressOverride: {
                        city: 'c',
                        countryCode: 'AU',
                        line1: 'a1',
                        line2: 'a2',
                        phone: '0123456',
                        postalCode: '2000',
                        recipientName: 'foo bar',
                        state: 'NSW',
                    },
                }),
            );
        });

        it('sets up PayPal payment flow with no address when null is passed', async () => {
            jest.spyOn(paymentIntegrationService.getState(), 'getCustomer').mockReturnValue(
                undefined,
            );

            await strategy.initialize({
                ...initializationOptions,
                braintreepaypal: {
                    ...initializationOptions.braintreepaypal,
                    shippingAddress: null,
                },
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

            expectedError.name = 'BraintreeError';

            jest.spyOn(braintreePaypalCheckoutMock, 'createPayment').mockImplementation(() =>
                Promise.reject(expectedError),
            );

            await strategy.initialize(initializationOptions);

            eventEmitter.emit('createOrder');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(braintreePaypalOptions.onPaymentError).toHaveBeenCalledWith(expectedError);
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

        it('posts payment details to server to process payment if `shouldProcessPayment` is passed when PayPal payment details are tokenized', async () => {
            const options = {
                ...initializationOptions,
                braintreepaypal: {
                    ...braintreePaypalOptions,
                    shouldProcessPayment: true,
                },
            };

            await strategy.initialize(options);

            eventEmitter.emit('approve');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(formPoster.postForm).toHaveBeenCalledWith(
                '/checkout.php',
                expect.objectContaining({
                    payment_type: 'paypal',
                    provider: 'braintreepaypal',
                    action: 'process_payment',
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

            expectedError.name = 'BraintreeError';

            jest.spyOn(braintreePaypalCheckoutMock, 'tokenizePayment').mockReturnValue(
                Promise.reject(expectedError),
            );

            await strategy.initialize(initializationOptions);

            eventEmitter.emit('approve');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(braintreePaypalOptions.onAuthorizeError).toHaveBeenCalledWith(expectedError);
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
});
