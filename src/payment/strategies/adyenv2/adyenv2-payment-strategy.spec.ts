import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { createAction, createErrorAction } from '@bigcommerce/data-store';
import { createFormPoster, FormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { omit } from 'lodash';
import { of, Observable } from 'rxjs';

import { PaymentInitializeOptions } from '../..';
import {
    createCheckoutStore,
    CheckoutRequestSender,
    CheckoutStore,
    CheckoutValidator
} from '../../../checkout';
import { getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import {
    InvalidArgumentError,
    MissingDataError,
    RequestError
} from '../../../common/error/errors';
import { getResponse } from '../../../common/http-request/responses.mock';
import {
    FinalizeOrderAction,
    OrderActionCreator,
    OrderActionType,
    OrderRequestSender,
    SubmitOrderAction
} from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { getOrderRequestBody } from '../../../order/internal-orders.mock';
import { createSpamProtection, SpamProtectionActionCreator } from '../../../order/spam-protection';
import { PaymentArgumentInvalidError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentActionType, SubmitPaymentAction } from '../../payment-actions';
import { getAdyenV2 } from '../../payment-methods.mock';
import PaymentRequestSender from '../../payment-request-sender';
import PaymentRequestTransformer from '../../payment-request-transformer';
import { getErrorPaymentResponseBody } from '../../payments.mock';

import {
    AdyenV2PaymentStrategy,
    AdyenV2ScriptLoader,
    ThreeDS2ChallengeComponentOptions,
    ThreeDS2ComponentType,
    ThreeDS2DeviceFingerprintComponentOptions
} from '.';
import {
    AdyenCardState,
    AdyenCheckout,
    AdyenComponent,
    ResultCode
} from './adyenv2';
import {
    getAdyenCheckout,
    getAdyenInitializeOptions,
    getInvalidCardState,
    getValidCardState
} from './adyenv2.mock';

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

        adyenV2ScriptLoader = new AdyenV2ScriptLoader(scriptLoader);

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
            formPoster
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
            const error = new RequestError(getResponse({
                ...getErrorPaymentResponseBody(),
                errors: [
                    { code: 'three_d_secure_required' },
                ],
                three_ds_result: {
                    result_code: ResultCode.ChallengeShopper,
                    token: 'token',
                    payment_data: 'paymentData',
                },
                status: 'error',
            }));
            let handleOnChange: (state: AdyenCardState) => {};

            options = {
                methodId: 'adyenv2',
                adyenv2: {
                    containerId: 'adyen-component-field',
                    options: {
                        hasHolderName: true,
                        styles: {},
                        placeholders: {},
                    },
                    threeDS2ChallengeWidgetSize: '01',
                },
            };
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
                .mockReturnValueOnce(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, error)))
                .mockReturnValueOnce(submitPaymentAction);

            await strategy.initialize(options);
            await strategy.execute(getOrderRequestBody());

            expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
            const state = {
                ...getValidCardState().data.paymentMethod,
                origin: window.location.origin,
            };
            expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith({
                methodId: 'authorizenet',
                paymentData: {
                    nonce: JSON.stringify(state, null, 2),
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

        it('returns 3DS2 IndentifyShopper flow', async () => {
            const error = new RequestError(getResponse({
                ...getErrorPaymentResponseBody(),
                errors: [
                    { code: 'three_d_secure_required' },
                ],
                three_ds_result: {
                    result_code: ResultCode.IdentifyShopper,
                    token: 'token',
                    payment_data: 'paymentData',
                },
                status: 'error',
            }));

            jest.spyOn(adyenCheckout, 'create')
                .mockImplementationOnce(jest.fn(() => adyenComponent))
                .mockImplementationOnce(jest.fn((_type, options) => {
                    componentOptions = options;

                    return threeDS2Component;
                }));

            jest.spyOn(adyenV2ScriptLoader, 'load').mockReturnValue(Promise.resolve(adyenCheckout));

            jest.spyOn(paymentActionCreator, 'submitPayment')
                .mockReturnValueOnce(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, error)))
                .mockReturnValueOnce(submitPaymentAction);

            await strategy.initialize(options);
            await strategy.execute(getOrderRequestBody());

            expect(paymentActionCreator.submitPayment).toHaveBeenCalledTimes(2);
            expect(paymentActionCreator.submitPayment).toHaveBeenLastCalledWith({
                methodId: 'authorizenet',
                paymentData: {
                    nonce: JSON.stringify({
                        ...{ threeDS2Token: 'token' },
                        paymentData: 'paymentData',
                    }, null, 2),
                },
            });
            expect(adyenCheckout.create).toHaveBeenLastCalledWith(
                ThreeDS2ComponentType.ThreeDS2DeviceFingerprint,
                componentOptions
            );
            expect(adyenCheckout.create).toHaveBeenCalledTimes(2);
        });

        it('returns 3DS2 IndentifyShopper flow and Adyen response onError', async () => {
            const error = new RequestError(getResponse({
                ...getErrorPaymentResponseBody(),
                errors: [
                    { code: 'three_d_secure_required' },
                ],
                three_ds_result: {
                    result_code: ResultCode.IdentifyShopper,
                    token: 'token',
                    payment_data: 'paymentData',
                },
                status: 'error',
            }));

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
                .mockReturnValueOnce(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, error)))
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

        it('returns 3DS2 IndentifyShopper flow and responses ChallengeShopper flow', async () => {
            const error = new RequestError(getResponse({
                ...getErrorPaymentResponseBody(),
                errors: [
                    { code: 'three_d_secure_required' },
                ],
                three_ds_result: {
                    result_code: ResultCode.IdentifyShopper,
                    token: 'token',
                    payment_data: 'paymentData',
                },
                status: 'error',
            }));
            const errorChallenge = new RequestError(getResponse({
                ...getErrorPaymentResponseBody(),
                errors: [
                    { code: 'three_d_secure_required' },
                ],
                three_ds_result: {
                    result_code: ResultCode.ChallengeShopper,
                    token: 'chellengeToken',
                    payment_data: 'paymentData',
                },
                status: 'error',
            }));
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
                .mockReturnValueOnce(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, error)))
                .mockReturnValueOnce(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, errorChallenge)))
                .mockReturnValueOnce(submitPaymentAction);

            await strategy.initialize(options);
            await strategy.execute(getOrderRequestBody());

            expect(paymentActionCreator.submitPayment).toHaveBeenCalledTimes(3);
            expect(paymentActionCreator.submitPayment).toHaveBeenLastCalledWith({
                methodId: 'authorizenet',
                paymentData: {
                    nonce: JSON.stringify({
                        ...{ threeDS2Token: 'challengeToken' },
                        paymentData: 'paymentData',
                    }, null, 2),
                },
            });
            expect(adyenCheckout.create).toHaveBeenLastCalledWith(
                ThreeDS2ComponentType.ThreeDS2Challenge,
                componentOptions
            );
            expect(adyenCheckout.create).toHaveBeenCalledTimes(3);
        });

        it('returns 3DS2 IndentifyShopper flow and after that throws an error when submit payment', async () => {
            const error = new RequestError(getResponse({
                ...getErrorPaymentResponseBody(),
                errors: [
                    { code: 'three_d_secure_required' },
                ],
                three_ds_result: {
                    result_code: ResultCode.IdentifyShopper,
                    token: 'token',
                    payment_data: 'paymentData',
                },
                status: 'error',
            }));

            jest.spyOn(adyenCheckout, 'create')
                .mockImplementationOnce(jest.fn(() => adyenComponent))
                .mockImplementationOnce(jest.fn((_type, options) => {
                    componentOptions = options;

                    return threeDS2Component;
                }));

            jest.spyOn(adyenV2ScriptLoader, 'load').mockReturnValue(Promise.resolve(adyenCheckout));

            jest.spyOn(paymentActionCreator, 'submitPayment')
                .mockReturnValueOnce(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, error)))
                .mockReturnValueOnce(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, {
                    ...error,
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

        it('returns 3DS2 IndentifyShopper flow and after that throws a unexpected error when submit payment', async () => {
            const error = new RequestError(getResponse({
                ...getErrorPaymentResponseBody(),
                errors: [
                    { code: 'three_d_secure_required' },
                ],
                three_ds_result: {
                    result_code: ResultCode.IdentifyShopper,
                    token: 'token',
                    payment_data: 'paymentData',
                },
                status: 'error',
            }));

            const errorUnexpected = new RequestError(getResponse({
                ...getErrorPaymentResponseBody(),
                errors: [
                    { code: 'three_d_secure_required' },
                ],
                three_ds_result: {
                    result_code: ResultCode.IdentifyShopper,
                    token: 'challengeToken',
                    payment_data: 'paymentData',
                },
                status: 'error',
            }));

            jest.spyOn(adyenCheckout, 'create')
                .mockImplementationOnce(jest.fn(() => adyenComponent))
                .mockImplementationOnce(jest.fn((_type, options) => {
                    componentOptions = options;

                    return threeDS2Component;
                }));

            jest.spyOn(adyenV2ScriptLoader, 'load').mockReturnValue(Promise.resolve(adyenCheckout));

            jest.spyOn(paymentActionCreator, 'submitPayment')
                .mockReturnValueOnce(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, error)))
                .mockReturnValueOnce(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, errorUnexpected)));

            try {
                await strategy.initialize(options);
                await strategy.execute(getOrderRequestBody());
            } catch (error) {
                expect(error).toEqual(errorUnexpected);
            }
        });

        it('throws when Adyen JS is not loaded and submitPayment retrieves IdentifyShopper', async () => {
            const error = new RequestError(getResponse({
                ...getErrorPaymentResponseBody(),
                errors: [
                    { code: 'three_d_secure_required' },
                ],
                three_ds_result: {
                    result_code: ResultCode.IdentifyShopper,
                    token: 'token',
                    payment_data: 'paymentData',
                },
                status: 'error',
            }));

            jest.spyOn(adyenV2ScriptLoader, 'load').mockReturnValue(Promise.resolve(adyenCheckout));

            jest.spyOn(paymentActionCreator, 'submitPayment')
                .mockReturnValueOnce(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, error)));

            const response = strategy.execute(getOrderRequestBody());

            return expect(response).rejects.toThrow(MissingDataError);
        });

        it('returns 3DS2 ChallengeShopper flow', async () => {
            const error = new RequestError(getResponse({
                ...getErrorPaymentResponseBody(),
                errors: [
                    { code: 'three_d_secure_required' },
                ],
                three_ds_result: {
                    result_code: ResultCode.ChallengeShopper,
                    token: 'token',
                    payment_data: 'paymentData',
                },
                status: 'error',
            }));

            jest.spyOn(adyenCheckout, 'create')
                .mockImplementationOnce(jest.fn(() => adyenComponent))
                .mockImplementationOnce(jest.fn((_type, options) => {
                    componentOptions = options;

                    return threeDS2Component;
                }));

            jest.spyOn(adyenV2ScriptLoader, 'load').mockReturnValue(Promise.resolve(adyenCheckout));

            jest.spyOn(paymentActionCreator, 'submitPayment')
                .mockReturnValueOnce(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, error)))
                .mockReturnValueOnce(submitPaymentAction);

            await strategy.initialize(options);
            await strategy.execute(getOrderRequestBody());

            expect(paymentActionCreator.submitPayment).toHaveBeenCalledTimes(2);
            expect(paymentActionCreator.submitPayment).toHaveBeenLastCalledWith({
                methodId: 'authorizenet',
                paymentData: {
                    nonce: JSON.stringify({
                        ...{ threeDS2Token: 'token' },
                        paymentData: 'paymentData',
                    }, null, 2),
                },
            });
            expect(adyenCheckout.create).toHaveBeenLastCalledWith(
                ThreeDS2ComponentType.ThreeDS2Challenge,
                componentOptions
            );
            expect(adyenCheckout.create).toHaveBeenCalledTimes(2);
        });

        it('returns 3DS2 ChallengeShopper flow and Adyen response onError', async () => {
            const error = new RequestError(getResponse({
                ...getErrorPaymentResponseBody(),
                errors: [
                    { code: 'three_d_secure_required' },
                ],
                three_ds_result: {
                    result_code: ResultCode.ChallengeShopper,
                    token: 'token',
                    payment_data: 'paymentData',
                },
                status: 'error',
            }));

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
                .mockReturnValueOnce(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, error)))
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
            const error = new RequestError(getResponse({
                ...getErrorPaymentResponseBody(),
                errors: [
                    { code: 'three_d_secure_required' },
                ],
                three_ds_result: {
                    result_code: ResultCode.ChallengeShopper,
                    token: 'token',
                    payment_data: 'paymentData',
                },
                status: 'error',
            }));

            jest.spyOn(adyenV2ScriptLoader, 'load').mockReturnValue(Promise.resolve(adyenCheckout));

            jest.spyOn(paymentActionCreator, 'submitPayment')
                .mockReturnValueOnce(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, error)));

            const response = strategy.execute(getOrderRequestBody());

            return expect(response).rejects.toThrow(MissingDataError);
        });

        it('returns ReedirectShopper 3DS Flow', async () => {
            const error = new RequestError(getResponse({
                ...getErrorPaymentResponseBody(),
                errors: [
                    { code: 'three_d_secure_required' },
                ],
                three_ds_result: {
                    result_code: ResultCode.RedirectShopper,
                    acs_url: 'https://acs/url',
                    callback_url: 'https://callback/url',
                    payer_auth_request: 'payer_auth_request',
                    merchant_data: 'merchant_data',
                },
                status: 'error',
            }));

            jest.spyOn(paymentActionCreator, 'submitPayment')
                .mockReturnValue(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, error)));

            strategy.execute(getOrderRequestBody());

            await new Promise(resolve => process.nextTick(resolve));

            expect(formPoster.postForm).toHaveBeenCalledWith('https://acs/url', {
                PaReq: 'payer_auth_request',
                TermUrl: 'https://callback/url',
                MD: 'merchant_data',
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
        it('deinitializes adyen payment strategy', async () => {
            const adyenCheckout = getAdyenCheckout();
            const adyenComponent = adyenCheckout.create('scheme', {});

            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(getAdyenV2());
            jest.spyOn(adyenV2ScriptLoader, 'load').mockReturnValue(Promise.resolve(adyenCheckout));
            jest.spyOn(adyenCheckout, 'create').mockReturnValue(adyenComponent);

            await strategy.initialize(getAdyenInitializeOptions());
            const promise = strategy.deinitialize();

            expect(adyenComponent.unmount).toHaveBeenCalled();

            return expect(promise).resolves.toBe(store.getState());
        });

        it('does not unmount when adyen component is not available', async () => {
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(getAdyenV2());

            const promise = strategy.deinitialize();

            return expect(promise).resolves.toBe(store.getState());
        });
    });
});
