import { createFormPoster, FormPoster } from '@bigcommerce/form-poster';

import {
    BraintreeSdk,
    BraintreeVenmoCheckout,
    createBraintreeSdk,
    getBraintree,
    getVenmoCheckoutMock,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    BuyNowCartRequestBody,
    Cart,
    CartSource,
    CheckoutButtonInitializeOptions,
    InvalidArgumentError,
    MissingDataError,
    PaymentIntegrationService,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getCart,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BraintreeVenmoButtonStrategy from './braintree-venmo-button-strategy';

describe('BraintreeVenmoButtonStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;
    let braintreeVenmoCheckoutMock: BraintreeVenmoCheckout;
    let formPoster: FormPoster;
    let paymentMethodMock: PaymentMethod;
    let venmoButtonElement: HTMLDivElement;
    let strategy: BraintreeVenmoButtonStrategy;

    const defaultContainerId = 'braintree-venmo-button-mock-id';

    const buyNowCartMock: Cart = {
        ...getCart(),
        id: '999',
        source: CartSource.BuyNow,
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

    const getBraintreeVenmoButtonOptionsMock = () => ({
        methodId: 'braintreevenmo',
        containerId: defaultContainerId,
        braintreevenmo: {
            onError: jest.fn(),
        },
    });

    const getBuyNowBraintreeVenmoButtonOptionsMock = () => ({
        methodId: 'braintreevenmo',
        containerId: defaultContainerId,
        braintreevenmo: {
            onError: jest.fn(),
            currencyCode: 'USD',
            buyNowInitializeOptions: {
                getBuyNowCartRequestBody: jest.fn().mockReturnValue(buyNowCartRequestBody),
            },
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

    const braintreeSdk: BraintreeSdk = createBraintreeSdk();

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
        paymentIntegrationService = new PaymentIntegrationServiceMock();
        formPoster = createFormPoster();

        strategy = new BraintreeVenmoButtonStrategy(
            paymentIntegrationService,
            formPoster,
            braintreeSdk,
        );

        paymentMethodMock = {
            ...getBraintree(),
            clientToken: 'myToken',
            initializationData: {
                merchantAccountId: '100000',
            },
        };

        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethodMock,
        );
        jest.spyOn(braintreeSdk, 'getClient').mockReturnValue(
            Promise.resolve({ request: jest.fn() }),
        );
        jest.spyOn(paymentIntegrationService, 'createBuyNowCart').mockReturnValue(
            Promise.resolve(buyNowCartMock),
        );
        jest.spyOn(braintreeSdk, 'getVenmoCheckoutOrThrow').mockReturnValue(
            Promise.resolve(getVenmoCheckoutMock()),
        );
        jest.spyOn(formPoster, 'postForm').mockImplementation(() => {});
        jest.spyOn(braintreeSdk, 'getDataCollectorOrThrow').mockReturnValue({
            // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            deviceData: { device: 'something' },
        });

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
            const options = {
                containerId: 'braintree-venmo-button-mock-id',
            } as CheckoutButtonInitializeOptions;

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
            const options = {
                methodId: 'braintreevenmo',
            } as CheckoutButtonInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('initializes braintree sdk', async () => {
            const options = getBraintreeVenmoButtonOptionsMock();

            braintreeSdk.initialize = jest.fn();

            await strategy.initialize(options);

            expect(braintreeSdk.initialize).toHaveBeenCalledWith(
                paymentMethodMock.clientToken,
                paymentIntegrationService.getState().getStoreConfig(),
            );
        });

        it('initializes the braintree venmo checkout', async () => {
            const options = getBraintreeVenmoButtonOptionsMock();

            await strategy.initialize(options);

            expect(braintreeSdk.initialize).toHaveBeenCalledWith(
                paymentMethodMock.clientToken,
                paymentIntegrationService.getState().getStoreConfig(),
            );
            expect(braintreeSdk.getVenmoCheckoutOrThrow).toHaveBeenCalled();
        });

        it('successfully renders braintree venmo button', async () => {
            braintreeVenmoCheckoutMock = {
                isBrowserSupported: jest.fn().mockReturnValue(true),
                teardown: jest.fn(),
                tokenize: jest.fn(),
            };

            const options = getBraintreeVenmoButtonOptionsMock();
            const venmoButton = document.getElementById(options.containerId);

            await strategy.initialize(options);

            expect(venmoButton).toBeInstanceOf(HTMLDivElement);
        });

        it('successfully creates Buy Now cart on venmo button click', async () => {
            const options = getBuyNowBraintreeVenmoButtonOptionsMock();

            braintreeVenmoCheckoutMock = {
                isBrowserSupported: jest.fn().mockReturnValue(true),
                teardown: jest.fn(),
                tokenize: jest.fn(),
            };

            const venmoButton = document.getElementById(options.containerId);

            await strategy.initialize(options);

            if (venmoButton) {
                venmoButton.click();

                expect(paymentIntegrationService.createBuyNowCart).toHaveBeenCalled();
            }
        });

        it('successfully tokenize braintreeVenmoCheckout on venmo button click', async () => {
            braintreeVenmoCheckoutMock = {
                isBrowserSupported: jest.fn().mockReturnValue(true),
                teardown: jest.fn(),
                tokenize: jest.fn(),
            };

            jest.spyOn(braintreeSdk, 'getVenmoCheckoutOrThrow').mockReturnValue(
                Promise.resolve(braintreeVenmoCheckoutMock),
            );

            const options = getBraintreeVenmoButtonOptionsMock();
            const venmoButton = document.getElementById(options.containerId);

            await strategy.initialize(options);

            if (venmoButton) {
                venmoButton.click();

                await new Promise((resolve) => process.nextTick(resolve));

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
                // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                tokenize: jest.fn((callback) => callback(undefined, tokenizationPayload)),
            };

            jest.spyOn(braintreeSdk, 'getVenmoCheckoutOrThrow').mockReturnValue(
                Promise.resolve(braintreeVenmoCheckoutMock),
            );

            const options = getBraintreeVenmoButtonOptionsMock();
            const venmoButton = document.getElementById(options.containerId);

            await strategy.initialize(options);

            if (venmoButton) {
                venmoButton.click();

                await new Promise((resolve) => process.nextTick(resolve));

                expect(braintreeVenmoCheckoutMock.tokenize).toHaveBeenCalled();

                await new Promise((resolve) => process.nextTick(resolve));

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

        it('successfully sends data through formPoster on venmo button click with Buy Now cart id', async () => {
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
                // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                tokenize: jest.fn((callback) => callback(undefined, tokenizationPayload)),
            };

            jest.spyOn(braintreeSdk, 'getVenmoCheckoutOrThrow').mockReturnValue(
                Promise.resolve(braintreeVenmoCheckoutMock),
            );

            jest.spyOn(paymentIntegrationService, 'createBuyNowCart').mockReturnValue({
                // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                body: buyNowCartMock,
            });

            const options = getBuyNowBraintreeVenmoButtonOptionsMock();
            const venmoButton = document.getElementById(options.containerId);

            await strategy.initialize(options);

            if (venmoButton) {
                venmoButton.click();

                await new Promise((resolve) => process.nextTick(resolve));

                expect(braintreeVenmoCheckoutMock.tokenize).toHaveBeenCalled();

                await new Promise((resolve) => process.nextTick(resolve));

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
                // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                tokenize: jest.fn((callback) => callback(undefined, tokenizationPayload)),
            };

            jest.spyOn(braintreeSdk, 'getVenmoCheckoutOrThrow').mockReturnValue(
                Promise.resolve(braintreeVenmoCheckoutMock),
            );

            const options = getBraintreeVenmoButtonOptionsMock();
            const venmoButton = document.getElementById(options.containerId);

            await strategy.initialize(options);

            if (venmoButton) {
                venmoButton.click();

                await new Promise((resolve) => process.nextTick(resolve));

                expect(braintreeVenmoCheckoutMock.tokenize).toHaveBeenCalled();

                await new Promise((resolve) => process.nextTick(resolve));

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
        it('deinitialize braintree sdk on strategy deinitialize', async () => {
            const options = getBraintreeVenmoButtonOptionsMock();

            braintreeSdk.initialize = jest.fn();
            braintreeSdk.deinitialize = jest.fn();

            await strategy.initialize(options);
            await strategy.deinitialize();

            expect(braintreeSdk.deinitialize).toHaveBeenCalled();
        });
    });
});
