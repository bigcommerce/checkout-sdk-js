import { createScriptLoader } from '@bigcommerce/script-loader';

import {
    InvalidArgumentError,
    NotInitializedError,
    OrderFinalizationNotRequiredError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentMethodFailedError,
    RequestError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getCart,
    getCheckout,
    getErrorPaymentResponseBody,
    getResponse,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import {
    getStripeIntegrationServiceMock,
    getStripeJsMock,
    StripeClient,
    StripeElementType,
    StripeEventMock,
    StripeInstrumentSetupFutureUsage,
    StripeIntegrationService,
    StripePIPaymentMethodOptions,
    StripeScriptLoader,
    StripeStringConstants,
} from '../stripe-utils';

import { WithStripeOCSPaymentInitializeOptions } from './stripe-ocs-initialize-options';
import StripeOCSPaymentStrategy from './stripe-ocs-payment-strategy';
import {
    getStripeOCSInitializeOptionsMock,
    getStripeOCSMock,
    getStripeOCSOrderRequestBodyMock,
} from './stripe-ocs.mock';

describe('StripeOCSPaymentStrategy', () => {
    let stripeOCSPaymentStrategy: StripeOCSPaymentStrategy;
    let paymentIntegrationService: PaymentIntegrationService;
    let stripeScriptLoader: StripeScriptLoader;
    let stripeIntegrationService: StripeIntegrationService;
    let stripeOptions: PaymentInitializeOptions & WithStripeOCSPaymentInitializeOptions;
    let stripeUPEJsMock: StripeClient;

    const methodId = 'optymized_checkout';
    const gatewayId = 'stripeocs';

    beforeEach(() => {
        const scriptLoader = createScriptLoader();

        paymentIntegrationService = new PaymentIntegrationServiceMock();
        stripeScriptLoader = new StripeScriptLoader(scriptLoader);
        stripeIntegrationService = getStripeIntegrationServiceMock();
        stripeOCSPaymentStrategy = new StripeOCSPaymentStrategy(
            paymentIntegrationService,
            stripeScriptLoader,
            stripeIntegrationService,
        );

        stripeOptions = getStripeOCSInitializeOptionsMock();
        stripeUPEJsMock = getStripeJsMock();

        jest.spyOn(stripeScriptLoader, 'getStripeClient').mockImplementation(
            jest.fn(() => Promise.resolve(stripeUPEJsMock)),
        );
        jest.spyOn(paymentIntegrationService, 'loadPaymentMethod').mockResolvedValue(
            paymentIntegrationService.getState(),
        );
        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            getStripeOCSMock(),
        );
        jest.spyOn(stripeScriptLoader, 'getElements').mockReturnValue(
            Promise.resolve(stripeUPEJsMock.elements({})),
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('#initialize', () => {
        it('throws error if no stripe initialization options', async () => {
            await expect(
                stripeOCSPaymentStrategy.initialize({
                    ...stripeOptions,
                    stripeocs: undefined,
                }),
            ).rejects.toThrow(NotInitializedError);
            expect(stripeIntegrationService.initCheckoutEventsSubscription).not.toHaveBeenCalled();
        });

        it('throws error if no container id in stripe options', async () => {
            await expect(
                stripeOCSPaymentStrategy.initialize({
                    ...stripeOptions,
                    stripeocs: {
                        ...stripeOptions.stripeocs,
                        render: jest.fn(),
                        containerId: '',
                    },
                }),
            ).rejects.toThrow(NotInitializedError);
            expect(stripeIntegrationService.initCheckoutEventsSubscription).not.toHaveBeenCalled();
        });

        it('throws error if no gatewayId option', async () => {
            await expect(
                stripeOCSPaymentStrategy.initialize({
                    ...stripeOptions,
                    gatewayId: undefined,
                }),
            ).rejects.toThrow(InvalidArgumentError);
            expect(stripeIntegrationService.initCheckoutEventsSubscription).not.toHaveBeenCalled();
        });

        it('throws error if payment method does not like stripe payment method', async () => {
            const stripePaymentMethod = getStripeOCSMock();
            const onErrorMock = jest.fn();

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue({
                ...stripePaymentMethod,
                initializationData: undefined,
            });

            await stripeOCSPaymentStrategy.initialize({
                ...stripeOptions,
                stripeocs: {
                    containerId: 'containerId',
                    render: jest.fn(),
                    onError: onErrorMock,
                },
            });

            expect(onErrorMock).toHaveBeenCalled();
        });

        it('throws error if payment method does not have clientToken', async () => {
            const stripePaymentMethod = getStripeOCSMock();
            const onErrorMock = jest.fn();

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue({
                ...stripePaymentMethod,
                clientToken: undefined,
            });

            await stripeOCSPaymentStrategy.initialize({
                ...stripeOptions,
                stripeocs: {
                    containerId: 'containerId',
                    render: jest.fn(),
                    onError: onErrorMock,
                },
            });

            expect(onErrorMock).toHaveBeenCalled();
        });

        it('should initialize', async () => {
            const onErrorMock = jest.fn();
            const renderMock = jest.fn();

            await stripeOCSPaymentStrategy.initialize({
                ...stripeOptions,
                stripeocs: {
                    containerId: 'containerId',
                    render: renderMock,
                    onError: onErrorMock,
                },
            });

            expect(stripeScriptLoader.getElements).toHaveBeenCalled();
            expect(onErrorMock).not.toHaveBeenCalled();
            expect(stripeScriptLoader.getStripeClient).toHaveBeenCalled();
            expect(stripeIntegrationService.initCheckoutEventsSubscription).toHaveBeenCalled();
        });

        it('should initialize and get postal code when shipping address unavailable', async () => {
            const onErrorMock = jest.fn();
            const renderMock = jest.fn();
            const createMock = jest.fn().mockImplementation(() => ({
                mount: jest.fn(),
                unmount: jest.fn(),
                on: jest.fn((_, callback) => callback(StripeEventMock)),
                update: jest.fn(),
                destroy: jest.fn(),
            }));

            jest.spyOn(paymentIntegrationService.getState(), 'getShippingAddress').mockReturnValue(
                undefined,
            );
            jest.spyOn(stripeScriptLoader, 'getElements').mockReturnValue(
                Promise.resolve({
                    ...stripeUPEJsMock.elements({}),
                    create: createMock,
                }),
            );

            await stripeOCSPaymentStrategy.initialize({
                ...stripeOptions,
                stripeocs: {
                    ...stripeOptions.stripeocs,
                    containerId: 'containerId',
                    render: renderMock,
                    onError: onErrorMock,
                },
            });

            expect(createMock).toHaveBeenCalledWith(StripeElementType.PAYMENT, {
                fields: {
                    billingDetails: {
                        email: StripeStringConstants.NEVER,
                        address: {
                            country: StripeStringConstants.NEVER,
                            city: StripeStringConstants.NEVER,
                            postalCode: StripeStringConstants.NEVER,
                        },
                    },
                },
                wallets: {
                    applePay: StripeStringConstants.NEVER,
                    googlePay: StripeStringConstants.NEVER,
                    link: StripeStringConstants.NEVER,
                },
                layout: {
                    type: 'accordion',
                    defaultCollapsed: false,
                    radios: true,
                    spacedAccordionItems: false,
                    visibleAccordionItemsCount: 0,
                },
                savePaymentMethod: {
                    maxVisiblePaymentMethods: 20,
                },
                defaultValues: {
                    billingDetails: {
                        email: 'test@bigcommerce.com',
                    },
                },
            });
            expect(onErrorMock).not.toHaveBeenCalled();
            expect(stripeIntegrationService.mountElement).toHaveBeenCalled();
        });

        it('should initialize if address information unavailable', async () => {
            const onErrorMock = jest.fn();
            const renderMock = jest.fn();
            const createMock = jest.fn().mockImplementation(() => ({
                mount: jest.fn(),
                unmount: jest.fn(),
                on: jest.fn((_, callback) => callback(StripeEventMock)),
                update: jest.fn(),
                destroy: jest.fn(),
            }));

            jest.spyOn(paymentIntegrationService.getState(), 'getShippingAddress').mockReturnValue(
                undefined,
            );
            jest.spyOn(paymentIntegrationService.getState(), 'getBillingAddress').mockReturnValue(
                undefined,
            );
            jest.spyOn(stripeScriptLoader, 'getElements').mockReturnValue(
                Promise.resolve({
                    ...stripeUPEJsMock.elements({}),
                    create: createMock,
                }),
            );

            await stripeOCSPaymentStrategy.initialize({
                ...stripeOptions,
                stripeocs: {
                    ...stripeOptions.stripeocs,
                    containerId: 'containerId',
                    render: renderMock,
                    onError: onErrorMock,
                },
            });

            expect(createMock).toHaveBeenCalledWith(StripeElementType.PAYMENT, {
                fields: {
                    billingDetails: {
                        email: StripeStringConstants.NEVER,
                        address: {
                            country: StripeStringConstants.NEVER,
                            city: StripeStringConstants.NEVER,
                            postalCode: StripeStringConstants.AUTO,
                        },
                    },
                },
                wallets: {
                    applePay: StripeStringConstants.NEVER,
                    googlePay: StripeStringConstants.NEVER,
                    link: StripeStringConstants.NEVER,
                },
                layout: {
                    type: 'accordion',
                    defaultCollapsed: false,
                    radios: true,
                    spacedAccordionItems: false,
                    visibleAccordionItemsCount: 0,
                },
                savePaymentMethod: {
                    maxVisiblePaymentMethods: 20,
                },
                defaultValues: {
                    billingDetails: {
                        email: '',
                    },
                },
            });
            expect(onErrorMock).not.toHaveBeenCalled();
        });

        it('initialize accordion close handled', async () => {
            const onErrorMock = jest.fn();
            const collapseMock = jest.fn();
            const createMock = jest.fn().mockImplementation(() => ({
                mount: jest.fn(),
                unmount: jest.fn(),
                on: jest.fn((_, callback) => callback(StripeEventMock)),
                update: jest.fn(),
                destroy: jest.fn(),
                collapse: collapseMock,
            }));

            jest.spyOn(stripeScriptLoader, 'getElements').mockReturnValue(
                Promise.resolve({
                    ...stripeUPEJsMock.elements({}),
                    getElement: createMock,
                }),
            );

            await stripeOCSPaymentStrategy.initialize({
                ...stripeOptions,
                stripeocs: {
                    containerId: 'containerId',
                    render: jest.fn(),
                    onError: onErrorMock,
                    handleClosePaymentMethod: jest.fn().mockImplementation((callback) => {
                        callback();
                    }),
                },
            });

            expect(onErrorMock).not.toHaveBeenCalled();
            expect(collapseMock).toHaveBeenCalled();
        });

        it('should not collapse accordion if element not initialized', async () => {
            const onErrorMock = jest.fn();
            const collapseMock = jest.fn();

            jest.spyOn(stripeScriptLoader, 'getElements').mockReturnValue(
                Promise.resolve(stripeUPEJsMock.elements({})),
            );

            await stripeOCSPaymentStrategy.initialize({
                ...stripeOptions,
                stripeocs: {
                    containerId: 'containerId',
                    render: jest.fn(),
                    onError: onErrorMock,
                    handleClosePaymentMethod: jest.fn().mockImplementation((callback) => {
                        callback();
                    }),
                },
            });

            expect(onErrorMock).not.toHaveBeenCalled();
            expect(collapseMock).not.toHaveBeenCalled();
        });

        it('loads stripe js only once per initialization', async () => {
            await stripeOCSPaymentStrategy.initialize(stripeOptions);
            await stripeOCSPaymentStrategy.initialize(stripeOptions);

            expect(stripeScriptLoader.getStripeClient).toHaveBeenCalledTimes(1);
        });

        it('should enable Link by initialization data option', async () => {
            const createMock = jest.fn().mockImplementation(() => ({
                mount: jest.fn(),
                unmount: jest.fn(),
                on: jest.fn((_, callback) => callback(StripeEventMock)),
                update: jest.fn(),
                destroy: jest.fn(),
            }));
            const stripePaymentMethod = getStripeOCSMock();

            jest.spyOn(stripeScriptLoader, 'getElements').mockReturnValue(
                Promise.resolve({
                    ...stripeUPEJsMock.elements({}),
                    create: createMock,
                }),
            );

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue({
                ...stripePaymentMethod,
                initializationData: {
                    ...stripePaymentMethod.initializationData,
                    enableLink: true,
                },
            });

            await stripeOCSPaymentStrategy.initialize(stripeOptions);

            expect(createMock).toHaveBeenCalledWith(StripeElementType.PAYMENT, {
                fields: {
                    billingDetails: {
                        email: StripeStringConstants.NEVER,
                        address: {
                            country: StripeStringConstants.NEVER,
                            city: StripeStringConstants.NEVER,
                            postalCode: StripeStringConstants.AUTO,
                        },
                    },
                },
                wallets: {
                    applePay: StripeStringConstants.NEVER,
                    googlePay: StripeStringConstants.NEVER,
                    link: StripeStringConstants.AUTO,
                },
                layout: {
                    type: 'accordion',
                    defaultCollapsed: false,
                    radios: true,
                    spacedAccordionItems: false,
                    visibleAccordionItemsCount: 0,
                },
                savePaymentMethod: {
                    maxVisiblePaymentMethods: 20,
                },
                defaultValues: {
                    billingDetails: {
                        email: '',
                    },
                },
            });
        });

        it('should Disable Link by initialization data option', async () => {
            const createMock = jest.fn().mockImplementation(() => ({
                mount: jest.fn(),
                unmount: jest.fn(),
                on: jest.fn((_, callback) => callback(StripeEventMock)),
                update: jest.fn(),
                destroy: jest.fn(),
            }));
            const stripePaymentMethod = getStripeOCSMock();

            jest.spyOn(stripeScriptLoader, 'getElements').mockReturnValue(
                Promise.resolve({
                    ...stripeUPEJsMock.elements({}),
                    create: createMock,
                }),
            );

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue({
                ...stripePaymentMethod,
                initializationData: {
                    ...stripePaymentMethod.initializationData,
                    enableLink: false,
                },
            });

            await stripeOCSPaymentStrategy.initialize(stripeOptions);

            expect(createMock).toHaveBeenCalledWith(StripeElementType.PAYMENT, {
                fields: {
                    billingDetails: {
                        email: StripeStringConstants.NEVER,
                        address: {
                            country: StripeStringConstants.NEVER,
                            city: StripeStringConstants.NEVER,
                            postalCode: StripeStringConstants.AUTO,
                        },
                    },
                },
                wallets: {
                    applePay: StripeStringConstants.NEVER,
                    googlePay: StripeStringConstants.NEVER,
                    link: StripeStringConstants.NEVER,
                },
                layout: {
                    type: 'accordion',
                    defaultCollapsed: false,
                    radios: true,
                    spacedAccordionItems: false,
                    visibleAccordionItemsCount: 0,
                },
                savePaymentMethod: {
                    maxVisiblePaymentMethods: 20,
                },
                defaultValues: {
                    billingDetails: {
                        email: '',
                    },
                },
            });
        });
    });

    describe('#execute', () => {
        it('throw error if stripe client not initialized', async () => {
            await expect(stripeOCSPaymentStrategy.execute({})).rejects.toThrow(NotInitializedError);
        });

        it('throw error if there are no gateway id', async () => {
            await stripeOCSPaymentStrategy.initialize(stripeOptions);

            await expect(
                stripeOCSPaymentStrategy.execute({
                    payment: {
                        methodId: '',
                        gatewayId: '',
                    },
                }),
            ).rejects.toThrow(InvalidArgumentError);
        });

        it('throw error if there are no method id', async () => {
            await stripeOCSPaymentStrategy.initialize(stripeOptions);

            await expect(
                stripeOCSPaymentStrategy.execute({
                    payment: {
                        methodId: '',
                        gatewayId,
                    },
                }),
            ).rejects.toThrow(InvalidArgumentError);
        });

        it('execute with store credits', async () => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getCheckoutOrThrow',
            ).mockReturnValueOnce({
                ...getCheckout(),
                isStoreCreditApplied: true,
            });

            await stripeOCSPaymentStrategy.initialize(stripeOptions);
            await stripeOCSPaymentStrategy.execute(getStripeOCSOrderRequestBodyMock());

            expect(paymentIntegrationService.applyStoreCredit).toHaveBeenCalledWith(true);
        });

        it('execute without additional actions with selected method in accordion', async () => {
            await stripeOCSPaymentStrategy.initialize(stripeOptions);
            await stripeOCSPaymentStrategy.execute(getStripeOCSOrderRequestBodyMock());

            expect(paymentIntegrationService.applyStoreCredit).not.toHaveBeenCalled();
            expect(stripeIntegrationService.updateStripePaymentIntent).toHaveBeenCalledWith(
                gatewayId,
                methodId,
            );
            expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId,
                paymentData: {
                    formattedPayload: {
                        cart_id: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
                        credit_card_token: {
                            token: 'clientToken',
                        },
                        confirm: false,
                        payment_method_id: undefined,
                        vault_payment_instrument: false,
                    },
                },
            });
        });

        it('execute with selected payment method id without ui handled', async () => {
            const eventMock = {
                ...StripeEventMock,
                collapsed: false,
            };
            const createMock = jest.fn().mockImplementation(() => ({
                mount: jest.fn(),
                unmount: jest.fn(),
                on: jest.fn((_, callback) => callback(eventMock)),
                update: jest.fn(),
                destroy: jest.fn(),
            }));

            jest.spyOn(stripeScriptLoader, 'getElements').mockReturnValue(
                Promise.resolve({
                    ...stripeUPEJsMock.elements({}),
                    create: createMock,
                }),
            );

            await stripeOCSPaymentStrategy.initialize({
                ...stripeOptions,
                stripeocs: {
                    render: jest.fn(),
                    containerId: 'containerId',
                },
            });
            await stripeOCSPaymentStrategy.execute(getStripeOCSOrderRequestBodyMock());

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId,
                paymentData: {
                    formattedPayload: {
                        cart_id: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
                        credit_card_token: {
                            token: 'clientToken',
                        },
                        confirm: false,
                        payment_method_id: 'card',
                        vault_payment_instrument: false,
                    },
                },
            });
        });

        it('execute with selected payment method id', async () => {
            const eventMock = {
                ...StripeEventMock,
                collapsed: false,
            };
            const createMock = jest.fn().mockImplementation(() => ({
                mount: jest.fn(),
                unmount: jest.fn(),
                on: jest.fn((_, callback) => callback(eventMock)),
                update: jest.fn(),
                destroy: jest.fn(),
            }));
            const paymentMethodSelectMock = jest.fn();

            jest.spyOn(stripeScriptLoader, 'getElements').mockReturnValue(
                Promise.resolve({
                    ...stripeUPEJsMock.elements({}),
                    create: createMock,
                }),
            );

            await stripeOCSPaymentStrategy.initialize({
                ...stripeOptions,
                stripeocs: {
                    render: jest.fn(),
                    containerId: 'containerId',
                    paymentMethodSelect: paymentMethodSelectMock,
                },
            });
            await stripeOCSPaymentStrategy.execute(getStripeOCSOrderRequestBodyMock());

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId,
                paymentData: {
                    formattedPayload: {
                        cart_id: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
                        credit_card_token: {
                            token: 'clientToken',
                        },
                        confirm: false,
                        payment_method_id: 'card',
                        vault_payment_instrument: false,
                    },
                },
            });
            expect(paymentMethodSelectMock).toHaveBeenCalledWith(`${gatewayId}-${methodId}`);
        });

        it('does not change selected payment method id if accordion collapsed', async () => {
            const eventMock = {
                ...StripeEventMock,
                collapsed: true,
            };
            const createMock = jest.fn().mockImplementation(() => ({
                mount: jest.fn(),
                unmount: jest.fn(),
                on: jest.fn((_, callback) => callback(eventMock)),
                update: jest.fn(),
                destroy: jest.fn(),
            }));

            jest.spyOn(stripeScriptLoader, 'getElements').mockReturnValue(
                Promise.resolve({
                    ...stripeUPEJsMock.elements({}),
                    create: createMock,
                }),
            );

            await stripeOCSPaymentStrategy.initialize({
                ...stripeOptions,
                stripeocs: {
                    render: jest.fn(),
                    containerId: 'containerId',
                },
            });
            await stripeOCSPaymentStrategy.execute(getStripeOCSOrderRequestBodyMock());

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId,
                paymentData: {
                    formattedPayload: {
                        cart_id: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
                        credit_card_token: {
                            token: 'clientToken',
                        },
                        confirm: false,
                        payment_method_id: undefined,
                        vault_payment_instrument: false,
                    },
                },
            });
        });

        it('execute without additional actions without client token', async () => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValueOnce(getStripeOCSMock());
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValueOnce({
                ...getStripeOCSMock(),
                clientToken: undefined,
            });

            await stripeOCSPaymentStrategy.initialize(stripeOptions);
            await stripeOCSPaymentStrategy.execute(getStripeOCSOrderRequestBodyMock());

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId,
                paymentData: {
                    formattedPayload: {
                        cart_id: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
                        credit_card_token: {
                            token: '',
                        },
                        confirm: false,
                        payment_method_id: undefined,
                        vault_payment_instrument: false,
                    },
                },
            });
        });

        it('payment payload without cart', async () => {
            jest.spyOn(paymentIntegrationService.getState(), 'getCart').mockReturnValue(undefined);

            await stripeOCSPaymentStrategy.initialize(stripeOptions);
            await stripeOCSPaymentStrategy.execute(getStripeOCSOrderRequestBodyMock());

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId,
                paymentData: {
                    formattedPayload: {
                        cart_id: '',
                        credit_card_token: {
                            token: 'clientToken',
                        },
                        confirm: false,
                        payment_method_id: undefined,
                        vault_payment_instrument: false,
                    },
                },
            });
        });

        it('payment payload without cart ID', async () => {
            jest.spyOn(paymentIntegrationService.getState(), 'getCart').mockReturnValue({
                ...getCart(),
                id: '',
            });

            await stripeOCSPaymentStrategy.initialize(stripeOptions);
            await stripeOCSPaymentStrategy.execute(getStripeOCSOrderRequestBodyMock());

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId,
                paymentData: {
                    formattedPayload: {
                        cart_id: '',
                        credit_card_token: {
                            token: 'clientToken',
                        },
                        confirm: false,
                        payment_method_id: undefined,
                        vault_payment_instrument: false,
                    },
                },
            });
        });
    });

    describe('#execute, with additional action', () => {
        let errorResponse: RequestError;
        let confirmPaymentMock: jest.Mock;
        let retrievePaymentIntentMock: jest.Mock;

        const mockFirstPaymentRequest = (payload: unknown) => {
            jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValueOnce(
                Promise.reject(payload),
            );
        };

        beforeEach(() => {
            jest.spyOn(stripeIntegrationService, 'isAdditionalActionError').mockReturnValue(true);
            jest.spyOn(stripeIntegrationService, 'isPaymentCompleted').mockReturnValue(
                Promise.resolve(false),
            );

            errorResponse = new RequestError(
                getResponse({
                    ...getErrorPaymentResponseBody(),
                    errors: [{ code: 'additional_action_required' }],
                    additional_action_required: {
                        type: 'additional_action_requires_payment_method',
                        data: {
                            redirect_url: 'https://redirect-url.com',
                            token: 'token',
                        },
                    },
                    status: 'error',
                }),
            );

            confirmPaymentMock = jest.fn();
            retrievePaymentIntentMock = jest.fn();

            stripeUPEJsMock = {
                ...getStripeJsMock(),
                confirmPayment: confirmPaymentMock,
                retrievePaymentIntent: retrievePaymentIntentMock,
            };
            jest.spyOn(stripeScriptLoader, 'getStripeClient').mockImplementation(
                jest.fn(() => Promise.resolve(stripeUPEJsMock)),
            );
        });

        it('throws not request error', async () => {
            mockFirstPaymentRequest(new Error('Not request'));

            await stripeOCSPaymentStrategy.initialize(stripeOptions);

            await expect(
                stripeOCSPaymentStrategy.execute(getStripeOCSOrderRequestBodyMock()),
            ).rejects.toThrow(Error);
        });

        it('throws not additional action error', async () => {
            mockFirstPaymentRequest(errorResponse);
            jest.spyOn(stripeIntegrationService, 'isAdditionalActionError').mockReturnValue(false);

            await stripeOCSPaymentStrategy.initialize(stripeOptions);

            await expect(
                stripeOCSPaymentStrategy.execute(getStripeOCSOrderRequestBodyMock()),
            ).rejects.toThrow(Error);
        });

        it('throws not initialized error', async () => {
            jest.spyOn(paymentIntegrationService, 'submitPayment').mockImplementationOnce(() => {
                stripeOCSPaymentStrategy.deinitialize();

                return Promise.reject(errorResponse);
            });

            confirmPaymentMock = jest.fn().mockRejectedValue(new Error('stripe error'));
            retrievePaymentIntentMock = jest.fn().mockResolvedValue({
                paymentIntent: undefined,
            });

            stripeUPEJsMock = {
                ...getStripeJsMock(),
                confirmPayment: confirmPaymentMock,
                retrievePaymentIntent: retrievePaymentIntentMock,
            };
            jest.spyOn(stripeScriptLoader, 'getStripeClient').mockImplementation(
                jest.fn(() => Promise.resolve(stripeUPEJsMock)),
            );

            await stripeOCSPaymentStrategy.initialize(stripeOptions);

            await expect(
                stripeOCSPaymentStrategy.execute(getStripeOCSOrderRequestBodyMock()),
            ).rejects.toThrow(NotInitializedError);

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(1);
            expect(confirmPaymentMock).not.toHaveBeenCalled();
        });

        it('skips stripe confirmation if payment has been already completed', async () => {
            errorResponse.body.additional_action_required.data.token = undefined;
            mockFirstPaymentRequest(errorResponse);
            jest.spyOn(stripeIntegrationService, 'isPaymentCompleted').mockReturnValue(
                Promise.resolve(true),
            );

            confirmPaymentMock = jest.fn().mockRejectedValue(new Error('stripe error'));
            retrievePaymentIntentMock = jest.fn().mockResolvedValue({
                paymentIntent: {},
            });

            stripeUPEJsMock = {
                ...getStripeJsMock(),
                confirmPayment: confirmPaymentMock,
                retrievePaymentIntent: retrievePaymentIntentMock,
            };
            jest.spyOn(stripeScriptLoader, 'getStripeClient').mockImplementation(
                jest.fn(() => Promise.resolve(stripeUPEJsMock)),
            );

            await stripeOCSPaymentStrategy.initialize(stripeOptions);
            await stripeOCSPaymentStrategy.execute(getStripeOCSOrderRequestBodyMock());

            expect(confirmPaymentMock).not.toHaveBeenCalled();
            expect(retrievePaymentIntentMock).toHaveBeenCalled();
        });

        it('throw stripe error', async () => {
            const stripeGenericErrorMock = {
                type: 'cancelation_error',
            };

            mockFirstPaymentRequest(errorResponse);
            confirmPaymentMock = jest.fn().mockResolvedValue({
                paymentIntent: {},
                error: stripeGenericErrorMock,
            });

            stripeUPEJsMock = {
                ...getStripeJsMock(),
                confirmPayment: confirmPaymentMock,
                retrievePaymentIntent: jest.fn(),
            };
            jest.spyOn(stripeScriptLoader, 'getStripeClient').mockImplementation(
                jest.fn(() => Promise.resolve(stripeUPEJsMock)),
            );

            await stripeOCSPaymentStrategy.initialize(stripeOptions);

            await expect(
                stripeOCSPaymentStrategy.execute(getStripeOCSOrderRequestBodyMock()),
            ).rejects.toThrow('throw stripe error');
        });

        it('throw error if confirmation crashed', async () => {
            mockFirstPaymentRequest(errorResponse);
            confirmPaymentMock = jest
                .fn()
                .mockReturnValue(Promise.reject(new Error('stripe confirmation error')));

            stripeUPEJsMock = {
                ...getStripeJsMock(),
                confirmPayment: confirmPaymentMock,
                retrievePaymentIntent: jest.fn(),
            };
            jest.spyOn(stripeScriptLoader, 'getStripeClient').mockImplementation(
                jest.fn(() => Promise.resolve(stripeUPEJsMock)),
            );

            await stripeOCSPaymentStrategy.initialize(stripeOptions);

            await expect(
                stripeOCSPaymentStrategy.execute(getStripeOCSOrderRequestBodyMock()),
            ).rejects.toThrow('throw stripe error');
        });

        it('throw generic stripe error if no confirmation response', async () => {
            mockFirstPaymentRequest(errorResponse);
            confirmPaymentMock = jest.fn().mockResolvedValue(null);

            stripeUPEJsMock = {
                ...getStripeJsMock(),
                confirmPayment: confirmPaymentMock,
                retrievePaymentIntent: jest.fn(),
            };
            jest.spyOn(stripeScriptLoader, 'getStripeClient').mockImplementation(
                jest.fn(() => Promise.resolve(stripeUPEJsMock)),
            );

            await stripeOCSPaymentStrategy.initialize(stripeOptions);

            await expect(
                stripeOCSPaymentStrategy.execute(getStripeOCSOrderRequestBodyMock()),
            ).rejects.toThrow('throw stripe error');
        });

        it('throw generic stripe error if no payment intent response', async () => {
            mockFirstPaymentRequest(errorResponse);
            confirmPaymentMock = jest.fn().mockResolvedValue({});

            stripeUPEJsMock = {
                ...getStripeJsMock(),
                confirmPayment: confirmPaymentMock,
                retrievePaymentIntent: jest.fn(),
            };
            jest.spyOn(stripeScriptLoader, 'getStripeClient').mockImplementation(
                jest.fn(() => Promise.resolve(stripeUPEJsMock)),
            );

            await stripeOCSPaymentStrategy.initialize(stripeOptions);

            await expect(
                stripeOCSPaymentStrategy.execute(getStripeOCSOrderRequestBodyMock()),
            ).rejects.toThrow('throw stripe error');
        });

        it('submit second payment request after stripe confirmation', async () => {
            mockFirstPaymentRequest(errorResponse);
            confirmPaymentMock = jest.fn().mockResolvedValue({
                paymentIntent: {
                    id: 'paymentIntentId',
                    client_secret: 'paymentIntentClientSecret',
                },
            });

            stripeUPEJsMock = {
                ...getStripeJsMock(),
                confirmPayment: confirmPaymentMock,
                retrievePaymentIntent: jest.fn(),
            };
            jest.spyOn(stripeScriptLoader, 'getStripeClient').mockImplementation(
                jest.fn(() => Promise.resolve(stripeUPEJsMock)),
            );

            await stripeOCSPaymentStrategy.initialize(stripeOptions);
            await stripeOCSPaymentStrategy.execute(getStripeOCSOrderRequestBodyMock());

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(2);
            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId,
                paymentData: {
                    formattedPayload: {
                        cart_id: '',
                        credit_card_token: {
                            token: 'clientToken',
                        },
                        confirm: false,
                        payment_method_id: undefined,
                        vault_payment_instrument: false,
                    },
                },
            });
            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId,
                paymentData: {
                    formattedPayload: {
                        cart_id: '',
                        credit_card_token: {
                            token: 'paymentIntentClientSecret',
                        },
                        confirm: false,
                        payment_method_id: undefined,
                        vault_payment_instrument: false,
                    },
                },
            });
        });

        it('submit second payment request with token from submitPayment response error body if PI ID not exists', async () => {
            mockFirstPaymentRequest(errorResponse);
            confirmPaymentMock = jest.fn().mockResolvedValue({
                paymentIntent: {
                    id: '',
                },
            });

            stripeUPEJsMock = {
                ...getStripeJsMock(),
                confirmPayment: confirmPaymentMock,
                retrievePaymentIntent: jest.fn(),
            };
            jest.spyOn(stripeScriptLoader, 'getStripeClient').mockImplementation(
                jest.fn(() => Promise.resolve(stripeUPEJsMock)),
            );

            await stripeOCSPaymentStrategy.initialize(stripeOptions);
            await stripeOCSPaymentStrategy.execute(getStripeOCSOrderRequestBodyMock());

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(2);
            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId,
                paymentData: {
                    formattedPayload: {
                        cart_id: '',
                        credit_card_token: {
                            token: 'clientToken',
                        },
                        confirm: false,
                        payment_method_id: undefined,
                        vault_payment_instrument: false,
                    },
                },
            });
            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId,
                paymentData: {
                    formattedPayload: {
                        cart_id: '',
                        credit_card_token: {
                            token: 'token',
                        },
                        confirm: false,
                        payment_method_id: undefined,
                        vault_payment_instrument: false,
                    },
                },
            });
        });

        it('throws error on second submitPayment request', async () => {
            mockFirstPaymentRequest(errorResponse);
            mockFirstPaymentRequest(new Error('second submitPayment error'));
            confirmPaymentMock = jest.fn().mockResolvedValue({
                paymentIntent: {
                    id: 'paymentIntentId',
                    client_secret: 'paymentIntentClientSecret',
                },
            });

            stripeUPEJsMock = {
                ...getStripeJsMock(),
                confirmPayment: confirmPaymentMock,
                retrievePaymentIntent: jest.fn(),
            };
            jest.spyOn(stripeScriptLoader, 'getStripeClient').mockImplementation(
                jest.fn(() => Promise.resolve(stripeUPEJsMock)),
            );

            await stripeOCSPaymentStrategy.initialize(stripeOptions);

            await expect(
                stripeOCSPaymentStrategy.execute(getStripeOCSOrderRequestBodyMock()),
            ).rejects.toThrow(PaymentMethodFailedError);

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(2);
            expect(
                stripeIntegrationService.throwPaymentConfirmationProceedMessage,
            ).toHaveBeenCalled();
        });
    });

    describe('#vaulted instruments', () => {
        let errorResponse: RequestError;
        let confirmPaymentMock: jest.Mock;
        let retrievePaymentIntentMock: jest.Mock;

        const mockFirstPaymentRequest = (payload: unknown) => {
            jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValueOnce(
                Promise.reject(payload),
            );
        };

        const mockSetupFutureUsage = (payment_method_options?: StripePIPaymentMethodOptions) => {
            confirmPaymentMock = jest.fn().mockResolvedValue({
                paymentIntent: {
                    id: 'paymentIntentId',
                    client_secret: 'paymentIntentClientSecret',
                    payment_method_options,
                },
            });

            stripeUPEJsMock = {
                ...getStripeJsMock(),
                confirmPayment: confirmPaymentMock,
                retrievePaymentIntent: jest.fn(),
            };
            jest.spyOn(stripeScriptLoader, 'getStripeClient').mockImplementation(
                jest.fn(() => Promise.resolve(stripeUPEJsMock)),
            );
        };

        beforeEach(() => {
            jest.spyOn(stripeIntegrationService, 'isAdditionalActionError').mockReturnValue(true);
            jest.spyOn(stripeIntegrationService, 'isPaymentCompleted').mockReturnValue(
                Promise.resolve(false),
            );

            errorResponse = new RequestError(
                getResponse({
                    ...getErrorPaymentResponseBody(),
                    errors: [{ code: 'additional_action_required' }],
                    additional_action_required: {
                        type: 'additional_action_requires_payment_method',
                        data: {
                            redirect_url: 'https://redirect-url.com',
                            token: 'token',
                        },
                    },
                    status: 'error',
                }),
            );

            confirmPaymentMock = jest.fn();
            retrievePaymentIntentMock = jest.fn();

            stripeUPEJsMock = {
                ...getStripeJsMock(),
                confirmPayment: confirmPaymentMock,
                retrievePaymentIntent: retrievePaymentIntentMock,
            };
            jest.spyOn(stripeScriptLoader, 'getStripeClient').mockImplementation(
                jest.fn(() => Promise.resolve(stripeUPEJsMock)),
            );
            mockFirstPaymentRequest(errorResponse);
        });

        it('should not store vaulted instrument if stripe checkbox was not selected', async () => {
            mockSetupFutureUsage();

            await stripeOCSPaymentStrategy.initialize(stripeOptions);
            await stripeOCSPaymentStrategy.execute(getStripeOCSOrderRequestBodyMock());

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(2);
            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId,
                paymentData: {
                    formattedPayload: {
                        cart_id: '',
                        credit_card_token: {
                            token: 'clientToken',
                        },
                        confirm: false,
                        payment_method_id: undefined,
                        vault_payment_instrument: false,
                    },
                },
            });
            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId,
                paymentData: {
                    formattedPayload: {
                        cart_id: '',
                        credit_card_token: {
                            token: 'paymentIntentClientSecret',
                        },
                        confirm: false,
                        payment_method_id: undefined,
                        vault_payment_instrument: false,
                    },
                },
            });
        });

        it('should store vaulted card instrument [on_session]', async () => {
            mockSetupFutureUsage({
                card: {
                    setup_future_usage: StripeInstrumentSetupFutureUsage.ON_SESSION,
                },
            });

            await stripeOCSPaymentStrategy.initialize(stripeOptions);
            await stripeOCSPaymentStrategy.execute(getStripeOCSOrderRequestBodyMock());

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(2);
            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId,
                paymentData: {
                    formattedPayload: {
                        cart_id: '',
                        credit_card_token: {
                            token: 'clientToken',
                        },
                        confirm: false,
                        payment_method_id: undefined,
                        vault_payment_instrument: false,
                    },
                },
            });
            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId,
                paymentData: {
                    formattedPayload: {
                        cart_id: '',
                        credit_card_token: {
                            token: 'paymentIntentClientSecret',
                        },
                        confirm: false,
                        payment_method_id: undefined,
                        vault_payment_instrument: true,
                    },
                },
            });
        });

        it('should store vaulted card instrument [off_session]', async () => {
            mockSetupFutureUsage({
                card: {
                    setup_future_usage: StripeInstrumentSetupFutureUsage.OFF_SESSION,
                },
            });

            await stripeOCSPaymentStrategy.initialize(stripeOptions);
            await stripeOCSPaymentStrategy.execute(getStripeOCSOrderRequestBodyMock());

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(2);
            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId,
                paymentData: {
                    formattedPayload: {
                        cart_id: '',
                        credit_card_token: {
                            token: 'clientToken',
                        },
                        confirm: false,
                        payment_method_id: undefined,
                        vault_payment_instrument: false,
                    },
                },
            });
            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId,
                paymentData: {
                    formattedPayload: {
                        cart_id: '',
                        credit_card_token: {
                            token: 'paymentIntentClientSecret',
                        },
                        confirm: false,
                        payment_method_id: undefined,
                        vault_payment_instrument: true,
                    },
                },
            });
        });

        it('should store vaulted ACH instrument [on_session]', async () => {
            mockSetupFutureUsage({
                us_bank_account: {
                    setup_future_usage: StripeInstrumentSetupFutureUsage.ON_SESSION,
                },
            });

            await stripeOCSPaymentStrategy.initialize(stripeOptions);
            await stripeOCSPaymentStrategy.execute(getStripeOCSOrderRequestBodyMock());

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(2);
            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId,
                paymentData: {
                    formattedPayload: {
                        cart_id: '',
                        credit_card_token: {
                            token: 'clientToken',
                        },
                        confirm: false,
                        payment_method_id: undefined,
                        vault_payment_instrument: false,
                    },
                },
            });
            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId,
                paymentData: {
                    formattedPayload: {
                        cart_id: '',
                        tokenized_ach: {
                            token: 'paymentIntentClientSecret',
                        },
                        confirm: false,
                        payment_method_id: undefined,
                        vault_payment_instrument: true,
                    },
                },
            });
        });

        it('should store vaulted ACH instrument [off_session]', async () => {
            mockSetupFutureUsage({
                us_bank_account: {
                    setup_future_usage: StripeInstrumentSetupFutureUsage.OFF_SESSION,
                },
            });

            await stripeOCSPaymentStrategy.initialize(stripeOptions);
            await stripeOCSPaymentStrategy.execute(getStripeOCSOrderRequestBodyMock());

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(2);
            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId,
                paymentData: {
                    formattedPayload: {
                        cart_id: '',
                        credit_card_token: {
                            token: 'clientToken',
                        },
                        confirm: false,
                        payment_method_id: undefined,
                        vault_payment_instrument: false,
                    },
                },
            });
            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId,
                paymentData: {
                    formattedPayload: {
                        cart_id: '',
                        tokenized_ach: {
                            token: 'paymentIntentClientSecret',
                        },
                        confirm: false,
                        payment_method_id: undefined,
                        vault_payment_instrument: true,
                    },
                },
            });
        });
    });

    describe('#finalize()', () => {
        it('throws an error to inform that order finalization is not required', async () => {
            await expect(stripeOCSPaymentStrategy.finalize()).rejects.toBeInstanceOf(
                OrderFinalizationNotRequiredError,
            );
        });
    });

    describe('#deinitialize()', () => {
        let unmountMock: jest.Mock;
        let destroyMock: jest.Mock;
        let getElementMock: jest.Mock;

        beforeEach(() => {
            unmountMock = jest.fn();
            destroyMock = jest.fn();
            getElementMock = jest.fn().mockImplementation(() => ({
                mount: jest.fn(),
                unmount: unmountMock,
                on: jest.fn((_, callback) => callback(StripeEventMock)),
                update: jest.fn(),
                destroy: destroyMock,
                collapse: jest.fn(),
            }));
        });

        it('deinitializes stripe payment strategy', async () => {
            jest.spyOn(stripeScriptLoader, 'getElements').mockReturnValue(
                Promise.resolve({
                    ...stripeUPEJsMock.elements({}),
                    getElement: getElementMock,
                }),
            );

            await stripeOCSPaymentStrategy.initialize(getStripeOCSInitializeOptionsMock());
            await stripeOCSPaymentStrategy.deinitialize();

            expect(stripeIntegrationService.deinitialize).toHaveBeenCalled();
            expect(unmountMock).toHaveBeenCalled();
            expect(destroyMock).toHaveBeenCalled();
        });

        it('when stripe payment element not initialized', async () => {
            await stripeOCSPaymentStrategy.initialize(getStripeOCSInitializeOptionsMock());

            jest.spyOn(stripeScriptLoader, 'getElements').mockReturnValue(
                Promise.resolve({
                    ...stripeUPEJsMock.elements({}),
                    getElement: () => null,
                }),
            );

            await stripeOCSPaymentStrategy.deinitialize();

            expect(stripeIntegrationService.deinitialize).toHaveBeenCalled();
        });
    });
});
