import { createAction } from '@bigcommerce/data-store';
import { Observable } from 'rxjs';
import { merge, omit } from 'lodash';
import { createCheckoutClient, createCheckoutStore } from '../../checkout';
import { MissingDataError } from '../../common/error/errors';
import { getErrorPaymentResponseBody } from '../payments.mock';
import { getOrderRequestBody, getIncompleteOrder, getSubmittedOrder } from '../../order/internal-orders.mock';
import { getResponse } from '../../common/http-request/responses.mock';
import { FINALIZE_ORDER_REQUESTED } from '../../order/order-action-types';
import { OrderActionCreator } from '../../order';
import { OrderFinalizationNotRequiredError } from '../../order/errors';
import * as paymentStatusTypes from '../payment-status-types';
import SagePayPaymentStrategy from './sage-pay-payment-strategy';

describe('SagePayPaymentStrategy', () => {
    let finalizeOrderAction;
    let formPoster;
    let orderActionCreator;
    let placeOrderService;
    let store;
    let strategy;

    beforeEach(() => {
        orderActionCreator = new OrderActionCreator(createCheckoutClient());
        placeOrderService = {
            submitOrder: jest.fn(() => Promise.resolve(store.getState())),
            submitPayment: jest.fn(() => Promise.resolve(store.getState())),
        };

        formPoster = {
            postForm: jest.fn((url, data, callback = () => {}) => callback()),
        };

        store = createCheckoutStore();

        finalizeOrderAction = Observable.of(createAction(FINALIZE_ORDER_REQUESTED));

        jest.spyOn(store, 'dispatch');

        jest.spyOn(orderActionCreator, 'finalizeOrder')
            .mockReturnValue(finalizeOrderAction);

        strategy = new SagePayPaymentStrategy(store, placeOrderService, orderActionCreator, formPoster);
    });

    it('submits order without payment data', async () => {
        const payload = getOrderRequestBody();
        const options = {};

        await strategy.execute(payload, options);

        expect(placeOrderService.submitOrder).toHaveBeenCalledWith(omit(payload, 'payment'), options);
    });

    it('submits payment separately', async () => {
        const payload = getOrderRequestBody();
        const options = {};

        await strategy.execute(payload, options);

        expect(placeOrderService.submitPayment).toHaveBeenCalledWith(payload.payment, payload.useStoreCredit, options);
    });

    it('returns checkout state', async () => {
        const output = await strategy.execute(getOrderRequestBody());

        expect(output).toEqual(store.getState());
    });

    it('posts 3ds data to Sage if 3ds is enabled', async () => {
        const error = getResponse({
            ...getErrorPaymentResponseBody(),
            errors: [
                { code: 'three_d_secure_required' },
            ],
            three_ds_result: {
                acs_url: 'https://acs/url',
                callback_url: 'https://callback/url',
                payer_auth_request: 'payer_auth_request',
                merchant_data: 'merchant_data',
            },
            status: 'error',
        });

        jest.spyOn(placeOrderService, 'submitPayment').mockReturnValue(Promise.reject(error));

        strategy.execute(getOrderRequestBody());

        await new Promise((resolve) => process.nextTick(resolve));

        expect(formPoster.postForm).toHaveBeenCalledWith('https://acs/url', {
            PaReq: 'payer_auth_request',
            TermUrl: 'https://callback/url',
            MD: 'merchant_data',
        });
    });

    it('does not post 3ds data to Sage if 3ds is not enabled', async () => {
        const state = store.getState();

        jest.spyOn(placeOrderService, 'submitPayment').mockReturnValue(Promise.reject(state));
        jest.spyOn(state.errors, 'getSubmitOrderError').mockReturnValue(getResponse(getErrorPaymentResponseBody()));

        try {
            await strategy.execute(getOrderRequestBody());
        } catch (error) {
            expect(formPoster.postForm).not.toHaveBeenCalled();
        }
    });

    it('finalizes order if order is created and payment is finalized', async () => {
        const { checkout } = store.getState();

        jest.spyOn(checkout, 'getOrder').mockReturnValue(merge({}, getSubmittedOrder(), {
            payment: {
                status: paymentStatusTypes.FINALIZE,
            },
        }));

        await strategy.finalize();

        expect(orderActionCreator.finalizeOrder).toHaveBeenCalled();
        expect(store.dispatch).toHaveBeenCalledWith(finalizeOrderAction);
    });

    it('does not finalize order if order is not created', async () => {
        const { checkout } = store.getState();

        jest.spyOn(checkout, 'getOrder').mockReturnValue(getIncompleteOrder());

        try {
            await strategy.finalize();
        } catch (error) {
            expect(orderActionCreator.finalizeOrder).not.toHaveBeenCalled();
            expect(store.dispatch).not.toHaveBeenCalledWith(finalizeOrderAction);
            expect(error).toBeInstanceOf(OrderFinalizationNotRequiredError);
        }
    });

    it('does not finalize order if order is not finalized', async () => {
        const { checkout } = store.getState();

        jest.spyOn(checkout, 'getOrder').mockReturnValue(merge({}, getSubmittedOrder(), {
            payment: {
                status: paymentStatusTypes.INITIALIZE,
            },
        }));

        try {
            await strategy.finalize();
        } catch (error) {
            expect(orderActionCreator.finalizeOrder).not.toHaveBeenCalled();
            expect(store.dispatch).not.toHaveBeenCalledWith(finalizeOrderAction);
            expect(error).toBeInstanceOf(OrderFinalizationNotRequiredError);
        }
    });

    it('throws error if order is missing', async () => {
        const { checkout } = store.getState();

        jest.spyOn(checkout, 'getOrder').mockReturnValue();

        try {
            await strategy.finalize();
        } catch (error) {
            expect(error).toBeInstanceOf(MissingDataError);
        }
    });
});
