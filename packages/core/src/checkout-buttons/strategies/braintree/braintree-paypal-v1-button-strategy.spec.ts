import { createAction } from '@bigcommerce/data-store';
import { createFormPoster, FormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';
import { EventEmitter } from 'events';
import { from } from 'rxjs';

import { getCart } from '../../../cart/carts.mock';
import { createCheckoutStore, CheckoutActionCreator, CheckoutActionType, CheckoutRequestSender, CheckoutStore } from '../../../checkout';
import { getCheckout, getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { InvalidArgumentError, MissingDataError } from '../../../common/error/errors';
import { ConfigActionCreator, ConfigRequestSender } from '../../../config';
import { getConfig } from '../../../config/configs.mock';
import { FormFieldsActionCreator, FormFieldsRequestSender } from '../../../form';
import { PaymentMethod } from '../../../payment';
import { getBraintree } from '../../../payment/payment-methods.mock';
import { BraintreeDataCollector, BraintreePaypalCheckout, BraintreePaypalCheckoutCreator, BraintreeScriptLoader, BraintreeSDKCreator, BraintreeVenmoCheckout, BraintreeVenmoCheckoutCreator } from '../../../payment/strategies/braintree';
import { getDataCollectorMock, getPaypalCheckoutMock, getPayPalCheckoutCreatorMock } from '../../../payment/strategies/braintree/braintree.mock';
import { PaypalButtonOptions, PaypalHostWindow, PaypalSDK } from '../../../payment/strategies/paypal';
import { getPaypalMock } from '../../../payment/strategies/paypal/paypal.mock';
import { getShippingAddress } from '../../../shipping/internal-shipping-addresses.mock';
import { CheckoutButtonInitializeOptions } from '../../checkout-button-options';
import CheckoutButtonMethodType from '../checkout-button-method-type';

import { BraintreePaypalV1ButtonInitializeOptions } from './braintree-paypal-v1-button-options';
import BraintreePaypalV1ButtonStrategy from './braintree-paypal-v1-button-strategy';

describe('BraintreePaypalV1ButtonStrategy', () => {
    let braintreeSDKCreator: BraintreeSDKCreator;
    let braintreeScriptLoader: BraintreeScriptLoader;
    let braintreePaypalCheckoutCreatorMock: BraintreePaypalCheckoutCreator;
    let braintreePaypalCheckoutMock: BraintreePaypalCheckout;
    let braintreeVenmoCheckoutMock: BraintreeVenmoCheckout;
    let braintreeVenmoCheckoutCreatorMock: BraintreeVenmoCheckoutCreator;
    let checkoutActionCreator: CheckoutActionCreator;
    let dataCollector: BraintreeDataCollector;
    let eventEmitter: EventEmitter;
    let formPoster: FormPoster;
    let paymentMethodMock: PaymentMethod;
    let buttonElement: HTMLDivElement;
    let messageElement: HTMLDivElement;
    let paypalSdkMock: PaypalSDK;
    let store: CheckoutStore;
    let strategy: BraintreePaypalV1ButtonStrategy;

    const defaultButtonContainerId = 'braintree-button-mock-id';
    const defaultMessageContainerId = 'braintree-message-mock-id';

    const braintreePaypalOptions: BraintreePaypalV1ButtonInitializeOptions = {
        allowCredit: false,
        messagingContainerId: defaultMessageContainerId,
        style: {
            height: 45,
        },
        onAuthorizeError: jest.fn(),
        onPaymentError: jest.fn(),
        onError: jest.fn(),
    };

    const braintreePaypalInitializationOptions: CheckoutButtonInitializeOptions = {
        methodId: CheckoutButtonMethodType.BRAINTREE_PAYPAL,
        containerId: defaultButtonContainerId,
        braintreepaypal: braintreePaypalOptions,
    };

    const braintreePaypalCreditOptions: BraintreePaypalV1ButtonInitializeOptions = {
        allowCredit: true,
        style: {
            height: 45,
        },
        onAuthorizeError: jest.fn(),
        onPaymentError: jest.fn(),
        onError: jest.fn(),
    };

    const braintreePaypalCreditInitializationOptions: CheckoutButtonInitializeOptions = {
        methodId: CheckoutButtonMethodType.BRAINTREE_PAYPAL_CREDIT,
        containerId: defaultButtonContainerId,
        braintreepaypalcredit: braintreePaypalCreditOptions,
    };

    describe('braintreepaypal tests', () => {
        beforeEach(() => {
            const storeConfigMock = getConfig().storeConfig;
            storeConfigMock.checkoutSettings.features = {
                'PAYPAL-1149.braintree-new-card-below-totals-banner-placement': false,
            };

            braintreePaypalCheckoutMock = getPaypalCheckoutMock();
            braintreePaypalCheckoutCreatorMock = getPayPalCheckoutCreatorMock(braintreePaypalCheckoutMock, false);
            dataCollector = getDataCollectorMock();
            paypalSdkMock = getPaypalMock();
            eventEmitter = new EventEmitter();

            store = createCheckoutStore(getCheckoutStoreState());
            checkoutActionCreator = new CheckoutActionCreator(
                new CheckoutRequestSender(createRequestSender()),
                new ConfigActionCreator(new ConfigRequestSender(createRequestSender())),
                new FormFieldsActionCreator(new FormFieldsRequestSender(createRequestSender()))
            );
            braintreeScriptLoader = new BraintreeScriptLoader(getScriptLoader());
            braintreeSDKCreator = new BraintreeSDKCreator(braintreeScriptLoader);
            formPoster = createFormPoster();

            (window as PaypalHostWindow).paypal = paypalSdkMock;

            strategy = new BraintreePaypalV1ButtonStrategy(
                store,
                checkoutActionCreator,
                braintreeSDKCreator,
                formPoster,
                false,
                window
            );

            paymentMethodMock = {
                ...getBraintree(),
                clientToken: 'myToken',
                initializationData: {
                    isBraintreeVenmoEnabled: false,
                },
            };

            buttonElement = document.createElement('div');
            buttonElement.id = defaultButtonContainerId;
            document.body.appendChild(buttonElement);

            messageElement = document.createElement('div');
            messageElement.id = defaultMessageContainerId;
            document.body.appendChild(messageElement);

            jest.spyOn(store, 'dispatch').mockReturnValue(Promise.resolve(store.getState()));
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue(paymentMethodMock);
            jest.spyOn(store.getState().config, 'getStoreConfigOrThrow').mockReturnValue(storeConfigMock);
            jest.spyOn(braintreeSDKCreator, 'getClient').mockReturnValue(paymentMethodMock.clientToken);
            jest.spyOn(braintreeSDKCreator, 'getDataCollector').mockReturnValue(dataCollector);
            jest.spyOn(braintreeScriptLoader, 'loadPaypalCheckout').mockReturnValue(braintreePaypalCheckoutCreatorMock);
            jest.spyOn(formPoster, 'postForm').mockImplementation(() => {});

            jest.spyOn(paypalSdkMock, 'Buttons')
                .mockImplementation((options: PaypalButtonOptions) => {
                    eventEmitter.on('createOrder', () => {
                        if (options.createOrder) {
                            options.createOrder().catch(() => {});
                        }
                    });

                    eventEmitter.on('approve', () => {
                        if (options.onApprove) {
                            options.onApprove({ payerId: 'PAYER_ID' }).catch(() => {});
                        }
                    });

                    return {
                        isEligible: jest.fn(() => true),
                        render: jest.fn(),
                    };
                });

            jest.spyOn(paypalSdkMock, 'Messages').mockImplementation(() => ({ // TODO: only for braintreepaypal
                render: jest.fn(),
            }));
        });

        afterEach(() => {
            jest.clearAllMocks();

            delete (window as PaypalHostWindow).paypal;

            document.body.removeChild(buttonElement);
            document.body.removeChild(messageElement);
        });

        it('creates an instance of the braintree paypal checkout button strategy', () => {
            expect(strategy).toBeInstanceOf(BraintreePaypalV1ButtonStrategy);
        });

        describe('#initialize()', () => {
            it('throws error if methodId is not provided', async () => {
                const options = { containerId: defaultButtonContainerId } as CheckoutButtonInitializeOptions;

                try {
                    await strategy.initialize(options);
                } catch (error) {
                    expect(error).toBeInstanceOf(InvalidArgumentError);
                }
            });

            it('throws an error if containerId is not provided', async () => {
                const options = { methodId: CheckoutButtonMethodType.BRAINTREE_PAYPAL } as CheckoutButtonInitializeOptions;

                try {
                    await strategy.initialize(options);
                } catch (error) {
                    expect(error).toBeInstanceOf(InvalidArgumentError);
                }
            });

            it('throws an error if should not offer credit and braintreepaypal is not provided', async () => {
                const options = {
                    containerId: defaultButtonContainerId,
                    methodId: CheckoutButtonMethodType.BRAINTREE_PAYPAL,
                } as CheckoutButtonInitializeOptions;

                try {
                    await strategy.initialize(options);
                } catch (error) {
                    expect(error).toBeInstanceOf(InvalidArgumentError);
                }
            });

            it('throws an error if should offer credit and braintreepaypalcredit is not provided', async () => {
                const options = {
                    containerId: defaultButtonContainerId,
                    methodId: CheckoutButtonMethodType.BRAINTREE_PAYPAL_CREDIT,
                } as CheckoutButtonInitializeOptions;

                try {
                    await strategy.initialize(options);
                } catch (error) {
                    expect(error).toBeInstanceOf(InvalidArgumentError);
                }
            });

            it('throws error if client token is missing', async () => {
                paymentMethodMock.clientToken = undefined;

                try {
                    await strategy.initialize(braintreePaypalInitializationOptions);
                } catch (error) {
                    expect(error).toBeInstanceOf(MissingDataError);
                }
            });

            it('initializes braintree sdk creator', async () => {
                braintreeSDKCreator.initialize = jest.fn();
                braintreeSDKCreator.getPaypalCheckout = jest.fn();

                await strategy.initialize(braintreePaypalInitializationOptions);

                expect(braintreeSDKCreator.initialize).toHaveBeenCalledWith(paymentMethodMock.clientToken);
            });

            it('initializes braintree paypal checkout', async () => {
                braintreeSDKCreator.initialize = jest.fn();
                braintreeSDKCreator.getPaypalCheckout = jest.fn();

                await strategy.initialize(braintreePaypalInitializationOptions);

                expect(braintreeSDKCreator.initialize).toHaveBeenCalledWith(paymentMethodMock.clientToken);
                expect(braintreeSDKCreator.getPaypalCheckout).toHaveBeenCalled();
            });

            it('calls braintree paypal checkout create method', async () => {
                await strategy.initialize(braintreePaypalInitializationOptions);

                expect(braintreePaypalCheckoutCreatorMock.create).toHaveBeenCalled();
            });

            it('calls onError callback option if the error was caught on paypal checkout creation', async () => {
                braintreePaypalCheckoutCreatorMock = getPayPalCheckoutCreatorMock(undefined, true);

                jest.spyOn(braintreeScriptLoader, 'loadPaypalCheckout').mockReturnValue(braintreePaypalCheckoutCreatorMock);

                await strategy.initialize(braintreePaypalInitializationOptions);

                expect(braintreePaypalInitializationOptions.braintreepaypal?.onError).toHaveBeenCalled();
            });

            it('renders PayPal checkout message', async () => {
                const cartMock = getCart();
                const storeConfigMock = getConfig().storeConfig;
                storeConfigMock.checkoutSettings.features = {
                    'PAYPAL-1149.braintree-new-card-below-totals-banner-placement': true,
                };

                jest.spyOn(store.getState().config, 'getStoreConfigOrThrow').mockReturnValue(storeConfigMock);
                jest.spyOn(store.getState().cart, 'getCartOrThrow').mockReturnValue(cartMock);

                await strategy.initialize(braintreePaypalInitializationOptions);

                expect(paypalSdkMock.Messages).toHaveBeenCalledWith({
                    amount: 190,
                    placement: 'cart',
                });
            });

            it('renders PayPal checkout button', async () => {
                await strategy.initialize(braintreePaypalInitializationOptions);

                expect(paypalSdkMock.Buttons).toHaveBeenCalledWith({
                    commit: false,
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

            it('renders PayPal checkout button in production environment if payment method is in test mode', async () => {
                paymentMethodMock.config.testMode = false;

                await strategy.initialize(braintreePaypalInitializationOptions);

                expect(paypalSdkMock.Buttons).toHaveBeenCalledWith(
                    expect.objectContaining({ env: 'production' })
                );
            });

            it('loads checkout details when customer is ready to pay', async () => {
                jest.spyOn(checkoutActionCreator, 'loadDefaultCheckout')
                    .mockReturnValue(() => from([
                        createAction(CheckoutActionType.LoadCheckoutRequested),
                        createAction(CheckoutActionType.LoadCheckoutSucceeded, getCheckout()),
                    ]));

                await strategy.initialize(braintreePaypalInitializationOptions);

                eventEmitter.emit('createOrder');

                await new Promise(resolve => process.nextTick(resolve));

                expect(checkoutActionCreator.loadDefaultCheckout).toHaveBeenCalledTimes(2);
            });

            it('sets up PayPal payment flow with provided address', async () => {
                jest.spyOn(store.getState().checkout, 'getCheckoutOrThrow').mockReturnValue({ outstandingBalance: 22 });

                await strategy.initialize({
                    ...braintreePaypalInitializationOptions,
                    braintreepaypal: {
                        ...braintreePaypalInitializationOptions.braintreepaypal,
                        shippingAddress: {
                            ...getShippingAddress(),
                            address1: 'a1',
                            address2: 'a2',
                            city: 'c',
                            countryCode: 'AU',
                            phone: '0123456',
                            postalCode: '2000',
                            stateOrProvince: 'NSW',
                            stateOrProvinceCode: 'NSW',
                            firstName: 'foo',
                            lastName: 'bar',
                        },
                    },
                });

                eventEmitter.emit('createOrder');

                await new Promise(resolve => process.nextTick(resolve));

                expect(braintreePaypalCheckoutMock.createPayment).toHaveBeenCalledWith(expect.objectContaining({
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
                }));
            });

            it('sets up PayPal payment flow with no address when null is passed', async () => {
                jest.spyOn(store.getState().customer, 'getCustomer').mockReturnValue(undefined);

                await strategy.initialize({
                    ...braintreePaypalInitializationOptions,
                    braintreepaypal: {
                        ...braintreePaypalInitializationOptions.braintreepaypal,
                        shippingAddress: null,
                    },
                });

                eventEmitter.emit('createOrder');

                await new Promise(resolve => process.nextTick(resolve));

                expect(braintreePaypalCheckoutMock.createPayment).toHaveBeenCalledWith(expect.objectContaining({
                    shippingAddressOverride: undefined,
                }));
            });

            it('sets up PayPal payment flow with current checkout details when customer is ready to pay', async () => {
                await strategy.initialize(braintreePaypalInitializationOptions);

                eventEmitter.emit('createOrder');

                await new Promise(resolve => process.nextTick(resolve));

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

                jest.spyOn(braintreePaypalCheckoutMock, 'createPayment')
                    .mockImplementation(() => Promise.reject(expectedError));

                await strategy.initialize(braintreePaypalInitializationOptions);

                eventEmitter.emit('createOrder');

                await new Promise(resolve => process.nextTick(resolve));

                expect(braintreePaypalOptions.onPaymentError).toHaveBeenCalledWith(expectedError);
            });

            it('tokenizes PayPal payment details when authorization event is triggered', async () => {
                await strategy.initialize(braintreePaypalInitializationOptions);

                eventEmitter.emit('approve');

                await new Promise(resolve => process.nextTick(resolve));

                expect(braintreePaypalCheckoutMock.tokenizePayment).toHaveBeenCalledWith({ payerId: 'PAYER_ID' });
            });

            it('posts payment details to server to set checkout data when PayPal payment details are tokenized', async () => {
                await strategy.initialize(braintreePaypalInitializationOptions);

                eventEmitter.emit('approve');

                await new Promise(resolve => process.nextTick(resolve));

                expect(formPoster.postForm).toHaveBeenCalledWith('/checkout.php', expect.objectContaining({
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
                }));
            });

            it('posts payment details to server to process payment if `shouldProcessPayment` is passed when PayPal payment details are tokenized', async () => {
                const options = {
                    ...braintreePaypalInitializationOptions,
                    braintreepaypal: {
                        ...braintreePaypalOptions,
                        shouldProcessPayment: true,
                    },
                };

                await strategy.initialize(options);

                eventEmitter.emit('approve');

                await new Promise(resolve => process.nextTick(resolve));

                expect(formPoster.postForm).toHaveBeenCalledWith('/checkout.php', expect.objectContaining({
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
                }));
            });

            it('triggers error callback if unable to tokenize payment', async () => {
                const expectedError = new Error('Unable to tokenize');

                jest.spyOn(braintreePaypalCheckoutMock, 'tokenizePayment')
                    .mockReturnValue(Promise.reject(expectedError));

                await strategy.initialize(braintreePaypalInitializationOptions);

                eventEmitter.emit('approve');

                await new Promise(resolve => process.nextTick(resolve));

                expect(braintreePaypalOptions.onAuthorizeError).toHaveBeenCalledWith(expectedError);
            });
        });

        describe('#deinitialize()', () => {
            it('teardowns braintree sdk creator on strategy deinitialize', async () => {
                braintreeSDKCreator.teardown = jest.fn();

                await strategy.initialize(braintreePaypalInitializationOptions);
                await strategy.deinitialize();

                expect(braintreeSDKCreator.teardown).toHaveBeenCalled();
            });
        });
    });

    describe('braintreepaypalcredit tests', () => {
        beforeEach(() => {
            braintreePaypalCheckoutMock = getPaypalCheckoutMock();
            braintreePaypalCheckoutCreatorMock = getPayPalCheckoutCreatorMock(braintreePaypalCheckoutMock, false);
            dataCollector = getDataCollectorMock();
            paypalSdkMock = getPaypalMock();
            eventEmitter = new EventEmitter();

            store = createCheckoutStore(getCheckoutStoreState());
            checkoutActionCreator = new CheckoutActionCreator(
                new CheckoutRequestSender(createRequestSender()),
                new ConfigActionCreator(new ConfigRequestSender(createRequestSender())),
                new FormFieldsActionCreator(new FormFieldsRequestSender(createRequestSender()))
            );
            braintreeScriptLoader = new BraintreeScriptLoader(getScriptLoader());
            braintreeSDKCreator = new BraintreeSDKCreator(braintreeScriptLoader);
            formPoster = createFormPoster();

            (window as PaypalHostWindow).paypal = paypalSdkMock;

            strategy = new BraintreePaypalV1ButtonStrategy(
                store,
                checkoutActionCreator,
                braintreeSDKCreator,
                formPoster,
                true,
                window
            );

            paymentMethodMock = {
                ...getBraintree(),
                clientToken: 'myToken',
                initializationData: {
                    isBraintreeVenmoEnabled: false,
                },
            };

            buttonElement = document.createElement('div');
            buttonElement.id = defaultButtonContainerId;
            document.body.appendChild(buttonElement);

            jest.spyOn(store, 'dispatch').mockReturnValue(Promise.resolve(store.getState()));
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue(paymentMethodMock);
            jest.spyOn(store.getState().config, 'getStoreConfigOrThrow').mockReturnValue(getConfig().storeConfig);
            jest.spyOn(braintreeSDKCreator, 'getClient').mockReturnValue(paymentMethodMock.clientToken);
            jest.spyOn(braintreeSDKCreator, 'getDataCollector').mockReturnValue(dataCollector);
            jest.spyOn(braintreeScriptLoader, 'loadPaypalCheckout').mockReturnValue(braintreePaypalCheckoutCreatorMock);
            jest.spyOn(formPoster, 'postForm').mockImplementation(() => {});

            jest.spyOn(paypalSdkMock, 'Buttons')
                .mockImplementation((options: PaypalButtonOptions) => {
                    eventEmitter.on('createOrder', () => {
                        if (options.createOrder) {
                            options.createOrder().catch(() => {});
                        }
                    });

                    eventEmitter.on('approve', () => {
                        if (options.onApprove) {
                            options.onApprove({ payerId: 'PAYER_ID' }).catch(() => {});
                        }
                    });

                    return {
                        isEligible: jest.fn(() => true),
                        render: jest.fn(),
                    };
                });
        });

        afterEach(() => {
            jest.clearAllMocks();

            delete (window as PaypalHostWindow).paypal;

            document.body.removeChild(buttonElement);
        });

        it('creates an instance of the braintree paypal checkout button strategy', () => {
            expect(strategy).toBeInstanceOf(BraintreePaypalV1ButtonStrategy);
        });

        describe('#initialize()', () => {
            it('throws error if methodId is not provided', async () => {
                const options = { containerId: defaultButtonContainerId } as CheckoutButtonInitializeOptions;

                try {
                    await strategy.initialize(options);
                } catch (error) {
                    expect(error).toBeInstanceOf(InvalidArgumentError);
                }
            });

            it('throws an error if containerId is not provided', async () => {
                const options = { methodId: CheckoutButtonMethodType.BRAINTREE_PAYPAL_CREDIT } as CheckoutButtonInitializeOptions;

                try {
                    await strategy.initialize(options);
                } catch (error) {
                    expect(error).toBeInstanceOf(InvalidArgumentError);
                }
            });

            it('throws an error if should offers credit and braintreepaypalcredit is not provided', async () => {
                const options = {
                    containerId: defaultButtonContainerId,
                    methodId: CheckoutButtonMethodType.BRAINTREE_PAYPAL_CREDIT,
                } as CheckoutButtonInitializeOptions;

                try {
                    await strategy.initialize(options);
                } catch (error) {
                    expect(error).toBeInstanceOf(InvalidArgumentError);
                }
            });

            it('throws error if client token is missing', async () => {
                paymentMethodMock.clientToken = undefined;

                try {
                    await strategy.initialize(braintreePaypalCreditInitializationOptions);
                } catch (error) {
                    expect(error).toBeInstanceOf(MissingDataError);
                }
            });

            it('initializes braintree sdk creator', async () => {
                braintreeSDKCreator.initialize = jest.fn();
                braintreeSDKCreator.getPaypalCheckout = jest.fn();

                await strategy.initialize(braintreePaypalCreditInitializationOptions);

                expect(braintreeSDKCreator.initialize).toHaveBeenCalledWith(paymentMethodMock.clientToken);
            });

            it('initializes braintree paypal checkout', async () => {
                braintreeSDKCreator.initialize = jest.fn();
                braintreeSDKCreator.getPaypalCheckout = jest.fn();

                await strategy.initialize(braintreePaypalCreditInitializationOptions);

                expect(braintreeSDKCreator.initialize).toHaveBeenCalledWith(paymentMethodMock.clientToken);
                expect(braintreeSDKCreator.getPaypalCheckout).toHaveBeenCalled();
            });

            it('calls braintree paypal checkout create method', async () => {
                await strategy.initialize(braintreePaypalCreditInitializationOptions);

                expect(braintreePaypalCheckoutCreatorMock.create).toHaveBeenCalled();
            });

            it('calls onError callback option if the error was caught on paypal checkout creation', async () => {
                braintreePaypalCheckoutCreatorMock = getPayPalCheckoutCreatorMock(undefined, true);

                jest.spyOn(braintreeScriptLoader, 'loadPaypalCheckout').mockReturnValue(braintreePaypalCheckoutCreatorMock);

                await strategy.initialize(braintreePaypalCreditInitializationOptions);

                expect(braintreePaypalCreditInitializationOptions.braintreepaypalcredit?.onError).toHaveBeenCalled();
            });

            it('initializes braintree paylater and braintree credit buttons before rendering', async () => {
                await strategy.initialize(braintreePaypalCreditInitializationOptions);

                expect(paypalSdkMock.Buttons).toHaveBeenCalledWith({
                    commit: false,
                    createOrder: expect.any(Function),
                    env: 'sandbox',
                    fundingSource: paypalSdkMock.FUNDING.PAYLATER,
                    onApprove: expect.any(Function),
                    style: {
                        shape: 'rect',
                        height: 45,
                    },
                });

                expect(paypalSdkMock.Buttons).toHaveBeenCalledWith({
                    commit: false,
                    createOrder: expect.any(Function),
                    env: 'sandbox',
                    fundingSource: paypalSdkMock.FUNDING.CREDIT,
                    onApprove: expect.any(Function),
                    style: {
                        label: 'credit',
                        shape: 'rect',
                        height: 45,
                    },
                });
            });

            it('renders braintree checkout button in production environment if payment method is in test mode', async () => {
                paymentMethodMock.config.testMode = false;

                await strategy.initialize(braintreePaypalCreditInitializationOptions);

                expect(paypalSdkMock.Buttons).toHaveBeenCalledWith(
                    expect.objectContaining({ env: 'production' })
                );
            });

            it('loads checkout details when customer is ready to pay', async () => {
                jest.spyOn(checkoutActionCreator, 'loadDefaultCheckout')
                    .mockReturnValue(() => from([
                        createAction(CheckoutActionType.LoadCheckoutRequested),
                        createAction(CheckoutActionType.LoadCheckoutSucceeded, getCheckout()),
                    ]));

                await strategy.initialize(braintreePaypalCreditInitializationOptions);

                eventEmitter.emit('createOrder');

                await new Promise(resolve => process.nextTick(resolve));

                expect(checkoutActionCreator.loadDefaultCheckout).toHaveBeenCalledTimes(4);
            });

            it('sets up PayPal payment flow with provided address', async () => {
                jest.spyOn(store.getState().checkout, 'getCheckoutOrThrow').mockReturnValue({ outstandingBalance: 22 });

                await strategy.initialize({
                    ...braintreePaypalCreditInitializationOptions,
                    braintreepaypalcredit: {
                        ...braintreePaypalCreditInitializationOptions.braintreepaypalcredit,
                        shippingAddress: {
                            ...getShippingAddress(),
                            address1: 'a1',
                            address2: 'a2',
                            city: 'c',
                            countryCode: 'AU',
                            phone: '0123456',
                            postalCode: '2000',
                            stateOrProvince: 'NSW',
                            stateOrProvinceCode: 'NSW',
                            firstName: 'foo',
                            lastName: 'bar',
                        },
                    },
                });

                eventEmitter.emit('createOrder');

                await new Promise(resolve => process.nextTick(resolve));

                expect(braintreePaypalCheckoutMock.createPayment).toHaveBeenCalledWith(expect.objectContaining({
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
                }));
            });

            it('sets up PayPal payment flow with no address when null is passed', async () => {
                jest.spyOn(store.getState().customer, 'getCustomer').mockReturnValue(undefined);

                await strategy.initialize({
                    ...braintreePaypalCreditInitializationOptions,
                    braintreepaypalcredit: {
                        ...braintreePaypalCreditInitializationOptions.braintreepaypalcredit,
                        shippingAddress: null,
                    },
                });

                eventEmitter.emit('createOrder');

                await new Promise(resolve => process.nextTick(resolve));

                expect(braintreePaypalCheckoutMock.createPayment).toHaveBeenCalledWith(expect.objectContaining({
                    shippingAddressOverride: undefined,
                }));
            });

            it('sets up PayPal payment flow with current checkout details when customer is ready to pay', async () => {
                await strategy.initialize(braintreePaypalCreditInitializationOptions);

                eventEmitter.emit('createOrder');

                await new Promise(resolve => process.nextTick(resolve));

                expect(braintreePaypalCheckoutMock.createPayment).toHaveBeenCalledWith({
                    amount: 190,
                    currency: 'USD',
                    enableShippingAddress: true,
                    flow: 'checkout',
                    offerCredit: true,
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

                jest.spyOn(braintreePaypalCheckoutMock, 'createPayment')
                    .mockImplementation(() => Promise.reject(expectedError));

                await strategy.initialize(braintreePaypalCreditInitializationOptions);

                eventEmitter.emit('createOrder');

                await new Promise(resolve => process.nextTick(resolve));

                expect(braintreePaypalCreditOptions.onPaymentError).toHaveBeenCalledWith(expectedError);
            });

            it('tokenizes PayPal payment details when authorization event is triggered', async () => {
                await strategy.initialize(braintreePaypalCreditInitializationOptions);

                eventEmitter.emit('approve');

                await new Promise(resolve => process.nextTick(resolve));

                expect(braintreePaypalCheckoutMock.tokenizePayment).toHaveBeenCalledWith({ payerId: 'PAYER_ID' });
            });

            it('posts payment details to server to set checkout data when PayPal payment details are tokenized', async () => {
                await strategy.initialize(braintreePaypalCreditInitializationOptions);

                eventEmitter.emit('approve');

                await new Promise(resolve => process.nextTick(resolve));

                expect(formPoster.postForm).toHaveBeenCalledWith('/checkout.php', expect.objectContaining({
                    payment_type: 'paypal',
                    provider: 'braintreepaypalcredit',
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
                }));
            });

            it('posts payment details to server to process payment if `shouldProcessPayment` is passed when PayPal payment details are tokenized', async () => {
                const options = {
                    ...braintreePaypalCreditInitializationOptions,
                    braintreepaypalcredit: {
                        ...braintreePaypalCreditOptions,
                        shouldProcessPayment: true,
                    },
                };

                await strategy.initialize(options);

                eventEmitter.emit('approve');

                await new Promise(resolve => process.nextTick(resolve));

                expect(formPoster.postForm).toHaveBeenCalledWith('/checkout.php', expect.objectContaining({
                    payment_type: 'paypal',
                    provider: 'braintreepaypalcredit',
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
                }));
            });

            it('triggers error callback if unable to tokenize payment', async () => {
                const expectedError = new Error('Unable to tokenize');

                jest.spyOn(braintreePaypalCheckoutMock, 'tokenizePayment')
                    .mockReturnValue(Promise.reject(expectedError));

                await strategy.initialize(braintreePaypalCreditInitializationOptions);

                eventEmitter.emit('approve');

                await new Promise(resolve => process.nextTick(resolve));

                expect(braintreePaypalCreditOptions.onAuthorizeError).toHaveBeenCalledWith(expectedError);
            });
        });

        describe('#deinitialize()', () => {
            it('teardowns braintree sdk creator on strategy deinitialize', async () => {
                braintreeSDKCreator.teardown = jest.fn();

                await strategy.initialize(braintreePaypalCreditInitializationOptions);
                await strategy.deinitialize();

                expect(braintreeSDKCreator.teardown).toHaveBeenCalled();
            });
        });
    });

    describe('braintree venmo tests', () => {
        const billingAddressPayload = {
            line1: 'line1',
            line2: 'line2',
            city: 'city',
            state: 'state',
            postalCode: 'postalCode',
            countryCode: 'countryCode',
        };

        const shippingAddressPayload = {
            ...billingAddressPayload,
            recipientName: 'John Doe',
        };

        const expectedAddress = {
            email: 'test@test.com',
            first_name: 'John',
            last_name: 'Doe',
            phone_number: '123456789',
            address_line_1: 'line1',
            address_line_2: 'line2',
            city: 'city',
            state: 'state',
            country_code: 'countryCode',
            postal_code: 'postalCode',
        };

        beforeEach(() => {
            const storeConfigMock = getConfig().storeConfig;
            storeConfigMock.checkoutSettings.features = {
                'PAYPAL-1149.braintree-new-card-below-totals-banner-placement': false,
            };

            braintreePaypalCheckoutMock = getPaypalCheckoutMock();
            braintreePaypalCheckoutCreatorMock = getPayPalCheckoutCreatorMock(braintreePaypalCheckoutMock, false);
            dataCollector = getDataCollectorMock();
            paypalSdkMock = getPaypalMock();
            eventEmitter = new EventEmitter();

            store = createCheckoutStore(getCheckoutStoreState());
            checkoutActionCreator = new CheckoutActionCreator(
                new CheckoutRequestSender(createRequestSender()),
                new ConfigActionCreator(new ConfigRequestSender(createRequestSender())),
                new FormFieldsActionCreator(new FormFieldsRequestSender(createRequestSender()))
            );
            braintreeScriptLoader = new BraintreeScriptLoader(getScriptLoader());
            braintreeSDKCreator = new BraintreeSDKCreator(braintreeScriptLoader);
            formPoster = createFormPoster();

            (window as PaypalHostWindow).paypal = paypalSdkMock;

            strategy = new BraintreePaypalV1ButtonStrategy(
                store,
                checkoutActionCreator,
                braintreeSDKCreator,
                formPoster,
                false,
                window
            );

            paymentMethodMock = {
                ...getBraintree(),
                clientToken: 'myToken',
                initializationData: {
                    isBraintreeVenmoEnabled: true,
                },
            };

            buttonElement = document.createElement('div');
            buttonElement.id = defaultButtonContainerId;
            document.body.appendChild(buttonElement);

            messageElement = document.createElement('div');
            messageElement.id = defaultMessageContainerId;
            document.body.appendChild(messageElement);

            jest.spyOn(store, 'dispatch').mockReturnValue(Promise.resolve(store.getState()));
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue(paymentMethodMock);
            jest.spyOn(store.getState().config, 'getStoreConfigOrThrow').mockReturnValue(storeConfigMock);
            jest.spyOn(braintreeSDKCreator, 'getClient').mockReturnValue(paymentMethodMock.clientToken);
            jest.spyOn(braintreeSDKCreator, 'getDataCollector').mockReturnValue(dataCollector);
            jest.spyOn(braintreeScriptLoader, 'loadPaypalCheckout').mockReturnValue(braintreePaypalCheckoutCreatorMock);
            jest.spyOn(formPoster, 'postForm').mockImplementation(() => {});

            jest.spyOn(paypalSdkMock, 'Buttons')
                .mockImplementation((options: PaypalButtonOptions) => {
                    eventEmitter.on('createOrder', () => {
                        if (options.createOrder) {
                            options.createOrder().catch(() => {});
                        }
                    });

                    eventEmitter.on('approve', () => {
                        if (options.onApprove) {
                            options.onApprove({ payerId: 'PAYER_ID' }).catch(() => {});
                        }
                    });

                    return {
                        isEligible: jest.fn(() => false),
                        render: jest.fn(),
                    };
                });
        });

        afterEach(() => {
            jest.clearAllMocks();

            document.body.removeChild(buttonElement);
        });

        it('creates an instance of the braintree checkout button strategy', () => {
            expect(strategy).toBeInstanceOf(BraintreePaypalV1ButtonStrategy);
        });

        describe('#initialize()', () => {
            it('throws error if methodId is not provided', async () => {
                const options = { containerId: 'braintree-venmo-button-mock-id' } as CheckoutButtonInitializeOptions;

                try {
                    await strategy.initialize(options);
                } catch (error) {
                    expect(error).toBeInstanceOf(InvalidArgumentError);
                }
            });

            it('throws error if client token is missing', async () => {
                paymentMethodMock.clientToken = undefined;

                try {
                    await strategy.initialize(braintreePaypalInitializationOptions);
                } catch (error) {
                    expect(error).toBeInstanceOf(MissingDataError);
                }
            });

            it('throws an error if containerId is not provided', async () => {
                const { containerId, ...options } = braintreePaypalInitializationOptions;

                try {
                    await strategy.initialize(options as CheckoutButtonInitializeOptions);
                } catch (error) {
                    expect(error).toBeInstanceOf(InvalidArgumentError);
                }
            });

            it('initializes braintree sdk creator', async () => {
                braintreeSDKCreator.initialize = jest.fn();
                braintreeSDKCreator.getVenmoCheckout = jest.fn();

                await strategy.initialize(braintreePaypalInitializationOptions);

                expect(braintreeSDKCreator.initialize).toHaveBeenCalledWith(paymentMethodMock.clientToken);
            });

            it('initializes the braintree venmo checkout', async () => {
                braintreeSDKCreator.initialize = jest.fn();
                braintreeSDKCreator.getVenmoCheckout = jest.fn();

                await strategy.initialize(braintreePaypalInitializationOptions);

                expect(braintreeSDKCreator.initialize).toHaveBeenCalledWith(paymentMethodMock.clientToken);
                expect(braintreeSDKCreator.getVenmoCheckout).toHaveBeenCalled();
            });

            it('calls braintree venmo checkout create method', async () => {
                braintreeVenmoCheckoutCreatorMock = { create: jest.fn() };

                jest.spyOn(braintreeSDKCreator, 'getClient').mockReturnValue(paymentMethodMock.clientToken);
                jest.spyOn(braintreeScriptLoader, 'loadVenmoCheckout').mockReturnValue(braintreeVenmoCheckoutCreatorMock);

                await strategy.initialize(braintreePaypalInitializationOptions);

                expect(braintreeVenmoCheckoutCreatorMock.create).toHaveBeenCalled();
            });

            it('calls onError callback option if the error was caught on braintree venmo checkout creation', async () => {
                braintreeVenmoCheckoutMock = {
                    isBrowserSupported: jest.fn().mockReturnValue(true),
                    teardown: jest.fn(),
                    tokenize: jest.fn(),
                };

                braintreeVenmoCheckoutCreatorMock = {
                    create: jest.fn((_config, callback) => callback(new Error('test'), undefined)),
                };

                jest.spyOn(braintreeScriptLoader, 'loadVenmoCheckout').mockReturnValue(braintreeVenmoCheckoutCreatorMock);

                const onErrorCallback = jest.fn();

                const options = {
                    ...braintreePaypalInitializationOptions,
                    braintreepaypal: {
                        onError: onErrorCallback,
                    },
                };

                await strategy.initialize(options);
                expect(onErrorCallback).toHaveBeenCalled();
            });

            it('calls onError callback option if customer browser is not supported', async () => {
                braintreeVenmoCheckoutMock = {
                    isBrowserSupported: jest.fn().mockReturnValue(false),
                    teardown: jest.fn(),
                    tokenize: jest.fn(),
                };

                braintreeVenmoCheckoutCreatorMock = {
                    create: jest.fn((_config, callback) => callback(undefined, braintreeVenmoCheckoutMock)),
                };

                jest.spyOn(braintreeScriptLoader, 'loadVenmoCheckout').mockReturnValue(braintreeVenmoCheckoutCreatorMock);

                const onErrorCallback = jest.fn();

                const options = {
                    ...braintreePaypalInitializationOptions,
                    braintreepaypal: {
                        onError: onErrorCallback,
                    },
                };

                await strategy.initialize(options);
                expect(onErrorCallback).toHaveBeenCalled();
            });

            it('successfully renders braintree venmo button', async () => {
                braintreeVenmoCheckoutMock = {
                    isBrowserSupported: jest.fn().mockReturnValue(true),
                    teardown: jest.fn(),
                    tokenize: jest.fn(),
                };

                braintreeVenmoCheckoutCreatorMock = {
                    create: jest.fn((_config, callback) => callback(undefined, braintreeVenmoCheckoutMock)),
                };

                jest.spyOn(braintreeScriptLoader, 'loadVenmoCheckout').mockReturnValue(braintreeVenmoCheckoutCreatorMock);

                const options = braintreePaypalInitializationOptions;
                const venmoButton = document.getElementById(options.containerId);

                await strategy.initialize(options);

                expect(venmoButton).toBeInstanceOf(HTMLDivElement);
            });

            it('successfully tokenize braintreeVenmoCheckout on venmo button click', async () => {
                braintreeVenmoCheckoutMock = {
                    isBrowserSupported: jest.fn().mockReturnValue(true),
                    teardown: jest.fn(),
                    tokenize: jest.fn(),
                };

                braintreeVenmoCheckoutCreatorMock = {
                    create: jest.fn((_config, callback) => callback(undefined, braintreeVenmoCheckoutMock)),
                };

                jest.spyOn(braintreeScriptLoader, 'loadVenmoCheckout').mockReturnValue(braintreeVenmoCheckoutCreatorMock);

                const options = braintreePaypalInitializationOptions;

                await strategy.initialize(options);

                const venmoButtonParentContainer = document.getElementById(options.containerId);
                const venmoButton = venmoButtonParentContainer && venmoButtonParentContainer.firstChild as HTMLButtonElement;

                if (venmoButton) {
                    venmoButton.click();

                    expect(braintreeVenmoCheckoutMock.tokenize).toHaveBeenCalled();
                }
            });

            it('successfully sends data through formPoster on venmo button click', async () => {
                const tokenizationPayload = {
                    nonce: 'tokenization_nonce',
                    type: 'VenmoAccount',
                    details: {
                        email: 'test@test.com',
                        firstName: 'John',
                        lastName: 'Doe',
                        phone: '123456789',
                        billingAddress: billingAddressPayload,
                        shippingAddress: shippingAddressPayload,
                    },
                };

                braintreeVenmoCheckoutMock = {
                    isBrowserSupported: jest.fn().mockReturnValue(true),
                    teardown: jest.fn(),
                    tokenize: jest.fn(callback => callback(undefined, tokenizationPayload)),
                };

                braintreeVenmoCheckoutCreatorMock = {
                    create: jest.fn((_config, callback) => callback(undefined, braintreeVenmoCheckoutMock)),
                };

                jest.spyOn(braintreeScriptLoader, 'loadVenmoCheckout').mockReturnValue(braintreeVenmoCheckoutCreatorMock);

                const options = braintreePaypalInitializationOptions;

                await strategy.initialize(options);

                const venmoButtonParentContainer = document.getElementById(options.containerId);
                const venmoButton = venmoButtonParentContainer && venmoButtonParentContainer.firstChild as HTMLButtonElement;

                if (venmoButton) {
                    venmoButton.click();

                    expect(braintreeVenmoCheckoutMock.tokenize).toHaveBeenCalled();

                    await new Promise(resolve => process.nextTick(resolve));

                    expect(formPoster.postForm).toHaveBeenCalledWith('/checkout.php', {
                        action: 'set_external_checkout',
                        device_data: dataCollector.deviceData,
                        nonce: 'tokenization_nonce',
                        payment_type: 'paypal',
                        provider: 'braintreevenmo',
                        billing_address: JSON.stringify(expectedAddress),
                        shipping_address: JSON.stringify(expectedAddress),
                    });
                }
            });

            it('successfully sends data through formPoster on venmo button click with shipping data if billing data is not provided', async () => {
                const tokenizationPayload = {
                    nonce: 'tokenization_nonce',
                    type: 'VenmoAccount',
                    details: {
                        email: 'test@test.com',
                        firstName: 'John',
                        lastName: 'Doe',
                        phone: '123456789',
                        shippingAddress: shippingAddressPayload,
                    },
                };

                braintreeVenmoCheckoutMock = {
                    isBrowserSupported: jest.fn().mockReturnValue(true),
                    teardown: jest.fn(),
                    tokenize: jest.fn(callback => callback(undefined, tokenizationPayload)),
                };

                braintreeVenmoCheckoutCreatorMock = {
                    create: jest.fn((_config, callback) => callback(undefined, braintreeVenmoCheckoutMock)),
                };

                jest.spyOn(braintreeScriptLoader, 'loadVenmoCheckout').mockReturnValue(braintreeVenmoCheckoutCreatorMock);

                const options = braintreePaypalInitializationOptions;

                await strategy.initialize(options);

                const venmoButtonParentContainer = document.getElementById(options.containerId);
                const venmoButton = venmoButtonParentContainer && venmoButtonParentContainer.firstChild as HTMLButtonElement;

                if (venmoButton) {
                    venmoButton.click();

                    expect(braintreeVenmoCheckoutMock.tokenize).toHaveBeenCalled();

                    await new Promise(resolve => process.nextTick(resolve));

                    expect(formPoster.postForm).toHaveBeenCalledWith('/checkout.php', {
                        action: 'set_external_checkout',
                        device_data: dataCollector.deviceData,
                        nonce: 'tokenization_nonce',
                        payment_type: 'paypal',
                        provider: 'braintreevenmo',
                        billing_address: JSON.stringify(expectedAddress),
                        shipping_address: JSON.stringify(expectedAddress),
                    });
                }
            });
        });

        describe('#deinitialize()', () => {
            it('teardowns braintree sdk creator on strategy deinitialize', async () => {
                braintreeSDKCreator.initialize = jest.fn();
                braintreeSDKCreator.getVenmoCheckout = jest.fn();
                braintreeSDKCreator.teardown = jest.fn();

                await strategy.initialize(braintreePaypalInitializationOptions);
                await strategy.deinitialize();

                expect(braintreeSDKCreator.teardown).toHaveBeenCalled();
            });
        });
    });
});
