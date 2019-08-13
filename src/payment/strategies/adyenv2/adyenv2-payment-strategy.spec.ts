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
import { InvalidArgumentError, MissingDataError, RequestError } from '../../../common/error/errors';
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
import * as paymentStatusTypes from '../../payment-status-types';
import { getErrorPaymentResponseBody } from '../../payments.mock';

import { AdyenV2PaymentStrategy, AdyenV2ScriptLoader } from '.';
import { AdyenCardState, AdyenCheckout, AdyenComponent, ResultCode } from './adyenv2';
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

            adyenCheckout.create = jest.fn(options => {
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
        let options: PaymentInitializeOptions;
        let adyenCheckout: AdyenCheckout | undefined = getAdyenCheckout();

        beforeEach(() => {
            options = getAdyenInitializeOptions();
            // jest.spyOn(store, 'dispatch').mockReturnValue(Promise.resolve(store.getState()));
            // jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(getAdyenV2());
            // jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod').mockReturnValue(Promise.resolve());
            // jest.spyOn(orderActionCreator, 'submitOrder').mockReturnValue(Promise.resolve());
        });

        it('throws an error when payment is not set properly into payload', () => {
            const payload = {
                payment: undefined,
            };

            expect(() => strategy.execute(payload))
                .toThrow(PaymentArgumentInvalidError);
        });

        it('Returns 3DS2 IndentifyShopper flow', async () => {
            const error = new RequestError(getResponse({
                ...getErrorPaymentResponseBody(),
                errors: [
                    { code: 'three_d_secure_required' },
                ],
                three_ds_result: {
                    result_code: ResultCode.IdentifyShopper,
                },
                status: 'error',
            }));

            jest.spyOn(paymentActionCreator, 'submitPayment')
                .mockReturnValue(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, error)));

            strategy.execute(getOrderRequestBody());

            await new Promise(resolve => process.nextTick(resolve));
        });

        it('Returns 3DS2 ChallengeShopper flow', async () => {
            const error = new RequestError(getResponse({
                ...getErrorPaymentResponseBody(),
                errors: [
                    { code: 'three_d_secure_required' },
                ],
                three_ds_result: {
                    result_code: ResultCode.ChallengeShopper,
                },
                status: 'error',
            }));

            jest.spyOn(paymentActionCreator, 'submitPayment')
                .mockReturnValue(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, error)));

            strategy.execute(getOrderRequestBody());

            await new Promise(resolve => process.nextTick(resolve));
        });

        it('Returns ReedirectShopper 3DS Flow', async () => {
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

    it('submits order without payment data', async () => {
        const payload = getOrderRequestBody();
        const options = { methodId: 'adyenv2' };

        await strategy.execute(payload, options);

        expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(omit(payload, 'payment'), options);
        expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
    });

    // it('submits payment separately', async () => {
    //     const payload = getOrderRequestBody();
    //     const options = { methodId: 'converge' };

    //     await strategy.execute(payload, options);

    //     expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith(payload.payment);
    //     expect(store.dispatch).toHaveBeenCalledWith(submitPaymentAction);
    // });

    it('returns checkout state', async () => {
        const output = await strategy.execute(getOrderRequestBody());

        expect(output).toEqual(store.getState());
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

    // it('finalizes order if order is created and payment is finalized', async () => {
    //     const state = store.getState();

    //     jest.spyOn(state.order, 'getOrder')
    //         .mockReturnValue(getOrder());

    //     jest.spyOn(state.payment, 'getPaymentStatus')
    //         .mockReturnValue(paymentStatusTypes.FINALIZE);

    //     await strategy.finalize();

    //     expect(orderActionCreator.finalizeOrder).toHaveBeenCalled();
    //     expect(store.dispatch).toHaveBeenCalledWith(finalizeOrderAction);
    // });

    it('does not finalize order if order is not created', async () => {
        const state = store.getState();

        jest.spyOn(state.order, 'getOrder')
            .mockReturnValue(null);

        try {
            await strategy.finalize();
        } catch (error) {
            expect(orderActionCreator.finalizeOrder).not.toHaveBeenCalled();
            expect(store.dispatch).not.toHaveBeenCalledWith(finalizeOrderAction);
            expect(error).toBeInstanceOf(OrderFinalizationNotRequiredError);
        }
    });

    it('does not finalize order if order is not finalized', async () => {
        const state = store.getState();

        jest.spyOn(state.payment, 'getPaymentStatus')
            .mockReturnValue(paymentStatusTypes.INITIALIZE);

        try {
            await strategy.finalize();
        } catch (error) {
            expect(orderActionCreator.finalizeOrder).not.toHaveBeenCalled();
            expect(store.dispatch).not.toHaveBeenCalledWith(finalizeOrderAction);
            expect(error).toBeInstanceOf(OrderFinalizationNotRequiredError);
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
});
