import { createFormPoster, FormPoster } from '@bigcommerce/form-poster';
import { ScriptLoader } from '@bigcommerce/script-loader';
import { EventEmitter } from 'events';

import {
    CheckoutButtonInitializeOptions,
    InvalidArgumentError,
    PaymentIntegrationService,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getCart,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import { getPaypalExpress, getPaypalExpressMock } from './mocks/paypal-express-mock';
import {
    PaypalExpressButtonInitializeOptions,
    WithPaypalExpressButtonInitializeOptions,
} from './paypal-express-button-initialize-options';
import {
    PaypalActions,
    PaypalButtonOptions,
    PaypalButtonStyleColorOption,
    PaypalButtonStyleShapeOption,
    PaypalButtonStyleSizeOption,
    PaypalExpressTypes,
} from './paypal-express-types';

import { PaypalExpressButtonStrategy, PaypalExpressScriptLoader } from './index';

describe('PaypalExpressButtonStrategy', () => {
    let actionsMock: PaypalActions;
    let eventEmitter: EventEmitter;
    let formPoster: FormPoster;
    let options: CheckoutButtonInitializeOptions & WithPaypalExpressButtonInitializeOptions;
    let paypalOptions: PaypalExpressButtonInitializeOptions;
    let paymentIntegrationService: PaymentIntegrationService;
    let paypal: PaypalExpressTypes;
    let paypalExpressScriptLoader: PaypalExpressScriptLoader;
    let strategy: PaypalExpressButtonStrategy;
    let paymentMethod: PaymentMethod;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
        paypalExpressScriptLoader = new PaypalExpressScriptLoader(new ScriptLoader());
        formPoster = createFormPoster();
        paymentMethod = getPaypalExpress();

        paypalOptions = {
            shouldProcessPayment: false,
            clientId: 'abc',
            onAuthorizeError: jest.fn(),
            onPaymentError: jest.fn(),
        };

        options = {
            containerId: 'checkout-button',
            methodId: 'paypalexpress',
            paypal: paypalOptions,
        };

        eventEmitter = new EventEmitter();
        paypal = getPaypalExpressMock();

        actionsMock = {
            payment: {
                get: jest.fn().mockReturnValue(
                    Promise.resolve({
                        payer: {
                            payer_info: 'PAYER_INFO',
                        },
                    }),
                ),
            },
            request: {
                post: jest.fn().mockReturnValue(Promise.resolve()),
            },
        };

        jest.spyOn(paypal.Button, 'render').mockImplementation((options: PaypalButtonOptions) => {
            eventEmitter.on('payment', () => {
                if (options.payment) {
                    options
                        .payment(
                            {
                                payerId: 'PAYER_ID',
                                paymentID: 'PAYMENT_ID',
                                payerID: 'PAYER_ID',
                            },
                            actionsMock,
                        )
                        .catch(() => {});
                }
            });

            eventEmitter.on('authorize', () => {
                if (options.onAuthorize) {
                    options
                        .onAuthorize(
                            {
                                payerId: 'PAYER_ID',
                                paymentID: 'PAYMENT_ID',
                                payerID: 'PAYER_ID',
                            },
                            actionsMock,
                        )
                        .catch(() => {});
                }
            });
        });

        jest.spyOn(paypalExpressScriptLoader, 'loadPaypalSDK').mockReturnValue(
            Promise.resolve(paypal),
        );

        jest.spyOn(formPoster, 'postForm').mockImplementation(() => {});

        strategy = new PaypalExpressButtonStrategy(
            paymentIntegrationService,
            paypalExpressScriptLoader,
            formPoster,
        );
    });

    it('throws error if paypal options is not loaded', async () => {
        try {
            strategy = new PaypalExpressButtonStrategy(
                paymentIntegrationService,
                paypalExpressScriptLoader,
                formPoster,
            );

            options = {
                containerId: 'checkout-button',
                methodId: 'paypalexpress',
            } as CheckoutButtonInitializeOptions & WithPaypalExpressButtonInitializeOptions;

            await strategy.initialize(options);
        } catch (error) {
            expect(error).toBeInstanceOf(InvalidArgumentError);
        }
    });

    it('initializes Paypal and PayPal JS clients', async () => {
        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethod,
        );
        await strategy.initialize(options);

        expect(paypalExpressScriptLoader.loadPaypalSDK).toHaveBeenCalled();
    });

    it('throws error if unable to initialize Paypal or PayPal JS client', async () => {
        const expectedError = new Error('Unable to load JS client');

        jest.spyOn(paypalExpressScriptLoader, 'loadPaypalSDK').mockReturnValue(
            Promise.reject(expectedError),
        );

        try {
            await strategy.initialize(options);
        } catch (error) {
            expect(error).toEqual(expectedError);
        }
    });

    it('renders PayPal checkout button', async () => {
        await strategy.initialize(options);

        expect(paypal.Button.render).toHaveBeenCalledWith(
            {
                env: 'production',
                client: {
                    production: 'abc',
                },
                commit: false,
                onAuthorize: expect.any(Function),
                payment: expect.any(Function),
                style: {
                    shape: 'rect',
                },
                funding: {
                    allowed: [],
                    disallowed: [paypal.FUNDING.CREDIT],
                },
            },
            'checkout-button',
        );
    });

    it('customizes style of PayPal checkout button', async () => {
        options = {
            ...options,
            paypal: {
                ...paypalOptions,
                style: {
                    color: PaypalButtonStyleColorOption.BLUE,
                    shape: PaypalButtonStyleShapeOption.PILL,
                    size: PaypalButtonStyleSizeOption.RESPONSIVE,
                },
            },
        };

        await strategy.initialize(options);

        expect(paypal.Button.render).toHaveBeenCalledWith(
            expect.objectContaining({
                style: {
                    color: 'blue',
                    shape: 'pill',
                    size: 'responsive',
                },
            }),
            'checkout-button',
        );
    });

    it('throws error if unable to render PayPal button', async () => {
        const expectedError = new Error('Unable to render PayPal button');

        jest.spyOn(paypal.Button, 'render').mockImplementation(() => {
            throw expectedError;
        });

        try {
            await strategy.initialize(options);
        } catch (error) {
            expect(error).toEqual(expectedError);
        }
    });

    it('posts payment details to server to set checkout data when PayPal payment details are tokenized', async () => {
        await strategy.initialize(options);

        eventEmitter.emit('authorize');

        await new Promise((resolve) => process.nextTick(resolve));

        expect(formPoster.postForm).toHaveBeenCalledWith(
            '/checkout.php',
            expect.objectContaining({
                payment_type: 'paypal',
                provider: 'paypalexpress',
                action: 'set_external_checkout',
                paymentId: 'PAYMENT_ID',
                payerId: 'PAYER_ID',
                payerInfo: JSON.stringify('PAYER_INFO'),
            }),
        );
    });

    describe('if PayPal Credit is offered', () => {
        beforeEach(() => {
            options = {
                ...options,
                paypal: {
                    ...paypalOptions,
                    allowCredit: true,
                },
            };
        });

        it('renders PayPal Credit checkout button', async () => {
            await strategy.initialize(options);

            expect(paypal.Button.render).toHaveBeenCalledWith(
                {
                    client: {
                        production: 'abc',
                    },
                    commit: false,
                    env: 'production',
                    onAuthorize: expect.any(Function),
                    payment: expect.any(Function),
                    style: {
                        shape: 'rect',
                    },
                    funding: {
                        allowed: [paypal.FUNDING.CREDIT],
                        disallowed: [],
                    },
                },
                'checkout-button',
            );
        });
    });

    it('sends create payment requests to the relative url by default', async () => {
        jest.spyOn(paymentIntegrationService, 'loadDefaultCheckout').mockReturnValue(
            paymentIntegrationService.getState(),
        );
        jest.spyOn(paymentIntegrationService.getState(), 'getCartOrThrow').mockReturnValue(
            getCart(),
        );
        jest.spyOn(paymentIntegrationService.getState(), 'getHost').mockReturnValue('');
        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethod,
        );
        await strategy.initialize(options);

        eventEmitter.emit('payment');

        await new Promise((resolve) => process.nextTick(resolve));

        const expectedBody = {
            cartId: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
            merchantId: 'h3hxn44tdd8wxkzd',
        };

        expect(actionsMock.request.post).toHaveBeenCalledWith(
            '/api/storefront/payment/paypalexpress',
            expectedBody,
            expect.any(Object),
        );
    });

    describe('with a supplied host', () => {
        beforeEach(() => {
            strategy = new PaypalExpressButtonStrategy(
                paymentIntegrationService,
                paypalExpressScriptLoader,
                formPoster,
            );
        });

        it('sends create payment requests to the supplied host', async () => {
            jest.spyOn(paymentIntegrationService, 'loadDefaultCheckout').mockReturnValue(
                paymentIntegrationService.getState(),
            );
            jest.spyOn(paymentIntegrationService.getState(), 'getCartOrThrow').mockReturnValue(
                getCart(),
            );
            jest.spyOn(paymentIntegrationService.getState(), 'getHost').mockReturnValue(
                'https://example.com',
            );
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(paymentMethod);
            await strategy.initialize(options);

            eventEmitter.emit('payment');

            await new Promise((resolve) => process.nextTick(resolve));

            const expectedBody = {
                cartId: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
                merchantId: 'h3hxn44tdd8wxkzd',
            };

            expect(actionsMock.request.post).toHaveBeenCalledWith(
                'https://example.com/api/storefront/payment/paypalexpress',
                expectedBody,
                expect.any(Object),
            );
        });
    });
});
