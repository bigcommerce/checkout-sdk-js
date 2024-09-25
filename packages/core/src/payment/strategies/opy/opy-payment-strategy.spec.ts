import { createAction, createErrorAction } from '@bigcommerce/data-store';
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { omit } from 'lodash';
import { of } from 'rxjs';

import { StorefrontPaymentRequestSender } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { getCartState } from '../../../cart/carts.mock';
import {
    CheckoutRequestSender,
    CheckoutStore,
    CheckoutValidator,
    createCheckoutStore,
} from '../../../checkout';
import { getCheckoutState } from '../../../checkout/checkouts.mock';
import { MissingDataError, NotImplementedError, RequestError } from '../../../common/error/errors';
import { getResponse } from '../../../common/http-request/responses.mock';
import { getConfigState } from '../../../config/configs.mock';
import { getCustomerState } from '../../../customer/customers.mock';
import {
    OrderActionCreator,
    OrderActionType,
    OrderRequestBody,
    OrderRequestSender,
} from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { getOrderRequestBody } from '../../../order/internal-orders.mock';
import { createSpamProtection, PaymentHumanVerificationHandler } from '../../../spam-protection';
import createPaymentClient from '../../create-payment-client';
import { PaymentArgumentInvalidError, PaymentMethodClientUnavailableError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentActionType } from '../../payment-actions';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import PaymentMethodRequestSender from '../../payment-method-request-sender';
import { getOpy, getPaymentMethodsState } from '../../payment-methods.mock';
import { PaymentInitializeOptions } from '../../payment-request-options';
import PaymentRequestSender from '../../payment-request-sender';
import PaymentRequestTransformer from '../../payment-request-transformer';
import { getErrorPaymentResponseBody } from '../../payments.mock';

import { ActionTypes, OpyPaymentMethod } from './opy';
import { OpyWidget } from './opy-library';
import OpyError, { OpyErrorType } from './opy-payment-error';
import OpyPaymentStrategy from './opy-payment-strategy';
import OpyScriptLoader from './opy-script-loader';

describe('OpyPaymentStrategy', () => {
    let widgetContainer: HTMLDivElement;
    let store: CheckoutStore;
    let requestSender: RequestSender;
    let paymentClient: OrderRequestSender;
    let orderActionCreator: OrderActionCreator;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let storefrontPaymentRequestSender: StorefrontPaymentRequestSender;
    let paymentActionCreator: PaymentActionCreator;
    let opyScriptLoader: OpyScriptLoader;
    let strategy: OpyPaymentStrategy;

    beforeEach(() => {
        widgetContainer = document.createElement('div');

        store = createCheckoutStore({
            checkout: getCheckoutState(),
            customer: getCustomerState(),
            config: getConfigState(),
            cart: getCartState(),
            paymentMethods: getPaymentMethodsState(),
        });

        requestSender = createRequestSender();

        paymentClient = createPaymentClient(store);

        orderActionCreator = new OrderActionCreator(
            paymentClient,
            new CheckoutValidator(new CheckoutRequestSender(requestSender)),
        );

        paymentMethodActionCreator = new PaymentMethodActionCreator(
            new PaymentMethodRequestSender(requestSender),
        );

        storefrontPaymentRequestSender = new StorefrontPaymentRequestSender(requestSender);

        paymentActionCreator = new PaymentActionCreator(
            new PaymentRequestSender(paymentClient),
            orderActionCreator,
            new PaymentRequestTransformer(),
            new PaymentHumanVerificationHandler(createSpamProtection(createScriptLoader())),
        );

        opyScriptLoader = new OpyScriptLoader(createScriptLoader());

        jest.spyOn(orderActionCreator, 'submitOrder').mockReturnValue(
            // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            of(createAction(OrderActionType.SubmitOrderRequested)),
        );

        jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod').mockResolvedValue(
            // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            store.getState(),
        );

        jest.spyOn(storefrontPaymentRequestSender, 'saveExternalId').mockResolvedValue(undefined);

        jest.spyOn(paymentActionCreator, 'submitPayment').mockReturnValue(
            // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            of(createAction(PaymentActionType.SubmitPaymentRequested)),
        );

        jest.spyOn(opyScriptLoader, 'loadOpyWidget').mockResolvedValue({ Config: jest.fn() });

        strategy = new OpyPaymentStrategy(
            store,
            orderActionCreator,
            paymentMethodActionCreator,
            storefrontPaymentRequestSender,
            paymentActionCreator,
            opyScriptLoader,
        );

        jest.spyOn(document, 'getElementById').mockReturnValue(widgetContainer);

        jest.spyOn(document, 'createElement');

        jest.spyOn(widgetContainer, 'appendChild');
    });

    afterEach(() => {
        jest.spyOn(document, 'getElementById').mockRestore();

        jest.spyOn(document, 'createElement').mockRestore();
    });

    describe('#initialize()', () => {
        let options: PaymentInitializeOptions;

        beforeEach(() => {
            options = { methodId: 'opy', opy: { containerId: 'learnMoreButton' } };
        });

        it('initializes the strategy successfully', async () => {
            await expect(strategy.initialize(options)).resolves.toEqual(store.getState());

            const opyLibrary: OpyWidget = await (opyScriptLoader.loadOpyWidget as jest.Mock).mock
                .results[0].value;
            const opyLearMoreButton: HTMLUnknownElement = (document.createElement as jest.Mock).mock
                .results[0].value;

            expect(document.getElementById).toHaveBeenCalledWith('learnMoreButton');
            expect(opyScriptLoader.loadOpyWidget).toHaveBeenCalledWith('US');
            expect(opyLibrary.Config).toHaveBeenCalledWith({
                region: 'US',
                currency: '$',
                planTiers: [2, 4, 6],
                minEligibleAmount: 1,
                maxEligibleAmount: 10000,
                type: 'Online',
            });
            expect(document.createElement).toHaveBeenCalledWith('opy-learn-more-button');
            expect(widgetContainer.appendChild).toHaveBeenCalledWith(opyLearMoreButton);
        });

        describe('fails silently to install the widget if:', () => {
            it('containerId is not provided', async () => {
                options = { ...options, opy: undefined };

                await expect(strategy.initialize(options)).resolves.toEqual(store.getState());

                expect(document.getElementById).not.toHaveBeenCalled();
                expect(opyScriptLoader.loadOpyWidget).not.toHaveBeenCalled();
                expect(document.createElement).not.toHaveBeenCalled();
                expect(widgetContainer.appendChild).not.toHaveBeenCalled();
            });

            it('payment method is not found', async () => {
                jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValueOnce(
                    undefined,
                );

                await expect(strategy.initialize()).resolves.toEqual(store.getState());

                expect(document.getElementById).not.toHaveBeenCalled();
                expect(opyScriptLoader.loadOpyWidget).not.toHaveBeenCalled();
                expect(document.createElement).not.toHaveBeenCalled();
                expect(widgetContainer.appendChild).not.toHaveBeenCalled();
            });

            it('payment method is not an OpyPaymentMethod', async () => {
                jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValueOnce(
                    { ...getOpy(), initializationData: undefined },
                );

                await expect(strategy.initialize(options)).resolves.toEqual(store.getState());

                expect(document.getElementById).not.toHaveBeenCalled();
                expect(opyScriptLoader.loadOpyWidget).not.toHaveBeenCalled();
                expect(document.createElement).not.toHaveBeenCalled();
                expect(widgetContainer.appendChild).not.toHaveBeenCalled();
            });

            it('containerId is invalid', async () => {
                // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                jest.spyOn(document, 'getElementById').mockReturnValueOnce(undefined);

                await expect(strategy.initialize(options)).resolves.toEqual(store.getState());

                expect(document.getElementById).toHaveBeenCalledWith('learnMoreButton');
                expect(opyScriptLoader.loadOpyWidget).not.toHaveBeenCalled();
                expect(document.createElement).not.toHaveBeenCalled();
                expect(widgetContainer.appendChild).not.toHaveBeenCalled();
            });

            it('the Opy widgets library is unavailable', async () => {
                jest.spyOn(opyScriptLoader, 'loadOpyWidget').mockRejectedValue(
                    new PaymentMethodClientUnavailableError(),
                );

                await expect(strategy.initialize(options)).resolves.toEqual(store.getState());

                expect(document.getElementById).toHaveBeenCalledWith('learnMoreButton');
                expect(opyScriptLoader.loadOpyWidget).toHaveBeenCalled();
                expect(document.createElement).not.toHaveBeenCalled();
                expect(widgetContainer.appendChild).not.toHaveBeenCalled();
            });
        });
    });

    describe('#execute()', () => {
        let payload: OrderRequestBody;
        let options: PaymentInitializeOptions;
        let order: Omit<OrderRequestBody, 'payment'>;

        beforeEach(async () => {
            payload = {
                ...getOrderRequestBody(),
                payment: {
                    methodId: 'opy',
                },
            };
            options = { methodId: 'opy' };
            order = omit(payload, 'payment');

            await strategy.initialize();
        });

        it('executes the strategy successfully', async () => {
            await strategy.execute(payload, options);

            expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(order, options);
            expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalledWith(
                'opy',
                options,
            );
            expect(storefrontPaymentRequestSender.saveExternalId).toHaveBeenCalledWith(
                'opy',
                '3000000091451',
            );
            expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith({
                methodId: 'opy',
                paymentData: { nonce: '3000000091451' },
            });
        });

        it('redirects to Openpay URL', async () => {
            const paymentFailedErrorAction = of(
                createErrorAction(
                    PaymentActionType.SubmitPaymentFailed,
                    new RequestError(
                        getResponse({
                            ...getErrorPaymentResponseBody(),
                            status: 'additional_action_required',
                        }),
                    ),
                ),
            );

            jest.spyOn(paymentActionCreator, 'submitPayment').mockReturnValueOnce(
                // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                paymentFailedErrorAction,
            );

            Object.defineProperty(window, 'location', {
                value: {
                    assign: jest.fn(),
                },
            });

            strategy.execute(payload, options);

            await new Promise((resolve) => process.nextTick(resolve));

            expect(window.location.assign).toHaveBeenCalledWith(
                'https://retailer.myopenpay.com.au/websalestraining?TransactionToken=Al5dE65...%3D&JamPlanID=3000000091451',
            );
        });

        describe('fails to execute if:', () => {
            it('payment argument is invalid', async () => {
                payload.payment = undefined;

                await expect(strategy.execute(payload, options)).rejects.toThrow(
                    PaymentArgumentInvalidError,
                );
            });

            it('payment method is not found', async () => {
                payload.payment = { methodId: 'unkwnown' };

                await expect(strategy.execute(payload, options)).rejects.toThrow(MissingDataError);
            });

            it('payment method is not an OpyPaymentMethod', async () => {
                jest.spyOn(
                    store.getState().paymentMethods,
                    'getPaymentMethodOrThrow',
                ).mockReturnValueOnce({ ...getOpy(), initializationData: undefined });

                await expect(strategy.execute(payload, options)).rejects.toThrow(MissingDataError);
            });

            it('nextAction is empty', async () => {
                const opy = getOpy() as OpyPaymentMethod;

                delete opy.initializationData.nextAction;

                jest.spyOn(
                    store.getState().paymentMethods,
                    'getPaymentMethodOrThrow',
                ).mockReturnValueOnce(opy);

                await expect(strategy.execute(payload, options)).rejects.toThrow(
                    new OpyError(OpyErrorType.InvalidCart, 'Openpay'),
                );
            });

            it('nonce is empty', async () => {
                jest.spyOn(
                    store.getState().paymentMethods,
                    'getPaymentMethodOrThrow',
                ).mockReturnValueOnce({ ...getOpy(), clientToken: '' });

                await expect(strategy.execute(payload, options)).rejects.toThrow(MissingDataError);
            });

            it('nextAction type is not supported', async () => {
                const opy = getOpy() as OpyPaymentMethod;

                opy.initializationData.nextAction = { type: ActionTypes.WAIT_FOR_CUSTOMER };

                jest.spyOn(
                    store.getState().paymentMethods,
                    'getPaymentMethodOrThrow',
                ).mockReturnValueOnce(opy);

                const paymentFailedErrorAction = of(
                    createErrorAction(
                        PaymentActionType.SubmitPaymentFailed,
                        new RequestError(
                            getResponse({
                                ...getErrorPaymentResponseBody(),
                                status: 'additional_action_required',
                            }),
                        ),
                    ),
                );

                jest.spyOn(paymentActionCreator, 'submitPayment').mockReturnValueOnce(
                    // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    paymentFailedErrorAction,
                );

                await expect(strategy.execute(payload, options)).rejects.toThrow(
                    NotImplementedError,
                );
            });

            it('RequestError status is not additional_action_required', async () => {
                const paymentFailedErrorAction = of(
                    createErrorAction(
                        PaymentActionType.SubmitPaymentFailed,
                        new RequestError(getResponse(getErrorPaymentResponseBody())),
                    ),
                );

                jest.spyOn(paymentActionCreator, 'submitPayment').mockReturnValueOnce(
                    // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    paymentFailedErrorAction,
                );

                await expect(strategy.execute(payload, options)).rejects.toThrow(RequestError);
            });
        });
    });

    describe('#finalize()', () => {
        it('throws error to inform that order finalization is not required', async () => {
            await expect(strategy.finalize()).rejects.toThrow(OrderFinalizationNotRequiredError);
        });
    });

    describe('#deinitialize()', () => {
        it('deinitializes strategy', async () => {
            await expect(strategy.deinitialize()).resolves.toEqual(store.getState());
        });
    });
});
