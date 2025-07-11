import { EventEmitter } from 'events';

import {
    BigCommercePaymentsFastlaneUtils,
    createBigCommercePaymentsFastlaneUtils,
    createBigCommercePaymentsSdk,
    getPayPalFastlaneSdk,
    PayPalFastlaneSdk,
    PayPalSdkHelper,
} from '@bigcommerce/checkout-sdk/bigcommerce-payments-utils';
import {
    BillingAddress,
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
    getBillingAddress,
    getCart,
    getConfig,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BigCommercePaymentsIntegrationService from '../bigcommerce-payments-integration-service';
import {
    BigCommercePaymentsCardFieldsConfig,
    BigCommercePaymentsHostWindow,
    LiabilityShiftEnum,
    PayPalSDK,
} from '../bigcommerce-payments-types';
import {
    getBigCommercePaymentsIntegrationServiceMock,
    getBigCommercePaymentsPaymentMethod,
    getPayPalSDKMock,
} from '../mocks';

import BigCommercePaymentsCreditCardsPaymentInitializeOptions, {
    WithBigCommercePaymentsCreditCardsPaymentInitializeOptions,
} from './bigcommerce-payments-credit-cards-payment-initialize-options';
import BigCommercePaymentsCreditCardsPaymentStrategy from './bigcommerce-payments-credit-cards-payment-strategy';

describe('BigCommercePaymentsCreditCardsPaymentStrategy', () => {
    let billingAddress: BillingAddress;
    let cart: Cart;
    let strategy: BigCommercePaymentsCreditCardsPaymentStrategy;
    let paymentIntegrationService: PaymentIntegrationService;
    let paymentMethod: PaymentMethod;
    let bigCommercePaymentsIntegrationService: BigCommercePaymentsIntegrationService;
    let bigCommercePaymentsSdk: PayPalSdkHelper;
    let paypalFastlaneSdk: PayPalFastlaneSdk;
    let bigCommercePaymentsFastlaneUtils: BigCommercePaymentsFastlaneUtils;
    let paypalSdk: PayPalSDK;
    let eventEmitter: EventEmitter;
    const mockRender = jest.fn();
    const mockClose = jest.fn().mockReturnValue(Promise.resolve());
    const mockField = {
        render: mockRender,
        close: mockClose,
        clear: jest.fn(),
        removeClass: jest.fn(),
    };
    const hostedFormOrderId = 'hostedFormOrderId';
    let paypalCardNameFieldElement: HTMLDivElement;

    const methodId = 'bigcommerce_payments_creditcards';

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
                color: '#333333',
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
                outline: 'none',
                padding: '9px 13px',
            },
            '.valid': {
                color: '#333333',
                'font-family': 'bigFont',
                'font-size': '14px',
                'font-weight': '400',
                outline: 'none',
                padding: '9px 13px',
            },
            ':focus': {
                color: '#333333',
                'font-family': 'bigFont',
                'font-size': '14px',
                'font-weight': '400',
                outline: 'none',
                padding: '9px 13px',
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

    const creditCardVaultedForm = {
        [HostedFieldType.CardNumberVerification]: { containerId: 'card-number' },
        [HostedFieldType.CardCodeVerification]: { containerId: 'card-code' },
        [HostedFieldType.CardExpiryVerification]: { containerId: 'card-expiry' },
    };

    const bigCommercePaymentsCreditCardsOptions: BigCommercePaymentsCreditCardsPaymentInitializeOptions =
        {
            form: {
                fields: creditCardFormFields,
            },
            onCreditCardFieldsRenderingError: jest.fn(),
        };

    const initializationOptions: PaymentInitializeOptions &
        WithBigCommercePaymentsCreditCardsPaymentInitializeOptions = {
        methodId,
        bigcommerce_payments_creditcards: bigCommercePaymentsCreditCardsOptions,
    };

    const defaultExecutePayload = {
        payment: {
            methodId: 'bigcommerce_payments_creditcards',
            paymentData: {},
        },
    };

    beforeEach(() => {
        cart = getCart();
        billingAddress = getBillingAddress();
        eventEmitter = new EventEmitter();
        paymentMethod = { ...getBigCommercePaymentsPaymentMethod(), id: methodId };
        paypalSdk = getPayPalSDKMock();
        paypalFastlaneSdk = getPayPalFastlaneSdk();
        bigCommercePaymentsIntegrationService = getBigCommercePaymentsIntegrationServiceMock();
        paymentIntegrationService = new PaymentIntegrationServiceMock();
        bigCommercePaymentsSdk = createBigCommercePaymentsSdk();
        bigCommercePaymentsFastlaneUtils = createBigCommercePaymentsFastlaneUtils();

        strategy = new BigCommercePaymentsCreditCardsPaymentStrategy(
            paymentIntegrationService,
            bigCommercePaymentsIntegrationService,
            bigCommercePaymentsSdk,
            bigCommercePaymentsFastlaneUtils,
        );

        paypalCardNameFieldElement = document.createElement('div');
        paypalCardNameFieldElement.id = paypalCardNameFieldContainerId;
        document.body.appendChild(paypalCardNameFieldElement);

        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethod,
        );
        jest.spyOn(paymentIntegrationService.getState(), 'getCartOrThrow').mockReturnValue(cart);
        jest.spyOn(
            paymentIntegrationService.getState(),
            'getBillingAddressOrThrow',
        ).mockReturnValue(billingAddress);

        jest.spyOn(bigCommercePaymentsIntegrationService, 'loadPayPalSdk').mockResolvedValue(
            paypalSdk,
        );
        jest.spyOn(bigCommercePaymentsIntegrationService, 'getPayPalSdkOrThrow').mockReturnValue(
            paypalSdk,
        );
        jest.spyOn(bigCommercePaymentsIntegrationService, 'submitPayment').mockImplementation(
            jest.fn(),
        );
        jest.spyOn(
            bigCommercePaymentsIntegrationService,
            'createOrderCardFields',
        ).mockResolvedValue({
            orderId: 'orderId',
            setupToken: 'setupToken',
        });

        jest.spyOn(paypalSdk, 'CardFields').mockImplementation(
            (options: BigCommercePaymentsCardFieldsConfig) => {
                eventEmitter.on('onApprove', () => {
                    if (options.onApprove) {
                        options.onApprove({ orderID: hostedFormOrderId });
                    }
                });

                return Promise.resolve(cardFieldsInstanceMock);
            },
        );

        jest.spyOn(bigCommercePaymentsSdk, 'getPayPalFastlaneSdk').mockImplementation(() =>
            Promise.resolve(paypalFastlaneSdk),
        );
        jest.spyOn(bigCommercePaymentsFastlaneUtils, 'initializePayPalFastlane').mockImplementation(
            jest.fn(),
        );
    });

    afterEach(() => {
        jest.clearAllMocks();

        delete (window as BigCommercePaymentsHostWindow).paypal;

        if (document.getElementById(paypalCardNameFieldContainerId)) {
            document.body.removeChild(paypalCardNameFieldElement);
        }
    });

    it('creates an interface of the BigCommercePayments Credit Cards payment strategy', () => {
        expect(strategy).toBeInstanceOf(BigCommercePaymentsCreditCardsPaymentStrategy);
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

        it('throws an error if bigcommerce_payments_creditcards.form option is not provided', async () => {
            const options = { methodId } as PaymentInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('loads bigcommerce_payments_creditcards payment method', async () => {
            await strategy.initialize(initializationOptions);

            expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalledWith(methodId);
        });

        it('loads paypal sdk', async () => {
            await strategy.initialize(initializationOptions);

            expect(bigCommercePaymentsIntegrationService.loadPayPalSdk).toHaveBeenCalledWith(
                methodId,
                undefined,
                true,
                true,
            );
        });

        it('loads paypal fastlane sdk if bigcommerce payments fastlane analytic is enabled', async () => {
            const mockedPaymentMethod = {
                ...paymentMethod,
                initializationData: {
                    ...paymentMethod,
                    connectClientToken: 'connectClientToken123',
                    isAcceleratedCheckoutEnabled: true,
                    isBigCommercePaymentsAnalyticsV2Enabled: true,
                    isDeveloperModeApplicable: false,
                    isFastlaneEnabled: true,
                },
            };

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(mockedPaymentMethod);

            await strategy.initialize(initializationOptions);

            expect(bigCommercePaymentsSdk.getPayPalFastlaneSdk).toHaveBeenCalledWith(
                mockedPaymentMethod,
                cart.currency.code,
                cart.id,
            );

            expect(bigCommercePaymentsFastlaneUtils.initializePayPalFastlane).toHaveBeenCalledWith(
                paypalFastlaneSdk,
                false,
            );
        });
    });

    describe('#renderFields', () => {
        it('throws an error if card field is not eligible', async () => {
            jest.spyOn(paypalSdk, 'CardFields').mockResolvedValue({
                ...cardFieldsInstanceMock,
                isEligible: jest.fn().mockReturnValue(false),
            });

            try {
                await strategy.initialize(initializationOptions);
            } catch (error) {
                expect(error).toBeInstanceOf(NotInitializedError);
            }
        });

        it('calls a callback from initialization options if there was an issue with form rendering process', async () => {
            jest.spyOn(paypalSdk, 'CardFields').mockResolvedValue({
                ...cardFieldsInstanceMock,
                isEligible: jest.fn().mockReturnValue(true),
                NumberField: jest.fn().mockReturnValue({
                    render: jest.fn().mockImplementation(() => {
                        throw new Error();
                    }),
                }),
            });

            await strategy.initialize(initializationOptions);

            expect(
                initializationOptions.bigcommerce_payments_creditcards
                    ?.onCreditCardFieldsRenderingError,
            ).toHaveBeenCalled();
        });

        it('renders card fields if they are eligible', async () => {
            await strategy.initialize(initializationOptions);

            expect(mockRender).toHaveBeenCalled();
        });

        it('renders card fields with valid options', async () => {
            const initializationOptionsWithStyles = {
                methodId,
                bigcommerce_payments_creditcards: {
                    form: {
                        fields: bigCommercePaymentsCreditCardsOptions.form.fields,
                        styles: {
                            default: {
                                fontFamily: 'bigFont',
                                fontSize: '14px',
                                fontWeight: '400',
                            },
                            error: {
                                fontFamily: 'bigFont',
                                fontSize: '14px',
                                fontWeight: '400',
                            },
                            focus: {
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
                    shouldSaveInstrument: false,
                    shouldSetAsDefaultInstrument: false,
                    formattedPayload: {
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
                    methodId: 'bigcommerce_payments_creditcards',
                    paymentData: {
                        shouldSaveInstrument: true,
                        shouldSetAsDefaultInstrument: true,
                    },
                },
            });

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId,
                paymentData: {
                    shouldSaveInstrument: true,
                    shouldSetAsDefaultInstrument: true,
                    formattedPayload: {
                        card_with_order: {
                            order_id: hostedFormOrderId,
                        },
                    },
                },
            });
        });

        it('does not submit order and payment if 3ds failed', async () => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getStoreConfigOrThrow',
            ).mockReturnValue({
                ...getConfig().storeConfig,
                checkoutSettings: {
                    ...getConfig().storeConfig.checkoutSettings,
                    features: {
                        'PAYPAL-4591.paypal_commerce_3ds_verification': true,
                    },
                },
            });
            jest.spyOn(paypalSdk, 'CardFields').mockImplementation(
                (options: BigCommercePaymentsCardFieldsConfig) => {
                    eventEmitter.on('onApprove', () => {
                        if (options.onApprove) {
                            options.onApprove({
                                orderID: hostedFormOrderId,
                                liabilityShift: LiabilityShiftEnum.No,
                            });
                        }
                    });

                    return Promise.resolve(cardFieldsInstanceMock);
                },
            );
            await strategy.initialize(initializationOptions);

            try {
                eventEmitter.emit('onApprove');
                await new Promise((resolve) => process.nextTick(resolve));
            } catch (error) {
                expect(error).toBeDefined();
            }
        });

        it('submits payment with vaulted(stored) instrument', async () => {
            jest.spyOn(paypalSdk, 'CardFields').mockImplementation(
                (options: BigCommercePaymentsCardFieldsConfig) => {
                    eventEmitter.on('onApprove', () => {
                        if (options.onApprove) {
                            options.onApprove({
                                orderID: 'orderId',
                                vaultSetupToken: 'vaultSetupToken',
                            });
                        }
                    });

                    return Promise.resolve(cardFieldsInstanceMock);
                },
            );

            const instrumentId = 'bc_instrument_id';

            await strategy.initialize(initializationOptions);

            eventEmitter.emit('onApprove');
            await new Promise((resolve) => process.nextTick(resolve));

            await strategy.execute({
                payment: {
                    methodId: 'bigcommerce_payments_creditcards',
                    paymentData: {
                        instrumentId,
                    },
                },
            });

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId,
                paymentData: {
                    shouldSaveInstrument: false,
                    shouldSetAsDefaultInstrument: false,
                    instrumentId: 'bc_instrument_id',
                    formattedPayload: {
                        bigpay_token: {
                            verification_nonce: 'vaultSetupToken',
                            token: 'bc_instrument_id',
                        },
                        card_with_order: {
                            order_id: 'orderId',
                        },
                    },
                },
            });
        });
    });

    describe('#submitHostedForm()', () => {
        it('throws an error if the hosted form is not valid on form submit', async () => {
            jest.spyOn(paypalSdk, 'CardFields').mockResolvedValue({
                ...cardFieldsInstanceMock,
                getState: jest
                    .fn()
                    .mockReturnValue(Promise.resolve({ fields: { number: { isValid: false } } })),
            });
            await strategy.initialize(initializationOptions);

            try {
                await strategy.execute(defaultExecutePayload);
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentInvalidFormError);
            }
        });

        it('submits hosted form with billing address', async () => {
            const submitMock = jest.fn().mockReturnValue(Promise.resolve());

            jest.spyOn(paypalSdk, 'CardFields').mockResolvedValue({
                ...cardFieldsInstanceMock,
                submit: submitMock,
            });

            await strategy.initialize(initializationOptions);

            await strategy.execute(defaultExecutePayload);

            expect(submitMock).toHaveBeenCalledWith({
                billingAddress: {
                    company: billingAddress.company,
                    addressLine1: billingAddress.address1,
                    addressLine2: billingAddress.address2,
                    adminArea1: billingAddress.stateOrProvinceCode,
                    adminArea2: billingAddress.city,
                    postalCode: billingAddress.postalCode,
                    countryCode: billingAddress.countryCode,
                },
            });
        });

        it('submits hosted form without billing address if there is vaulted form', async () => {
            const optionsWithVaultingForm = {
                ...initializationOptions,
                bigcommerce_payments_creditcards: {
                    ...bigCommercePaymentsCreditCardsOptions,
                    form: {
                        fields: creditCardVaultedForm,
                    },
                },
            } as PaymentInitializeOptions;

            const submitMock = jest.fn().mockReturnValue(Promise.resolve());

            jest.spyOn(paypalSdk, 'CardFields').mockResolvedValue({
                ...cardFieldsInstanceMock,
                submit: submitMock,
            });

            await strategy.initialize(optionsWithVaultingForm);

            await strategy.execute(defaultExecutePayload);

            expect(submitMock).toHaveBeenCalledWith();
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
