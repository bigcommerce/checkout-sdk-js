import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { createAction } from '@bigcommerce/data-store';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { of, Observable } from 'rxjs';

import { PaymentActionCreator } from '../..';
import { createCheckoutStore, CheckoutRequestSender, CheckoutStore, CheckoutValidator } from '../../../checkout';
import { getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { InvalidArgumentError } from '../../../common/error/errors';
import { FinalizeOrderAction, OrderActionCreator, OrderActionType, OrderRequestSender } from '../../../order';
import { createSpamProtection, PaymentHumanVerificationHandler } from '../../../spam-protection';
import { PaymentArgumentInvalidError } from '../../errors';
import { PaymentActionType, SubmitPaymentAction } from '../../payment-actions';
import { getMollie } from '../../payment-methods.mock';
import { PaymentInitializeOptions } from '../../payment-request-options';
import PaymentRequestSender from '../../payment-request-sender';
import PaymentRequestTransformer from '../../payment-request-transformer';

import {  MollieClient, MollieElement, MollieHostWindow } from './mollie';
import MolliePaymentStrategy from './mollie-payment-strategy';
import MollieScriptLoader from './mollie-script-loader';
import { getInitializeOptions, getMollieClient, getOrderRequestBodyAPMs, getOrderRequestBodyWithoutPayment, getOrderRequestBodyWithCreditCard } from './mollie.mock';

describe('MolliePaymentStrategy', () => {
    let orderRequestSender: OrderRequestSender;
    let orderActionCreator: OrderActionCreator;
    let paymentActionCreator: PaymentActionCreator;
    let mollieScriptLoader: MollieScriptLoader;
    let mockWindow: MollieHostWindow;
    let store: CheckoutStore;
    let finalizeOrderAction: Observable<FinalizeOrderAction>;
    let submitPaymentAction: Observable<SubmitPaymentAction>;
    let strategy: MolliePaymentStrategy;
    let mollieClient: MollieClient;
    let mollieElement: MollieElement;

    beforeEach(() => {
        mollieClient = getMollieClient();
        mollieElement = {
            mount: jest.fn(),
            unmount: jest.fn(),
            addEventListener: jest.fn(),
        };
        const scriptLoader = createScriptLoader();
        const requestSender = createRequestSender();
        mockWindow = {} as MollieHostWindow;
        orderRequestSender = new OrderRequestSender(requestSender);
        orderActionCreator = new OrderActionCreator(
            orderRequestSender,
            new CheckoutValidator(new CheckoutRequestSender(requestSender))
        );
        paymentActionCreator = new PaymentActionCreator(
            new PaymentRequestSender(createPaymentClient()),
            orderActionCreator,
            new PaymentRequestTransformer(),
            new PaymentHumanVerificationHandler(createSpamProtection(createScriptLoader()))
        );

        mollieScriptLoader = new MollieScriptLoader(scriptLoader, mockWindow);

        store = createCheckoutStore(getCheckoutStoreState());

        finalizeOrderAction = of(createAction(OrderActionType.FinalizeOrderRequested));
        submitPaymentAction = of(createAction(PaymentActionType.SubmitPaymentRequested));

        jest.spyOn(store, 'dispatch');

        jest.spyOn(orderActionCreator, 'finalizeOrder')
            .mockReturnValue(finalizeOrderAction);

        jest.spyOn(orderActionCreator, 'submitOrder')
            .mockReturnValue(submitPaymentAction);

        jest.spyOn(paymentActionCreator, 'submitPayment')
            .mockReturnValue(submitPaymentAction);

        jest.spyOn(mollieScriptLoader, 'load')
            .mockReturnValue(Promise.resolve(mollieClient));

        jest.spyOn(mollieClient, 'createComponent')
            .mockReturnValue(mollieElement);

        strategy = new MolliePaymentStrategy(
            store,
            mollieScriptLoader,
            orderActionCreator,
            paymentActionCreator
        );
    });

    describe('#Initialize & Executes', () => {
        let options: PaymentInitializeOptions;

        beforeEach(() => {
            options = getInitializeOptions();

            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow')
                .mockReturnValue(getMollie());

            jest.spyOn(store.getState().config, 'getStoreConfig')
                .mockReturnValue({ storeProfile: { storeLanguage:  'en_US' } });
        });

        describe('Initialize', () => {
            it('does not load Mollie if initialization options are not provided', () => {
                options.mollie = undefined;
                const response = strategy.initialize(options);

                return expect(response).rejects.toThrow(InvalidArgumentError);
            });

            it('does initialize mollie and create 4 components', async () => {
                await strategy.initialize(options);

                expect(mollieScriptLoader.load).toBeCalledWith('test_T0k3n', 'en_US', true);
                expect(mollieClient.createComponent).toBeCalledTimes(4);
                expect(mollieElement.mount).toBeCalledTimes(4);
            });
        });

        describe('#execute', () => {
            beforeEach(() => {
                jest.spyOn(mollieClient, 'createToken')
                    .mockResolvedValue({token : 'tkn_test'});
            });

            it('throws an error when payment is not present', async () => {
                try {
                    await strategy.execute(getOrderRequestBodyWithoutPayment());
                } catch (err) {
                    expect(err).toBeInstanceOf(PaymentArgumentInvalidError);
                }
            });

            it('should call submitPayment when paying with creditcard', async () => {
                await strategy.initialize(options);
                await strategy.execute(getOrderRequestBodyWithCreditCard());

                expect(mollieClient.createToken).toBeCalled();
                expect(paymentActionCreator.submitPayment).toBeCalledWith({
                    gatewayId: 'mollie',
                    methodId: 'creditcard',
                    paymentData: {
                        formattedPayload: {
                            browser_info: {
                                color_depth: 24,
                                java_enabled: false,
                                language: 'en-US',
                                screen_height: 0,
                                screen_width: 0,
                                time_zone_offset: '0',
                            },
                            credit_card_token : {
                                token: 'tkn_test',
                            },
                        },
                    },
                });
            });

            it('should call submitPayment when paying with apms', async () => {
                await strategy.initialize(options);
                await strategy.execute(getOrderRequestBodyAPMs());

                expect(paymentActionCreator.submitPayment).toBeCalledWith({
                    gatewayId: 'mollie',
                    methodId: 'belfius',
                    paymentData: undefined,
                });
            });
        });

        afterEach(() =>  {
            jest.resetAllMocks();
        });
    });

    describe('#finalize()', () => {
        it('finalize mollie', () => {
            const promise = strategy.finalize();
            expect(promise).resolves.toBe({});
        });
    });

    describe('#deinitialize', () => {
        let options: PaymentInitializeOptions;

        beforeEach(() => {
            options = getInitializeOptions();

            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow')
                .mockReturnValue(getMollie());

            jest.spyOn(store.getState().config, 'getStoreConfig')
                .mockReturnValue({ storeProfile: { storeLanguage:  'en_US' } });
        });

        it('deinitialize mollie payment strategy', async () => {
            await strategy.initialize(options);

            expect(mollieElement.mount).toBeCalledTimes(4);

            const promise = strategy.deinitialize();

            expect(mollieElement.unmount).toBeCalledTimes(4);

            return expect(promise).resolves.toBe(store.getState());
        });
    });
});
