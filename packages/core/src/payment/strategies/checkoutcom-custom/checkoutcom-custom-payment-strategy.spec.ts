import { createAction } from '@bigcommerce/data-store';
import { merge } from 'lodash';
import { Observable, of } from 'rxjs';

import { CheckoutStore, createCheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import RequestError from '../../../common/error/errors/request-error';
import { getResponse } from '../../../common/http-request/responses.mock';
import { HostedFieldType, HostedForm, HostedFormFactory } from '../../../hosted-form';
import {
    FinalizeOrderAction,
    LoadOrderSucceededAction,
    OrderActionCreator,
    OrderActionType,
    SubmitOrderAction,
} from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { getOrderRequestBody } from '../../../order/internal-orders.mock';
import { getOrder } from '../../../order/orders.mock';
import PaymentActionCreator from '../../payment-action-creator';
import { getPaymentMethod } from '../../payment-methods.mock';
import { PaymentInitializeOptions } from '../../payment-request-options';
import * as paymentStatusTypes from '../../payment-status-types';
import { getErrorPaymentResponseBody } from '../../payments.mock';
import CreditCardPaymentStrategy from '../credit-card/credit-card-payment-strategy';

import CheckoutcomCustomPaymentStrategy from './checkoutcom-custom-payment-strategy';

describe('CheckoutcomCustomPaymentStrategy', () => {
    let strategy: CheckoutcomCustomPaymentStrategy;
    let store: CheckoutStore;
    let submitOrderAction: Observable<SubmitOrderAction>;
    let loadOrderAction: Observable<LoadOrderSucceededAction>;
    let finalizeOrderAction: Observable<FinalizeOrderAction>;
    let orderActionCreator: OrderActionCreator;
    let paymentActionCreator: PaymentActionCreator;
    let hostedFormFactory: HostedFormFactory;

    beforeEach(() => {
        store = createCheckoutStore();

        jest.spyOn(store, 'dispatch');

        submitOrderAction = of(createAction(OrderActionType.SubmitOrderRequested));
        loadOrderAction = of(createAction(OrderActionType.LoadOrderSucceeded));
        finalizeOrderAction = of(createAction(OrderActionType.FinalizeOrderRequested));

        orderActionCreator = {
            submitOrder: jest.fn(() => submitOrderAction),
            loadCurrentOrder: jest.fn(() => loadOrderAction),
            finalizeOrder: jest.fn(() => finalizeOrderAction),
        } as unknown as OrderActionCreator;

        hostedFormFactory = new HostedFormFactory(store);

        strategy = new CheckoutcomCustomPaymentStrategy(
            store,
            orderActionCreator,
            paymentActionCreator,
            hostedFormFactory,
        );
    });

    it('is special type of credit card strategy', () => {
        expect(strategy).toBeInstanceOf(CreditCardPaymentStrategy);
    });

    describe('#execute', () => {
        let form: Pick<HostedForm, 'attach' | 'submit' | 'validate'>;
        let initializeOptions: PaymentInitializeOptions;
        let state: InternalCheckoutSelectors;

        beforeEach(() => {
            form = {
                attach: jest.fn(() => Promise.resolve()),
                submit: jest.fn(() => Promise.resolve()),
                validate: jest.fn(() => Promise.resolve()),
            };
            initializeOptions = {
                creditCard: {
                    form: {
                        fields: {
                            [HostedFieldType.CardExpiry]: { containerId: 'card-expiry' },
                            [HostedFieldType.CardName]: { containerId: 'card-name' },
                            [HostedFieldType.CardNumber]: { containerId: 'card-number' },
                        },
                    },
                },
                methodId: 'checkoutcom',
            };
            state = store.getState();

            jest.spyOn(state.paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue(
                merge(getPaymentMethod(), { config: { isHostedFormEnabled: true } }),
            );

            jest.spyOn(hostedFormFactory, 'create').mockReturnValue(form);
        });

        it('validates user input before submitting data', async () => {
            await strategy.initialize(initializeOptions);
            await strategy.execute(getOrderRequestBody());

            expect(form.validate).toHaveBeenCalled();
        });

        it('submits the order', async () => {
            await strategy.initialize(initializeOptions);
            await strategy.execute(getOrderRequestBody());

            expect(orderActionCreator.submitOrder).toHaveBeenCalled();
            expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
        });

        it('submits payment data with hosted form', async () => {
            const payload = getOrderRequestBody();

            await strategy.initialize(initializeOptions);
            await strategy.execute(payload);

            expect(form.submit).toHaveBeenCalledWith(payload.payment);
        });

        it('does not submit payment data with hosted form if validation fails', async () => {
            jest.spyOn(form, 'validate').mockRejectedValue(new Error());

            try {
                await strategy.initialize(initializeOptions);
                await strategy.execute(getOrderRequestBody());
            } catch (error) {
                expect(form.submit).not.toHaveBeenCalled();
            }
        });

        it('loads current order after payment submission', async () => {
            const payload = getOrderRequestBody();

            await strategy.initialize(initializeOptions);
            await strategy.execute(payload);

            expect(store.dispatch).toHaveBeenCalledWith(loadOrderAction);
        });

        it('redirects to target url when additional action redirect is provided', async () => {
            const error = new RequestError(
                getResponse({
                    ...getErrorPaymentResponseBody(),
                    errors: [],
                    additional_action_required: {
                        data: {
                            redirect_url: 'http://redirect-url.com',
                        },
                        type: 'offsite_redirect',
                    },
                    three_ds_result: {},
                    status: 'error',
                }),
            );

            window.location.replace = jest.fn();

            jest.spyOn(form, 'submit').mockRejectedValue(error);

            await strategy.initialize(initializeOptions);
            strategy.execute(getOrderRequestBody());

            await new Promise((resolve) => process.nextTick(resolve));

            expect(window.location.replace).toHaveBeenCalledWith('http://redirect-url.com');
            expect(orderActionCreator.loadCurrentOrder).not.toHaveBeenCalled();
        });
    });

    describe('#finalize', () => {
        it('should throw an error to inform that order finalization is not required', async () => {
            const finalize = strategy.finalize();

            await expect(finalize).rejects.toThrow(OrderFinalizationNotRequiredError);
        });

        it('should finalize the strategy', async () => {
            const state = store.getState();

            jest.spyOn(state.order, 'getOrder').mockReturnValue(getOrder());

            jest.spyOn(state.payment, 'getPaymentStatus').mockReturnValue(
                paymentStatusTypes.FINALIZE,
            );

            await strategy.finalize();

            expect(orderActionCreator.finalizeOrder).toHaveBeenCalled();
            expect(store.dispatch).toHaveBeenCalledWith(finalizeOrderAction);
        });
    });
});
