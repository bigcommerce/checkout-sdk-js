import { createScriptLoader } from '@bigcommerce/script-loader';

import {
    NotInitializedError,
    OrderFinalizationNotRequiredError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';
import {
    getStripeCheckoutSessionMock,
    getStripeIntegrationServiceMock,
    getStripeJsMock,
    StripeClient,
    StripeEventMock,
    StripeIntegrationService,
    StripeJsVersion,
    StripeScriptLoader,
    StripeStringConstants,
} from '@bigcommerce/checkout-sdk/stripe-utils';

import { getStripeOCSInitializeOptionsMock, getStripeOCSMock } from '../stripe-ocs/stripe-ocs.mock';

import { WithStripeCSPaymentInitializeOptions } from './stripe-cs-initialize-options';
import StripeCSPaymentStrategy from './stripe-cs-payment-strategy';

describe('StripeOCSPaymentStrategy', () => {
    let stripeCSPaymentStrategy: StripeCSPaymentStrategy;
    let paymentIntegrationService: PaymentIntegrationService;
    let stripeScriptLoader: StripeScriptLoader;
    let stripeIntegrationService: StripeIntegrationService;
    let stripeOptions: PaymentInitializeOptions & WithStripeCSPaymentInitializeOptions;
    let stripeJsMock: StripeClient;

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
        jest.spyOn(stripeScriptLoader, 'getCheckoutSession').mockReturnValue(
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

        it('should initialize', async () => {
            const onErrorMock = jest.fn();
            const renderMock = jest.fn();
            const togglePreloaderMock = jest.fn();

            await stripeCSPaymentStrategy.initialize({
                ...stripeOptions,
                stripeocs: {
                    containerId: 'containerId',
                    render: renderMock,
                    onError: onErrorMock,
                    togglePreloader: togglePreloaderMock,
                },
            });

            expect(stripeScriptLoader.getCheckoutSession).toHaveBeenCalled();
            expect(onErrorMock).not.toHaveBeenCalled();
            expect(togglePreloaderMock).toHaveBeenCalled();
            expect(stripeScriptLoader.getStripeClient).toHaveBeenCalled();
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
            jest.spyOn(stripeScriptLoader, 'getCheckoutSession').mockReturnValue(
                Promise.resolve({
                    ...getStripeCheckoutSessionMock(),
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
            jest.spyOn(stripeScriptLoader, 'getCheckoutSession').mockReturnValue(
                Promise.resolve({
                    ...getStripeCheckoutSessionMock(),
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

            jest.spyOn(stripeScriptLoader, 'getCheckoutSession').mockReturnValue(
                Promise.resolve({
                    ...getStripeCheckoutSessionMock(),
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

            jest.spyOn(stripeScriptLoader, 'getCheckoutSession').mockReturnValue(
                Promise.resolve({
                    ...getStripeCheckoutSessionMock(),
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

            jest.spyOn(stripeScriptLoader, 'getCheckoutSession').mockReturnValue(
                Promise.resolve({
                    ...getStripeCheckoutSessionMock(),
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
            jest.spyOn(stripeScriptLoader, 'getCheckoutSession').mockReturnValue(
                Promise.resolve({
                    ...getStripeCheckoutSessionMock(),
                    getPaymentElement: getElementMock,
                }),
            );

            await stripeCSPaymentStrategy.initialize(getStripeOCSInitializeOptionsMock());
            await stripeCSPaymentStrategy.deinitialize();

            expect(stripeIntegrationService.deinitialize).toHaveBeenCalled();
            expect(unmountMock).toHaveBeenCalled();
            expect(destroyMock).toHaveBeenCalled();
        });

        it('when stripe payment element not initialized', async () => {
            await stripeCSPaymentStrategy.initialize(getStripeOCSInitializeOptionsMock());

            await stripeCSPaymentStrategy.deinitialize();

            expect(stripeIntegrationService.deinitialize).toHaveBeenCalled();
        });
    });
});
