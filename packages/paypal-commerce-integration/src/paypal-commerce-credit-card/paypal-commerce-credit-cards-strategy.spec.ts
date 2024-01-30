import { EventEmitter } from 'events';

import {
    Cart,
    HostedFieldType,
    InvalidArgumentError,
    NotInitializedError,
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentInvalidFormError,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getCart,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';
import {
    createPayPalCommerceAcceleratedCheckoutUtils,
    createPayPalCommerceSdk,
    getPayPalAxoSdk,
    PayPalAxoSdk,
    PayPalCommerceAcceleratedCheckoutUtils,
    PayPalCommerceSdk,
} from '@bigcommerce/checkout-sdk/paypal-commerce-utils';

import {
    getPayPalCommerceIntegrationServiceMock,
    getPayPalCommercePaymentMethod,
    getPayPalSDKMock,
} from '../mocks';
import PayPalCommerceIntegrationService from '../paypal-commerce-integration-service';
import {
    PayPalCommerceCardFieldsConfig,
    PayPalCommerceHostWindow,
    PayPalSDK,
} from '../paypal-commerce-types';

import PayPalCommerceCreditCardsPaymentInitializeOptions from './paypal-commerce-credit-cards-payment-initialize-options';
import PayPalCommerceCreditCardsPaymentStrategy from './paypal-commerce-credit-cards-payment-strategy';

describe('PayPalCommerceCreditCardsPaymentStrategy', () => {
    let cart: Cart;
    let strategy: PayPalCommerceCreditCardsPaymentStrategy;
    let paymentIntegrationService: PaymentIntegrationService;
    let paymentMethod: PaymentMethod;
    let paypalCommerceIntegrationService: PayPalCommerceIntegrationService;
    let paypalCommerceSdk: PayPalCommerceSdk;
    let paypalAxoSdk: PayPalAxoSdk;
    let paypalCommerceAcceleratedCheckoutUtils: PayPalCommerceAcceleratedCheckoutUtils;
    let paypalSdk: PayPalSDK;
    let eventEmitter: EventEmitter;
    const mockRender = jest.fn();
    const mockClose = jest.fn().mockReturnValue(Promise.resolve());
    const mockField = {
        render: mockRender,
        close: mockClose,
    };
    const hostedFormOrderId = 'hostedFormOrderId';
    let paypalCardNameFieldElement: HTMLDivElement;

    const methodId = 'paypalcommercecreditcards';

    const paypalCardNameFieldContainerId = 'card-name';

    const cardFieldsOptionsMock = {
        inputEvents: {
            onChange: expect.any(Function),
            onFocus: expect.any(Function),
            onBlur: expect.any(Function),
            onInputSubmitRequest: expect.any(Function),
        },
        style: {
            input: {
                color: 'gray',
                'font-family': 'bigFont',
                'font-size': '14px',
                'font-weight': '400',
                outline: 'none',
                padding: '9px 13px',
            },
            '.invalid': {
                color: 'red',
                'font-family': 'bigFont',
                'font-size': '14px',
                'font-weight': '400',
            },
            ':focus': {
                color: 'black',
                'font-family': 'bigFont',
                'font-size': '14px',
                'font-weight': '400',
            },
        },
        createOrder: expect.any(Function),
        onError: expect.any(Function),
        onApprove: expect.any(Function),
    };

    const cardFieldsInstanceMock = {
        isEligible: jest.fn(() => true),
        CVVField: () => mockField,
        ExpiryField: () => mockField,
        NameField: () => mockField,
        NumberField: () => mockField,
        getState: jest
            .fn()
            .mockReturnValue(Promise.resolve({ fields: { number: { isValid: true } } })),
        submit: jest.fn().mockReturnValue(Promise.resolve()),
    };

    const creditCardFormFields = {
        [HostedFieldType.CardNumber]: { containerId: 'card-number' },
        [HostedFieldType.CardExpiry]: { containerId: 'card-expiry' },
        [HostedFieldType.CardCode]: { containerId: 'card-code' },
        [HostedFieldType.CardName]: { containerId: paypalCardNameFieldContainerId },
    };

    const paypalCommerceCreditCardsOptions: PayPalCommerceCreditCardsPaymentInitializeOptions = {
        form: {
            fields: creditCardFormFields,
        },
    };

    const initializationOptions: PaymentInitializeOptions = {
        methodId,
        paypalcommercecreditcards: paypalCommerceCreditCardsOptions,
    };

    const defaultExecutePayload = {
        payment: {
            methodId: 'paypalcommercecreditcards',
            paymentData: {},
        },
    };

    beforeEach(() => {
        cart = getCart();
        eventEmitter = new EventEmitter();
        paymentMethod = { ...getPayPalCommercePaymentMethod(), id: methodId };
        paypalSdk = getPayPalSDKMock();
        paypalAxoSdk = getPayPalAxoSdk();
        paypalCommerceIntegrationService = getPayPalCommerceIntegrationServiceMock();
        paymentIntegrationService = new PaymentIntegrationServiceMock();
        paypalCommerceSdk = createPayPalCommerceSdk();
        paypalCommerceAcceleratedCheckoutUtils = createPayPalCommerceAcceleratedCheckoutUtils();

        strategy = new PayPalCommerceCreditCardsPaymentStrategy(
            paymentIntegrationService,
            paypalCommerceIntegrationService,
            paypalCommerceSdk,
            paypalCommerceAcceleratedCheckoutUtils,
        );

        paypalCardNameFieldElement = document.createElement('div');
        paypalCardNameFieldElement.id = paypalCardNameFieldContainerId;
        document.body.appendChild(paypalCardNameFieldElement);

        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethod,
        );
        jest.spyOn(paymentIntegrationService.getState(), 'getCartOrThrow').mockReturnValue(cart);

        jest.spyOn(paypalCommerceIntegrationService, 'loadPayPalSdk').mockReturnValue(paypalSdk);
        jest.spyOn(paypalCommerceIntegrationService, 'getPayPalSdkOrThrow').mockReturnValue(
            paypalSdk,
        );
        jest.spyOn(paypalCommerceIntegrationService, 'submitPayment').mockImplementation(jest.fn());
        jest.spyOn(paypalCommerceIntegrationService, 'createOrderCardFields').mockReturnValue({
            orderId: 'orderId',
            setupToken: 'setupToken',
        });

        jest.spyOn(paypalSdk, 'CardFields').mockImplementation(
            (options: PayPalCommerceCardFieldsConfig) => {
                eventEmitter.on('onApprove', () => {
                    if (options.onApprove) {
                        options.onApprove({ orderID: hostedFormOrderId });
                    }
                });

                return cardFieldsInstanceMock;
            },
        );

        jest.spyOn(paypalCommerceSdk, 'getPayPalAxo').mockImplementation(() => paypalAxoSdk);

        jest.spyOn(
            paypalCommerceAcceleratedCheckoutUtils,
            'initializePayPalConnect',
        ).mockImplementation(() => jest.fn());
    });

    afterEach(() => {
        jest.clearAllMocks();

        delete (window as PayPalCommerceHostWindow).paypal;

        if (document.getElementById(paypalCardNameFieldContainerId)) {
            document.body.removeChild(paypalCardNameFieldElement);
        }
    });

    it('creates an interface of the PayPal Commerce Credit Cards payment strategy', () => {
        expect(strategy).toBeInstanceOf(PayPalCommerceCreditCardsPaymentStrategy);
    });

    describe('#initialize', () => {
        it('throws an error if methodId is not provided', async () => {
            const options = {} as PaymentInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws an error if paypalcommercecreditcards.form option is not provided', async () => {
            const options = { methodId } as PaymentInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('loads paypalcommercecreditcards payment method', async () => {
            await strategy.initialize(initializationOptions);

            expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalledWith(methodId);
        });

        it('loads paypal sdk', async () => {
            await strategy.initialize(initializationOptions);

            expect(paypalCommerceIntegrationService.loadPayPalSdk).toHaveBeenCalledWith(
                methodId,
                undefined,
                true,
                true,
            );
        });

        it('loads paypal connect sdk if paypal commerce connect analytic is enabled', async () => {
            const mockedPaymentMethod = {
                ...paymentMethod,
                initializationData: {
                    ...paymentMethod,
                    connectClientToken: 'connectClientToken123',
                    isAcceleratedCheckoutEnabled: true,
                    isPayPalCommerceAnalyticsV2Enabled: true,
                    isDeveloperModeApplicable: false,
                },
            };

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(mockedPaymentMethod);

            await strategy.initialize(initializationOptions);

            expect(paypalCommerceSdk.getPayPalAxo).toHaveBeenCalledWith(
                mockedPaymentMethod,
                cart.currency.code,
            );

            expect(
                paypalCommerceAcceleratedCheckoutUtils.initializePayPalConnect,
            ).toHaveBeenCalledWith(paypalAxoSdk, false);
        });
    });

    describe('#renderFields', () => {
        it('throws an error if card field is not eligible', async () => {
            jest.spyOn(paypalSdk, 'CardFields').mockReturnValue({
                isEligible: jest.fn().mockReturnValue(false),
            });

            try {
                await strategy.initialize(initializationOptions);
            } catch (error) {
                expect(error).toBeInstanceOf(NotInitializedError);
            }
        });

        it('renders card fields if they are eligible', async () => {
            await strategy.initialize(initializationOptions);

            expect(mockRender).toHaveBeenCalled();
        });

        it('renders card fields with valid options', async () => {
            const initializationOptionsWithStyles = {
                methodId,
                paypalcommercecreditcards: {
                    form: {
                        fields: paypalCommerceCreditCardsOptions.form.fields,
                        styles: {
                            default: {
                                color: 'gray',
                                fontFamily: 'bigFont',
                                fontSize: '14px',
                                fontWeight: '400',
                            },
                            error: {
                                color: 'red',
                                fontFamily: 'bigFont',
                                fontSize: '14px',
                                fontWeight: '400',
                            },
                            focus: {
                                color: 'black',
                                fontFamily: 'bigFont',
                                fontSize: '14px',
                                fontWeight: '400',
                            },
                        },
                    },
                },
            };

            await strategy.initialize(initializationOptionsWithStyles);

            expect(paypalSdk.CardFields).toHaveBeenCalledWith(cardFieldsOptionsMock);
        });
    });

    describe('#execute', () => {
        it('throws an error if payment object is not provided as execution data', async () => {
            await strategy.initialize(initializationOptions);

            const payload = {};

            try {
                await strategy.execute(payload);
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentArgumentInvalidError);
            }
        });

        it('throws an error if methodId is not provided as execution payment payload', async () => {
            await strategy.initialize(initializationOptions);

            const payload = {
                payment: {
                    paymentData: {},
                },
            } as OrderRequestBody;

            try {
                await strategy.execute(payload);
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentArgumentInvalidError);
            }
        });

        it('submits an order', async () => {
            await strategy.initialize(initializationOptions);
            await strategy.execute(defaultExecutePayload);

            expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
        });

        it('submits payment without saving vaulting instrument', async () => {
            await strategy.initialize(initializationOptions);

            eventEmitter.emit('onApprove');
            await new Promise((resolve) => process.nextTick(resolve));

            await strategy.execute(defaultExecutePayload);

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId,
                paymentData: {
                    formattedPayload: {
                        vault_payment_instrument: false,
                        set_as_default_stored_instrument: false,
                        device_info: null,
                        method_id: methodId,
                        card_with_order: {
                            order_id: hostedFormOrderId,
                        },
                    },
                },
            });
        });

        it('submits payment with flag to save vaulted instrument', async () => {
            await strategy.initialize(initializationOptions);
            eventEmitter.emit('onApprove');
            await new Promise((resolve) => process.nextTick(resolve));
            await strategy.execute({
                payment: {
                    methodId: 'paypalcommercecreditcards',
                    paymentData: {
                        shouldSaveInstrument: true,
                        shouldSetAsDefaultInstrument: true,
                    },
                },
            });

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId,
                paymentData: {
                    formattedPayload: {
                        vault_payment_instrument: true,
                        set_as_default_stored_instrument: true,
                        device_info: null,
                        method_id: methodId,
                        card_with_order: {
                            order_id: hostedFormOrderId,
                        },
                    },
                },
            });
        });

        it('submits payment with vaulted(stored) instrument', async () => {
            jest.spyOn(paypalSdk, 'CardFields').mockImplementation(
                (options: PayPalCommerceCardFieldsConfig) => {
                    eventEmitter.on('onApprove', () => {
                        if (options.onApprove) {
                            options.onApprove({
                                orderID: 'orderId',
                                vaultSetupToken: 'vaultSetupToken',
                            });
                        }
                    });

                    return cardFieldsInstanceMock;
                },
            );

            const instrumentId = 'bc_instrument_id';

            await strategy.initialize(initializationOptions);

            eventEmitter.emit('onApprove');
            await new Promise((resolve) => process.nextTick(resolve));

            await strategy.execute({
                payment: {
                    methodId: 'paypalcommercecreditcards',
                    paymentData: {
                        instrumentId,
                    },
                },
            });

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId,
                paymentData: {
                    formattedPayload: {
                        bigpay_token: {
                            token: 'bc_instrument_id',
                        },
                        card_with_order: {
                            order_id: 'orderId',
                        },
                        setup_token: 'vaultSetupToken',
                        device_info: null,
                        method_id: 'paypalcommercecreditcards',
                        set_as_default_stored_instrument: false,
                        vault_payment_instrument: false,
                    },
                },
            });
        });
    });

    describe('#submitHostedForm()', () => {
        it('throws an error if the hosted form is not valid on form submit', async () => {
            const cardFields = paypalSdk.CardFields(
                cardFieldsOptionsMock as PayPalCommerceCardFieldsConfig,
            );

            jest.spyOn(paypalSdk, 'CardFields').mockImplementation(() => ({
                ...cardFields,
                getState: jest
                    .fn()
                    .mockReturnValue(Promise.resolve({ fields: { number: { isValid: false } } })),
            }));
            await strategy.initialize(initializationOptions);

            try {
                await strategy.execute(defaultExecutePayload);
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentInvalidFormError);
            }
        });

        it('submits hosted form', async () => {
            const cardFields = paypalSdk.CardFields(
                cardFieldsOptionsMock as PayPalCommerceCardFieldsConfig,
            );
            const submitMock = jest.fn().mockReturnValue(Promise.resolve());

            jest.spyOn(paypalSdk, 'CardFields').mockImplementation(() => ({
                ...cardFields,
                submit: submitMock,
            }));

            await strategy.initialize(initializationOptions);

            await strategy.execute(defaultExecutePayload);

            expect(submitMock).toHaveBeenCalled();
        });
    });

    describe('#finalize()', () => {
        it('throws error to inform that order finalization is not required', async () => {
            await expect(strategy.finalize()).rejects.toThrow(OrderFinalizationNotRequiredError);
        });
    });

    describe('#deinitialize()', () => {
        it('deinitializes strategy', async () => {
            await strategy.initialize(initializationOptions);

            const result = await strategy.deinitialize();

            expect(result).toBeUndefined();
            expect(mockClose).toHaveBeenCalled();
        });
    });
});
