import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { createAction, createErrorAction } from '@bigcommerce/data-store';
import { createFormPoster, FormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader, createStylesheetLoader } from '@bigcommerce/script-loader';
import { omit } from 'lodash';
import { of, Observable } from 'rxjs';

import { createCheckoutStore, CheckoutRequestSender, CheckoutStore, CheckoutValidator } from '../../../checkout';
import { getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { InvalidArgumentError, MissingDataError, NotInitializedError, RequestError } from '../../../common/error/errors';
import { getResponse } from '../../../common/http-request/responses.mock';
import { FinalizeOrderAction, OrderActionCreator, OrderActionType, OrderRequestSender, SubmitOrderAction } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { getOrderRequestBody } from '../../../order/internal-orders.mock';
import { createSpamProtection, SpamProtectionActionCreator } from '../../../order/spam-protection';
import { PaymentInitializeOptions } from '../../../payment';
import { PaymentArgumentInvalidError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentActionType, SubmitPaymentAction } from '../../payment-actions';
import { getAdyenV2 } from '../../payment-methods.mock';
import PaymentRequestSender from '../../payment-request-sender';
import PaymentRequestTransformer from '../../payment-request-transformer';
import { getErrorPaymentResponseBody, getVaultedInstrument } from '../../payments.mock';

import { AdyenV2PaymentStrategy, AdyenV2ScriptLoader, ThreeDS2ChallengeComponentOptions, ThreeDS2ComponentType, ThreeDS2DeviceFingerprintComponentOptions } from '.';
import { AdyenCardState, AdyenCheckout, AdyenComponent } from './adyenv2';
import { getAdyenCheckout, getAdyenInitializeOptions, getChallengeShopperError, getIdentifyShopperError, getIdentifyShopperErrorResponse, getInvalidCardState, getRedirectShopperError, getValidCardState, getValidChallengeResponse } from './adyenv2.mock';

describe('AdyenV2PaymentStrategy', () => {
    let finalizeOrderAction: Observable<FinalizeOrderAction>;
    let adyenV2ScriptLoader: AdyenV2ScriptLoader;
    let formPoster: FormPoster;
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
            new CheckoutValidator(new CheckoutRequestSender(requestSender)),
            new SpamProtectionActionCreator(createSpamProtection(scriptLoader))
        );

        paymentActionCreator = new PaymentActionCreator(
            new PaymentRequestSender(createPaymentClient()),
            orderActionCreator,
            new PaymentRequestTransformer()
        );

        adyenV2ScriptLoader = new AdyenV2ScriptLoader(scriptLoader, stylesheetLoader);

        formPoster = createFormPoster();
        store = createCheckoutStore(getCheckoutStoreState());

        finalizeOrderAction = of(createAction(OrderActionType.FinalizeOrderRequested));
        submitOrderAction = of(createAction(OrderActionType.SubmitOrderRequested));
        submitPaymentAction = of(createAction(PaymentActionType.SubmitPaymentRequested));

        jest.spyOn(store, 'dispatch');

        jest.spyOn(formPoster, 'postForm')
            .mockImplementation((_url, _data, callback = () => {}) => callback());

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
            formPoster,
            'en_US'
        );
    });

    describe('#initialize()', () => {
        const adyenCheckout = getAdyenCheckout();
        let options: PaymentInitializeOptions;

        beforeEach(() => {
            options = getAdyenInitializeOptions();

            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(getAdyenV2());
        });

        it('loads adyen V2 script', async () => {
            jest.spyOn(adyenV2ScriptLoader, 'load').mockReturnValue(Promise.resolve(adyenCheckout));

            const promise =  strategy.initialize(options);

            expect(adyenV2ScriptLoader.load).toHaveBeenCalled();

            return expect(promise).resolves.toBe(store.getState());
        });

        it('loads adyen V2 script with no storeConfig', async () => {
            jest.spyOn(adyenV2ScriptLoader, 'load').mockReturnValue(Promise.resolve(adyenCheckout));
            jest.spyOn(store.getState().config, 'getStoreConfig').mockReturnValue(undefined);

            const promise =  strategy.initialize(options);

            expect(adyenV2ScriptLoader.load).toHaveBeenCalled();

            return expect(promise).resolves.toBe(store.getState());
        });

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
    });

    describe('#callbacks', () => {
        const adyenCheckout = getAdyenCheckout();
        let options: PaymentInitializeOptions;
        let adyenComponent: AdyenComponent;
        let handleOnChange: (state: AdyenCardState) => {};

        beforeEach(() => {
            options = getAdyenInitializeOptions();

            adyenCheckout.create = jest.fn((_method, options) => {
                const { onChange } = options;
                handleOnChange = onChange;

                return adyenComponent;
            });

            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(getAdyenV2());
        });

        it('fires onChange with valid state', async () => {
            adyenComponent = {
                mount: jest.fn(() => {
                    handleOnChange(getValidCardState());

                    return;
                }),
                unmount: jest.fn(),
            };

            jest.spyOn(adyenV2ScriptLoader, 'load').mockReturnValue(Promise.resolve(adyenCheckout));

            const promise =  strategy.initialize(options);

            return expect(promise).resolves.toBe(store.getState());
        });

        it('fires onChange with invalid state', async () => {
            adyenComponent = {
                mount: jest.fn(() => {
                    handleOnChange(getInvalidCardState());

                    return;
                }),
                unmount: jest.fn(),
            };

            jest.spyOn(adyenV2ScriptLoader, 'load').mockReturnValue(Promise.resolve(adyenCheckout));

            const promise =  strategy.initialize(options);

            return expect(promise).resolves.toBe(store.getState());
        });
    });

    describe('#execute', () => {
        const adyenCheckout: AdyenCheckout = getAdyenCheckout();
        const identifyShopperError = getIdentifyShopperError();
        const challengeShopperError = getChallengeShopperError();
        const redirectShopperError = getRedirectShopperError();
        let adyenComponent: AdyenComponent;
        let componentOptions: ThreeDS2DeviceFingerprintComponentOptions | ThreeDS2ChallengeComponentOptions;
        let options: PaymentInitializeOptions;
        let threeDS2Component: AdyenComponent;

        beforeEach(() => {
            options = getAdyenInitializeOptions();

            threeDS2Component = {
                mount: jest.fn(() => {
                    componentOptions.onComplete({
                        data: {
                            threeDS2Token: 'token',
                        },
                    });

                    return;
                }),
                unmount: jest.fn(),
            };
            adyenComponent = {
                mount: jest.fn(),
                unmount: jest.fn(),
            };

            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(getAdyenV2());
        });

        afterEach(() => {
            jest.resetAllMocks();
        });

        it('submits order without payment data', async () => {
            const payload = getOrderRequestBody();
            const options = { methodId: 'adyenv2' };

            await strategy.execute(payload, options);

            expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(omit(payload, 'payment'), options);
            expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
        });

        it('submits payment with adyen state', async () => {
            let handleOnChange: (state: AdyenCardState) => {};

            adyenComponent = {
                mount: jest.fn(() => {
                    handleOnChange(getValidCardState());

                    return;
                }),
                unmount: jest.fn(),
            };

            jest.spyOn(adyenV2ScriptLoader, 'load').mockReturnValue(Promise.resolve(adyenCheckout));

            jest.spyOn(adyenCheckout, 'create')
                .mockImplementationOnce(jest.fn((_method, options) => {
                    const { onChange } = options;
                    handleOnChange = onChange;

                    return adyenComponent;
                }))
                .mockImplementationOnce(jest.fn((_type, options) => {
                    componentOptions = options;

                    return threeDS2Component;
                }));

            jest.spyOn(adyenV2ScriptLoader, 'load').mockReturnValue(Promise.resolve(adyenCheckout));

            jest.spyOn(paymentActionCreator, 'submitPayment')
                .mockReturnValueOnce(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, challengeShopperError)))
                .mockReturnValueOnce(submitPaymentAction);

            await strategy.initialize(options);
            await strategy.execute(getOrderRequestBody());

            expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
            expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith({
                methodId: 'authorizenet',
                paymentData: {
                    nonce: JSON.stringify(getValidChallengeResponse()),
                },
            });
        });

        it('throws an error when payment is not set properly into payload', () => {
            const payload = {
                payment: undefined,
            };

            expect(() => strategy.execute(payload))
                .toThrow(PaymentArgumentInvalidError);
        });

        it('does not post 3ds data to Adyen if 3ds is not enabled', async () => {
            const response = new RequestError(getResponse(getErrorPaymentResponseBody()));

            jest.spyOn(paymentActionCreator, 'submitPayment')
                .mockReturnValue(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, response)));

            try {
                await strategy.execute(getOrderRequestBody());
            } catch (error) {
                expect(error).toBeInstanceOf(RequestError);
                expect(formPoster.postForm).not.toHaveBeenCalled();
            }
        });

        it('throws error if order is missing', async () => {
            const state = store.getState();

            jest.spyOn(state.order, 'getOrder')
                .mockReturnValue(null);

            try {
                await strategy.finalize();
            } catch (error) {
                expect(error).toBeInstanceOf(OrderFinalizationNotRequiredError);
            }
        });

        it('returns 3DS2 IdentifyShopper flow', async () => {
            jest.spyOn(adyenCheckout, 'create')
                .mockImplementationOnce(jest.fn(() => adyenComponent))
                .mockImplementationOnce(jest.fn((_type, options) => {
                    componentOptions = options;

                    return threeDS2Component;
                }));

            jest.spyOn(adyenV2ScriptLoader, 'load').mockReturnValue(Promise.resolve(adyenCheckout));

            jest.spyOn(paymentActionCreator, 'submitPayment')
                .mockReturnValueOnce(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, identifyShopperError)))
                .mockReturnValueOnce(submitPaymentAction);

            await strategy.initialize(options);
            await strategy.execute(getOrderRequestBody());

            expect(paymentActionCreator.submitPayment).toHaveBeenCalledTimes(2);
            expect(paymentActionCreator.submitPayment).toHaveBeenLastCalledWith({
                methodId: 'authorizenet',
                paymentData: {
                    nonce: JSON.stringify({
                        threeDS2Token: 'token',
                        paymentData: 'paymentData',
                    }),
                },
            });
            expect(adyenCheckout.create).toHaveBeenLastCalledWith(
                ThreeDS2ComponentType.ThreeDS2DeviceFingerprint,
                componentOptions
            );
            expect(adyenCheckout.create).toHaveBeenCalledTimes(2);
        });

        it('returns 3DS2 IdentifyShopper flow and Adyen response onError', async () => {
            threeDS2Component = {
                mount: jest.fn(() => {
                    componentOptions.onError({
                        errorCode: 'errorCode',
                        message: 'errorMessage',
                    });

                    return;
                }),
                unmount: jest.fn(),
            };

            jest.spyOn(adyenCheckout, 'create')
                .mockImplementationOnce(jest.fn(() => adyenComponent))
                .mockImplementationOnce(jest.fn((_type, options) => {
                    componentOptions = options;

                    return threeDS2Component;
                }));

            jest.spyOn(adyenV2ScriptLoader, 'load').mockReturnValue(Promise.resolve(adyenCheckout));

            jest.spyOn(paymentActionCreator, 'submitPayment')
                .mockReturnValueOnce(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, identifyShopperError)))
                .mockReturnValueOnce(submitPaymentAction);

            try {
                await strategy.initialize(options);
                await strategy.execute(getOrderRequestBody());
            } catch (error) {
                expect(error).toEqual({
                    errorCode: 'errorCode',
                    message: 'errorMessage',
                });
            }
        });

        it('returns 3DS2 IdentifyShopper flow and responses ChallengeShopper flow', async () => {
            const threeDS2ChallengeComponent: AdyenComponent = {
                mount: jest.fn(() => {
                    componentOptions.onComplete({
                        data: {
                            threeDS2Token: 'challengeToken',
                        },
                    });

                    return;
                }),
                unmount: jest.fn(),
            };

            jest.spyOn(adyenCheckout, 'create')
                .mockImplementationOnce(jest.fn(() => adyenComponent))
                .mockImplementationOnce(jest.fn((_type, options) => {
                    componentOptions = options;

                    return threeDS2Component;
                }))
                .mockImplementationOnce(jest.fn((_type, options) => {
                    componentOptions = options;

                    return threeDS2ChallengeComponent;
                }));

            jest.spyOn(adyenV2ScriptLoader, 'load').mockReturnValue(Promise.resolve(adyenCheckout));

            jest.spyOn(paymentActionCreator, 'submitPayment')
                .mockReturnValueOnce(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, identifyShopperError)))
                .mockReturnValueOnce(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, challengeShopperError)))
                .mockReturnValueOnce(submitPaymentAction);

            await strategy.initialize(options);
            await strategy.execute(getOrderRequestBody());

            expect(paymentActionCreator.submitPayment).toHaveBeenCalledTimes(3);
            expect(paymentActionCreator.submitPayment).toHaveBeenLastCalledWith({
                methodId: 'authorizenet',
                paymentData: {
                    nonce: JSON.stringify({
                        threeDS2Token: 'challengeToken',
                        paymentData: 'paymentData',
                    }),
                },
            });
            expect(adyenCheckout.create).toHaveBeenLastCalledWith(
                ThreeDS2ComponentType.ThreeDS2Challenge,
                componentOptions
            );
            expect(adyenCheckout.create).toHaveBeenCalledTimes(3);
        });

        it('returns 3DS2 IdentifyShopper flow and after that throws an error when submit payment', async () => {
            jest.spyOn(adyenCheckout, 'create')
                .mockImplementationOnce(jest.fn(() => adyenComponent))
                .mockImplementationOnce(jest.fn((_type, options) => {
                    componentOptions = options;

                    return threeDS2Component;
                }));

            jest.spyOn(adyenV2ScriptLoader, 'load').mockReturnValue(Promise.resolve(adyenCheckout));

            jest.spyOn(paymentActionCreator, 'submitPayment')
                .mockReturnValueOnce(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, identifyShopperError)))
                .mockReturnValueOnce(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, {
                    ...getIdentifyShopperErrorResponse(),
                    body: {
                        three_ds_result: undefined,
                    },
                })));

            try {
                await strategy.initialize(options);
                await strategy.execute(getOrderRequestBody());
            } catch (error) {
                expect(error).toEqual({
                    ...error,
                    body: {
                        three_ds_result: undefined,
                    },
                });
            }
        });

        it('returns 3DS2 IdentifyShopper flow and after that throws a unexpected error when submit payment', async () => {
            const errorUnexpected = new RequestError(getResponse({
                ...getErrorPaymentResponseBody(),
                ...getIdentifyShopperErrorResponse(),
            }));

            jest.spyOn(adyenCheckout, 'create')
                .mockImplementationOnce(jest.fn(() => adyenComponent))
                .mockImplementationOnce(jest.fn((_type, options) => {
                    componentOptions = options;

                    return threeDS2Component;
                }));

            jest.spyOn(adyenV2ScriptLoader, 'load').mockReturnValue(Promise.resolve(adyenCheckout));

            jest.spyOn(paymentActionCreator, 'submitPayment')
                .mockReturnValueOnce(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, identifyShopperError)))
                .mockReturnValueOnce(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, errorUnexpected)));

            try {
                await strategy.initialize(options);
                await strategy.execute(getOrderRequestBody());
            } catch (error) {
                expect(error).toEqual(errorUnexpected);
            }
        });

        it('throws when Adyen JS is not loaded and submitPayment retrieves IdentifyShopper', async () => {
            jest.spyOn(adyenV2ScriptLoader, 'load').mockReturnValue(Promise.resolve(adyenCheckout));

            jest.spyOn(paymentActionCreator, 'submitPayment')
                .mockReturnValueOnce(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, identifyShopperError)));

            const response = strategy.execute(getOrderRequestBody());

            return expect(response).rejects.toThrow(NotInitializedError);
        });

        it('returns 3DS2 ChallengeShopper flow', async () => {
            jest.spyOn(adyenCheckout, 'create')
                .mockImplementationOnce(jest.fn(() => adyenComponent))
                .mockImplementationOnce(jest.fn((_type, options) => {
                    componentOptions = options;

                    return threeDS2Component;
                }));

            jest.spyOn(adyenV2ScriptLoader, 'load').mockReturnValue(Promise.resolve(adyenCheckout));

            jest.spyOn(paymentActionCreator, 'submitPayment')
                .mockReturnValueOnce(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, challengeShopperError)))
                .mockReturnValueOnce(submitPaymentAction);

            await strategy.initialize(options);
            await strategy.execute(getOrderRequestBody());

            expect(paymentActionCreator.submitPayment).toHaveBeenCalledTimes(2);
            expect(paymentActionCreator.submitPayment).toHaveBeenLastCalledWith({
                methodId: 'authorizenet',
                paymentData: {
                    nonce: JSON.stringify({
                        threeDS2Token: 'token',
                        paymentData: 'paymentData',
                    }),
                },
            });
            expect(adyenCheckout.create).toHaveBeenLastCalledWith(
                ThreeDS2ComponentType.ThreeDS2Challenge,
                componentOptions
            );
            expect(adyenCheckout.create).toHaveBeenCalledTimes(2);
        });

        it('returns 3DS2 ChallengeShopper flow and Adyen response onError', async () => {
            threeDS2Component = {
                mount: jest.fn(() => {
                    componentOptions.onError({
                        errorCode: 'errorCode',
                        message: 'errorMessage',
                    });

                    return;
                }),
                unmount: jest.fn(),
            };

            jest.spyOn(adyenCheckout, 'create')
                .mockImplementationOnce(jest.fn(() => adyenComponent))
                .mockImplementationOnce(jest.fn((_type, options) => {
                    componentOptions = options;

                    return threeDS2Component;
                }));

            jest.spyOn(adyenV2ScriptLoader, 'load').mockReturnValue(Promise.resolve(adyenCheckout));

            jest.spyOn(paymentActionCreator, 'submitPayment')
                .mockReturnValueOnce(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, challengeShopperError)))
                .mockReturnValueOnce(submitPaymentAction);

            try {
                await strategy.initialize(options);
                await strategy.execute(getOrderRequestBody());
            } catch (error) {
                expect(error).toEqual({
                    errorCode: 'errorCode',
                    message: 'errorMessage',
                });
            }
        });

        it('throws when Adyen JS is not loaded and submitPayment retrieves ChallengeShopper', async () => {
            jest.spyOn(adyenV2ScriptLoader, 'load').mockReturnValue(Promise.resolve(adyenCheckout));

            jest.spyOn(paymentActionCreator, 'submitPayment')
                .mockReturnValueOnce(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, challengeShopperError)));

            const response = strategy.execute(getOrderRequestBody());

            return expect(response).rejects.toThrow(NotInitializedError);
        });

        it('returns RedirectShopper 3DS Flow', async () => {
            jest.spyOn(paymentActionCreator, 'submitPayment')
                .mockReturnValue(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, redirectShopperError)));

            strategy.execute(getOrderRequestBody());

            await new Promise(resolve => process.nextTick(resolve));

            expect(formPoster.postForm).toHaveBeenCalledWith('https://acs/url', {
                PaReq: 'payer_auth_request',
                TermUrl: 'https://callback/url',
                MD: 'merchant_data',
            });
        });

        it('submits payment with a vaulted instrument', async () => {
            const payload = {
                ...getOrderRequestBody(),
                payment: {
                    methodId: 'adyenv2',
                    paymentData: getVaultedInstrument(),
                },
            };
            const options = { methodId: 'adyenv2' };

            await strategy.execute(payload, options);

            expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(omit(payload, 'payment'), options);
            expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
            expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
            expect(store.dispatch).toHaveBeenCalledWith(submitPaymentAction);
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

            await strategy.initialize(getAdyenInitializeOptions());
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
