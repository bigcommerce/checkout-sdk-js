import { Action, createAction } from '@bigcommerce/data-store';
import { createFormPoster, FormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader, getScriptLoader } from '@bigcommerce/script-loader';
import { EventEmitter } from 'events';
import { Observable, of } from 'rxjs';

import {
    CheckoutActionCreator,
    CheckoutRequestSender,
    CheckoutStore,
    createCheckoutStore,
} from '../../../checkout';
import { getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { MutationObserverFactory } from '../../../common/dom';
import { InvalidArgumentError, MissingDataError } from '../../../common/error/errors';
import { ConfigActionCreator, ConfigRequestSender } from '../../../config';
import { FormFieldsActionCreator, FormFieldsRequestSender } from '../../../form';
import {
    PaymentMethod,
    PaymentMethodActionCreator,
    PaymentMethodActionType,
    PaymentStrategyType,
} from '../../../payment';
import { getBraintree } from '../../../payment/payment-methods.mock';
import {
    BraintreeDataCollector,
    BraintreePaypalCheckout,
    BraintreePaypalCheckoutCreator,
    BraintreeScriptLoader,
    BraintreeSDKCreator,
} from '../../../payment/strategies/braintree';
import {
    getDataCollectorMock,
    getPayPalCheckoutCreatorMock,
    getPaypalCheckoutMock,
} from '../../../payment/strategies/braintree/braintree.mock';
import {
    PaypalButtonOptions,
    PaypalHostWindow,
    PaypalSDK,
} from '../../../payment/strategies/paypal';
import { getPaypalMock } from '../../../payment/strategies/paypal/paypal.mock';
import {
    GoogleRecaptcha,
    GoogleRecaptchaScriptLoader,
    GoogleRecaptchaWindow,
    SpamProtectionActionCreator,
    SpamProtectionRequestSender,
} from '../../../spam-protection';
import CustomerActionCreator from '../../customer-action-creator';
import { CustomerInitializeOptions } from '../../customer-request-options';
import CustomerRequestSender from '../../customer-request-sender';

import BraintreePaypalCustomerInitializeOptions from './braintree-paypal-customer-options';
import BraintreePaypalCustomerStrategy from './braintree-paypal-customer-strategy';

describe('BraintreePaypalCustomerStrategy', () => {
    let braintreeSDKCreator: BraintreeSDKCreator;
    let braintreeScriptLoader: BraintreeScriptLoader;
    let braintreePaypalCheckoutCreatorMock: BraintreePaypalCheckoutCreator;
    let braintreePaypalCheckoutMock: BraintreePaypalCheckout;
    let checkoutActionCreator: CheckoutActionCreator;
    let dataCollector: BraintreeDataCollector;
    let eventEmitter: EventEmitter;
    let formPoster: FormPoster;
    let paymentMethodMock: PaymentMethod;
    let paypalButtonElement: HTMLDivElement;
    let paypalSdkMock: PaypalSDK;
    let store: CheckoutStore;
    let strategy: BraintreePaypalCustomerStrategy;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let customerActionCreator: CustomerActionCreator;
    let loadPaymentMethodAction: Observable<Action>;
    let googleRecaptcha: GoogleRecaptcha;
    let googleRecaptchaMockWindow: GoogleRecaptchaWindow;
    let googleRecaptchaScriptLoader: GoogleRecaptchaScriptLoader;

    const defaultButtonContainerId = 'braintree-paypal-button-mock-id';

    const braintreePaypalOptions: BraintreePaypalCustomerInitializeOptions = {
        container: defaultButtonContainerId,
        onError: jest.fn(),
    };

    const initializationOptions: CustomerInitializeOptions = {
        methodId: PaymentStrategyType.BRAINTREE_PAYPAL,
        container: defaultButtonContainerId,
        braintreepaypal: braintreePaypalOptions,
    };

    beforeEach(() => {
        braintreePaypalCheckoutMock = getPaypalCheckoutMock();
        braintreePaypalCheckoutCreatorMock = getPayPalCheckoutCreatorMock(
            braintreePaypalCheckoutMock,
            false,
        );
        dataCollector = getDataCollectorMock();
        paypalSdkMock = getPaypalMock();
        eventEmitter = new EventEmitter();
        paymentMethodMock = {
            ...getBraintree(),
            clientToken: 'myToken',
        };

        googleRecaptchaMockWindow = { grecaptcha: {} } as GoogleRecaptchaWindow;
        googleRecaptchaScriptLoader = new GoogleRecaptchaScriptLoader(
            createScriptLoader(),
            googleRecaptchaMockWindow,
        );
        googleRecaptcha = new GoogleRecaptcha(
            googleRecaptchaScriptLoader,
            new MutationObserverFactory(),
        );

        loadPaymentMethodAction = of(
            createAction(PaymentMethodActionType.LoadPaymentMethodSucceeded, paymentMethodMock, {
                methodId: paymentMethodMock.id,
            }),
        );

        store = createCheckoutStore(getCheckoutStoreState());
        checkoutActionCreator = new CheckoutActionCreator(
            new CheckoutRequestSender(createRequestSender()),
            new ConfigActionCreator(new ConfigRequestSender(createRequestSender())),
            new FormFieldsActionCreator(new FormFieldsRequestSender(createRequestSender())),
        );
        braintreeScriptLoader = new BraintreeScriptLoader(getScriptLoader());
        braintreeSDKCreator = new BraintreeSDKCreator(braintreeScriptLoader);
        formPoster = createFormPoster();
        customerActionCreator = new CustomerActionCreator(
            new CustomerRequestSender(createRequestSender()),
            checkoutActionCreator,
            new SpamProtectionActionCreator(
                googleRecaptcha,
                new SpamProtectionRequestSender(createRequestSender()),
            ),
        );
        paymentMethodActionCreator = {} as PaymentMethodActionCreator;
        paymentMethodActionCreator.loadPaymentMethod = jest.fn(() => loadPaymentMethodAction);

        (window as PaypalHostWindow).paypal = paypalSdkMock;

        strategy = new BraintreePaypalCustomerStrategy(
            store,
            checkoutActionCreator,
            customerActionCreator,
            paymentMethodActionCreator,
            braintreeSDKCreator,
            formPoster,
            window,
        );

        paypalButtonElement = document.createElement('div');
        paypalButtonElement.id = defaultButtonContainerId;
        document.body.appendChild(paypalButtonElement);

        jest.spyOn(store, 'dispatch').mockReturnValue(Promise.resolve(store.getState()));
        jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethodMock,
        );
        jest.spyOn(braintreeSDKCreator, 'getClient').mockReturnValue(paymentMethodMock.clientToken);
        jest.spyOn(braintreeSDKCreator, 'getDataCollector').mockReturnValue(dataCollector);
        jest.spyOn(braintreeScriptLoader, 'loadPaypalCheckout').mockReturnValue(
            braintreePaypalCheckoutCreatorMock,
        );
        jest.spyOn(formPoster, 'postForm').mockImplementation(() => {});
        jest.spyOn(checkoutActionCreator, 'loadDefaultCheckout').mockImplementation(() => {});

        jest.spyOn(paypalSdkMock, 'Buttons').mockImplementation((options: PaypalButtonOptions) => {
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

        jest.spyOn(paypalSdkMock, 'Messages').mockImplementation(() => ({
            render: jest.fn(),
        }));
    });

    afterEach(() => {
        jest.clearAllMocks();

        delete (window as PaypalHostWindow).paypal;

        if (document.getElementById(defaultButtonContainerId)) {
            document.body.removeChild(paypalButtonElement);
        }
    });

    it('creates an instance of the braintree paypal checkout button strategy', () => {
        expect(strategy).toBeInstanceOf(BraintreePaypalCustomerStrategy);
    });

    describe('#initialize()', () => {
        it('throws error if methodId is not provided', async () => {
            const options = {
                container: defaultButtonContainerId,
            } as CustomerInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws an error if containerId is not provided', async () => {
            const options = {
                methodId: PaymentStrategyType.BRAINTREE_PAYPAL,
            } as CustomerInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws an error if braintreepaypal is not provided', async () => {
            const options = {
                container: defaultButtonContainerId,
                methodId: PaymentStrategyType.BRAINTREE_PAYPAL,
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

        it('initializes braintree sdk creator', async () => {
            braintreeSDKCreator.initialize = jest.fn();
            braintreeSDKCreator.getPaypalCheckout = jest.fn();

            await strategy.initialize(initializationOptions);

            expect(braintreeSDKCreator.initialize).toHaveBeenCalledWith(
                paymentMethodMock.clientToken,
            );
        });

        it('initializes braintree paypal checkout', async () => {
            braintreeSDKCreator.initialize = jest.fn();
            braintreeSDKCreator.getPaypalCheckout = jest.fn();

            await strategy.initialize(initializationOptions);

            expect(braintreeSDKCreator.initialize).toHaveBeenCalledWith(
                paymentMethodMock.clientToken,
            );
            expect(braintreeSDKCreator.getPaypalCheckout).toHaveBeenCalled();
        });

        it('calls braintree paypal checkout create method', async () => {
            await strategy.initialize(initializationOptions);

            expect(braintreePaypalCheckoutCreatorMock.create).toHaveBeenCalled();
        });

        it('calls onError callback option if the error was caught on paypal checkout creation', async () => {
            braintreePaypalCheckoutCreatorMock = getPayPalCheckoutCreatorMock(undefined, true);

            jest.spyOn(braintreeScriptLoader, 'loadPaypalCheckout').mockReturnValue(
                braintreePaypalCheckoutCreatorMock,
            );

            await strategy.initialize(initializationOptions);

            expect(initializationOptions.braintreepaypal?.onError).toHaveBeenCalled();
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

            expect(checkoutActionCreator.loadDefaultCheckout).toHaveBeenCalledTimes(1);
        });

        it('sets up PayPal payment flow with no address when null is passed', async () => {
            jest.spyOn(store.getState().customer, 'getCustomer').mockReturnValue(undefined);

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
            braintreeSDKCreator.teardown = jest.fn();

            await strategy.initialize(initializationOptions);
            await strategy.deinitialize();

            expect(braintreeSDKCreator.teardown).toHaveBeenCalled();
        });
    });
});
