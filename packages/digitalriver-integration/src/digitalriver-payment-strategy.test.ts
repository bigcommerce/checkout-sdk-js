import { Action, createAction } from '@bigcommerce/data-store';
import {
    createScriptLoader,
    createStylesheetLoader,
    ScriptLoader,
} from '@bigcommerce/script-loader';
import { merge } from 'lodash';
import { Observable, of } from 'rxjs';

import {
    Checkout,
    InvalidArgumentError,
    MissingDataError,
    NotInitializedError,
    NotInitializedErrorType,
    OrderActionType,
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentActionType,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentMethod,
    PaymentMethodActionType,
    StoreCreditActionType,
    SubmitOrderAction,
    SubmitPaymentAction,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getBillingAddress,
    getCheckout,
    getConfig,
    getCustomer,
    getOrderRequestBody,
    getVaultedInstrument,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import { AuthenticationSourceStatus, OnSuccessResponse } from './digitalriver';
import DigitalRiverError from './digitalriver-error';
import DigitalRiverPaymentStrategy from './digitalriver-payment-strategy';
import DigitalRiverScriptLoader from './digitalriver-script-loader';
import {
    getAdditionalActionError,
    getClientMock,
    getDigitalRiverJSMock,
    getDigitalRiverPaymentMethodMock,
    getInitializeOptionsMock,
    getOrderRequestBodyWithVaultedInstrument,
} from './digitalriver.mock';

describe('DigitalRiverPaymentStrategy', () => {
    let payload: OrderRequestBody;
    let checkoutMock: Checkout;
    let paymentIntegrationService: PaymentIntegrationService;
    let loadPaymentMethodAction: Observable<Action>;
    let strategy: DigitalRiverPaymentStrategy;
    let digitalRiverScriptLoader: DigitalRiverScriptLoader;
    let paymentMethodMock: PaymentMethod;
    let scriptLoader: ScriptLoader;
    let submitOrderAction: Observable<SubmitOrderAction>;
    let submitPaymentAction: Observable<SubmitPaymentAction>;
    let applyStoreCreditAction: Observable<Action>;
    let updateAddressAction: string | unknown;

    beforeEach(() => {
        scriptLoader = createScriptLoader();

        const stylesheetLoader = createStylesheetLoader();

        paymentIntegrationService = new PaymentIntegrationServiceMock();

        submitOrderAction = of(createAction(OrderActionType.SubmitOrderRequested));
        submitPaymentAction = of(createAction(PaymentActionType.SubmitPaymentRequested));

        paymentMethodMock = {
            ...getDigitalRiverPaymentMethodMock(),
            clientToken: JSON.stringify(getClientMock()),
        };
        digitalRiverScriptLoader = new DigitalRiverScriptLoader(scriptLoader, stylesheetLoader);

        checkoutMock = getCheckout();
        applyStoreCreditAction = of(createAction(StoreCreditActionType.ApplyStoreCreditRequested));
        loadPaymentMethodAction = of(
            createAction(PaymentMethodActionType.LoadPaymentMethodSucceeded, paymentMethodMock, {
                methodId: paymentMethodMock.id,
            }),
        );
        // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        paymentIntegrationService.loadPaymentMethod = jest.fn(() => loadPaymentMethodAction);
        updateAddressAction = 'UPDATE_BILLING_ADDRESS_REQUESTED';
        jest.spyOn(paymentIntegrationService, 'loadPaymentMethod');
        jest.spyOn(paymentIntegrationService, 'updateBillingAddress');
        jest.spyOn(paymentIntegrationService, 'updateShippingAddress');
        jest.spyOn(paymentIntegrationService, 'updateBillingAddress').mockReturnValue(
            updateAddressAction,
        );
        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethodMock,
        );

        jest.spyOn(paymentIntegrationService.getState(), 'getCheckoutOrThrow').mockReturnValue(
            checkoutMock,
        );
        jest.spyOn(paymentIntegrationService.getState(), 'getBillingAddress').mockImplementation(
            () => getBillingAddress(),
        );
        // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        jest.spyOn(paymentIntegrationService, 'submitOrder').mockReturnValue(submitOrderAction);

        // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValue(submitPaymentAction);

        jest.spyOn(paymentIntegrationService, 'applyStoreCredit').mockReturnValue(
            // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            applyStoreCreditAction,
        );

        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethodMock,
        );

        jest.spyOn(paymentIntegrationService, 'updateBillingAddress').mockReturnValue(
            // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            updateAddressAction,
        );
        strategy = new DigitalRiverPaymentStrategy(
            paymentIntegrationService,
            digitalRiverScriptLoader,
        );
    });

    describe('#initialize()', () => {
        const digitalRiverLoadResponse = getDigitalRiverJSMock();
        const digitalRiverComponent = digitalRiverLoadResponse.createDropin(expect.any(Object));
        const digitalRiverElement = digitalRiverLoadResponse.createElement(
            expect.any(Object),
            expect.any(Object),
        );
        const customer = getCustomer();
        let options: PaymentInitializeOptions;
        let onSuccessCallback: (data?: OnSuccessResponse) => void;
        let container: HTMLDivElement;
        let submitFormEvent: () => void;

        beforeEach(() => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getBillingAddressOrThrow',
            ).mockReturnValue(getBillingAddress());
            jest.spyOn(paymentIntegrationService.getState(), 'getCustomer').mockReturnValue(
                customer,
            );
            jest.spyOn(digitalRiverScriptLoader, 'load').mockReturnValue(
                Promise.resolve(digitalRiverLoadResponse),
            );
            jest.spyOn(digitalRiverLoadResponse, 'createDropin').mockReturnValue(
                digitalRiverComponent,
            );
            jest.spyOn(digitalRiverLoadResponse, 'createElement').mockReturnValue(
                digitalRiverElement,
            );
            submitFormEvent = jest.fn();

            options = getInitializeOptionsMock();
            container = document.createElement('div');
            container.setAttribute('id', 'compliance');
            document.body.appendChild(container);
        });

        afterEach(() => {
            document.body.removeChild(container);
        });

        it('should initialize payment strategy successfully', async () => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue({
                ...getDigitalRiverPaymentMethodMock(),
                initializationData: {
                    publicKey: 'publicKey',
                    paymentLanguage: 'en',
                },
            });

            jest.spyOn(digitalRiverScriptLoader, 'load').mockResolvedValue({
                createDropin: jest.fn().mockResolvedValue({
                    mount: jest.fn(),
                }),
                authenticateSource: jest.fn(),
                createElement: jest.fn(),
            });

            await strategy.initialize(options);

            expect(digitalRiverScriptLoader.load).toHaveBeenCalledWith('publicKey', 'en');
            expect(submitFormEvent).not.toHaveBeenCalled();
        });

        it('loads DigitalRiver script', async () => {
            await strategy.initialize(options);

            expect(digitalRiverScriptLoader.load).toHaveBeenCalled();
            expect(digitalRiverLoadResponse.createDropin).toHaveBeenCalled();
            expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalled();
        });

        it('creates the order and submit payment with credit card', async () => {
            onSuccessCallback = jest.fn();

            const orderRequest: OrderRequestBody = getOrderRequestBodyWithVaultedInstrument();

            jest.spyOn(paymentIntegrationService.getState(), 'getCheckoutOrThrow').mockReturnValue({
                ...getCheckout(),
                isStoreCreditApplied: false,
            });

            payload = merge({}, getOrderRequestBody(), {
                payment: paymentMethodMock,
                onSuccess: {
                    source: {
                        id: '1',
                        reusable: false,
                    },
                    readyForStorage: true,
                },
            });

            strategy.digitalRiverCheckoutData = getClientMock();
            strategy.loadSuccessResponse = {
                source: {
                    id: '1',
                    reusable: false,
                },
                readyForStorage: true,
            };

            await strategy.initialize(options);
            await strategy.execute(orderRequest);

            expect(paymentIntegrationService.submitOrder).toHaveBeenCalledWith(
                {
                    useStoreCredit: false,
                },
                undefined,
            );
            expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
            expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalled();

            expect(paymentIntegrationService.applyStoreCredit).toHaveBeenCalledWith(false);
            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId: 'digitalriver',
                paymentData: {
                    formattedPayload: {
                        bigpay_token: {
                            token: '123',
                        },
                        confirm: false,
                        credit_card_token: {
                            token: '{"checkoutId":"12345676543"}',
                        },
                        set_as_default_stored_instrument: null,
                    },
                },
            });
        });

        it('creates the order and should update the billing address', async () => {
            onSuccessCallback = jest.fn();

            const payPal = {
                digitalriver: {
                    containerId: 'drop-in',
                    configuration: {
                        button: {
                            type: 'submitOrder',
                        },
                        flow: 'checkout',
                        showComplianceSection: true,
                        showSavePaymentAgreement: false,
                        showTermsOfSaleDisclosure: true,
                        usage: 'unscheduled',
                    },
                    onError: jest.fn(),
                    onRenderButton: jest.fn(),
                    onSubmitForm: jest.fn(),
                },
                gatewayId: '',
                methodId: 'digitalriver',
            };

            payload = merge({}, getOrderRequestBody(), {
                payment: payPal,
                onSuccess: {
                    source: {
                        id: '1',
                        reusable: false,
                    },
                    readyForStorage: true,
                },
            });

            strategy.digitalRiverCheckoutData = getClientMock();
            strategy.loadSuccessResponse = {
                source: {
                    id: '1',
                    reusable: false,
                },
                readyForStorage: true,
            };

            const payPalOptions = {
                ...payload,
                payment: {
                    ...payload.payment,
                    ...payPal,
                },
            };

            const owner = {
                address: {
                    city: 'Minnetoka',
                    country: 'US',
                    line1: '10380 Bren Road WW',
                    postalCode: '55343',
                    state: 'MN',
                },
                email: 'test@digitalriver.com',
                firstName: 'John',
                lastName: 'Doe',
                phoneNumber: '000-000-0000',
            };

            jest.spyOn(digitalRiverLoadResponse, 'createDropin').mockImplementation(
                (configuration) => {
                    // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    onSuccessCallback = configuration.onSuccess;

                    return digitalRiverComponent;
                },
            );
            jest.spyOn(paymentIntegrationService.getState(), 'getCheckoutOrThrow').mockReturnValue({
                ...getCheckout(),
                isStoreCreditApplied: false,
            });
            jest.spyOn(paymentIntegrationService, 'updateBillingAddress').mockResolvedValue(
                updateAddressAction,
            );
            await strategy.initialize(payPal);
            await strategy.execute(payPalOptions);
            onSuccessCallback({
                source: {
                    id: '1',
                    reusable: false,
                    owner,
                },
                readyForStorage: true,
            });

            expect(digitalRiverLoadResponse.createDropin).toHaveBeenCalled();
            expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
            expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalled();
            expect(paymentIntegrationService.applyStoreCredit).toHaveBeenCalledWith(false);
            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId: 'digitalriver',
                paymentData: {
                    formattedPayload: {
                        bigpay_token: {
                            token: '123',
                        },
                        confirm: false,
                        credit_card_token: {
                            token: '{"checkoutId":"12345676543"}',
                        },
                        set_as_default_stored_instrument: null,
                    },
                },
            });
        });

        it('loads DigitalRiver script with vaulting enable and customer email', async () => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getBillingAddressOrThrow',
            ).mockReturnValue({ ...getBillingAddress(), email: undefined });
            jest.spyOn(paymentIntegrationService.getState(), 'getCustomerOrThrow').mockReturnValue({
                ...getCustomer(),
                email: 'customer@bigcommerce.com',
            });

            await strategy.initialize(options);

            const billingAddressMock = getBillingAddress();
            const digitalRiverConfigurationExpected = {
                sessionId: '',
                options: {
                    ...options.digitalriver?.configuration,
                    showSavePaymentAgreement: true,
                },
                billingAddress: {
                    firstName: billingAddressMock.firstName,
                    lastName: billingAddressMock.lastName,
                    email: 'customer@bigcommerce.com',
                    phoneNumber: billingAddressMock.phone,
                    address: {
                        line1: billingAddressMock.address1,
                        line2: billingAddressMock.address2,
                        city: billingAddressMock.city,
                        state: billingAddressMock.stateOrProvinceCode,
                        postalCode: billingAddressMock.postalCode,
                        country: billingAddressMock.countryCode,
                    },
                },
                onSuccess: jest.fn(),
                onReady: jest.fn(),
                onError: jest.fn(),
            };

            expect(digitalRiverScriptLoader.load).toHaveBeenCalled();
            expect(digitalRiverLoadResponse.createDropin).toHaveBeenCalledWith(
                digitalRiverConfigurationExpected,
            );
        });

        it('loads DigitalRiver script without vaulting enable and customer email', async () => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getBillingAddressOrThrow',
            ).mockReturnValue({ ...getBillingAddress(), email: undefined });
            jest.spyOn(paymentIntegrationService.getState(), 'getCustomerOrThrow').mockReturnValue({
                ...getCustomer(),
                email: 'customer@bigcommerce.com',
            });

            if (options.digitalriver) {
                options.digitalriver.configuration.showSavePaymentAgreement = true;
            }

            await strategy.initialize(options);

            const billingAddressMock = getBillingAddress();
            const digitalRiverConfigurationExpected = {
                sessionId: '',
                options: {
                    ...options.digitalriver?.configuration,
                    showSavePaymentAgreement: false,
                },
                billingAddress: {
                    firstName: billingAddressMock.firstName,
                    lastName: billingAddressMock.lastName,
                    email: 'customer@bigcommerce.com',
                    phoneNumber: billingAddressMock.phone,
                    address: {
                        line1: billingAddressMock.address1,
                        line2: billingAddressMock.address2,
                        city: billingAddressMock.city,
                        state: billingAddressMock.stateOrProvinceCode,
                        postalCode: billingAddressMock.postalCode,
                        country: billingAddressMock.countryCode,
                    },
                },
                onSuccess: jest.fn(),
                onReady: jest.fn(),
                onError: jest.fn(),
            };

            expect(digitalRiverScriptLoader.load).toHaveBeenCalled();

            expect(digitalRiverLoadResponse.createDropin).toHaveBeenCalledWith(
                digitalRiverConfigurationExpected,
            );
        });

        it('loads DigitalRiver when widget was updated', async () => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'isPaymentMethodInitialized',
            ).mockReturnValue(true);
            // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            jest.spyOn(document, 'getElementById').mockReturnValue('mock');
            jest.spyOn(document, 'getElementById').mockReturnValue(container);

            await strategy.initialize(options);

            expect(digitalRiverScriptLoader.load).toHaveBeenCalled();
            expect(digitalRiverLoadResponse.createDropin).toHaveBeenCalled();
        });

        it('loads DigitalRiver and disable PayPal when feature is off', async () => {
            const storeConfigMock = getConfig().storeConfig;

            storeConfigMock.checkoutSettings.features = {
                'PROJECT-4802.digital_river_paypal_support': false,
            };

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getStoreConfigOrThrow',
            ).mockReturnValueOnce(storeConfigMock);

            await strategy.initialize(options);

            const billingAddressMock = getBillingAddress();
            const digitalRiverConfigurationExpected = {
                sessionId: '',
                options: {
                    ...options.digitalriver?.configuration,
                    showSavePaymentAgreement:
                        Boolean(customer.email) &&
                        options.digitalriver?.configuration.showSavePaymentAgreement,
                },
                billingAddress: {
                    firstName: billingAddressMock.firstName,
                    lastName: billingAddressMock.lastName,
                    email: billingAddressMock.email || customer.email,
                    phoneNumber: billingAddressMock.phone,
                    address: {
                        line1: billingAddressMock.address1,
                        line2: billingAddressMock.address2,
                        city: billingAddressMock.city,
                        state: billingAddressMock.stateOrProvinceCode,
                        postalCode: billingAddressMock.postalCode,
                        country: billingAddressMock.countryCode,
                    },
                },
                paymentMethodConfiguration: {
                    disabledPaymentMethods: ['payPal'],
                },
                onSuccess: jest.fn(),
                onReady: jest.fn(),
                onError: jest.fn(),
            };

            expect(digitalRiverScriptLoader.load).toHaveBeenCalled();
            expect(digitalRiverLoadResponse.createDropin).toHaveBeenCalledWith(
                digitalRiverConfigurationExpected,
            );
        });

        it('loads DigitalRiver and does not disabled PayPal when feature is on', async () => {
            const storeConfigMock = getConfig().storeConfig;

            storeConfigMock.checkoutSettings.features = {
                'PROJECT-4802.digital_river_paypal_support': true,
            };

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getStoreConfigOrThrow',
            ).mockReturnValueOnce(storeConfigMock);

            await strategy.initialize(options);

            const billingAddressMock = getBillingAddress();
            const digitalRiverConfigurationExpected = {
                sessionId: '',
                options: {
                    ...options.digitalriver?.configuration,
                    showSavePaymentAgreement:
                        Boolean(customer.email) &&
                        options.digitalriver?.configuration.showSavePaymentAgreement,
                },
                billingAddress: {
                    firstName: billingAddressMock.firstName,
                    lastName: billingAddressMock.lastName,
                    email: billingAddressMock.email || customer.email,
                    phoneNumber: billingAddressMock.phone,
                    address: {
                        line1: billingAddressMock.address1,
                        line2: billingAddressMock.address2,
                        city: billingAddressMock.city,
                        state: billingAddressMock.stateOrProvinceCode,
                        postalCode: billingAddressMock.postalCode,
                        country: billingAddressMock.countryCode,
                    },
                },
                paymentMethodConfiguration: {
                    disabledPaymentMethods: [],
                },
                onSuccess: jest.fn(),
                onReady: jest.fn(),
                onError: jest.fn(),
            };

            expect(digitalRiverScriptLoader.load).toHaveBeenCalled();
            expect(digitalRiverLoadResponse.createDropin).toHaveBeenCalledWith(
                digitalRiverConfigurationExpected,
            );
        });

        it('calls onSuccess callback from DigitalRiver', async () => {
            onSuccessCallback = jest.fn();
            jest.spyOn(digitalRiverLoadResponse, 'createDropin').mockImplementation(
                (configuration) => {
                    // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    onSuccessCallback = configuration.onSuccess;

                    return digitalRiverComponent;
                },
            );

            await strategy.initialize(options);
            onSuccessCallback({
                source: {
                    id: '1',
                    reusable: false,
                },
                readyForStorage: true,
            });

            expect(digitalRiverLoadResponse.createDropin).toHaveBeenCalled();
        });

        it('calls onReady callback from DigitalRiver', async () => {
            jest.spyOn(digitalRiverLoadResponse, 'createDropin').mockImplementation(
                ({ onReady }) => {
                    // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    onReady({
                        paymentMethodTypes: ['creditCard', 'paypal'],
                    });

                    return digitalRiverComponent;
                },
            );

            await strategy.initialize(options);

            expect(digitalRiverLoadResponse.createDropin).toHaveBeenCalled();
        });

        it('calls onError callback from DigitalRiver', async () => {
            const onErrorCallback = jest.fn();

            jest.spyOn(digitalRiverLoadResponse, 'createDropin').mockImplementation(
                ({ onError }) => {
                    // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    onErrorCallback = onError;

                    return digitalRiverComponent;
                },
            );

            await strategy.initialize(options);
            onErrorCallback({
                errors: [
                    {
                        code: 'code',
                        message: 'message',
                    },
                ],
            });
            expect(onErrorCallback).toHaveBeenCalled();
            expect(digitalRiverLoadResponse.createDropin).toHaveBeenCalled();
        });

        it('throws an error when load response is empty or not provided', () => {
            jest.spyOn(digitalRiverScriptLoader, 'load').mockRejectedValueOnce(
                // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                Promise.resolve(new Error()),
            );

            const promise = strategy.initialize(options);

            expect(promise).rejects.toThrow(DigitalRiverError);
        });

        it('throws an error when DigitalRiver options is not provided', () => {
            const error = new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);

            options.digitalriver = undefined;

            const promise = strategy.initialize(options);

            return expect(promise).rejects.toThrow(error);
        });

        it('throws an error when DigitalRiver clientToken is not provided', () => {
            paymentMethodMock = { ...getDigitalRiverPaymentMethodMock(), clientToken: '' };
            loadPaymentMethodAction = of(
                createAction(
                    PaymentMethodActionType.LoadPaymentMethodSucceeded,
                    paymentMethodMock,
                    { methodId: paymentMethodMock.id },
                ),
            );

            options = getInitializeOptionsMock();
            payload = merge({}, getOrderRequestBody(), {
                payment: {
                    useStoreCredit: false,
                    order: {
                        order: 'fake',
                    },
                    payment: {
                        methodId: 'digitalriver',
                        paymentData: { instrumentId: '123', shouldSetAsDefaultInstrument: true },
                        clientToken: '',
                    },
                },
            });

            const promise = strategy.execute(payload);

            return expect(promise).rejects.toThrow(MissingDataError);
        });

        it('throws an error when DigitalRiver clientToken is not receiving correct data', () => {
            paymentMethodMock = { ...getDigitalRiverPaymentMethodMock(), clientToken: 'ok' };
            loadPaymentMethodAction = of(
                createAction(
                    PaymentMethodActionType.LoadPaymentMethodSucceeded,
                    paymentMethodMock,
                    { methodId: paymentMethodMock.id },
                ),
            );
            payload = merge({}, getOrderRequestBody(), {
                payment: {
                    useStoreCredit: false,
                    order: {
                        order: 'fake',
                    },
                    payment: {
                        methodId: 'digitalriver',
                        paymentData: { instrumentId: '123', shouldSetAsDefaultInstrument: true },
                        clientToken: 'ok',
                    },
                },
            });

            const promise = strategy.execute(payload);

            return expect(promise).rejects.toThrow(MissingDataError);
        });

        it('throws an error when data on onSuccess event is not provided', async () => {
            strategy.digitalRiverCheckoutData = getClientMock();

            const payloadWithEmptyOnSuccess = merge({}, getOrderRequestBody(), {
                payment: paymentMethodMock,
                onSuccess: undefined,
            });

            jest.spyOn(digitalRiverLoadResponse, 'createDropin').mockImplementation(() => {
                throw new InvalidArgumentError();
            });

            await expect(strategy.execute(payloadWithEmptyOnSuccess)).rejects.toThrow(
                InvalidArgumentError,
            );
        });
    });

    describe('#execute()', () => {
        let options: PaymentInitializeOptions;
        let onSuccessCallback: (data: OnSuccessResponse) => void;
        const digitalRiverLoadResponse = getDigitalRiverJSMock();
        const digitalRiverComponent = digitalRiverLoadResponse.createDropin(expect.any(Object));

        beforeEach(() => {
            jest.spyOn(digitalRiverScriptLoader, 'load').mockReturnValue(
                Promise.resolve(digitalRiverLoadResponse),
            );
            jest.spyOn(digitalRiverLoadResponse, 'createDropin').mockReturnValue(
                digitalRiverComponent,
            );
            submitOrderAction = of(createAction(OrderActionType.SubmitOrderRequested));
            // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            jest.spyOn(paymentIntegrationService, 'submitOrder').mockReturnValue(submitOrderAction);
            strategy.digitalRiverCheckoutData = getClientMock();
            strategy.loadSuccessResponse = {
                source: {
                    id: '1',
                    reusable: false,
                },
                readyForStorage: true,
            };
            options = getInitializeOptionsMock();
            payload = merge({}, getOrderRequestBody(), {
                payment: {
                    useStoreCredit: false,
                    order: {
                        order: 'fake',
                    },
                    payment: {
                        methodId: 'digitalriver',
                        paymentData: { instrumentId: '123', shouldSetAsDefaultInstrument: true },
                    },
                },
            });
        });

        it('executes the strategy successfully and applies the store credit', async () => {
            onSuccessCallback = jest.fn();
            payload = merge({}, getOrderRequestBody(), {
                payment: {
                    useStoreCredit: true,
                    order: {
                        order: 'fake',
                    },
                    payment: {
                        methodId: 'authorizenet',
                        paymentData: { instrumentId: '123', shouldSetAsDefaultInstrument: true },
                    },
                },
            });

            jest.spyOn(digitalRiverLoadResponse, 'createDropin').mockImplementation(
                ({ onSuccess }) => {
                    // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    onSuccessCallback = onSuccess;

                    return digitalRiverComponent;
                },
            );
            jest.spyOn(paymentIntegrationService, 'applyStoreCredit').mockReturnValue(
                // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                true,
            );

            checkoutMock.isStoreCreditApplied = true;
            await strategy.initialize(options);
            await strategy.execute(payload);
            onSuccessCallback({
                source: {
                    id: '1',
                    reusable: false,
                },
                readyForStorage: true,
            });

            expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
            expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalled();
            expect(paymentIntegrationService.applyStoreCredit).toHaveBeenCalledWith(true);
            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId: 'authorizenet',
                paymentData: {
                    formattedPayload: {
                        credit_card_token: {
                            token: JSON.stringify({
                                checkoutId: '12345676543',
                                source: {
                                    source: {
                                        id: '1',
                                        reusable: false,
                                    },
                                    readyForStorage: true,
                                },
                                sessionId: '1234',
                            }),
                        },
                        set_as_default_stored_instrument: false,
                        vault_payment_instrument: true,
                    },
                },
            });
        });

        it('throws an error when payment is not provided', () => {
            payload.payment = undefined;

            const promise = strategy.execute(payload, undefined);

            return expect(promise).rejects.toBeInstanceOf(PaymentArgumentInvalidError);
        });

        it('throws an error when DigitalRiver checkout data is not provided', () => {
            strategy.digitalRiverCheckoutData = undefined;

            const promise = strategy.execute(payload, undefined);

            return expect(promise).rejects.toBeInstanceOf(MissingDataError);
        });

        describe('using vaulted cards', () => {
            beforeEach(() => {
                jest.spyOn(digitalRiverScriptLoader, 'load').mockReturnValue(
                    Promise.resolve(digitalRiverLoadResponse),
                );
                paymentIntegrationService.loadPaymentMethod = jest.fn(
                    () => loadPaymentMethodAction,
                );

                jest.spyOn(digitalRiverLoadResponse, 'createDropin').mockReturnValue(
                    digitalRiverComponent,
                );

                submitOrderAction = of(createAction(OrderActionType.SubmitOrderRequested));
                // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                jest.spyOn(paymentIntegrationService, 'submitOrder').mockReturnValue(
                    submitOrderAction,
                );
                strategy.digitalRiverCheckoutData = getClientMock();
                strategy.loadSuccessResponse = {
                    source: {
                        id: '1',
                        reusable: false,
                    },
                    readyForStorage: true,
                };
                options = getInitializeOptionsMock();
                payload = merge({}, getOrderRequestBody(), {
                    payment: {
                        useStoreCredit: false,
                        order: {
                            order: 'fake',
                        },
                        payment: {
                            methodId: 'digitalriver',
                            paymentData: {
                                instrumentId: '123',
                                shouldSetAsDefaultInstrument: true,
                            },
                        },
                    },
                });
            });

            it('calls submitPayment when paying with vaulted instrument', async () => {
                const expectedPaymentPayload = {
                    methodId: 'digitalriver',
                    paymentData: {
                        formattedPayload: {
                            bigpay_token: {
                                token: getVaultedInstrument().instrumentId,
                            },
                            credit_card_token: {
                                token: JSON.stringify({
                                    checkoutId: '12345676543',
                                }),
                            },
                            confirm: false,
                            set_as_default_stored_instrument: null,
                        },
                    },
                };

                jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValueOnce(
                    // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    submitPaymentAction,
                );

                await strategy.initialize(options);
                await strategy.execute(getOrderRequestBodyWithVaultedInstrument());

                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(
                    expectedPaymentPayload,
                );
            });

            it('calls authenticateSource method when paying with vaulted instrument and 3DS is required', async () => {
                strategy.digitalRiverCheckoutData = getClientMock();

                const error = getAdditionalActionError();

                jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValueOnce(
                    Promise.reject(error),
                );
                jest.spyOn(digitalRiverLoadResponse, 'authenticateSource').mockImplementation(() =>
                    Promise.resolve({ status: AuthenticationSourceStatus.complete }),
                );

                options = getInitializeOptionsMock();
                payload = merge({}, getOrderRequestBodyWithVaultedInstrument());

                await strategy.initialize(options);
                await strategy.execute(payload);

                expect(digitalRiverLoadResponse.authenticateSource).toHaveBeenCalled();
                expect(paymentIntegrationService.submitPayment).toHaveBeenCalled();
            });

            it('calls authenticateSource method, authentication fails and execute method fails', async () => {
                const error = getAdditionalActionError();

                jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValueOnce(
                    // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    error,
                );
                jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValueOnce(
                    Promise.reject(error),
                );
                jest.spyOn(digitalRiverLoadResponse, 'authenticateSource').mockReturnValue(
                    Promise.reject({ status: AuthenticationSourceStatus.failed }),
                );

                await strategy.initialize(options);
                await strategy.execute(getOrderRequestBodyWithVaultedInstrument());
                expect(paymentIntegrationService.submitPayment).toHaveBeenCalled();
                expect(digitalRiverLoadResponse.authenticateSource).toHaveBeenCalled();
            });
        });
    });

    describe('#finalize()', () => {
        it('throws an error to inform that order finalization is not required', async () => {
            const promise = strategy.finalize();

            return expect(promise).rejects.toBeInstanceOf(OrderFinalizationNotRequiredError);
        });
    });

    describe('#deinitialize()', () => {
        const digitalRiverLoadResponse = getDigitalRiverJSMock();
        const digitalRiverComponent = digitalRiverLoadResponse.createDropin(expect.any(Object));
        const customer = getCustomer();
        let options: PaymentInitializeOptions;

        beforeEach(() => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getBillingAddressOrThrow',
            ).mockReturnValue(getBillingAddress());
            jest.spyOn(paymentIntegrationService.getState(), 'getCustomer').mockReturnValue(
                customer,
            );
            jest.spyOn(digitalRiverScriptLoader, 'load').mockReturnValue(
                Promise.resolve(digitalRiverLoadResponse),
            );
            jest.spyOn(digitalRiverLoadResponse, 'createDropin').mockReturnValue(
                digitalRiverComponent,
            );
            // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            jest.spyOn(document, 'getElementById').mockReturnValue('');
            options = getInitializeOptionsMock();
        });

        it('returns the state', async () => {
            await strategy.initialize(options);

            const result = await strategy.deinitialize();

            expect(result).toBeUndefined();
        });
    });
});
