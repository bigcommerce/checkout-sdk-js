import {
    MissingDataError,
    NotInitializedError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentMethodCancelledError,
    PaymentMethodFailedError,
    StoreConfig,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getBillingAddress,
    getConfig,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import {
    StripeClient,
    StripeElement,
    StripeElements,
    StripeError,
    StripePaymentMethodType,
} from './stripe';
import StripePaymentInitializeOptions from './stripe-initialize-options';
import StripeIntegrationService from './stripe-integration-service';
import StripeScriptLoader from './stripe-script-loader';
import {
    getStripeInitializeOptionsMock,
    getStripeJsMock,
    getStripeMock,
    WithStripePaymentInitializeOptions,
} from './stripe.mock';

describe('StripeIntegrationService', () => {
    let paymentIntegrationService: PaymentIntegrationService;
    let stripeIntegrationService: StripeIntegrationService;
    let initializeOptions: PaymentInitializeOptions & WithStripePaymentInitializeOptions;
    let stripeupeMock: StripePaymentInitializeOptions;
    let stripeUPEJsMock: StripeClient;
    const gatewayId = 'stripeupe';
    const methodId = StripePaymentMethodType.OCS;
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
    let stripeElementsMock: StripeElements;
    let stripeElementMock: StripeElement;
    let stripeScriptLoader: StripeScriptLoader;

    beforeEach(() => {
        initializeOptions = getStripeInitializeOptionsMock(StripePaymentMethodType.OCS, style);

        if (!initializeOptions.stripeupe) {
            initializeOptions.stripeupe = {
                containerId: 'container',
                render: jest.fn(),
            };
        }

        stripeScriptLoader = {
            updateStripeElements: jest.fn(),
        } as unknown as StripeScriptLoader;
        paymentIntegrationService = new PaymentIntegrationServiceMock();
        stripeIntegrationService = new StripeIntegrationService(
            paymentIntegrationService,
            stripeScriptLoader,
        );
        stripeupeMock = {
            containerId: 'container',
            render: jest.fn(),
        };

        stripeElementMock = {
            mount: jest.fn(),
            destroy: jest.fn(),
            unmount: jest.fn(),
            on: jest.fn(),
            update: jest.fn(),
            collapse: jest.fn(),
        };

        stripeElementsMock = {
            create: jest.fn(),
            getElement: jest.fn(() => stripeElementMock),
            update: jest.fn(),
            fetchUpdates: jest.fn(),
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('#deinitialize', () => {
        it('should clear subscription', () => {
            const subscriptionMock = jest.fn();

            jest.spyOn(paymentIntegrationService, 'subscribe').mockImplementation(
                () => subscriptionMock,
            );

            stripeIntegrationService.initCheckoutEventsSubscription(
                gatewayId,
                methodId,
                stripeupeMock,
                stripeElementsMock,
            );
            stripeIntegrationService.deinitialize();

            expect(subscriptionMock).toHaveBeenCalled();
            // eslint-disable-next-line @typescript-eslint/dot-notation, dot-notation
            expect(stripeIntegrationService['isMounted']).toBe(false);
        });

        it('should not unsibscribe when subscription is not set', () => {
            jest.spyOn(paymentIntegrationService, 'subscribe').mockImplementation(undefined);

            stripeIntegrationService.initCheckoutEventsSubscription(
                gatewayId,
                methodId,
                stripeupeMock,
                stripeElementsMock,
            );
            stripeIntegrationService.deinitialize();

            // eslint-disable-next-line @typescript-eslint/dot-notation, dot-notation
            expect(stripeIntegrationService['checkoutEventsUnsubscribe']).toBeUndefined();
        });
    });

    describe('#initCheckoutEventsSubscription', () => {
        beforeEach(() => {
            const state = paymentIntegrationService.getState();

            jest.spyOn(paymentIntegrationService, 'loadPaymentMethod').mockResolvedValue(state);
            jest.spyOn(paymentIntegrationService, 'subscribe').mockImplementation(
                (subscriber, ...filters) => {
                    subscriber(state);
                    filters.forEach((filter) => filter(state));

                    return jest.fn();
                },
            );
            jest.spyOn(state, 'getPaymentMethodOrThrow').mockReturnValue(getStripeMock());
        });

        it('skip subscription actions if no stripe elements initialized', () => {
            stripeIntegrationService.initCheckoutEventsSubscription(
                gatewayId,
                methodId,
                stripeupeMock,
                undefined,
            );

            expect(paymentIntegrationService.loadPaymentMethod).not.toHaveBeenCalled();
        });

        it('skip subscription actions if no stripe payment element found', () => {
            stripeElementsMock.getElement = () => null;

            stripeIntegrationService.initCheckoutEventsSubscription(
                gatewayId,
                methodId,
                stripeupeMock,
                stripeElementsMock,
            );

            expect(paymentIntegrationService.loadPaymentMethod).not.toHaveBeenCalled();
        });

        it('throws error if loadPaymentMethod fails', async () => {
            stripeupeMock.onError = jest.fn();
            jest.spyOn(paymentIntegrationService, 'loadPaymentMethod').mockRejectedValue(
                new Error(),
            );

            stripeIntegrationService.initCheckoutEventsSubscription(
                gatewayId,
                methodId,
                stripeupeMock,
                stripeElementsMock,
            );

            await new Promise((resolve) => process.nextTick(resolve));

            expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalled();
            expect(stripeupeMock.onError).toHaveBeenCalled();
            expect(stripeElementMock.unmount).not.toHaveBeenCalled();
        });

        it('unmount stripe payment element if loadPaymentMethod fails', async () => {
            jest.spyOn(paymentIntegrationService, 'loadPaymentMethod').mockRejectedValue(
                new Error(),
            );
            jest.spyOn(document, 'getElementById').mockReturnValue(document.createElement('div'));

            stripeIntegrationService.mountElement(stripeElementMock, stripeupeMock.containerId);
            stripeIntegrationService.initCheckoutEventsSubscription(
                gatewayId,
                methodId,
                stripeupeMock,
                stripeElementsMock,
            );

            await new Promise((resolve) => process.nextTick(resolve));

            expect(stripeElementMock.unmount).toHaveBeenCalled();
            // eslint-disable-next-line @typescript-eslint/dot-notation, dot-notation
            expect(stripeIntegrationService['isMounted']).toBe(false);
        });

        it('mount stripe payment element if not mounted', async () => {
            jest.spyOn(document, 'getElementById').mockReturnValue(document.createElement('div'));

            stripeIntegrationService.initCheckoutEventsSubscription(
                gatewayId,
                methodId,
                stripeupeMock,
                stripeElementsMock,
            );

            await new Promise((resolve) => process.nextTick(resolve));

            expect(stripeElementsMock.fetchUpdates).toHaveBeenCalled();
            expect(stripeElementMock.mount).toHaveBeenCalled();
            // eslint-disable-next-line @typescript-eslint/dot-notation, dot-notation
            expect(stripeIntegrationService['isMounted']).toBe(true);
        });

        it('does not mount stripe payment element if already mounted', async () => {
            jest.spyOn(document, 'getElementById').mockReturnValue(document.createElement('div'));

            stripeIntegrationService.mountElement(stripeElementMock, stripeupeMock.containerId);
            stripeIntegrationService.initCheckoutEventsSubscription(
                gatewayId,
                methodId,
                stripeupeMock,
                stripeElementsMock,
            );

            await new Promise((resolve) => process.nextTick(resolve));

            expect(stripeElementsMock.fetchUpdates).not.toHaveBeenCalled();
            expect(stripeElementMock.mount).toHaveBeenCalledTimes(1);
            // eslint-disable-next-line @typescript-eslint/dot-notation, dot-notation
            expect(stripeIntegrationService['isMounted']).toBe(true);
        });
    });

    describe('#mountElement', () => {
        it('should mount stripe element', () => {
            jest.spyOn(document, 'getElementById').mockReturnValue(document.createElement('div'));

            stripeIntegrationService.mountElement(stripeElementMock, stripeupeMock.containerId);

            expect(stripeElementMock.mount).toHaveBeenCalled();
            // eslint-disable-next-line @typescript-eslint/dot-notation, dot-notation
            expect(stripeIntegrationService['isMounted']).toBe(true);
        });

        it('should not mount stripe element if container is not found', () => {
            jest.spyOn(document, 'getElementById').mockReturnValue(null);

            stripeIntegrationService.mountElement(stripeElementMock, stripeupeMock.containerId);

            expect(stripeElementMock.mount).not.toHaveBeenCalled();
            // eslint-disable-next-line @typescript-eslint/dot-notation, dot-notation
            expect(stripeIntegrationService['isMounted']).toBe(false);
        });
    });

    describe('#mapAppearanceVariables', () => {
        it('should map appearance variables', () => {
            expect(stripeIntegrationService.mapAppearanceVariables(style)).toEqual({
                colorPrimary: testColor,
                colorBackground: testColor,
                colorText: testColor,
                colorDanger: testColor,
                colorTextSecondary: testColor,
                colorTextPlaceholder: testColor,
                colorIcon: testColor,
            });
        });
    });

    describe('#mapInputAppearanceRules', () => {
        it('should map appearance variables', () => {
            expect(stripeIntegrationService.mapInputAppearanceRules(style)).toEqual({
                borderColor: testColor,
                color: testColor,
                boxShadow: testColor,
            });
        });
    });

    describe('#throwStripeError', () => {
        it('throws non stripe error', () => {
            try {
                stripeIntegrationService.throwStripeError(new Error('error message'));
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentMethodFailedError);
            }
        });

        it('throws stripe displayable error', () => {
            try {
                stripeIntegrationService.throwStripeError({
                    type: 'invalid_request_error',
                    message: 'error message',
                } as StripeError);
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
                expect((error as Error).message).toBe('error message');
            }
        });

        it('throws stripe cancellation error', () => {
            try {
                stripeIntegrationService.throwStripeError({
                    type: 'non_displayable_type',
                    message: 'error message',
                    payment_intent: {
                        last_payment_error: {
                            message: 'PaymentIntent was canceled.',
                        },
                    },
                } as StripeError);
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentMethodCancelledError);
            }
        });
    });

    describe('#throwDisplayableStripeError', () => {
        it('should throw displayable stripe error', () => {
            try {
                stripeIntegrationService.throwDisplayableStripeError({
                    type: 'invalid_request_error',
                    message: 'error message',
                } as StripeError);
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
                expect((error as Error).message).toBe('error message');
            }
        });

        it('should not throw if it is not stripe error', () => {
            let err;

            try {
                stripeIntegrationService.throwDisplayableStripeError({
                    type: 'any_other_code',
                    message: 'error message',
                } as StripeError);
            } catch (error) {
                err = error;
            } finally {
                expect(err).toBeUndefined();
            }
        });
    });

    describe('#throwPaymentConfirmationProceedMessage', () => {
        it('throw default error', () => {
            try {
                stripeIntegrationService.throwPaymentConfirmationProceedMessage();
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentMethodFailedError);
            }
        });
    });

    describe('#isCancellationError', () => {
        it('should return true if error is cancellation error', () => {
            expect(
                stripeIntegrationService.isCancellationError({
                    type: 'invalid_request_error',
                    message: 'error message',
                    payment_intent: {
                        last_payment_error: {
                            message: 'PaymentIntent was canceled.',
                        },
                    },
                } as StripeError),
            ).toBe(true);
        });

        it('should return false if error is undefined', () => {
            expect(stripeIntegrationService.isCancellationError(undefined)).toBe(false);
        });

        it('should return false if error does not contain last payment error', () => {
            expect(
                stripeIntegrationService.isCancellationError({
                    type: 'invalid_request_error',
                    message: 'error message',
                    payment_intent: {},
                } as StripeError),
            ).toBe(false);
        });

        it('should return false if error in not cancellation error', () => {
            expect(
                stripeIntegrationService.isCancellationError({
                    type: 'invalid_request_error',
                    message: 'error message',
                    payment_intent: {
                        last_payment_error: {
                            message: 'PaymentIntent was finished.',
                        },
                    },
                } as StripeError),
            ).toBe(false);
        });
    });

    describe('#isPaymentCompleted', () => {
        const setConfirmationExperiment = (enabled = true) => {
            const storeConfig: StoreConfig = {
                ...getConfig().storeConfig,
                checkoutSettings: {
                    ...getConfig().storeConfig.checkoutSettings,
                    features: {
                        'PI-626.Block_unnecessary_payment_confirmation_for_StripeUPE': enabled,
                    },
                },
            };

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getStoreConfigOrThrow',
            ).mockReturnValue(storeConfig);
        };

        beforeEach(() => {
            setConfirmationExperiment(true);
            stripeUPEJsMock = {
                ...getStripeJsMock(),
                retrievePaymentIntent: jest.fn().mockResolvedValue({
                    paymentIntent: {
                        status: 'succeeded',
                    },
                }),
            };

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(getStripeMock(StripePaymentMethodType.CreditCard));
        });

        it('returns true if payment intent already completed', async () => {
            expect(
                await stripeIntegrationService.isPaymentCompleted(
                    StripePaymentMethodType.CreditCard,
                    stripeUPEJsMock,
                ),
            ).toBe(true);
        });

        it('returns false if no client token provided', async () => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue({
                ...getStripeMock(StripePaymentMethodType.CreditCard),
                clientToken: undefined,
            });

            expect(
                await stripeIntegrationService.isPaymentCompleted(
                    StripePaymentMethodType.CreditCard,
                    stripeUPEJsMock,
                ),
            ).toBe(false);
        });

        it('returns false if no stripe client', async () => {
            expect(
                await stripeIntegrationService.isPaymentCompleted(
                    StripePaymentMethodType.CreditCard,
                    undefined,
                ),
            ).toBe(false);
        });

        it('returns false if experiment disabled', async () => {
            setConfirmationExperiment(false);

            expect(
                await stripeIntegrationService.isPaymentCompleted(
                    StripePaymentMethodType.CreditCard,
                    stripeUPEJsMock,
                ),
            ).toBe(false);
        });

        it('returns false if no payment intent retrieved', async () => {
            stripeUPEJsMock = {
                ...getStripeJsMock(),
                retrievePaymentIntent: jest.fn().mockResolvedValue({
                    paymentIntent: undefined,
                }),
            };

            expect(
                await stripeIntegrationService.isPaymentCompleted(
                    StripePaymentMethodType.CreditCard,
                    stripeUPEJsMock,
                ),
            ).toBe(false);
        });

        it('returns false if payment status not succeed', async () => {
            stripeUPEJsMock = {
                ...getStripeJsMock(),
                retrievePaymentIntent: jest.fn().mockResolvedValue({
                    paymentIntent: {
                        status: 'failed',
                    },
                }),
            };

            expect(
                await stripeIntegrationService.isPaymentCompleted(
                    StripePaymentMethodType.CreditCard,
                    stripeUPEJsMock,
                ),
            ).toBe(false);
        });
    });

    describe('#mapStripePaymentData', () => {
        beforeEach(() => {
            jest.spyOn(paymentIntegrationService.getState(), 'getBillingAddress').mockReturnValue(
                getBillingAddress(),
            );
        });

        it('throws error if stipe elements does not initialized', () => {
            try {
                stripeIntegrationService.mapStripePaymentData(undefined);
            } catch (error) {
                expect(error).toBeInstanceOf(NotInitializedError);
            }
        });

        it('throws error if billing address not defined', () => {
            jest.spyOn(paymentIntegrationService.getState(), 'getBillingAddress').mockReturnValue(
                undefined,
            );

            try {
                stripeIntegrationService.mapStripePaymentData(stripeElementsMock);
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });

        it('throws error if email not defined', () => {
            jest.spyOn(paymentIntegrationService.getState(), 'getBillingAddress').mockReturnValue({
                ...getBillingAddress(),
                email: undefined,
            });

            try {
                stripeIntegrationService.mapStripePaymentData(stripeElementsMock);
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });

        it('throws error if firstName not defined', () => {
            jest.spyOn(paymentIntegrationService.getState(), 'getBillingAddress').mockReturnValue({
                ...getBillingAddress(),
                firstName: '',
            });

            try {
                stripeIntegrationService.mapStripePaymentData(stripeElementsMock);
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });

        it('throws error if lastName not defined', () => {
            jest.spyOn(paymentIntegrationService.getState(), 'getBillingAddress').mockReturnValue({
                ...getBillingAddress(),
                lastName: '',
            });

            try {
                stripeIntegrationService.mapStripePaymentData(stripeElementsMock);
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });

        it('returns mapped payment data', () => {
            expect(
                stripeIntegrationService.mapStripePaymentData(stripeElementsMock, 'redirect.url'),
            ).toEqual({
                elements: stripeElementsMock,
                redirect: 'if_required',
                confirmParams: {
                    payment_method_data: {
                        billing_details: {
                            email: 'test@bigcommerce.com',
                            address: {
                                city: 'Some City',
                                country: 'US',
                                line1: '12345 Testing Way',
                                line2: '',
                                postal_code: '95555',
                                state: 'CA',
                            },
                            name: 'Test Tester',
                        },
                    },
                    return_url: 'redirect.url',
                },
            });
        });

        it('returns mapped payment data with allow_redisplay: always', () => {
            expect(
                stripeIntegrationService.mapStripePaymentData(
                    stripeElementsMock,
                    'redirect.url',
                    true,
                ),
            ).toEqual({
                elements: stripeElementsMock,
                redirect: 'if_required',
                confirmParams: {
                    payment_method_data: {
                        allow_redisplay: 'always',
                        billing_details: {
                            email: 'test@bigcommerce.com',
                            address: {
                                city: 'Some City',
                                country: 'US',
                                line1: '12345 Testing Way',
                                line2: '',
                                postal_code: '95555',
                                state: 'CA',
                            },
                            name: 'Test Tester',
                        },
                    },
                    return_url: 'redirect.url',
                },
            });
        });

        it('returns mapped payment data without allow_redisplay: always', () => {
            expect(
                stripeIntegrationService.mapStripePaymentData(
                    stripeElementsMock,
                    'redirect.url',
                    false,
                ),
            ).toEqual({
                elements: stripeElementsMock,
                redirect: 'if_required',
                confirmParams: {
                    payment_method_data: {
                        billing_details: {
                            email: 'test@bigcommerce.com',
                            address: {
                                city: 'Some City',
                                country: 'US',
                                line1: '12345 Testing Way',
                                line2: '',
                                postal_code: '95555',
                                state: 'CA',
                            },
                            name: 'Test Tester',
                        },
                    },
                    return_url: 'redirect.url',
                },
            });
        });
    });

    describe('#isAdditionalActionError', () => {
        it('should return true if error is additional action error', () => {
            expect(
                stripeIntegrationService.isAdditionalActionError([
                    { code: 'additional_action_required' },
                ]),
            ).toBe(true);
        });

        it('should return false if error is not additional action error', () => {
            expect(stripeIntegrationService.isAdditionalActionError([])).toBe(false);
        });
    });

    describe('#isRedirectAction', () => {
        it('should return true if additional action is redirect action', () => {
            expect(
                stripeIntegrationService.isRedirectAction({
                    type: 'redirect_to_url',
                    data: { redirect_url: 'url' },
                }),
            ).toBe(true);
        });

        it('should return false if additional action is not redirect action', () => {
            expect(
                stripeIntegrationService.isRedirectAction({
                    type: 'additional_action_requires_payment_method',
                    data: { token: 'token' },
                }),
            ).toBe(false);
        });
    });

    describe('#isOnPageAdditionalAction', () => {
        it('should return true if additional action is on page action', () => {
            expect(
                stripeIntegrationService.isOnPageAdditionalAction({
                    type: 'additional_action_requires_payment_method',
                    data: { token: 'token' },
                }),
            ).toBe(true);
        });

        it('should return false if additional action is not on page action', () => {
            expect(
                stripeIntegrationService.isOnPageAdditionalAction({
                    type: 'redirect_to_url',
                    data: { redirect_url: 'url' },
                }),
            ).toBe(false);
        });
    });

    describe('#updateStripePaymentIntent', () => {
        it('should trigger payment intent update', async () => {
            await stripeIntegrationService.updateStripePaymentIntent(gatewayId, methodId);

            expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalled();
            expect(stripeScriptLoader.updateStripeElements).toHaveBeenCalled();
        });

        it('should not update Stripe Payment Element if no client token provided', async () => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue({
                ...getStripeMock(),
                clientToken: undefined,
            });

            await stripeIntegrationService.updateStripePaymentIntent(gatewayId, methodId);

            expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalled();
            expect(stripeScriptLoader.updateStripeElements).not.toHaveBeenCalled();
        });
    });
});
