import { createFormPoster, FormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';

import { createCheckoutStore, CheckoutStore } from '../../../checkout';
import { getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { InvalidArgumentError, MissingDataError } from '../../../common/error/errors';
import { PaymentMethod, PaymentMethodActionCreator, PaymentMethodRequestSender } from '../../../payment';
import { getBraintree } from '../../../payment/payment-methods.mock';
import { BraintreeScriptLoader, BraintreeSDKCreator, BraintreeVenmoCheckout, BraintreeVenmoCheckoutCreator } from '../../../payment/strategies/braintree';
import { CheckoutButtonInitializeOptions } from '../../checkout-button-options';
import CheckoutButtonMethodType from '../checkout-button-method-type';

import BraintreeVenmoButtonStrategy from './braintree-venmo-button-strategy';

describe('BraintreeVenmoButtonStrategy', () => {
    let braintreeSDKCreator: BraintreeSDKCreator;
    let braintreeScriptLoader: BraintreeScriptLoader;
    let braintreeVenmoCheckoutMock: BraintreeVenmoCheckout;
    let braintreeVenmoCheckoutCreatorMock: BraintreeVenmoCheckoutCreator;
    let formPoster: FormPoster;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let paymentMethodMock: PaymentMethod;
    let venmoButtonElement: HTMLDivElement;
    let store: CheckoutStore;
    let strategy: BraintreeVenmoButtonStrategy;

    const defaultContainerId = 'braintree-venmo-button-mock-id';

    const getBraintreeVenmoButtonOptionsMock = () => ({
        methodId: CheckoutButtonMethodType.BRAINTREE_VENMO,
        containerId: defaultContainerId,
        braintreevenmo: {
            onError: jest.fn(),
        },
    });

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
        store = createCheckoutStore(getCheckoutStoreState());
        paymentMethodActionCreator = new PaymentMethodActionCreator(new PaymentMethodRequestSender(createRequestSender()));
        braintreeScriptLoader = new BraintreeScriptLoader(getScriptLoader());
        braintreeSDKCreator = new BraintreeSDKCreator(braintreeScriptLoader);
        formPoster = createFormPoster();

        strategy = new BraintreeVenmoButtonStrategy(
            store,
            paymentMethodActionCreator,
            braintreeSDKCreator,
            formPoster
        );

        paymentMethodMock = {
            ...getBraintree(),
            clientToken: 'myToken',
            initializationData: {
                merchantAccountId: '100000',
            },
        };

        jest.spyOn(store, 'dispatch').mockReturnValue(Promise.resolve(store.getState()));
        jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue(paymentMethodMock);
        jest.spyOn(braintreeSDKCreator, 'getClient').mockReturnValue(paymentMethodMock.clientToken);
        jest.spyOn(braintreeSDKCreator, 'getDataCollector').mockReturnValue({ deviceData: { device: 'something' } });
        jest.spyOn(formPoster, 'postForm').mockImplementation(() => {});

        venmoButtonElement = document.createElement('div');
        venmoButtonElement.id = defaultContainerId;
        document.body.appendChild(venmoButtonElement);
    });

    afterEach(() => {
        jest.clearAllMocks();

        if (document.getElementById(defaultContainerId)) {
            document.body.removeChild(venmoButtonElement);
        }
    });

    it('creates an instance of the braintree venmo checkout button strategy', () => {
        expect(strategy).toBeInstanceOf(BraintreeVenmoButtonStrategy);
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
            const options = getBraintreeVenmoButtonOptionsMock();

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });

        it('throws an error if containerId is not provided', async () => {
            const options = { methodId: CheckoutButtonMethodType.BRAINTREE_VENMO } as CheckoutButtonInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('initializes braintree sdk creator', async () => {
            const options = getBraintreeVenmoButtonOptionsMock();

            braintreeSDKCreator.initialize = jest.fn();
            braintreeSDKCreator.getVenmoCheckout = jest.fn();

            await strategy.initialize(options);

            expect(braintreeSDKCreator.initialize).toHaveBeenCalledWith(paymentMethodMock.clientToken);
        });

        it('initializes the braintree venmo checkout', async () => {
            const options = getBraintreeVenmoButtonOptionsMock();

            braintreeSDKCreator.initialize = jest.fn();
            braintreeSDKCreator.getVenmoCheckout = jest.fn();

            await strategy.initialize(options);

            expect(braintreeSDKCreator.initialize).toHaveBeenCalledWith(paymentMethodMock.clientToken);
            expect(braintreeSDKCreator.getVenmoCheckout).toHaveBeenCalled();
        });

        it('calls braintree venmo checkout create method', async () => {
            braintreeVenmoCheckoutCreatorMock = { create: jest.fn() };

            jest.spyOn(braintreeSDKCreator, 'getClient').mockReturnValue(paymentMethodMock.clientToken);
            jest.spyOn(braintreeScriptLoader, 'loadVenmoCheckout').mockReturnValue(braintreeVenmoCheckoutCreatorMock);

            const options = getBraintreeVenmoButtonOptionsMock();

            await strategy.initialize(options);

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
                ...getBraintreeVenmoButtonOptionsMock(),
                braintreevenmo: {
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
                ...getBraintreeVenmoButtonOptionsMock(),
                braintreevenmo: {
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

            const options = getBraintreeVenmoButtonOptionsMock();
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

            const options = getBraintreeVenmoButtonOptionsMock();
            const venmoButton = document.getElementById(options.containerId);

            await strategy.initialize(options);

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

            const options = getBraintreeVenmoButtonOptionsMock();
            const venmoButton = document.getElementById(options.containerId);

            await strategy.initialize(options);

            if (venmoButton) {
                venmoButton.click();

                expect(braintreeVenmoCheckoutMock.tokenize).toHaveBeenCalled();

                await new Promise(resolve => process.nextTick(resolve));

                expect(formPoster.postForm).toHaveBeenCalledWith('/checkout.php', {
                    action: 'set_external_checkout',
                    device_data: { device: 'something' },
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

            const options = getBraintreeVenmoButtonOptionsMock();
            const venmoButton = document.getElementById(options.containerId);

            await strategy.initialize(options);

            if (venmoButton) {
                venmoButton.click();

                expect(braintreeVenmoCheckoutMock.tokenize).toHaveBeenCalled();

                await new Promise(resolve => process.nextTick(resolve));

                expect(formPoster.postForm).toHaveBeenCalledWith('/checkout.php', {
                    action: 'set_external_checkout',
                    device_data: {
                        device: 'something',
                    },
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
            const options = getBraintreeVenmoButtonOptionsMock();

            braintreeSDKCreator.initialize = jest.fn();
            braintreeSDKCreator.getVenmoCheckout = jest.fn();
            braintreeSDKCreator.teardown = jest.fn();

            await strategy.initialize(options);
            await strategy.deinitialize();

            expect(braintreeSDKCreator.teardown).toHaveBeenCalled();
        });
    });
});
