import { createScriptLoader } from '@bigcommerce/script-loader';

import {
    InvalidArgumentError,
    NotInitializedError,
    OrderFinalizationNotRequiredError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentMethodCancelledError,
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

import StripeOCSPaymentStrategy from './stripe-ocs-payment-strategy';
import {
    StripeElementType,
    StripePaymentMethodType,
    StripeStringConstants,
    StripeUPEClient,
} from './stripe-upe';
import { WithStripeUPEPaymentInitializeOptions } from './stripe-upe-initialize-options';
import StripeUPEIntegrationService from './stripe-upe-integration-service';
import { getStripeUPEIntegrationServiceMock } from './stripe-upe-integration-service.mock';
import StripeUPEScriptLoader from './stripe-upe-script-loader';
import {
    getStripeOCSOrderRequestBodyMock,
    getStripeUPE,
    getStripeUPEInitializeOptionsMock,
    getStripeUPEJsMock,
    StripeEventMock,
} from './stripe-upe.mock';

describe('StripeOCSPaymentStrategy', () => {
    let stripeOCSPaymentStrategy: StripeOCSPaymentStrategy;
    let paymentIntegrationService: PaymentIntegrationService;
    let stripeScriptLoader: StripeUPEScriptLoader;
    let stripeUPEIntegrationService: StripeUPEIntegrationService;
    let stripeOptions: PaymentInitializeOptions & WithStripeUPEPaymentInitializeOptions;
    let stripeUPEJsMock: StripeUPEClient;

    const testColor = '#123456';
    const style = {
        labelText: testColor,
        fieldText: testColor,
        fieldPlaceholderText: testColor,
        fieldErrorText: testColor,
        fieldBackground: testColor,
        fieldInnerShadow: testColor,
        fieldBorder: testColor,
    };

    beforeEach(() => {
        const scriptLoader = createScriptLoader();

        paymentIntegrationService = new PaymentIntegrationServiceMock();
        stripeScriptLoader = new StripeUPEScriptLoader(scriptLoader);
        stripeUPEIntegrationService = getStripeUPEIntegrationServiceMock();
        stripeOCSPaymentStrategy = new StripeOCSPaymentStrategy(
            paymentIntegrationService,
            stripeScriptLoader,
            stripeUPEIntegrationService,
        );

        stripeOptions = getStripeUPEInitializeOptionsMock(StripePaymentMethodType.OCS, style);
        stripeUPEJsMock = getStripeUPEJsMock();

        jest.spyOn(stripeScriptLoader, 'getStripeClient').mockImplementation(
            jest.fn(() => Promise.resolve(stripeUPEJsMock)),
        );
        jest.spyOn(stripeScriptLoader, 'getElements').mockImplementation(jest.fn());
        jest.spyOn(paymentIntegrationService, 'loadPaymentMethod').mockResolvedValue(
            paymentIntegrationService.getState(),
        );
        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            getStripeUPE(),
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
                    stripeupe: undefined,
                }),
            ).rejects.toThrowError(NotInitializedError);
            expect(
                stripeUPEIntegrationService.initCheckoutEventsSubscription,
            ).not.toHaveBeenCalled();
        });

        it('throws error if no container id in stripe options', async () => {
            await expect(
                stripeOCSPaymentStrategy.initialize({
                    ...stripeOptions,
                    stripeupe: {
                        ...stripeOptions.stripeupe,
                        render: jest.fn(),
                        containerId: '',
                    },
                }),
            ).rejects.toThrow(NotInitializedError);
            expect(
                stripeUPEIntegrationService.initCheckoutEventsSubscription,
            ).not.toHaveBeenCalled();
        });

        it('throws error if no gatewayId option', async () => {
            await expect(
                stripeOCSPaymentStrategy.initialize({
                    ...stripeOptions,
                    gatewayId: undefined,
                }),
            ).rejects.toThrow(InvalidArgumentError);
            expect(
                stripeUPEIntegrationService.initCheckoutEventsSubscription,
            ).not.toHaveBeenCalled();
        });

        it('throws error if payment method does not like stripe payment method', async () => {
            const stripePaymentMethod = getStripeUPE();
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
                stripeupe: {
                    containerId: 'containerId',
                    render: jest.fn(),
                    onError: onErrorMock,
                },
            });

            expect(onErrorMock).toHaveBeenCalled();
        });

        it('throws error if payment method does not have clientToken', async () => {
            const stripePaymentMethod = getStripeUPE();
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
                stripeupe: {
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
                stripeupe: {
                    containerId: 'containerId',
                    render: renderMock,
                    onError: onErrorMock,
                },
            });

            expect(stripeScriptLoader.getElements).toHaveBeenCalled();
            expect(onErrorMock).not.toHaveBeenCalled();
            expect(stripeScriptLoader.getStripeClient).toHaveBeenCalled();
            expect(stripeUPEIntegrationService.initCheckoutEventsSubscription).toHaveBeenCalled();
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
                stripeupe: {
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
                },
                layout: {
                    type: 'accordion',
                    defaultCollapsed: false,
                    radios: true,
                    spacedAccordionItems: false,
                    visibleAccordionItemsCount: 0,
                },
            });
            expect(onErrorMock).not.toHaveBeenCalled();
            expect(stripeUPEIntegrationService.mountElement).toHaveBeenCalled();
        });

        it('should initialize if postal code unavailable', async () => {
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
                stripeupe: {
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
                },
                layout: {
                    type: 'accordion',
                    defaultCollapsed: false,
                    radios: true,
                    spacedAccordionItems: false,
                    visibleAccordionItemsCount: 0,
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
                stripeupe: {
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
                stripeupe: {
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
                        gatewayId: 'stripeupe',
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
            expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalledWith('stripeupe', {
                params: {
                    method: 'stripe_ocs',
                },
            });
            expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId: 'stripe_ocs',
                paymentData: {
                    formattedPayload: {
                        cart_id: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
                        credit_card_token: {
                            token: 'clientToken',
                        },
                        confirm: false,
                        payment_method_id: undefined,
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
                stripeupe: {
                    render: jest.fn(),
                    containerId: 'containerId',
                },
            });
            await stripeOCSPaymentStrategy.execute(getStripeOCSOrderRequestBodyMock());

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId: 'stripe_ocs',
                paymentData: {
                    formattedPayload: {
                        cart_id: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
                        credit_card_token: {
                            token: 'clientToken',
                        },
                        confirm: false,
                        payment_method_id: 'card',
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
                stripeupe: {
                    render: jest.fn(),
                    containerId: 'containerId',
                    paymentMethodSelect: paymentMethodSelectMock,
                },
            });
            await stripeOCSPaymentStrategy.execute(getStripeOCSOrderRequestBodyMock());

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId: 'stripe_ocs',
                paymentData: {
                    formattedPayload: {
                        cart_id: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
                        credit_card_token: {
                            token: 'clientToken',
                        },
                        confirm: false,
                        payment_method_id: 'card',
                    },
                },
            });
            expect(paymentMethodSelectMock).toHaveBeenCalledWith('stripeupe-stripe_ocs');
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
                stripeupe: {
                    render: jest.fn(),
                    containerId: 'containerId',
                },
            });
            await stripeOCSPaymentStrategy.execute(getStripeOCSOrderRequestBodyMock());

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId: 'stripe_ocs',
                paymentData: {
                    formattedPayload: {
                        cart_id: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
                        credit_card_token: {
                            token: 'clientToken',
                        },
                        confirm: false,
                        payment_method_id: undefined,
                    },
                },
            });
        });

        it('execute without additional actions without client token', async () => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValueOnce(getStripeUPE());
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValueOnce({
                ...getStripeUPE(),
                clientToken: undefined,
            });

            await stripeOCSPaymentStrategy.initialize(stripeOptions);
            await stripeOCSPaymentStrategy.execute(getStripeOCSOrderRequestBodyMock());

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId: 'stripe_ocs',
                paymentData: {
                    formattedPayload: {
                        cart_id: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
                        credit_card_token: {
                            token: '',
                        },
                        confirm: false,
                        payment_method_id: undefined,
                    },
                },
            });
        });

        it('payment payload without cart', async () => {
            jest.spyOn(paymentIntegrationService.getState(), 'getCart').mockReturnValue(undefined);

            await stripeOCSPaymentStrategy.initialize(stripeOptions);
            await stripeOCSPaymentStrategy.execute(getStripeOCSOrderRequestBodyMock());

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId: 'stripe_ocs',
                paymentData: {
                    formattedPayload: {
                        cart_id: '',
                        credit_card_token: {
                            token: 'clientToken',
                        },
                        confirm: false,
                        payment_method_id: undefined,
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
                methodId: 'stripe_ocs',
                paymentData: {
                    formattedPayload: {
                        cart_id: '',
                        credit_card_token: {
                            token: 'clientToken',
                        },
                        confirm: false,
                        payment_method_id: undefined,
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
            jest.spyOn(stripeUPEIntegrationService, 'isAdditionalActionError').mockReturnValue(
                true,
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
                ...getStripeUPEJsMock(),
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
            jest.spyOn(stripeUPEIntegrationService, 'isAdditionalActionError').mockReturnValue(
                false,
            );

            await stripeOCSPaymentStrategy.initialize(stripeOptions);

            await expect(
                stripeOCSPaymentStrategy.execute(getStripeOCSOrderRequestBodyMock()),
            ).rejects.toThrow(Error);
        });

        it('throws generic error', async () => {
            mockFirstPaymentRequest(errorResponse);
            jest.spyOn(stripeUPEIntegrationService, 'isRedirectAction').mockReturnValue(false);
            jest.spyOn(stripeUPEIntegrationService, 'isOnPageAdditionalAction').mockReturnValue(
                false,
            );
            confirmPaymentMock = jest.fn().mockRejectedValue(new Error('stripe error'));
            retrievePaymentIntentMock = jest.fn().mockResolvedValue({
                paymentIntent: undefined,
            });

            stripeUPEJsMock = {
                ...getStripeUPEJsMock(),
                confirmPayment: confirmPaymentMock,
                retrievePaymentIntent: retrievePaymentIntentMock,
            };
            jest.spyOn(stripeScriptLoader, 'getStripeClient').mockImplementation(
                jest.fn(() => Promise.resolve(stripeUPEJsMock)),
            );

            await stripeOCSPaymentStrategy.initialize(stripeOptions);

            await expect(
                stripeOCSPaymentStrategy.execute(getStripeOCSOrderRequestBodyMock()),
            ).rejects.toThrow(RequestError);

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(1);
            expect(confirmPaymentMock).not.toHaveBeenCalled();
        });

        describe('redirect additional action', () => {
            beforeEach(() => {
                jest.spyOn(stripeUPEIntegrationService, 'isRedirectAction').mockReturnValue(true);
                jest.spyOn(stripeUPEIntegrationService, 'isOnPageAdditionalAction').mockReturnValue(
                    false,
                );
                jest.spyOn(stripeUPEIntegrationService, 'isPaymentCompleted').mockResolvedValue(
                    false,
                );
            });

            it('should skip redirect action if payment already confirmed', async () => {
                const stripeErrorMock = new Error('stripe error');

                mockFirstPaymentRequest(errorResponse);
                confirmPaymentMock = jest.fn().mockResolvedValue({
                    paymentIntent: { status: 'succeeded' },
                    error: stripeErrorMock,
                });

                stripeUPEJsMock = {
                    ...getStripeUPEJsMock(),
                    confirmPayment: confirmPaymentMock,
                };
                jest.spyOn(stripeScriptLoader, 'getStripeClient').mockImplementation(
                    jest.fn(() => Promise.resolve(stripeUPEJsMock)),
                );
                jest.spyOn(stripeUPEIntegrationService, 'isPaymentCompleted').mockResolvedValue(
                    true,
                );
                jest.spyOn(
                    stripeUPEIntegrationService,
                    'throwPaymentConfirmationProceedMessage',
                ).mockImplementation(() => {
                    throw new Error();
                });

                await stripeOCSPaymentStrategy.initialize(stripeOptions);

                await expect(
                    stripeOCSPaymentStrategy.execute(getStripeOCSOrderRequestBodyMock()),
                ).rejects.toThrow(Error);

                expect(
                    stripeUPEIntegrationService.throwPaymentConfirmationProceedMessage,
                ).toHaveBeenCalled();
                expect(confirmPaymentMock).not.toHaveBeenCalled();
                expect(
                    stripeUPEIntegrationService.throwDisplayableStripeError,
                ).not.toHaveBeenCalled();
            });

            it('throws stripe error on confirmation', async () => {
                const stripeErrorMock = new Error('stripe error');

                mockFirstPaymentRequest(errorResponse);
                confirmPaymentMock = jest.fn().mockResolvedValue({
                    paymentIntent: { status: 'succeeded' },
                    error: stripeErrorMock,
                });

                stripeUPEJsMock = {
                    ...getStripeUPEJsMock(),
                    confirmPayment: confirmPaymentMock,
                };
                jest.spyOn(stripeScriptLoader, 'getStripeClient').mockImplementation(
                    jest.fn(() => Promise.resolve(stripeUPEJsMock)),
                );

                await stripeOCSPaymentStrategy.initialize(stripeOptions);

                await expect(
                    stripeOCSPaymentStrategy.execute(getStripeOCSOrderRequestBodyMock()),
                ).rejects.toThrow(Error);

                expect(confirmPaymentMock).toHaveBeenCalled();
                expect(
                    stripeUPEIntegrationService.throwDisplayableStripeError,
                ).toHaveBeenCalledWith(stripeErrorMock);
            });

            it('throws non stripe error on confirmation', async () => {
                const stripeErrorMock = new Error('stripe error');

                mockFirstPaymentRequest(errorResponse);
                confirmPaymentMock = jest.fn().mockResolvedValue({
                    paymentIntent: { status: 'succeeded' },
                    error: stripeErrorMock,
                });

                stripeUPEJsMock = {
                    ...getStripeUPEJsMock(),
                    confirmPayment: confirmPaymentMock,
                };
                jest.spyOn(stripeScriptLoader, 'getStripeClient').mockImplementation(
                    jest.fn(() => Promise.resolve(stripeUPEJsMock)),
                );
                jest.spyOn(
                    stripeUPEIntegrationService,
                    'throwDisplayableStripeError',
                ).mockReturnValue(undefined);

                await stripeOCSPaymentStrategy.initialize(stripeOptions);

                await expect(
                    stripeOCSPaymentStrategy.execute(getStripeOCSOrderRequestBodyMock()),
                ).rejects.toThrow(PaymentMethodFailedError);

                expect(confirmPaymentMock).toHaveBeenCalled();
                expect(
                    stripeUPEIntegrationService.throwDisplayableStripeError,
                ).toHaveBeenCalledWith(stripeErrorMock);
            });

            it('throws error if no confirmation error and no payment intent data', async () => {
                mockFirstPaymentRequest(errorResponse);
                confirmPaymentMock = jest.fn().mockResolvedValue({
                    paymentIntent: undefined,
                });

                stripeUPEJsMock = {
                    ...getStripeUPEJsMock(),
                    confirmPayment: confirmPaymentMock,
                };
                jest.spyOn(stripeScriptLoader, 'getStripeClient').mockImplementation(
                    jest.fn(() => Promise.resolve(stripeUPEJsMock)),
                );

                await stripeOCSPaymentStrategy.initialize(stripeOptions);

                await expect(
                    stripeOCSPaymentStrategy.execute(getStripeOCSOrderRequestBodyMock()),
                ).rejects.toThrow(RequestError);

                expect(confirmPaymentMock).toHaveBeenCalled();
                expect(
                    stripeUPEIntegrationService.throwDisplayableStripeError,
                ).not.toHaveBeenCalled();
            });
        });

        describe('on page additional action', () => {
            beforeEach(() => {
                jest.spyOn(stripeUPEIntegrationService, 'isRedirectAction').mockReturnValue(false);
                jest.spyOn(stripeUPEIntegrationService, 'isOnPageAdditionalAction').mockReturnValue(
                    true,
                );
                jest.spyOn(stripeUPEIntegrationService, 'isPaymentCompleted').mockResolvedValue(
                    false,
                );
            });

            it('throw stripe confirmation error without response data', async () => {
                mockFirstPaymentRequest(errorResponse);
                confirmPaymentMock = jest.fn().mockRejectedValue(new Error('stripe error'));
                retrievePaymentIntentMock = jest.fn().mockRejectedValue(new Error('stripe error'));

                stripeUPEJsMock = {
                    ...getStripeUPEJsMock(),
                    confirmPayment: confirmPaymentMock,
                    retrievePaymentIntent: retrievePaymentIntentMock,
                };
                jest.spyOn(stripeScriptLoader, 'getStripeClient').mockImplementation(
                    jest.fn(() => Promise.resolve(stripeUPEJsMock)),
                );

                await stripeOCSPaymentStrategy.initialize(stripeOptions);
                await stripeOCSPaymentStrategy.execute(getStripeOCSOrderRequestBodyMock());

                expect(confirmPaymentMock).toHaveBeenCalled();
                expect(retrievePaymentIntentMock).toHaveBeenCalled();
                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                    methodId: 'stripe_ocs',
                    paymentData: {
                        formattedPayload: {
                            cart_id: '',
                            credit_card_token: {
                                token: 'clientToken',
                            },
                            confirm: false,
                            payment_method_id: undefined,
                        },
                    },
                });
            });

            it('throw stripe confirmation without error and payment intent', async () => {
                mockFirstPaymentRequest(errorResponse);
                confirmPaymentMock = jest.fn().mockRejectedValue(new Error('stripe error'));
                retrievePaymentIntentMock = jest.fn().mockResolvedValue({
                    paymentIntent: undefined,
                });

                stripeUPEJsMock = {
                    ...getStripeUPEJsMock(),
                    confirmPayment: confirmPaymentMock,
                    retrievePaymentIntent: retrievePaymentIntentMock,
                };
                jest.spyOn(stripeScriptLoader, 'getStripeClient').mockImplementation(
                    jest.fn(() => Promise.resolve(stripeUPEJsMock)),
                );

                await stripeOCSPaymentStrategy.initialize(stripeOptions);

                await expect(
                    stripeOCSPaymentStrategy.execute(getStripeOCSOrderRequestBodyMock())
                ).rejects.toThrow(RequestError);

                expect(confirmPaymentMock).toHaveBeenCalled();
                expect(retrievePaymentIntentMock).toHaveBeenCalled();
                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(1);
            });

            it('throw stripe confirmation without error', async () => {
                mockFirstPaymentRequest(errorResponse);
                confirmPaymentMock = jest.fn().mockRejectedValue(new Error('stripe error'));
                retrievePaymentIntentMock = jest.fn().mockResolvedValue({
                    paymentIntent: { status: 'succeeded' },
                });

                stripeUPEJsMock = {
                    ...getStripeUPEJsMock(),
                    confirmPayment: confirmPaymentMock,
                    retrievePaymentIntent: retrievePaymentIntentMock,
                };
                jest.spyOn(stripeScriptLoader, 'getStripeClient').mockImplementation(
                    jest.fn(() => Promise.resolve(stripeUPEJsMock)),
                );

                await stripeOCSPaymentStrategy.initialize(stripeOptions);
                await stripeOCSPaymentStrategy.execute(getStripeOCSOrderRequestBodyMock());

                expect(confirmPaymentMock).toHaveBeenCalled();
                expect(retrievePaymentIntentMock).toHaveBeenCalled();
                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(2);
            });

            it('throw dispayable stripe confirmation error', async () => {
                mockFirstPaymentRequest(errorResponse);
                confirmPaymentMock = jest.fn().mockResolvedValue({
                    paymentIntent: { status: 'succeeded' },
                    error: new Error('stripe error'),
                });

                stripeUPEJsMock = {
                    ...getStripeUPEJsMock(),
                    confirmPayment: confirmPaymentMock,
                };
                jest.spyOn(stripeScriptLoader, 'getStripeClient').mockImplementation(
                    jest.fn(() => Promise.resolve(stripeUPEJsMock)),
                );

                await stripeOCSPaymentStrategy.initialize(stripeOptions);

                await expect(
                    stripeOCSPaymentStrategy.execute(getStripeOCSOrderRequestBodyMock())
                ).rejects.toThrow(Error);

                expect(confirmPaymentMock).toHaveBeenCalled();
                expect(retrievePaymentIntentMock).not.toHaveBeenCalled();
                expect(stripeUPEIntegrationService.isCancellationError).not.toHaveBeenCalled();
                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(1);
            });

            it('throw cancellation stripe confirmation error', async () => {
                mockFirstPaymentRequest(errorResponse);
                confirmPaymentMock = jest.fn().mockResolvedValue({
                    paymentIntent: { status: 'succeeded' },
                    error: new Error('stripe error'),
                });

                stripeUPEJsMock = {
                    ...getStripeUPEJsMock(),
                    confirmPayment: confirmPaymentMock,
                };
                jest.spyOn(stripeScriptLoader, 'getStripeClient').mockImplementation(
                    jest.fn(() => Promise.resolve(stripeUPEJsMock)),
                );
                jest.spyOn(
                    stripeUPEIntegrationService,
                    'throwDisplayableStripeError',
                ).mockReturnValue(undefined);

                jest.spyOn(stripeUPEIntegrationService, 'isCancellationError').mockReturnValue(
                    true,
                );

                await stripeOCSPaymentStrategy.initialize(stripeOptions);

                await expect(
                    stripeOCSPaymentStrategy.execute(getStripeOCSOrderRequestBodyMock())
                ).rejects.toThrow(PaymentMethodCancelledError);

                expect(confirmPaymentMock).toHaveBeenCalled();
                expect(retrievePaymentIntentMock).not.toHaveBeenCalled();
                expect(stripeUPEIntegrationService.isCancellationError).toHaveBeenCalled();
                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(1);
            });

            it('throw stripe payment method error', async () => {
                mockFirstPaymentRequest(errorResponse);
                confirmPaymentMock = jest.fn().mockResolvedValue({
                    paymentIntent: { status: 'succeeded' },
                    error: new Error('stripe error'),
                });

                stripeUPEJsMock = {
                    ...getStripeUPEJsMock(),
                    confirmPayment: confirmPaymentMock,
                };
                jest.spyOn(stripeScriptLoader, 'getStripeClient').mockImplementation(
                    jest.fn(() => Promise.resolve(stripeUPEJsMock)),
                );
                jest.spyOn(
                    stripeUPEIntegrationService,
                    'throwDisplayableStripeError',
                ).mockReturnValue(undefined);

                jest.spyOn(stripeUPEIntegrationService, 'isCancellationError').mockReturnValue(
                    false,
                );

                await stripeOCSPaymentStrategy.initialize(stripeOptions);

                await expect(
                    stripeOCSPaymentStrategy.execute(getStripeOCSOrderRequestBodyMock())
                ).rejects.toThrow(PaymentMethodFailedError);

                expect(confirmPaymentMock).toHaveBeenCalled();
                expect(retrievePaymentIntentMock).not.toHaveBeenCalled();
                expect(stripeUPEIntegrationService.isCancellationError).toHaveBeenCalled();
                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(1);
            });

            it('submit if confirmation response not contain payment intent', async () => {
                mockFirstPaymentRequest(errorResponse);
                confirmPaymentMock = jest.fn().mockRejectedValue(new Error('stripe error'));
                retrievePaymentIntentMock = jest.fn().mockRejectedValue(new Error('stripe error'));

                stripeUPEJsMock = {
                    ...getStripeUPEJsMock(),
                    confirmPayment: confirmPaymentMock,
                    retrievePaymentIntent: retrievePaymentIntentMock,
                };
                jest.spyOn(stripeScriptLoader, 'getStripeClient').mockImplementation(
                    jest.fn(() => Promise.resolve(stripeUPEJsMock)),
                );
                jest.spyOn(stripeUPEIntegrationService, 'isPaymentCompleted').mockResolvedValue(
                    true,
                );

                await stripeOCSPaymentStrategy.initialize(stripeOptions);
                await stripeOCSPaymentStrategy.execute(getStripeOCSOrderRequestBodyMock());

                expect(confirmPaymentMock).not.toHaveBeenCalled();
                expect(retrievePaymentIntentMock).toHaveBeenCalled();
                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(2);
            });

            it('throw default error if second payment submit fails', async () => {
                mockFirstPaymentRequest(errorResponse);
                confirmPaymentMock = jest.fn().mockResolvedValue({
                    paymentIntent: { status: 'succeeded' },
                });

                stripeUPEJsMock = {
                    ...getStripeUPEJsMock(),
                    confirmPayment: confirmPaymentMock,
                    retrievePaymentIntent: retrievePaymentIntentMock,
                };
                jest.spyOn(stripeScriptLoader, 'getStripeClient').mockImplementation(
                    jest.fn(() => Promise.resolve(stripeUPEJsMock)),
                );
                jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValueOnce(
                    Promise.reject(new Error('error')),
                );
                jest.spyOn(
                    stripeUPEIntegrationService,
                    'throwPaymentConfirmationProceedMessage',
                ).mockImplementation(() => {
                    throw new Error();
                });

                await stripeOCSPaymentStrategy.initialize(stripeOptions);

                await expect(
                    stripeOCSPaymentStrategy.execute(getStripeOCSOrderRequestBodyMock()),
                ).rejects.toThrow(Error);

                expect(confirmPaymentMock).toHaveBeenCalled();
                expect(retrievePaymentIntentMock).not.toHaveBeenCalled();
                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(2);
                expect(
                    stripeUPEIntegrationService.throwPaymentConfirmationProceedMessage,
                ).toHaveBeenCalled();
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
        it('deinitializes stripe payment strategy', async () => {
            const unmountMock = jest.fn();
            const getElementMock = jest.fn().mockImplementation(() => ({
                mount: jest.fn(),
                unmount: unmountMock,
                on: jest.fn((_, callback) => callback(StripeEventMock)),
                update: jest.fn(),
                destroy: jest.fn(),
                collapse: jest.fn(),
            }));

            jest.spyOn(stripeScriptLoader, 'getElements').mockReturnValue(
                Promise.resolve({
                    ...stripeUPEJsMock.elements({}),
                    getElement: getElementMock,
                }),
            );

            await stripeOCSPaymentStrategy.initialize(getStripeUPEInitializeOptionsMock());
            await stripeOCSPaymentStrategy.deinitialize();

            expect(stripeUPEIntegrationService.deinitialize).toHaveBeenCalled();
            expect(unmountMock).toHaveBeenCalled();
        });

        it('when stripe element not initialized', async () => {
            await stripeOCSPaymentStrategy.initialize(getStripeUPEInitializeOptionsMock());

            jest.spyOn(stripeScriptLoader, 'getElements').mockReturnValue(
                Promise.resolve({
                    ...stripeUPEJsMock.elements({}),
                    getElement: () => null,
                }),
            );

            await stripeOCSPaymentStrategy.deinitialize();

            expect(stripeUPEIntegrationService.deinitialize).toHaveBeenCalled();
        });
    });
});
