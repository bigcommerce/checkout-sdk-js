import { createAction } from '@bigcommerce/data-store';
import { createFormPoster, FormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';
import { EventEmitter } from 'events';
import { merge } from 'lodash';
import { from } from 'rxjs';

import { createCheckoutStore, CheckoutActionCreator, CheckoutActionType, CheckoutRequestSender, CheckoutStore } from '../../../checkout';
import { getCheckout, getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { MissingDataError } from '../../../common/error/errors';
import { ConfigActionCreator, ConfigRequestSender } from '../../../config';
import { FormFieldsActionCreator, FormFieldsRequestSender } from '../../../form';
import { getBraintreePaypal } from '../../../payment/payment-methods.mock';
import { BraintreeDataCollector, BraintreePaypalCheckout, BraintreeScriptLoader, BraintreeSDKCreator, VenmoInstance } from '../../../payment/strategies/braintree';
import { getDataCollectorMock, getPaypalCheckoutMock, getVenmoCheckoutMock } from '../../../payment/strategies/braintree/braintree.mock';
import { PaypalButtonOptions,
    PaypalHostWindow,
    PaypalScriptLoader,
    PaypalSDK } from '../../../payment/strategies/paypal';
import { getPaypalMock } from '../../../payment/strategies/paypal/paypal.mock';
import { getShippingAddress } from '../../../shipping/shipping-addresses.mock';
import { CheckoutButtonInitializeOptions } from '../../checkout-button-options';
import CheckoutButtonMethodType from '../checkout-button-method-type';

import { BraintreePaypalButtonInitializeOptions } from './braintree-paypal-button-options';
import BraintreePaypalButtonStrategy from './braintree-paypal-button-strategy';

describe('BraintreePaypalButtonStrategy', () => {
    let braintreeSDKCreator: BraintreeSDKCreator;
    let checkoutActionCreator: CheckoutActionCreator;
    let dataCollector: BraintreeDataCollector;
    let eventEmitter: EventEmitter;
    let formPoster: FormPoster;
    let options: CheckoutButtonInitializeOptions;
    let paypalOptions: BraintreePaypalButtonInitializeOptions;
    let paypal: PaypalSDK;
    let paypalCheckout: BraintreePaypalCheckout;
    let venmoCheckout: VenmoInstance;
    let paypalScriptLoader: PaypalScriptLoader;
    let store: CheckoutStore;
    let strategy: BraintreePaypalButtonStrategy;

    beforeEach(() => {
        store = createCheckoutStore(getCheckoutStoreState());
        checkoutActionCreator = new CheckoutActionCreator(
            new CheckoutRequestSender(createRequestSender()),
            new ConfigActionCreator(new ConfigRequestSender(createRequestSender())),
            new FormFieldsActionCreator(new FormFieldsRequestSender(createRequestSender()))
        );
        braintreeSDKCreator = new BraintreeSDKCreator(new BraintreeScriptLoader(getScriptLoader()));
        formPoster = createFormPoster();
        paypalScriptLoader = new PaypalScriptLoader(getScriptLoader());

        paypalOptions = {
            onAuthorizeError: jest.fn(),
            onPaymentError: jest.fn(),
            style: {
                height: 45,
            },
        };

        options = {
            methodId: CheckoutButtonMethodType.BRAINTREE_PAYPAL,
            containerId: 'checkout-button',
            braintreepaypal: paypalOptions,
        };

        eventEmitter = new EventEmitter();
        dataCollector = getDataCollectorMock();
        paypal = getPaypalMock();
        paypalCheckout = getPaypalCheckoutMock();
        venmoCheckout = getVenmoCheckoutMock();

        jest.spyOn(paypal.Button, 'render')
            .mockImplementation((options: PaypalButtonOptions) => {
                eventEmitter.on('payment', () => {
                    if (options.createOrder) {
                        options.createOrder().catch(() => {
                        });
                    }
                });

                eventEmitter.on('approve', () => {
                    if (options.onApprove) {
                        options.onApprove({ payerId: 'PAYER_ID' }).catch(() => {
                        });
                    }
                });
            });

        jest.spyOn(paypal, 'Buttons')
            .mockImplementation((options: PaypalButtonOptions) => {
                eventEmitter.on('createOrder', () => {
                    if (options.createOrder) {
                        options.createOrder().catch(() => {
                        });
                    }
                });

                eventEmitter.on('approve', () => {
                    if (options.onApprove) {
                       options.onApprove({ payerId: 'PAYER_ID' }).catch(() => {
                        });
                    }
                });

                return {
                    render: jest.fn(),
                    isEligible: jest.fn(),
                };
            });

        jest.spyOn(checkoutActionCreator, 'loadDefaultCheckout')
            .mockReturnValue(() => from([
                createAction(CheckoutActionType.LoadCheckoutRequested),
                createAction(CheckoutActionType.LoadCheckoutSucceeded, getCheckout()),
            ]));

        jest.spyOn(braintreeSDKCreator, 'getPaypalCheckout')
            /* eslint-disable no-empty-pattern */
            .mockImplementation(({}, callback) => {
                callback(paypalCheckout);

                return Promise.resolve(paypalCheckout);
            });

        jest.spyOn(braintreeSDKCreator, 'getVenmoCheckout').mockReturnValue(Promise.resolve(venmoCheckout));

        jest.spyOn(braintreeSDKCreator, 'getDataCollector')
            .mockReturnValue(Promise.resolve(dataCollector));

        jest.spyOn(paypalScriptLoader, 'loadPaypal')
            .mockReturnValue(Promise.resolve(paypal));

        jest.spyOn(braintreeSDKCreator, 'getPaypal')
            .mockReturnValue(Promise.resolve(paypal));

        jest.spyOn(formPoster, 'postForm')
            .mockImplementation(() => {});

        (window as PaypalHostWindow).paypal = paypal;

        strategy = new BraintreePaypalButtonStrategy(
            store,
            checkoutActionCreator,
            braintreeSDKCreator,
            formPoster,
            undefined,
            window
        );
    });

    afterEach(() => {
        delete (window as PaypalHostWindow).paypal;
    });

    it('throws error if required data is not loaded', async () => {
        try {
            store = createCheckoutStore();
            strategy = new BraintreePaypalButtonStrategy(
                store,
                checkoutActionCreator,
                braintreeSDKCreator,
                formPoster,
                undefined,
                window
            );

            await strategy.initialize(options);
        } catch (error) {
            expect(error).toBeInstanceOf(MissingDataError);
        }
    });

    it('initializes Braintree and PayPal JS clients', async () => {
        await strategy.initialize(options);

        expect(braintreeSDKCreator.getPaypalCheckout).toHaveBeenCalled();
        expect(braintreeSDKCreator.getVenmoCheckout).toHaveBeenCalled();
        expect(braintreeSDKCreator.getPaypal).toHaveBeenCalled();
    });

    it('throws error if unable to initialize Braintree or PayPal JS client', async () => {
        const expectedError = new Error('Unable to load JS client');

        jest.spyOn(braintreeSDKCreator, 'getPaypal')
            .mockReturnValue(Promise.reject(expectedError));

        try {
            await strategy.initialize(options);
        } catch (error) {
            expect(error).toEqual(expectedError);
        }
    });

    it('renders PayPal checkout button', async () => {
        await strategy.initialize(options);

        expect(paypal.Buttons).toHaveBeenCalledWith({
            commit: false,
            env: 'production',
            onApprove: expect.any(Function),
            createOrder: expect.any(Function),
            style: {
                label: undefined,
                shape: 'rect',
                height: 45,
            },
            fundingSource: paypal.FUNDING.PAYPAL,
        });
    });

    it('customizes style of PayPal checkout button', async () => {
        options = {
            ...options,
            braintreepaypal: {
                ...paypalOptions,
                style: {
                    color: 'blue',
                    shape: 'pill',
                    size: 'responsive',
                    layout: 'horizontal',
                    label: 'paypal',
                    tagline: true,
                    fundingicons: false,
                    height: 45,
                },
            },
        };

        await strategy.initialize(options);

        expect(paypal.Buttons).toHaveBeenCalledWith(expect.objectContaining({
            style: {
                color: 'blue',
                shape: 'pill',
                size: 'responsive',
                layout: 'horizontal',
                label: 'paypal',
                tagline: true,
                fundingicons: false,
                height: 45,
            },
        }));
    });

    it('throws error if unable to render PayPal button', async () => {
        const expectedError = new Error('Unable to render PayPal button');
        jest.spyOn(paypal, 'Buttons')
            .mockImplementation(() => {
                throw expectedError;
            });

        try {
            await strategy.initialize(options);
        } catch (error) {
            expect(error).toEqual(expectedError);
        }
    });

    it('renders PayPal checkout button in sandbox environment if payment method is in test mode', async () => {
        store = createCheckoutStore(merge({}, getCheckoutStoreState(), {
            paymentMethods: {
                data: [
                    merge({}, getBraintreePaypal(), { config: { testMode: true } }),
                ],
            },
        }));

        strategy = new BraintreePaypalButtonStrategy(
            store,
            checkoutActionCreator,
            braintreeSDKCreator,
            formPoster,
            undefined,
            window
        );

        await strategy.initialize(options);

        expect(paypal.Buttons)
            .toHaveBeenCalledWith(expect.objectContaining({ env: 'sandbox' }));
    });

    it('loads checkout details when customer is ready to pay', async () => {
        jest.spyOn(store, 'dispatch');

        await strategy.initialize(options);

        eventEmitter.emit('createOrder');

        await new Promise(resolve => process.nextTick(resolve));

        expect(checkoutActionCreator.loadDefaultCheckout).toHaveBeenCalled();
        expect(store.dispatch).toHaveBeenCalledWith(checkoutActionCreator.loadDefaultCheckout());
    });

    it('sets up PayPal payment flow with provided address', async () => {
        await strategy.initialize({
            ...options,
            braintreepaypal: {
                ...options.braintreepaypal,
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

        await new Promise(resolve => process.nextTick(resolve));

        expect(paypalCheckout.createPayment).toHaveBeenCalledWith(expect.objectContaining({
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
        await strategy.initialize({
            ...options,
            braintreepaypal: {
                ...options.braintreepaypal,
                shippingAddress: null,
            },
        });

        eventEmitter.emit('createOrder');

        await new Promise(resolve => process.nextTick(resolve));

        expect(paypalCheckout.createPayment).toHaveBeenCalledWith(expect.objectContaining({
            shippingAddressOverride: undefined,
        }));
    });

    it('sets up PayPal payment flow with current checkout details when customer is ready to pay', async () => {
        await strategy.initialize(options);

        eventEmitter.emit('createOrder');

        await new Promise(resolve => process.nextTick(resolve));

        expect(paypalCheckout.createPayment).toHaveBeenCalledWith({
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

    it('tokenizes PayPal payment details when authorization event is triggered', async () => {
        await strategy.initialize(options);

        eventEmitter.emit('approve');

        expect(paypalCheckout.tokenizePayment).toHaveBeenCalledWith({ payerId: 'PAYER_ID' });
    });

    it('posts payment details to server to set checkout data when PayPal payment details are tokenized', async () => {
        await strategy.initialize(options);

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
        options = {
            ...options,
            braintreepaypal: {
                ...paypalOptions,
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

    it('triggers error callback if unable to set up payment flow', async () => {
        const expectedError = new Error('Unable to set up payment flow');

        jest.spyOn(paypalCheckout, 'createPayment')
            .mockReturnValue(Promise.reject(expectedError));

        await strategy.initialize(options);

        eventEmitter.emit('createOrder');

        await new Promise(resolve => process.nextTick(resolve));

        expect(paypalOptions.onPaymentError).toHaveBeenCalledWith(expectedError);
    });

    it('triggers error callback if unable to tokenize payment', async () => {
        const expectedError = new Error('Unable to tokenize');

        jest.spyOn(paypalCheckout, 'tokenizePayment')
            .mockReturnValue(Promise.reject(expectedError));

        await strategy.initialize(options);

        eventEmitter.emit('approve');

        await new Promise(resolve => process.nextTick(resolve));

        expect(paypalOptions.onAuthorizeError).toHaveBeenCalledWith(expectedError);
    });

    it('tears down Braintree setup when button is deinitialized', async () => {
        jest.spyOn(braintreeSDKCreator, 'teardown');

        await strategy.initialize(options);
        await strategy.deinitialize();

        expect(braintreeSDKCreator.teardown).toHaveBeenCalled();
    });

    describe('if PayPal Credit is offered', () => {
        beforeEach(() => {
            options = {
                methodId: CheckoutButtonMethodType.BRAINTREE_PAYPAL_CREDIT,
                containerId: 'checkout-button',
                braintreepaypalcredit: {
                    allowCredit: true,
                    style: {
                        label: 'credit',
                        height: 45,
                    },
                },
            };

            strategy = new BraintreePaypalButtonStrategy(
                store,
                checkoutActionCreator,
                braintreeSDKCreator,
                formPoster,
                true,
                window
            );
        });

        it('renders PayPal Credit checkout button', async () => {
            await strategy.initialize(options);

            expect(paypal.Buttons).toHaveBeenCalledWith({
                commit: false,
                env: 'production',
                onApprove: expect.any(Function),
                createOrder: expect.any(Function),
                style: {
                    label: 'credit',
                    shape: 'rect',
                    height: 45,
                },
                fundingSource: paypal.FUNDING.PAYPAL,
            });
        });

        it('sets up PayPal Credit payment flow with current checkout details when customer is ready to pay', async () => {
            await strategy.initialize(options);

            eventEmitter.emit('createOrder');

            await new Promise(resolve => process.nextTick(resolve));

            expect(paypalCheckout.createPayment).toHaveBeenCalledWith({
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
    });
});
