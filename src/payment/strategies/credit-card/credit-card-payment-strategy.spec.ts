import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { createAction, Action } from '@bigcommerce/data-store';
import { createRequestSender } from '@bigcommerce/request-sender';
import { merge, omit } from 'lodash';
import { of, Observable } from 'rxjs';

import { createCheckoutStore, CheckoutRequestSender, CheckoutStore, CheckoutValidator, InternalCheckoutSelectors } from '../../../checkout';
import { getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { getConfig } from '../../../config/configs.mock';
import { HostedFieldType, HostedForm, HostedFormFactory } from '../../../hosted-form';
import { LoadOrderSucceededAction, OrderActionCreator, OrderActionType, OrderRequestSender } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { getOrderRequestBody } from '../../../order/internal-orders.mock';
import { getOrder } from '../../../order/orders.mock';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentActionType } from '../../payment-actions';
import { PaymentInitializeOptions } from '../../payment-request-options';
import PaymentRequestSender from '../../payment-request-sender';
import PaymentRequestTransformer from '../../payment-request-transformer';

import CreditCardPaymentStrategy from './credit-card-payment-strategy';

describe('CreditCardPaymentStrategy', () => {
    let formFactory: HostedFormFactory;
    let orderActionCreator: OrderActionCreator;
    let paymentActionCreator: PaymentActionCreator;
    let store: CheckoutStore;
    let strategy: CreditCardPaymentStrategy;
    let submitOrderAction: Observable<Action>;
    let submitPaymentAction: Observable<Action>;

    beforeEach(() => {
        store = createCheckoutStore(getCheckoutStoreState());

        paymentActionCreator = new PaymentActionCreator(
            new PaymentRequestSender(createPaymentClient()),
            orderActionCreator,
            new PaymentRequestTransformer()
        );

        submitOrderAction = of(createAction(OrderActionType.SubmitOrderRequested));
        submitPaymentAction = of(createAction(PaymentActionType.SubmitPaymentRequested));

        orderActionCreator = new OrderActionCreator(
            new OrderRequestSender(createRequestSender()),
            new CheckoutValidator(new CheckoutRequestSender(createRequestSender()))
        );

        formFactory = new HostedFormFactory(store);

        strategy = new CreditCardPaymentStrategy(
            store,
            orderActionCreator,
            paymentActionCreator,
            formFactory
        );

        jest.spyOn(store, 'dispatch');

        jest.spyOn(orderActionCreator, 'submitOrder')
            .mockReturnValue(submitOrderAction);

        jest.spyOn(paymentActionCreator, 'submitPayment')
            .mockReturnValue(submitPaymentAction);
    });

    it('submits order without payment data', async () => {
        const payload = getOrderRequestBody();

        await strategy.execute(payload);

        expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(omit(payload, 'payment'), undefined);
        expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
    });

    it('submits payment separately', async () => {
        const payload = getOrderRequestBody();

        await strategy.execute(payload);

        expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith(payload.payment);
        expect(store.dispatch).toHaveBeenCalledWith(submitPaymentAction);
    });

    it('returns checkout state', async () => {
        const output = await strategy.execute(getOrderRequestBody());

        expect(output).toEqual(store.getState());
    });

    it('throws error to inform that order finalization is not required', async () => {
        try {
            await strategy.finalize();
        } catch (error) {
            expect(error).toBeInstanceOf(OrderFinalizationNotRequiredError);
        }
    });

    describe('when hosted form is enabled', () => {
        let form: Pick<HostedForm, 'attach' | 'submit' | 'validate'>;
        let initializeOptions: PaymentInitializeOptions;
        let loadOrderAction: Observable<LoadOrderSucceededAction>;
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
                methodId: 'authorizenet',
            };
            loadOrderAction = of(createAction(OrderActionType.LoadOrderSucceeded, getOrder()));
            state = store.getState();

            jest.spyOn(state.config, 'getStoreConfig')
                .mockReturnValue(merge(
                    getConfig().storeConfig,
                    { checkoutSettings: { isHostedPaymentFormEnabled: true } }
                ));

            jest.spyOn(orderActionCreator, 'loadCurrentOrder')
                .mockReturnValue(loadOrderAction);

            jest.spyOn(formFactory, 'create')
                .mockReturnValue(form);
        });

        it('creates hosted form', async () => {
            await strategy.initialize(initializeOptions);

            expect(formFactory.create)
                .toHaveBeenCalledWith(
                    'https://bigpay.integration.zone',
                    'dc030783-6129-4ee3-8e06-6f4270df1527',
                    // tslint:disable-next-line:no-non-null-assertion
                    initializeOptions.creditCard!.form!
                );
        });

        it('attaches hosted form to container', async () => {
            await strategy.initialize(initializeOptions);

            expect(form.attach)
                .toHaveBeenCalled();
        });

        it('submits payment data with hosted form', async () => {
            const payload = getOrderRequestBody();

            await strategy.initialize(initializeOptions);
            await strategy.execute(payload);

            expect(form.submit)
                .toHaveBeenCalledWith(payload.payment);
        });

        it('validates user input before submitting data', async () => {
            await strategy.initialize(initializeOptions);
            await strategy.execute(getOrderRequestBody());

            expect(form.validate)
                .toHaveBeenCalled();
        });

        it('does not submit payment data with hosted form if validation fails', async () => {
            jest.spyOn(form, 'validate')
                .mockRejectedValue(new Error());

            try {
                await strategy.initialize(initializeOptions);
                await strategy.execute(getOrderRequestBody());
            } catch (error) {
                expect(form.submit)
                    .not.toHaveBeenCalled();
            }
        });

        it('loads current order after payment submission', async () => {
            const payload = getOrderRequestBody();

            await strategy.initialize(initializeOptions);
            await strategy.execute(payload);

            expect(store.dispatch)
                .toHaveBeenCalledWith(loadOrderAction);
        });
    });

    describe('when hosted form is enabled but hosted fields are not present for rendering', () => {
        let form: Pick<HostedForm, 'attach' | 'submit' | 'validate'>;
        let initializeOptions: PaymentInitializeOptions;
        let loadOrderAction: Observable<LoadOrderSucceededAction>;
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
                        fields: {},
                    },
                },
                methodId: 'authorizenet',
            };
            loadOrderAction = of(createAction(OrderActionType.LoadOrderSucceeded, getOrder()));
            state = store.getState();

            jest.spyOn(state.config, 'getStoreConfig')
                .mockReturnValue(merge(
                    getConfig().storeConfig,
                    { checkoutSettings: { isHostedPaymentFormEnabled: true } }
                ));

            jest.spyOn(orderActionCreator, 'loadCurrentOrder')
                .mockReturnValue(loadOrderAction);

            jest.spyOn(formFactory, 'create')
                .mockReturnValue(form);
        });

        it('does not create hosted form', async () => {
            await strategy.initialize(initializeOptions);

            expect(formFactory.create)
                .not.toHaveBeenCalled();
        });

        it('does not submit with hosted form', async () => {
            const payload = getOrderRequestBody();

            await strategy.initialize(initializeOptions);
            await strategy.execute(payload);

            expect(form.submit)
                .not.toHaveBeenCalled();
        });
    });
});
