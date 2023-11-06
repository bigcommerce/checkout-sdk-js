import {
    HostedCardFieldOptionsMap,
    HostedFieldType,
    HostedStoredCardFieldOptionsMap,
    InvalidArgumentError,
    NotInitializedError,
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentInvalidFormError,
    PaymentMethod,
    PaymentMethodFailedError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import {
    getPayPalCommerceIntegrationServiceMock,
    getPayPalCommercePaymentMethod,
    getPayPalSDKMock,
} from '../mocks';
import PayPalCommerceIntegrationService from '../paypal-commerce-integration-service';
import { PayPalCommerceHostWindow, PayPalSDK } from '../paypal-commerce-types';

import PayPalCommerceCreditCardsPaymentInitializeOptions from './paypal-commerce-credit-cards-payment-initialize-options';
import PayPalCommerceCreditCardsPaymentStrategy from './paypal-commerce-credit-cards-payment-strategy';

describe('PayPalCommerceCreditCardsPaymentStrategy', () => {
    let strategy: PayPalCommerceCreditCardsPaymentStrategy;
    let paymentIntegrationService: PaymentIntegrationService;
    let paymentMethod: PaymentMethod;
    let paypalCommerceIntegrationService: PayPalCommerceIntegrationService;
    let paypalSdk: PayPalSDK;

    let paypalCardNameFieldElement: HTMLDivElement;

    const methodId = 'paypalcommercecreditcards';

    const paypalCardNameFieldContainerId = 'card-name';

    const creditCardFormFields = {
        [HostedFieldType.CardNumber]: { containerId: 'card-number' },
        [HostedFieldType.CardExpiry]: { containerId: 'card-expiry' },
        [HostedFieldType.CardCode]: { containerId: 'card-code' },
        [HostedFieldType.CardName]: { containerId: paypalCardNameFieldContainerId },
    };

    const storedCreditCardFormFields = {
        [HostedFieldType.CardCodeVerification]: { containerId: 'card-code-verification' },
        [HostedFieldType.CardNumberVerification]: { containerId: 'card-number-verification' },
    } as HostedStoredCardFieldOptionsMap;

    const paypalCommerceCreditCardsOptions: PayPalCommerceCreditCardsPaymentInitializeOptions = {
        form: {
            fields: creditCardFormFields,
        },
    };

    const paypalCommerceStoredCreditCardsOptions: PayPalCommerceCreditCardsPaymentInitializeOptions =
        {
            form: {
                fields: storedCreditCardFormFields,
            },
        };

    const initializationOptions: PaymentInitializeOptions = {
        methodId,
        paypalcommercecreditcards: paypalCommerceCreditCardsOptions,
    };

    const initializationOptionsForStoredCreditCardsForm: PaymentInitializeOptions = {
        methodId,
        paypalcommercecreditcards: paypalCommerceStoredCreditCardsOptions,
    };

    const defaultExecutePayload = {
        payment: {
            methodId: 'paypalcommercecreditcards',
            paymentData: {},
        },
    };

    const getHostedFieldSateMock = (isValid = true) => ({
        cards: [],
        emittedBy: 'number',
        fields: {
            number: {
                container: 'containerId',
                isFocused: false,
                isEmpty: true,
                isPotentiallyValid: false,
                isValid,
            },
        },
    });

    beforeEach(() => {
        paymentMethod = { ...getPayPalCommercePaymentMethod(), id: methodId };
        paypalSdk = getPayPalSDKMock();
        paypalCommerceIntegrationService = getPayPalCommerceIntegrationServiceMock();
        paymentIntegrationService = new PaymentIntegrationServiceMock();

        strategy = new PayPalCommerceCreditCardsPaymentStrategy(
            paymentIntegrationService,
            paypalCommerceIntegrationService,
        );

        paypalCardNameFieldElement = document.createElement('div');
        paypalCardNameFieldElement.id = paypalCardNameFieldContainerId;
        document.body.appendChild(paypalCardNameFieldElement);

        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethod,
        );

        jest.spyOn(paypalCommerceIntegrationService, 'loadPayPalSdk').mockReturnValue(paypalSdk);
        jest.spyOn(paypalCommerceIntegrationService, 'getPayPalSdkOrThrow').mockReturnValue(
            paypalSdk,
        );
        jest.spyOn(paypalCommerceIntegrationService, 'submitPayment').mockImplementation(jest.fn());

        jest.spyOn(paypalSdk.HostedFields, 'isEligible').mockReturnValue(true);
        jest.spyOn(paypalSdk.HostedFields, 'render').mockImplementation(jest.fn());
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
    });

    describe('#renderFields', () => {
        it('throws an error if hosted field is not eligible', async () => {
            jest.spyOn(paypalSdk.HostedFields, 'isEligible').mockReturnValue(false);

            try {
                await strategy.initialize(initializationOptions);
            } catch (error) {
                expect(error).toBeInstanceOf(NotInitializedError);
            }
        });

        it('renders hosted fields if they are eligible', async () => {
            await strategy.initialize(initializationOptions);

            expect(paypalSdk.HostedFields.render).toHaveBeenCalled();
        });

        it('renders hosted fields with credit card fields', async () => {
            const { fields } = paypalCommerceCreditCardsOptions.form;
            const formFields = fields as HostedCardFieldOptionsMap;

            const expectedCreditCardFormFields = {
                number: {
                    selector: `#${formFields[HostedFieldType.CardNumber].containerId}`,
                    placeholder: undefined,
                },
                expirationDate: {
                    selector: `#${formFields[HostedFieldType.CardExpiry].containerId}`,
                    placeholder: undefined,
                },
                cvv: {
                    selector: `#${formFields[HostedFieldType.CardCode]?.containerId || ''}`,
                    placeholder: undefined,
                },
            };

            await strategy.initialize(initializationOptions);

            expect(paypalSdk.HostedFields.render).toHaveBeenCalledWith({
                fields: expectedCreditCardFormFields,
                styles: {},
                paymentsSDK: true,
                createOrder: expect.any(Function),
            });
        });

        it('renders hosted fields with stored credit fields', async () => {
            const { fields } = paypalCommerceStoredCreditCardsOptions.form;
            const formFields = fields as HostedStoredCardFieldOptionsMap;

            const numberSelector =
                formFields[HostedFieldType.CardNumberVerification]?.containerId || '';
            const cvvSelector = formFields[HostedFieldType.CardCodeVerification]?.containerId || '';

            const expectedCreditCardFormFields = {
                number: {
                    selector: `#${numberSelector}`,
                    placeholder: undefined,
                },
                cvv: {
                    selector: `#${cvvSelector}`,
                    placeholder: undefined,
                },
            };

            await strategy.initialize(initializationOptionsForStoredCreditCardsForm);

            expect(paypalSdk.HostedFields.render).toHaveBeenCalledWith({
                fields: expectedCreditCardFormFields,
                styles: {},
                paymentsSDK: true,
                createOrder: expect.any(Function),
            });
        });

        it('renders hosted fields with valid styles', async () => {
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

            const { fields } = paypalCommerceCreditCardsOptions.form;
            const formFields = fields as HostedCardFieldOptionsMap;

            const numberSelector = formFields[HostedFieldType.CardNumber].containerId;
            const expirationDateSelector = formFields[HostedFieldType.CardExpiry].containerId;
            const cvvSelector = formFields[HostedFieldType.CardCode]?.containerId || '';

            const expectedCreditCardFormFields = {
                number: {
                    selector: `#${numberSelector}`,
                    placeholder: undefined,
                },
                expirationDate: {
                    selector: `#${expirationDateSelector}`,
                    placeholder: undefined,
                },
                cvv: {
                    selector: `#${cvvSelector}`,
                    placeholder: undefined,
                },
            };

            await strategy.initialize(initializationOptionsWithStyles);

            expect(paypalSdk.HostedFields.render).toHaveBeenCalledWith({
                fields: expectedCreditCardFormFields,
                styles: {
                    input: {
                        color: 'gray',
                        'font-family': 'bigFont',
                        'font-size': '14px',
                        'font-weight': '400',
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
                paymentsSDK: true,
                createOrder: expect.any(Function),
            });
        });

        it('sets hosted form events if related callbacks were provided', async () => {
            const hostedFieldOn = jest.fn();

            jest.spyOn(paypalSdk.HostedFields, 'render').mockImplementation(() =>
                Promise.resolve({
                    on: hostedFieldOn,
                }),
            );

            const initializationOptionsWithStyles = {
                methodId,
                paypalcommercecreditcards: {
                    form: {
                        fields: paypalCommerceCreditCardsOptions.form.fields,
                        onBlur: jest.fn(),
                        onFocus: jest.fn(),
                        onEnter: jest.fn(),
                        onCardTypeChange: jest.fn(),
                        onValidate: jest.fn(),
                    },
                },
            };

            await strategy.initialize(initializationOptionsWithStyles);

            expect(hostedFieldOn).toHaveBeenCalledWith('blur', expect.any(Function));
            expect(hostedFieldOn).toHaveBeenCalledWith('focus', expect.any(Function));
            expect(hostedFieldOn).toHaveBeenCalledWith('inputSubmitRequest', expect.any(Function));
            expect(hostedFieldOn).toHaveBeenCalledWith('cardTypeChange', expect.any(Function));
            expect(hostedFieldOn).toHaveBeenCalledWith('validityChange', expect.any(Function));
        });

        it('throws an error if an element with provided card name container id is not defined', async () => {
            document.body.removeChild(paypalCardNameFieldElement);

            try {
                await strategy.initialize(initializationOptions);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('renders card name field for credit card form', async () => {
            await strategy.initialize(initializationOptions);

            const cardNameContainer = document.getElementById(paypalCardNameFieldContainerId);
            const cardNameField = cardNameContainer?.getElementsByTagName('input')[0];

            expect(cardNameField).toBeDefined();
        });

        it('does not render card name field for stored credit card form', async () => {
            await strategy.initialize(initializationOptionsForStoredCreditCardsForm);

            const cardNameContainer = document.getElementById(paypalCardNameFieldContainerId);
            const cardNameField = cardNameContainer?.getElementsByTagName('input')[0];

            expect(cardNameField).toBeUndefined();
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
            const hostedFormSubmitFnMock = jest.fn(() => ({
                liabilityShift: undefined,
                orderId: 'orderId',
            }));

            jest.spyOn(paypalSdk.HostedFields, 'render').mockImplementation(() =>
                Promise.resolve({
                    getState: () => getHostedFieldSateMock(),
                    submit: hostedFormSubmitFnMock,
                }),
            );

            await strategy.initialize(initializationOptions);

            await strategy.execute(defaultExecutePayload);

            expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
        });

        it('submits payment without saving vaulting instrument', async () => {
            const hostedFormOrderId = 'hostedFormOrderId';

            const hostedFormSubmitFnMock = jest.fn(() => ({
                liabilityShift: undefined,
                orderId: hostedFormOrderId,
            }));

            jest.spyOn(paypalSdk.HostedFields, 'render').mockImplementation(() =>
                Promise.resolve({
                    getState: () => getHostedFieldSateMock(),
                    submit: hostedFormSubmitFnMock,
                }),
            );

            await strategy.initialize(initializationOptions);

            await strategy.execute(defaultExecutePayload);

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId,
                paymentData: {
                    formattedPayload: {
                        vault_payment_instrument: false,
                        set_as_default_stored_instrument: false,
                        device_info: null,
                        method_id: methodId,
                        paypal_account: {
                            order_id: hostedFormOrderId,
                        },
                    },
                },
            });
        });

        it('submits payment with flag to save vaulted instrument', async () => {
            const hostedFormOrderId = 'hostedFormOrderId';

            const hostedFormSubmitFnMock = jest.fn(() => ({
                liabilityShift: undefined,
                orderId: hostedFormOrderId,
            }));

            jest.spyOn(paypalSdk.HostedFields, 'render').mockImplementation(() =>
                Promise.resolve({
                    getState: () => getHostedFieldSateMock(),
                    submit: hostedFormSubmitFnMock,
                }),
            );

            await strategy.initialize(initializationOptions);
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
                        paypal_account: {
                            order_id: hostedFormOrderId,
                        },
                    },
                },
            });
        });

        it('submits payment with vaulted(stored) instrument', async () => {
            const instrumentId = 'bc_instrument_id';

            await strategy.initialize(initializationOptions);
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
                    instrumentId,
                },
            });
        });
    });

    describe('#submitHostedForm()', () => {
        it('throws an error if the hosted form is not valid on form submit', async () => {
            jest.spyOn(paypalSdk.HostedFields, 'render').mockImplementation(() =>
                Promise.resolve({
                    getState: () => getHostedFieldSateMock(false),
                    submit: jest.fn(),
                }),
            );

            await strategy.initialize(initializationOptions);

            try {
                await strategy.execute(defaultExecutePayload);
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentInvalidFormError);
            }
        });

        it('submits hosted form', async () => {
            const hostedFormSubmitFnMock = jest.fn(() => ({
                liabilityShift: undefined,
                orderId: 'orderId',
            }));

            jest.spyOn(paypalSdk.HostedFields, 'render').mockImplementation(() =>
                Promise.resolve({
                    getState: () => getHostedFieldSateMock(),
                    submit: hostedFormSubmitFnMock,
                }),
            );

            await strategy.initialize(initializationOptions);

            await strategy.execute(defaultExecutePayload);

            expect(hostedFormSubmitFnMock).toHaveBeenCalled();
        });

        it('submits hosted form with 3DS contingencies', async () => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue({
                ...paymentMethod,
                config: {
                    ...paymentMethod.config,
                    is3dsEnabled: true,
                },
            });

            const hostedFormSubmitFnMock = jest.fn(() => ({
                liabilityShift: undefined,
                orderId: 'orderId',
            }));

            jest.spyOn(paypalSdk.HostedFields, 'render').mockImplementation(() =>
                Promise.resolve({
                    getState: () => getHostedFieldSateMock(),
                    submit: hostedFormSubmitFnMock,
                }),
            );

            await strategy.initialize(initializationOptions);

            await strategy.execute(defaultExecutePayload);

            expect(hostedFormSubmitFnMock).toHaveBeenCalledWith({
                contingencies: ['3D_SECURE'],
            });
        });

        it('throws an error if liabilityShift is "NO" or "UNKNOWN" on submit hosted form while 3DS enabled', async () => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue({
                ...paymentMethod,
                config: {
                    ...paymentMethod.config,
                    is3dsEnabled: true,
                },
            });

            const hostedFormSubmitFnMock = jest.fn(() => ({
                liabilityShift: 'NO',
                orderId: 'orderId',
            }));

            jest.spyOn(paypalSdk.HostedFields, 'render').mockImplementation(() =>
                Promise.resolve({
                    getState: () => getHostedFieldSateMock(),
                    submit: hostedFormSubmitFnMock,
                }),
            );

            await strategy.initialize(initializationOptions);

            try {
                await strategy.execute(defaultExecutePayload);
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentMethodFailedError);
            }
        });
    });

    describe('#finalize()', () => {
        it('throws error to inform that order finalization is not required', async () => {
            await expect(strategy.finalize()).rejects.toThrow(OrderFinalizationNotRequiredError);
        });
    });

    describe('#deinitialize()', () => {
        it('deinitializes strategy', async () => {
            const result = await strategy.deinitialize();

            expect(result).toBeUndefined();
        });
    });
});
