import { createAction } from '@bigcommerce/data-store';
import { FormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';
import { of, Observable } from 'rxjs';

import { createCheckoutStore, CheckoutRequestSender, CheckoutStore, CheckoutValidator } from '../../../../checkout';
import { getCheckoutStoreState } from '../../../../checkout/checkouts.mock';
import { InvalidArgumentError, NotInitializedError } from '../../../../common/error/errors';
import { HostedFieldType, HostedForm, HostedFormFactory } from '../../../../hosted-form';
import { LoadOrderSucceededAction, OrderActionCreator, OrderActionType, OrderPaymentRequestBody, OrderRequestSender } from '../../../../order';
import { getOrder } from '../../../../order/orders.mock';
import { PaymentArgumentInvalidError } from '../../../errors';
import { PaymentInitializeOptions } from '../../../payment-request-options';
import { getPayment } from '../../../payments.mock';
import { createStepHandler } from '../step-handler';

import { CardSubStrategy } from './card-sub-strategy';

describe('CreditCardPaymentStrategy', () => {
    const stepHandler = createStepHandler(new FormPoster());
    const requestSender = createRequestSender();

    let formFactory: HostedFormFactory;
    let form: Pick<HostedForm, 'attach' | 'submit' | 'validate'>;
    let initializeOptions: PaymentInitializeOptions;
    let loadOrderAction: Observable<LoadOrderSucceededAction>;
    let orderActionCreator: OrderActionCreator;
    let store: CheckoutStore;
    let cardSubStrategy: CardSubStrategy;

    beforeEach(() => {
        store = createCheckoutStore(getCheckoutStoreState());
        orderActionCreator = new OrderActionCreator(
            new OrderRequestSender(requestSender),
            new CheckoutValidator(new CheckoutRequestSender(requestSender))
        );
        formFactory = new HostedFormFactory(store, stepHandler);

        cardSubStrategy = new CardSubStrategy(store, orderActionCreator, formFactory);

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
            methodId: 'cabbage_pay.card',
        };
        loadOrderAction = of(createAction(OrderActionType.LoadOrderSucceeded, getOrder()));

        jest.spyOn(orderActionCreator, 'loadCurrentOrder')
            .mockReturnValue(loadOrderAction);

        jest.spyOn(formFactory, 'create')
            .mockReturnValue(form);

        jest.spyOn(store, 'dispatch');
    });

    describe('initialize()', () => {
        it('creates hosted form', async () => {
            await cardSubStrategy.initialize(initializeOptions);

            expect(formFactory.create)
                .toHaveBeenCalledWith(
                    'https://bigpay.integration.zone',
                    // tslint:disable-next-line:no-non-null-assertion
                    initializeOptions.creditCard!.form!
                );
        });

        it('attaches hosted form to container', async () => {
            await cardSubStrategy.initialize(initializeOptions);

            expect(form.attach)
                .toHaveBeenCalled();
        });

        it('throws error form when fields does not exist ', async () => {
            initializeOptions = {
                methodId: 'cabbage_pay.card',
            };
            try {
                await cardSubStrategy.initialize(initializeOptions);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });
    });

    describe('execute()', () => {
        const payment = getPayment() as OrderPaymentRequestBody;

        it('throws error if hosted form does not exist', async () => {
            try {
                // execute without initialization
                await cardSubStrategy.execute({
                    payment,
                    methodId: 'cabbage_pay.card',
                    bigpayBaseUrl: 'https://bigpay.integration.zone',
                    token: 'abc',
                });
            } catch (error) {
                expect(error).toBeInstanceOf(NotInitializedError);
            }
        });

        it('throws error if payment data is missing', async () => {
            try {
                await cardSubStrategy.initialize(initializeOptions);
                await cardSubStrategy.execute({
                    payment: undefined,
                    methodId: 'cabbage_pay.card',
                    bigpayBaseUrl: 'https://bigpay.integration.zone',
                    token: 'abc',
                });
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentArgumentInvalidError);
            }
        });

        it('validates user input before submitting data', async () => {
            await cardSubStrategy.initialize(initializeOptions);
            await cardSubStrategy.execute({
                payment,
                methodId: 'cabbage_pay.card',
                bigpayBaseUrl: 'https://bigpay.integration.zone',
                token: 'abc',
            });

            expect(form.validate).toHaveBeenCalled();
        });

        it('does not submit payment data with hosted form if validation fails', async () => {
            jest.spyOn(form, 'validate').mockRejectedValue(new Error());

            try {
                await cardSubStrategy.initialize(initializeOptions);
                await cardSubStrategy.execute({
                    payment,
                    methodId: 'cabbage_pay.card',
                    bigpayBaseUrl: 'https://bigpay.integration.zone',
                    token: 'abc',
                });
            } catch (error) {
                expect(form.submit).not.toHaveBeenCalled();
            }
        });

        it('submits payment data with hosted form', async () => {
            await cardSubStrategy.initialize(initializeOptions);
            await cardSubStrategy.execute({
                payment,
                methodId: 'cabbage_pay.card',
                bigpayBaseUrl: 'https://bigpay.integration.zone',
                token: 'abc',
            });

            expect(form.submit).toHaveBeenCalledWith(payment);
        });

        it('loads current order after payment submission', async () => {
            await cardSubStrategy.initialize(initializeOptions);
            await cardSubStrategy.execute({
                payment,
                methodId: 'cabbage_pay.card',
                bigpayBaseUrl: 'https://bigpay.integration.zone',
                token: 'abc',
            });

            expect(store.dispatch).toHaveBeenCalledWith(loadOrderAction);
        });
    });
});
