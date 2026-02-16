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
    getStripeCheckoutInstanceMock,
    getStripeIntegrationServiceMock,
    getStripeJsMock,
    StripeCheckoutSessionPaymentStatus,
    StripeClient,
    StripeEventMock,
    StripeIntegrationService,
    StripeJsVersion,
    StripeLoadActionsResultType,
    StripeScriptLoader,
    StripeStringConstants,
} from '@bigcommerce/checkout-sdk/stripe-utils';

import { WithStripeOCSPaymentInitializeOptions } from '../stripe-ocs/stripe-ocs-initialize-options';
import {
    getStripeOCSInitializeOptionsMock,
    getStripeOCSMock,
    getStripeOCSOrderRequestBodyMock,
} from '../stripe-ocs/stripe-ocs.mock';

import StripeCSPaymentStrategy from './stripe-cs-payment-strategy';

describe('StripeOCSPaymentStrategy', () => {
    let stripeCSPaymentStrategy: StripeCSPaymentStrategy;
    let paymentIntegrationService: PaymentIntegrationService;
    let stripeScriptLoader: StripeScriptLoader;
    let stripeIntegrationService: StripeIntegrationService;
    let stripeOptions: PaymentInitializeOptions & WithStripeOCSPaymentInitializeOptions;
    let stripeJsMock: StripeClient;

    const methodId = 'checkout_session';
    const gatewayId = 'stripeocs';

    beforeEach(() => {
        const scriptLoader = createScriptLoader();

        paymentIntegrationService = new PaymentIntegrationServiceMock();
        stripeScriptLoader = new StripeScriptLoader(scriptLoader);
        stripeIntegrationService = getStripeIntegrationServiceMock();
        stripeCSPaymentStrategy = new StripeCSPaymentStrategy(
            paymentIntegrationService,
            stripeScriptLoader,
            stripeIntegrationService,
        );

        stripeOptions = getStripeOCSInitializeOptionsMock();
        stripeJsMock = getStripeJsMock();

        jest.spyOn(stripeScriptLoader, 'getStripeClient').mockImplementation(
            jest.fn(() => Promise.resolve(stripeJsMock)),
        );
        jest.spyOn(paymentIntegrationService, 'loadPaymentMethod').mockResolvedValue(
            paymentIntegrationService.getState(),
        );
        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            getStripeOCSMock(),
        );
        jest.spyOn(paymentIntegrationService.getState(), 'getCartLocale').mockReturnValue('en');
        jest.spyOn(stripeScriptLoader, 'getStripeCheckout').mockReturnValue(
            Promise.resolve(stripeJsMock.initCheckout({ clientSecret: 'clientSecret' })),
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('#initialize', () => {
        it('throws error if no stripe initialization options', async () => {
            await expect(
                stripeCSPaymentStrategy.initialize({
                    ...stripeOptions,
                    stripeocs: undefined,
                }),
            ).rejects.toThrow(NotInitializedError);
            expect(stripeIntegrationService.initCheckoutEventsSubscription).not.toHaveBeenCalled();
        });

        it('throws error if no container id in stripe options', async () => {
            await expect(
                stripeCSPaymentStrategy.initialize({
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
                stripeCSPaymentStrategy.initialize({
                    ...stripeOptions,
                    gatewayId: undefined,
                }),
            ).rejects.toThrow(NotInitializedError);
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

            await stripeCSPaymentStrategy.initialize({
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

            await stripeCSPaymentStrategy.initialize({
                ...stripeOptions,
                stripeocs: {
                    containerId: 'containerId',
                    render: jest.fn(),
                    onError: onErrorMock,
                },
            });

            expect(onErrorMock).toHaveBeenCalled();
        });

        it('throws error if stripe payment element not created', async () => {
            const onErrorMock = jest.fn();
            const renderMock = jest.fn();
            const togglePreloaderMock = jest.fn();

            jest.spyOn(stripeScriptLoader, 'getStripeCheckout').mockReturnValue(
                Promise.resolve({
                    ...getStripeCheckoutInstanceMock(),
                    createPaymentElement: jest.fn().mockReturnValue(null),
                }),
            );

            await stripeCSPaymentStrategy.initialize({
                ...stripeOptions,
                stripeocs: {
                    containerId: 'containerId',
                    render: renderMock,
                    onError: onErrorMock,
                    togglePreloader: togglePreloaderMock,
                },
            });

            expect(onErrorMock).toHaveBeenCalled();
            expect(stripeIntegrationService.mountElement).not.toHaveBeenCalled();
        });

        it('should initialize', async () => {
            const onErrorMock = jest.fn();
            const renderMock = jest.fn();
            const togglePreloaderMock = jest.fn();
            const updateEmailMock = jest.fn();

            jest.spyOn(stripeScriptLoader, 'getStripeCheckout').mockReturnValue(
                Promise.resolve({
                    ...getStripeCheckoutInstanceMock(),
                    loadActions: () =>
                        Promise.resolve({
                            type: StripeLoadActionsResultType.SUCCESS,
                            actions: {
                                updateEmail: updateEmailMock,
                                confirm: jest.fn(),
                            },
                        }),
                }),
            );

            await stripeCSPaymentStrategy.initialize({
                ...stripeOptions,
                stripeocs: {
                    containerId: 'containerId',
                    render: renderMock,
                    onError: onErrorMock,
                    togglePreloader: togglePreloaderMock,
                },
            });

            expect(stripeScriptLoader.getStripeCheckout).toHaveBeenCalled();
            expect(onErrorMock).not.toHaveBeenCalled();
            expect(togglePreloaderMock).toHaveBeenCalled();
            expect(stripeScriptLoader.getStripeClient).toHaveBeenCalled();
            expect(stripeIntegrationService.mountElement).toHaveBeenCalled();
            expect(updateEmailMock).toHaveBeenCalledWith('test@bigcommerce.com');
        });

        it('Throws error if no stripe actions loaded', async () => {
            const onErrorMock = jest.fn();
            const renderMock = jest.fn();
            const togglePreloaderMock = jest.fn();

            jest.spyOn(stripeScriptLoader, 'getStripeCheckout').mockReturnValue(
                Promise.resolve({
                    ...getStripeCheckoutInstanceMock(),
                    loadActions: () =>
                        Promise.resolve({
                            type: StripeLoadActionsResultType.ERROR,
                            error: { message: 'stripe actions error' },
                        }),
                }),
            );

            await stripeCSPaymentStrategy.initialize({
                ...stripeOptions,
                stripeocs: {
                    containerId: 'containerId',
                    render: renderMock,
                    onError: onErrorMock,
                    togglePreloader: togglePreloaderMock,
                },
            });

            expect(onErrorMock).toHaveBeenCalled();
            expect(stripeIntegrationService.mountElement).not.toHaveBeenCalled();
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
            jest.spyOn(stripeScriptLoader, 'getStripeCheckout').mockReturnValue(
                Promise.resolve({
                    ...getStripeCheckoutInstanceMock(),
                    createPaymentElement: createMock,
                }),
            );

            await stripeCSPaymentStrategy.initialize({
                ...stripeOptions,
                stripeocs: {
                    ...stripeOptions.stripeocs,
                    containerId: 'containerId',
                    render: renderMock,
                    onError: onErrorMock,
                },
            });

            expect(createMock).toHaveBeenCalledWith({
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
            jest.spyOn(stripeScriptLoader, 'getStripeCheckout').mockReturnValue(
                Promise.resolve({
                    ...getStripeCheckoutInstanceMock(),
                    createPaymentElement: createMock,
                }),
            );

            await stripeCSPaymentStrategy.initialize({
                ...stripeOptions,
                stripeocs: {
                    ...stripeOptions.stripeocs,
                    containerId: 'containerId',
                    render: renderMock,
                    onError: onErrorMock,
                },
            });

            expect(createMock).toHaveBeenCalledWith({
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

            jest.spyOn(stripeScriptLoader, 'getStripeCheckout').mockReturnValue(
                Promise.resolve({
                    ...getStripeCheckoutInstanceMock(),
                    getPaymentElement: createMock,
                }),
            );

            await stripeCSPaymentStrategy.initialize({
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

            await stripeCSPaymentStrategy.initialize({
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
            await stripeCSPaymentStrategy.initialize(stripeOptions);
            await stripeCSPaymentStrategy.initialize(stripeOptions);

            expect(stripeScriptLoader.getStripeClient).toHaveBeenCalledTimes(1);
            expect(stripeScriptLoader.getStripeClient).toHaveBeenCalledWith(
                getStripeOCSMock().initializationData,
                'en',
                StripeJsVersion.CLOVER,
            );
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

            jest.spyOn(stripeScriptLoader, 'getStripeCheckout').mockReturnValue(
                Promise.resolve({
                    ...getStripeCheckoutInstanceMock(),
                    createPaymentElement: createMock,
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

            await stripeCSPaymentStrategy.initialize(stripeOptions);

            expect(createMock).toHaveBeenCalledWith({
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

            jest.spyOn(stripeScriptLoader, 'getStripeCheckout').mockReturnValue(
                Promise.resolve({
                    ...getStripeCheckoutInstanceMock(),
                    createPaymentElement: createMock,
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

            await stripeCSPaymentStrategy.initialize(stripeOptions);

            expect(createMock).toHaveBeenCalledWith({
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
            });
        });
    });

    describe('#finalize()', () => {
        it('throws an error to inform that order finalization is not required', async () => {
            await expect(stripeCSPaymentStrategy.finalize()).rejects.toBeInstanceOf(
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
            jest.spyOn(stripeScriptLoader, 'getStripeCheckout').mockReturnValue(
                Promise.resolve({
                    ...getStripeCheckoutInstanceMock(),
                    getPaymentElement: getElementMock,
                }),
            );

            await stripeCSPaymentStrategy.initialize(getStripeOCSInitializeOptionsMock());
            await stripeCSPaymentStrategy.deinitialize();

            expect(unmountMock).toHaveBeenCalled();
            expect(destroyMock).toHaveBeenCalled();
        });
    });

    describe('#execute()', () => {
        it('throw error if stripe client not initialized', async () => {
            await expect(stripeCSPaymentStrategy.execute({})).rejects.toThrow(NotInitializedError);
        });

        it('throw error if there are no gateway id', async () => {
            await stripeCSPaymentStrategy.initialize(stripeOptions);

            await expect(
                stripeCSPaymentStrategy.execute({
                    payment: {
                        methodId: '',
                        gatewayId: '',
                    },
                }),
            ).rejects.toThrow(InvalidArgumentError);
        });

        it('throw error if there are no method id', async () => {
            await stripeCSPaymentStrategy.initialize(stripeOptions);

            await expect(
                stripeCSPaymentStrategy.execute({
                    payment: {
                        gatewayId,
                        methodId: '',
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

            await stripeCSPaymentStrategy.initialize(stripeOptions);
            await stripeCSPaymentStrategy.execute(getStripeOCSOrderRequestBodyMock(methodId));

            expect(paymentIntegrationService.applyStoreCredit).toHaveBeenCalledWith(true);
        });

        it('execute without additional actions with selected method in accordion', async () => {
            await stripeCSPaymentStrategy.initialize(stripeOptions);
            await stripeCSPaymentStrategy.execute(getStripeOCSOrderRequestBodyMock(methodId));

            expect(paymentIntegrationService.applyStoreCredit).not.toHaveBeenCalled();
            expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalledWith(gatewayId, {
                params: { method: methodId },
            });
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
                        method: undefined,
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

            jest.spyOn(stripeScriptLoader, 'getStripeCheckout').mockReturnValue(
                Promise.resolve({
                    ...getStripeCheckoutInstanceMock(),
                    createPaymentElement: jest.fn(() => createMock()),
                }),
            );

            await stripeCSPaymentStrategy.initialize({
                ...stripeOptions,
                stripeocs: {
                    render: jest.fn(),
                    containerId: 'containerId',
                },
            });
            await stripeCSPaymentStrategy.execute(getStripeOCSOrderRequestBodyMock(methodId));

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId,
                paymentData: {
                    formattedPayload: {
                        cart_id: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
                        credit_card_token: {
                            token: 'clientToken',
                        },
                        confirm: false,
                        method: 'card',
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

            jest.spyOn(stripeScriptLoader, 'getStripeCheckout').mockReturnValue(
                Promise.resolve({
                    ...getStripeCheckoutInstanceMock(),
                    createPaymentElement: jest.fn(() => createMock()),
                }),
            );

            await stripeCSPaymentStrategy.initialize({
                ...stripeOptions,
                methodId,
                stripeocs: {
                    render: jest.fn(),
                    containerId: 'containerId',
                    paymentMethodSelect: paymentMethodSelectMock,
                },
            });
            await stripeCSPaymentStrategy.execute(getStripeOCSOrderRequestBodyMock(methodId));

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId,
                paymentData: {
                    formattedPayload: {
                        cart_id: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
                        credit_card_token: {
                            token: 'clientToken',
                        },
                        confirm: false,
                        method: 'card',
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

            jest.spyOn(stripeScriptLoader, 'getStripeCheckout').mockReturnValue(
                Promise.resolve({
                    ...getStripeCheckoutInstanceMock(),
                    createPaymentElement: jest.fn(() => createMock()),
                }),
            );

            await stripeCSPaymentStrategy.initialize({
                ...stripeOptions,
                stripeocs: {
                    render: jest.fn(),
                    containerId: 'containerId',
                },
            });
            await stripeCSPaymentStrategy.execute(getStripeOCSOrderRequestBodyMock(methodId));

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId,
                paymentData: {
                    formattedPayload: {
                        cart_id: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
                        credit_card_token: {
                            token: 'clientToken',
                        },
                        confirm: false,
                        method: undefined,
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

            await stripeCSPaymentStrategy.initialize(stripeOptions);
            await stripeCSPaymentStrategy.execute(getStripeOCSOrderRequestBodyMock(methodId));

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId,
                paymentData: {
                    formattedPayload: {
                        cart_id: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
                        credit_card_token: {
                            token: '',
                        },
                        confirm: false,
                        method: undefined,
                    },
                },
            });
        });

        it('payment payload without cart', async () => {
            jest.spyOn(paymentIntegrationService.getState(), 'getCart').mockReturnValue(undefined);

            await stripeCSPaymentStrategy.initialize(stripeOptions);
            await stripeCSPaymentStrategy.execute(getStripeOCSOrderRequestBodyMock(methodId));

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId,
                paymentData: {
                    formattedPayload: {
                        cart_id: '',
                        credit_card_token: {
                            token: 'clientToken',
                        },
                        confirm: false,
                        method: undefined,
                    },
                },
            });
        });

        it('payment payload without cart ID', async () => {
            jest.spyOn(paymentIntegrationService.getState(), 'getCart').mockReturnValue({
                ...getCart(),
                id: '',
            });

            await stripeCSPaymentStrategy.initialize(stripeOptions);
            await stripeCSPaymentStrategy.execute(getStripeOCSOrderRequestBodyMock(methodId));

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId,
                paymentData: {
                    formattedPayload: {
                        cart_id: '',
                        credit_card_token: {
                            token: 'clientToken',
                        },
                        confirm: false,
                        method: undefined,
                    },
                },
            });
        });
    });

    describe('#execute, with additional action', () => {
        let errorResponse: RequestError;
        let confirmPaymentMock: jest.Mock;

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

            jest.spyOn(stripeScriptLoader, 'getStripeCheckout').mockReturnValue(
                Promise.resolve({
                    ...getStripeCheckoutInstanceMock(),
                    loadActions: () =>
                        Promise.resolve({
                            type: StripeLoadActionsResultType.SUCCESS,
                            actions: {
                                updateEmail: jest.fn(),
                                confirm: confirmPaymentMock,
                            },
                        }),
                }),
            );
        });

        it('throws not request error', async () => {
            mockFirstPaymentRequest(new Error('Not request'));

            await stripeCSPaymentStrategy.initialize(stripeOptions);

            await expect(
                stripeCSPaymentStrategy.execute(getStripeOCSOrderRequestBodyMock(methodId)),
            ).rejects.toThrow(Error);
        });

        it('throws not additional action error', async () => {
            mockFirstPaymentRequest(errorResponse);
            jest.spyOn(stripeIntegrationService, 'isAdditionalActionError').mockReturnValue(false);

            await stripeCSPaymentStrategy.initialize(stripeOptions);

            await expect(
                stripeCSPaymentStrategy.execute(getStripeOCSOrderRequestBodyMock(methodId)),
            ).rejects.toThrow(Error);
        });

        it('throws not initialized error', async () => {
            jest.spyOn(paymentIntegrationService, 'submitPayment').mockImplementationOnce(() => {
                stripeCSPaymentStrategy.deinitialize();

                return Promise.reject(errorResponse);
            });

            confirmPaymentMock = jest.fn().mockRejectedValue(new Error('stripe error'));

            jest.spyOn(stripeScriptLoader, 'getStripeCheckout').mockReturnValue(
                Promise.resolve({
                    ...getStripeCheckoutInstanceMock(),
                    loadActions: () =>
                        Promise.resolve({
                            type: StripeLoadActionsResultType.SUCCESS,
                            actions: {
                                updateEmail: jest.fn(),
                                confirm: confirmPaymentMock,
                            },
                        }),
                }),
            );

            jest.spyOn(stripeScriptLoader, 'getStripeClient').mockImplementation(
                jest.fn(() => Promise.resolve(stripeJsMock)),
            );

            await stripeCSPaymentStrategy.initialize(stripeOptions);

            await expect(
                stripeCSPaymentStrategy.execute(getStripeOCSOrderRequestBodyMock(methodId)),
            ).rejects.toThrow(NotInitializedError);

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(1);
            expect(confirmPaymentMock).not.toHaveBeenCalled();
        });

        it('throw stripe error', async () => {
            const stripeGenericErrorMock = {
                type: 'cancelation_error',
                message: 'throw stripe error',
            };

            mockFirstPaymentRequest(errorResponse);
            confirmPaymentMock = jest.fn().mockResolvedValue({
                error: stripeGenericErrorMock,
            });

            jest.spyOn(stripeScriptLoader, 'getStripeCheckout').mockReturnValue(
                Promise.resolve({
                    ...getStripeCheckoutInstanceMock(),
                    loadActions: () =>
                        Promise.resolve({
                            type: StripeLoadActionsResultType.SUCCESS,
                            actions: {
                                updateEmail: jest.fn(),
                                confirm: confirmPaymentMock,
                            },
                        }),
                }),
            );

            await stripeCSPaymentStrategy.initialize(stripeOptions);

            await expect(
                stripeCSPaymentStrategy.execute(getStripeOCSOrderRequestBodyMock(methodId)),
            ).rejects.toThrow('throw stripe error');
        });

        it('throw error if confirmation crashed', async () => {
            mockFirstPaymentRequest(errorResponse);
            confirmPaymentMock = jest
                .fn()
                .mockReturnValue(Promise.reject(new Error('stripe confirmation error')));

            jest.spyOn(stripeScriptLoader, 'getStripeCheckout').mockReturnValue(
                Promise.resolve({
                    ...getStripeCheckoutInstanceMock(),
                    loadActions: () =>
                        Promise.resolve({
                            type: StripeLoadActionsResultType.SUCCESS,
                            actions: {
                                updateEmail: jest.fn(),
                                confirm: confirmPaymentMock,
                            },
                        }),
                }),
            );

            await stripeCSPaymentStrategy.initialize(stripeOptions);

            await expect(
                stripeCSPaymentStrategy.execute(getStripeOCSOrderRequestBodyMock(methodId)),
            ).rejects.toThrow('stripe confirmation error');
        });

        it('throw generic stripe error if no checkout session in response', async () => {
            mockFirstPaymentRequest(errorResponse);
            confirmPaymentMock = jest.fn().mockResolvedValue({});

            jest.spyOn(stripeScriptLoader, 'getStripeCheckout').mockReturnValue(
                Promise.resolve({
                    ...getStripeCheckoutInstanceMock(),
                    loadActions: () =>
                        Promise.resolve({
                            type: StripeLoadActionsResultType.SUCCESS,
                            actions: {
                                updateEmail: jest.fn(),
                                confirm: confirmPaymentMock,
                            },
                        }),
                }),
            );

            await stripeCSPaymentStrategy.initialize(stripeOptions);

            await expect(
                stripeCSPaymentStrategy.execute(getStripeOCSOrderRequestBodyMock()),
            ).rejects.toThrow(PaymentMethodFailedError);
        });

        it('submit second payment request after stripe confirmation', async () => {
            mockFirstPaymentRequest(errorResponse);
            confirmPaymentMock = jest.fn().mockResolvedValue({
                session: {
                    id: 'checkoutSessionId',
                },
            });

            jest.spyOn(stripeScriptLoader, 'getStripeCheckout').mockReturnValue(
                Promise.resolve({
                    ...getStripeCheckoutInstanceMock(),
                    loadActions: () =>
                        Promise.resolve({
                            type: StripeLoadActionsResultType.SUCCESS,
                            actions: {
                                updateEmail: jest.fn(),
                                confirm: confirmPaymentMock,
                            },
                        }),
                }),
            );

            await stripeCSPaymentStrategy.initialize(stripeOptions);
            await stripeCSPaymentStrategy.execute(getStripeOCSOrderRequestBodyMock(methodId));

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(2);
            expect(paymentIntegrationService.submitPayment).toHaveBeenNthCalledWith(1, {
                methodId,
                paymentData: {
                    formattedPayload: {
                        cart_id: '',
                        credit_card_token: {
                            token: 'clientToken',
                        },
                        confirm: false,
                        method: undefined,
                    },
                },
            });
            expect(paymentIntegrationService.submitPayment).toHaveBeenNthCalledWith(2, {
                methodId,
                paymentData: {
                    formattedPayload: {
                        cart_id: '',
                        credit_card_token: {
                            token: 'checkoutSessionId',
                        },
                        confirm: false,
                        method: undefined,
                    },
                },
            });
        });

        it('submit second payment request with token from submitPayment response error body if checkout session ID not exists', async () => {
            mockFirstPaymentRequest(errorResponse);
            confirmPaymentMock = jest.fn().mockResolvedValue({
                session: {
                    id: '',
                },
            });

            jest.spyOn(stripeScriptLoader, 'getStripeCheckout').mockReturnValue(
                Promise.resolve({
                    ...getStripeCheckoutInstanceMock(),
                    loadActions: () =>
                        Promise.resolve({
                            type: StripeLoadActionsResultType.SUCCESS,
                            actions: {
                                updateEmail: jest.fn(),
                                confirm: confirmPaymentMock,
                            },
                        }),
                }),
            );

            await stripeCSPaymentStrategy.initialize(stripeOptions);
            await stripeCSPaymentStrategy.execute(getStripeOCSOrderRequestBodyMock(methodId));

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(2);
            expect(paymentIntegrationService.submitPayment).toHaveBeenNthCalledWith(1, {
                methodId,
                paymentData: {
                    formattedPayload: {
                        cart_id: '',
                        credit_card_token: {
                            token: 'clientToken',
                        },
                        confirm: false,
                        method: undefined,
                    },
                },
            });
            expect(paymentIntegrationService.submitPayment).toHaveBeenNthCalledWith(2, {
                methodId,
                paymentData: {
                    formattedPayload: {
                        cart_id: '',
                        credit_card_token: {
                            token: 'token',
                        },
                        confirm: false,
                        method: undefined,
                    },
                },
            });
        });

        it('throws error on second submitPayment request', async () => {
            mockFirstPaymentRequest(errorResponse);
            mockFirstPaymentRequest(new Error('second submitPayment error'));
            confirmPaymentMock = jest.fn().mockResolvedValue({
                session: {
                    id: 'paymentIntentId',
                    status: {
                        paymentStatus: StripeCheckoutSessionPaymentStatus.UnPaid,
                    },
                },
            });

            jest.spyOn(stripeScriptLoader, 'getStripeCheckout').mockReturnValue(
                Promise.resolve({
                    ...getStripeCheckoutInstanceMock(),
                    loadActions: () =>
                        Promise.resolve({
                            type: StripeLoadActionsResultType.SUCCESS,
                            actions: {
                                updateEmail: jest.fn(),
                                confirm: confirmPaymentMock,
                            },
                        }),
                }),
            );

            await stripeCSPaymentStrategy.initialize(stripeOptions);

            await expect(
                stripeCSPaymentStrategy.execute(getStripeOCSOrderRequestBodyMock(methodId)),
            ).rejects.toThrow('second submitPayment error');

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(2);
        });

        it('throws error on second submitPayment request but order already paid on the stripe side', async () => {
            mockFirstPaymentRequest(errorResponse);
            mockFirstPaymentRequest(new Error('second submitPayment error'));
            confirmPaymentMock = jest.fn().mockResolvedValue({
                session: {
                    id: 'paymentIntentId',
                    status: {
                        paymentStatus: StripeCheckoutSessionPaymentStatus.Paid,
                    },
                },
            });

            jest.spyOn(stripeScriptLoader, 'getStripeCheckout').mockReturnValue(
                Promise.resolve({
                    ...getStripeCheckoutInstanceMock(),
                    loadActions: () =>
                        Promise.resolve({
                            type: StripeLoadActionsResultType.SUCCESS,
                            actions: {
                                updateEmail: jest.fn(),
                                confirm: confirmPaymentMock,
                            },
                        }),
                }),
            );

            await stripeCSPaymentStrategy.initialize(stripeOptions);

            await expect(
                stripeCSPaymentStrategy.execute(getStripeOCSOrderRequestBodyMock(methodId)),
            ).rejects.toThrow(PaymentMethodFailedError);

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(2);
            expect(
                stripeIntegrationService.throwPaymentConfirmationProceedMessage,
            ).toHaveBeenCalled();
        });
    });
});
