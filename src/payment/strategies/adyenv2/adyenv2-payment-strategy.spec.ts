import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { createAction, createErrorAction } from '@bigcommerce/data-store';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader, createStylesheetLoader } from '@bigcommerce/script-loader';
import { of, Observable } from 'rxjs';

import { createCheckoutStore, CheckoutRequestSender, CheckoutStore, CheckoutValidator } from '../../../checkout';
import { getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { InvalidArgumentError, MissingDataError, NotInitializedError, RequestError } from '../../../common/error/errors';
import { FinalizeOrderAction, OrderActionCreator, OrderActionType, OrderRequestSender, SubmitOrderAction } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { PaymentInitializeOptions } from '../../../payment';
import { PaymentArgumentInvalidError, PaymentMethodCancelledError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentActionType, SubmitPaymentAction } from '../../payment-actions';
import { getAdyenV2 } from '../../payment-methods.mock';
import PaymentRequestSender from '../../payment-request-sender';
import PaymentRequestTransformer from '../../payment-request-transformer';

import { AdyenAdditionalActionState, AdyenComponentState, AdyenError, AdyenPaymentMethodType, AdyenV2PaymentStrategy, AdyenV2ScriptLoader, ResultCode } from '.';
import { AdyenCheckout, AdyenComponent } from './adyenv2';
import { getAdditionalActionError, getAdyenCheckout, getAdyenError, getComponentState, getInitializeOptions, getInitializeOptionsWithNoCallbacks, getInitializeOptionsWithUndefinedWidgetSize, getOrderRequestBody, getOrderRequestBodyWithoutPayment, getOrderRequestBodyWithVaultedInstrument, getUnknownError } from './adyenv2.mock';

describe('AdyenV2PaymentStrategy', () => {
    let finalizeOrderAction: Observable<FinalizeOrderAction>;
    let adyenV2ScriptLoader: AdyenV2ScriptLoader;
    let orderActionCreator: OrderActionCreator;
    let paymentActionCreator: PaymentActionCreator;
    let store: CheckoutStore;
    let orderRequestSender: OrderRequestSender;
    let strategy: AdyenV2PaymentStrategy;
    let submitOrderAction: Observable<SubmitOrderAction>;
    let submitPaymentAction: Observable<SubmitPaymentAction>;

    beforeEach(() => {
        const scriptLoader = createScriptLoader();
        const stylesheetLoader = createStylesheetLoader();
        const requestSender = createRequestSender();
        orderRequestSender = new OrderRequestSender(requestSender);
        orderActionCreator = new OrderActionCreator(
            orderRequestSender,
            new CheckoutValidator(new CheckoutRequestSender(requestSender))
        );

        paymentActionCreator = new PaymentActionCreator(
            new PaymentRequestSender(createPaymentClient()),
            orderActionCreator,
            new PaymentRequestTransformer()
        );

        adyenV2ScriptLoader = new AdyenV2ScriptLoader(scriptLoader, stylesheetLoader);

        store = createCheckoutStore(getCheckoutStoreState());

        finalizeOrderAction = of(createAction(OrderActionType.FinalizeOrderRequested));
        submitOrderAction = of(createAction(OrderActionType.SubmitOrderRequested));
        submitPaymentAction = of(createAction(PaymentActionType.SubmitPaymentRequested));

        jest.spyOn(store, 'dispatch');

        jest.spyOn(orderActionCreator, 'finalizeOrder')
            .mockReturnValue(finalizeOrderAction);

        jest.spyOn(orderActionCreator, 'submitOrder')
            .mockReturnValue(submitOrderAction);

        jest.spyOn(paymentActionCreator, 'submitPayment')
            .mockReturnValue(submitPaymentAction);

        strategy = new AdyenV2PaymentStrategy(
            store,
            paymentActionCreator,
            orderActionCreator,
            adyenV2ScriptLoader,
            'en_US'
        );
    });

    describe('#Initializes & Executes', () => {
        let options: PaymentInitializeOptions;
        const adyenCheckout: AdyenCheckout = getAdyenCheckout();
        let paymentComponent: AdyenComponent;
        let cardVerificationComponent: AdyenComponent;

        beforeEach(() => {
            let handleOnChange: (componentState: AdyenComponentState) => {};
            let handleOnError: (componentState: AdyenComponentState) => {};

            options = getInitializeOptions();

            paymentComponent = {
                mount: jest.fn(() => {
                    handleOnChange(getComponentState());

                    return;
                }),
                unmount: jest.fn(),
            };

            cardVerificationComponent = {
                mount: jest.fn(() => {
                    handleOnChange(getComponentState());
                    handleOnError(getComponentState(false));

                    return;
                }),
                unmount: jest.fn(),
            };

            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(getAdyenV2());

            jest.spyOn(adyenV2ScriptLoader, 'load').mockReturnValue(Promise.resolve(adyenCheckout));

            jest.spyOn(adyenCheckout, 'create')
                .mockImplementationOnce(jest.fn((_method, options) => {
                    const { onChange } = options;
                    handleOnChange = onChange;

                    return paymentComponent;
                }))
                .mockImplementationOnce(jest.fn((_method, options) => {
                    const { onChange, onError } = options;
                    handleOnChange = onChange;
                    handleOnError = onError;

                    return cardVerificationComponent;
                }));
        });

        afterEach(() => {
            jest.resetAllMocks();
        });

        describe('#initialize()', () => {
            it('does not load adyen V2 if initialization options are not provided', () => {
                options.adyenv2 = undefined;

                expect(() => strategy.initialize(options))
                    .toThrow(InvalidArgumentError);
            });

            it('does not load adyen V2 if paymentMethod is not provided', () => {
                jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(undefined);

                expect(() => strategy.initialize(options))
                    .toThrow(MissingDataError);
            });

            it('does not create adyen card verification component', async () => {
                if (options.adyenv2) {
                    options.adyenv2.cardVerificationContainerId = undefined;
                }

                await strategy.initialize(options);

                expect(adyenCheckout.create).toHaveBeenCalledTimes(1);
            });

            it('does not call adyenCheckout.create when initializing AliPay', async () => {
                jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod')
                    .mockReturnValue(getAdyenV2(AdyenPaymentMethodType.AliPay));

                await strategy.initialize(options);

                expect(adyenCheckout.create).not.toBeCalled();
            });
        });

        describe('#execute', () => {
            const identifyShopperError = getAdditionalActionError(ResultCode.IdentifyShopper);
            const challengeShopperError = getAdditionalActionError(ResultCode.ChallengeShopper);
            let additionalActionComponent: AdyenComponent;

            beforeEach(() => {
                let handleOnAdditionalDetails: (additionalActionState: AdyenAdditionalActionState) => {};

                additionalActionComponent = {
                    mount: jest.fn(() => {
                        handleOnAdditionalDetails({
                            data: {
                                resultCode: ResultCode.ChallengeShopper,
                                action: 'adyenAction',
                            },
                            isValid: true,
                        });

                        return;
                    }),
                    unmount: jest.fn(),
                };

                jest.spyOn(adyenCheckout, 'createFromAction')
                    .mockImplementation(jest.fn((_type, options) => {
                        const { onAdditionalDetails } = options;
                        handleOnAdditionalDetails = onAdditionalDetails;

                        return additionalActionComponent;
                    }));
            });

            it('throws an error when payment is not present',  () => {
                expect(  () =>  strategy.execute(getOrderRequestBodyWithoutPayment()))
                    .toThrow(PaymentArgumentInvalidError);
            });

            it('does not submit payment when trying to pay with invalid component state', async () => {
                const adyenInvalidPaymentComponent = {
                    mount: jest.fn(),
                    unmount: jest.fn(),
                };
                jest.spyOn(adyenCheckout, 'create')
                    .mockReturnValue(adyenInvalidPaymentComponent);

                await strategy.initialize(options);

                await expect(strategy.execute(getOrderRequestBody()))
                    .rejects.toThrow(NotInitializedError);

                expect(paymentActionCreator.submitPayment).toHaveBeenCalledTimes(0);
                expect(adyenCheckout.create).toHaveBeenCalledTimes(2);
            });

            it('calls submitPayment when paying with vaulted instrument', async () => {
                jest.spyOn(paymentActionCreator, 'submitPayment')
                    .mockReturnValueOnce(submitPaymentAction);

                await strategy.initialize(options);
                await strategy.execute(getOrderRequestBodyWithVaultedInstrument());

                expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith(expect.objectContaining({
                    methodId: 'scheme',
                    paymentData: {
                        formattedPayload: {
                            bigpay_token : {
                                credit_card_number_confirmation: 'ENCRYPTED_CARD_NUMBER',
                                token: '123',
                                verification_value: 'ENCRYPTED_CVV',
                                expiry_month: 'ENCRYPTED_EXPIRY_MONTH',
                                expiry_year: 'ENCRYPTED_EXPIRY_YEAR',
                            },
                            browser_info: {
                                color_depth: 24,
                                java_enabled: false,
                                language: 'en-US',
                                screen_height: 0,
                                screen_width: 0,
                                time_zone_offset: expect.anything(),
                            },
                        },
                    },
                }));
                expect(adyenCheckout.create).toHaveBeenCalledTimes(2);
            });

            it('additional action component fires back onError', async () => {
                let additionalActionComponentWithError: AdyenComponent;
                const adyenError = getAdyenError();
                let handleOnError: (error: AdyenError) => {};

                additionalActionComponentWithError = {
                    mount: jest.fn(() => {
                        handleOnError(adyenError);

                        return;
                    }),
                    unmount: jest.fn(),
                };

                jest.spyOn(adyenCheckout, 'createFromAction')
                    .mockImplementation(jest.fn((_type, options) => {
                        const { onError } = options;
                        handleOnError = onError;

                        return additionalActionComponentWithError;
                    }));
                jest.spyOn(paymentActionCreator, 'submitPayment')
                    .mockReturnValueOnce(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, identifyShopperError)));

                await strategy.initialize(options);

                await expect(strategy.execute(getOrderRequestBody()))
                    .rejects.toMatchObject(adyenError);

                expect(paymentActionCreator.submitPayment).toHaveBeenCalledTimes(1);
                expect(adyenCheckout.create).toHaveBeenCalledTimes(2);
                expect(adyenCheckout.createFromAction).toHaveBeenCalledTimes(1);
            });

            it('returns 3DS2 ChallengeShopper flow with default widget size', async () => {
                jest.spyOn(paymentActionCreator, 'submitPayment')
                    .mockReturnValueOnce(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, challengeShopperError)))
                    .mockReturnValueOnce(submitPaymentAction);

                options = getInitializeOptionsWithUndefinedWidgetSize();
                await strategy.initialize(options);
                await strategy.execute(getOrderRequestBody());

                expect(paymentActionCreator.submitPayment).toHaveBeenCalledTimes(2);
                expect(adyenCheckout.create).toHaveBeenCalledTimes(2);
                expect(adyenCheckout.createFromAction).toHaveBeenCalledTimes(1);
            });

            it('returns 3DS2 ChallengeShopper flow with no callbacks', async () => {
                jest.spyOn(paymentActionCreator, 'submitPayment')
                    .mockReturnValueOnce(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, challengeShopperError)))
                    .mockReturnValueOnce(submitPaymentAction);

                options = getInitializeOptionsWithNoCallbacks();
                await strategy.initialize(options);
                await strategy.execute(getOrderRequestBody());

                expect(paymentActionCreator.submitPayment).toHaveBeenCalledTimes(2);
                expect(adyenCheckout.create).toHaveBeenCalledTimes(2);
                expect(adyenCheckout.createFromAction).toHaveBeenCalledTimes(1);
            });

            it('unmounts additional component when payment fails with challengeShopperError', async () => {
                additionalActionComponent = {
                    mount: jest.fn(),
                    unmount: jest.fn(),
                };

                jest.spyOn(paymentActionCreator, 'submitPayment')
                    .mockReturnValueOnce(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, challengeShopperError)));

                const newOptions = {
                    methodId: 'adyenv2',
                    adyenv2: {
                        containerId: 'adyen-scheme-component-field',
                        cardVerificationContainerId: 'adyen-custom-card-component-field',
                        threeDS2ContainerId: 'adyen-scheme-3ds-component-field',
                        options: {
                            hasHolderName: true,
                            styles: {},
                            placeholders: {},
                        },
                        threeDS2Options: {
                            widgetSize: '05',
                            onBeforeLoad: jest.fn(),
                            onComplete: jest.fn(),
                            onLoad: jest.fn(),
                        },
                        additionalActionOptions: {
                            containerId: 'adyen-scheme-additional-action-component-field',
                            onBeforeLoad: jest.fn(),
                            onComplete: jest.fn(),
                            onLoad: jest.fn(func => {
                                func('Cancel');
                            }),
                        },
                    },
                };

                await strategy.initialize(newOptions);

                await expect(strategy.execute(getOrderRequestBody()))
                    .rejects.toThrow(PaymentMethodCancelledError);

                expect(paymentActionCreator.submitPayment).toHaveBeenCalledTimes(1);
                expect(additionalActionComponent.unmount).toHaveBeenCalledTimes(1);
            });

            describe( 'submitPayment fails with identifyShopperError', () => {
                beforeEach(async () => {
                    jest.spyOn(paymentActionCreator, 'submitPayment')
                        .mockReturnValueOnce(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, identifyShopperError)));

                    await strategy.initialize(options);
                });

                it('calls submitPayment when additional action completes', async () => {
                    jest.spyOn(paymentActionCreator, 'submitPayment').mockReturnValueOnce(submitPaymentAction);

                    await strategy.execute(getOrderRequestBody());

                    expect(paymentActionCreator.submitPayment).toHaveBeenCalledTimes(2);
                    expect(adyenCheckout.create).toHaveBeenCalledTimes(2);
                    expect(adyenCheckout.createFromAction).toHaveBeenCalledTimes(1);
                });

                it('returns UNKNOWN_ERROR when submitPayment fails', async () => {
                    jest.spyOn(paymentActionCreator, 'submitPayment')
                        .mockReturnValueOnce(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, getUnknownError())))
                        .mockReturnValueOnce(submitPaymentAction);

                    await expect(strategy.execute(getOrderRequestBody()))
                        .rejects.toThrow(RequestError);

                    expect(paymentActionCreator.submitPayment).toHaveBeenCalledTimes(2);
                    expect(adyenCheckout.create).toHaveBeenCalledTimes(2);
                    expect(adyenCheckout.createFromAction).toHaveBeenCalledTimes(1);
                });

                describe( 'submitPayment fails with challengeShopperError', () => {
                    beforeEach( () => {
                        jest.spyOn(paymentActionCreator, 'submitPayment')
                            .mockReturnValueOnce(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, challengeShopperError)));
                    });

                    it('calls submitPayment when additional action completes', async () => {
                        jest.spyOn(paymentActionCreator, 'submitPayment')
                            .mockReturnValueOnce(submitPaymentAction);

                        await strategy.execute(getOrderRequestBody());

                        expect(paymentActionCreator.submitPayment).toHaveBeenCalledTimes(3);
                        expect(adyenCheckout.create).toHaveBeenCalledTimes(2);
                        expect(adyenCheckout.createFromAction).toHaveBeenCalledTimes(2);
                    });

                    it('returns UNKNOWN_ERROR when submitPayment fails',  async  () => {
                        jest.spyOn(paymentActionCreator, 'submitPayment')
                            .mockReturnValueOnce(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, getUnknownError())));

                        await expect(strategy.execute(getOrderRequestBody()))
                            .rejects.toThrow(RequestError);

                        expect(paymentActionCreator.submitPayment).toHaveBeenCalledTimes(3);
                        expect(adyenCheckout.create).toHaveBeenCalledTimes(2);
                        expect(adyenCheckout.createFromAction).toHaveBeenCalledTimes(2);
                    });
                });
            });

            describe( 'submitPayment fails with challengeShopperError', () => {
                beforeEach(async () => {
                    jest.spyOn(paymentActionCreator, 'submitPayment')
                        .mockReturnValueOnce(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, challengeShopperError)));

                    await strategy.initialize(options);
                });

                it('calls submitPayment when additional action completes', async () => {
                    jest.spyOn(paymentActionCreator, 'submitPayment').mockReturnValueOnce(submitPaymentAction);

                    await strategy.execute(getOrderRequestBody());

                    expect(paymentActionCreator.submitPayment).toHaveBeenCalledTimes(2);
                    expect(adyenCheckout.create).toHaveBeenCalledTimes(2);
                    expect(adyenCheckout.createFromAction).toHaveBeenCalledTimes(1);
                });

                it('returns UNKNOWN_ERROR when submitPayment fails', async () => {
                    jest.spyOn(paymentActionCreator, 'submitPayment')
                        .mockReturnValueOnce(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, getUnknownError())))
                        .mockReturnValueOnce(submitPaymentAction);

                    await expect(strategy.execute(getOrderRequestBody()))
                        .rejects.toThrow(RequestError);

                    expect(paymentActionCreator.submitPayment).toHaveBeenCalledTimes(2);
                    expect(adyenCheckout.create).toHaveBeenCalledTimes(2);
                    expect(adyenCheckout.createFromAction).toHaveBeenCalledTimes(1);
                });
            });
        });
    });

    describe('#finalize()', () => {
        it('throws an error to inform that order finalization is not required', async () => {
            const promise = strategy.finalize();

            return expect(promise).rejects.toBeInstanceOf(OrderFinalizationNotRequiredError);
        });
    });

    describe('#deinitialize', () => {
        beforeEach(() => {
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(getAdyenV2());
        });

        it('deinitialize adyen payment strategy', async () => {
            const adyenCheckout = getAdyenCheckout();
            const adyenComponent = adyenCheckout.create('scheme', {});

            jest.spyOn(adyenV2ScriptLoader, 'load').mockReturnValue(Promise.resolve(adyenCheckout));
            jest.spyOn(adyenCheckout, 'create').mockReturnValue(adyenComponent);

            await strategy.initialize(getInitializeOptions());
            const promise = strategy.deinitialize();

            expect(adyenComponent.unmount).toHaveBeenCalled();

            return expect(promise).resolves.toBe(store.getState());
        });

        it('does not unmount when adyen component is not available', async () => {
            const promise = strategy.deinitialize();

            return expect(promise).resolves.toBe(store.getState());
        });
    });
});
