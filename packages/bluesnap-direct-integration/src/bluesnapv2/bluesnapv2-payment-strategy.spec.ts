import { Action, createAction } from '@bigcommerce/data-store';
import { merge } from 'lodash';
import { Observable, of } from 'rxjs';

import {
    FinalizeOrderAction,
    NotInitializedError,
    OrderActionType,
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentActionType,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentStatusTypes,
    SubmitOrderAction,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getOrder,
    getOrderRequestBody,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import { WithBlueSnapV2PaymentInitializeOptions } from './bluesnapv2-payment-options';
import BlueSnapV2PaymentStrategy from './bluesnapv2-payment-strategy';

describe('BlueSnapV2PaymentStrategy', () => {
    let strategy: BlueSnapV2PaymentStrategy;
    let paymentIntegrationService: PaymentIntegrationService;

    let finalizeOrderAction: Observable<FinalizeOrderAction>;
    let initializeOffsitePaymentAction: Observable<Action>;
    let initializeOptions: PaymentInitializeOptions;
    let options: PaymentInitializeOptions & WithBlueSnapV2PaymentInitializeOptions;
    let payload: OrderRequestBody;
    let orderRequestBody: OrderRequestBody;
    let submitOrderAction: Observable<SubmitOrderAction>;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();

        const state = paymentIntegrationService.getState();

        orderRequestBody = getOrderRequestBody();

        finalizeOrderAction = of(createAction(OrderActionType.FinalizeOrderRequested));
        initializeOffsitePaymentAction = of(
            createAction(PaymentActionType.InitializeOffsitePaymentRequested),
        );
        submitOrderAction = of(createAction(OrderActionType.SubmitOrderRequested));

        initializeOptions = {
            methodId: 'method',
            bluesnapv2: {
                onLoad: () => ({}),
            },
        };
        payload = merge(getOrderRequestBody(), {
            payment: {
                methodId: 'method',
                paymentData: null,
            },
        });

        jest.spyOn(paymentIntegrationService, 'loadPaymentMethod').mockReturnValue(state);
        jest.spyOn(paymentIntegrationService, 'finalizeOrder').mockReturnValue(finalizeOrderAction);
        jest.spyOn(paymentIntegrationService, 'submitOrder').mockReturnValue(submitOrderAction);
        jest.spyOn(paymentIntegrationService, 'initializeOffsitePayment').mockReturnValue(
            initializeOffsitePaymentAction,
        );

        options = {
            methodId: 'method',
            bluesnapv2: {
                onLoad: jest.fn(),
            },
        };

        strategy = new BlueSnapV2PaymentStrategy(paymentIntegrationService);
    });

    it('submits order with payment data', async () => {
        await strategy.initialize(initializeOptions);
        await strategy.execute(payload, options);

        expect(paymentIntegrationService.submitOrder).toHaveBeenCalledWith(payload, options);
    });

    it('initializes offsite payment flow', async () => {
        const myOptions = {
            methodId: 'method',
            bluesnapv2: {
                onLoad: jest.fn(),
            },
        };

        await strategy.initialize(initializeOptions);
        await strategy.execute(payload, myOptions);

        expect(paymentIntegrationService.initializeOffsitePayment).toHaveBeenCalledWith({
            methodId: 'method',
            gatewayId: options.gatewayId,
            shouldSaveInstrument: false,
            target: 'bluesnapv2_hosted_payment_page',
            promise: expect.any(Promise),
        });
    });

    it('finalizes order if order is created and payment is acknowledged', async () => {
        const order = getOrder();
        const status = PaymentStatusTypes.ACKNOWLEDGE;

        jest.spyOn(paymentIntegrationService, 'getState').mockReturnValue({
            getOrder: () => order,
            getPaymentStatus: () => status,
        });

        await strategy.initialize(options);
        await strategy.execute(orderRequestBody, options);

        jest.spyOn(paymentIntegrationService, 'finalizeOrder').mockResolvedValue(undefined);

        await strategy.finalize(options);

        expect(paymentIntegrationService.finalizeOrder).toHaveBeenCalledWith(options);
    });

    it('finalizes order if order is created and payment is finalized', async () => {
        const order = getOrder();

        jest.spyOn(paymentIntegrationService, 'getState').mockReturnValue({
            getOrder: () => order,
            getPaymentStatus: () => PaymentStatusTypes.FINALIZE,
        });

        await strategy.finalize(options);

        expect(paymentIntegrationService.finalizeOrder).toHaveBeenCalledWith(options);
    });

    it('does not finalize order if order is not created', async () => {
        jest.spyOn(paymentIntegrationService, 'getState').mockReturnValue({
            getOrder: () => null,
            getPaymentStatus: () => 'INCOMPLETE',
        });

        await strategy.initialize(initializeOptions);

        await expect(strategy.finalize()).rejects.toThrow(OrderFinalizationNotRequiredError);
    });

    it('does not finalize order if order is not finalized or acknowledged', async () => {
        const order = getOrder();

        jest.spyOn(paymentIntegrationService, 'finalizeOrder').mockReturnValue({
            getOrder: () => order,
            getPaymentStatus: () => 'INITIALIZE',
        });

        await expect(strategy.finalize()).rejects.toThrow(OrderFinalizationNotRequiredError);
    });

    it('throws error if unable to finalize due to missing data', async () => {
        jest.spyOn(paymentIntegrationService, 'finalizeOrder').mockReturnValue(
            Promise.resolve({
                status: PaymentStatusTypes.INITIALIZE,
            }),
        );
        jest.spyOn(paymentIntegrationService, 'finalizeOrder').mockReturnValue(null);

        await expect(strategy.finalize()).rejects.toThrow(OrderFinalizationNotRequiredError);
    });

    it('returns checkout state', async () => {
        await strategy.initialize(initializeOptions);

        const output = await strategy.execute(getOrderRequestBody());

        await expect(strategy.execute(payload, options)).resolves.toEqual(output);
    });

    it('throws error is unable to execute due to invalid payment', async () => {
        await strategy.initialize(initializeOptions);
        payload.payment = undefined;

        await expect(strategy.execute(payload)).rejects.toBeInstanceOf(PaymentArgumentInvalidError);
    });

    it('throws error is unable to execute due to _initializeOptions un set', async () => {
        await strategy.initialize();

        await expect(strategy.execute(payload)).rejects.toBeInstanceOf(NotInitializedError);
    });

    it('deinitialize payment strategy', async () => {
        await strategy.initialize(initializeOptions);

        const deinitialize = strategy.deinitialize();

        await expect(deinitialize).resolves.toBeUndefined();
    });

    it('create iframe with styleprops', () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line no-underscore-dangle
        const _iframe: HTMLIFrameElement = strategy._createIframe.call(
            '',
            'bluesnapv2_hosted_payment_page',
            { border: '1px solid gray', height: '40vh', width: '100%', padding: '3px' },
        );

        expect(_iframe).toHaveProperty('style');
        expect(_iframe.name).toBe('bluesnapv2_hosted_payment_page');
        expect(_iframe.style.height).toBe('40vh');
        expect(_iframe.style.border).toBe('1px solid gray');
        expect(_iframe.style.width).toBe('100%');
        // eslint-disable-next-line jest/no-restricted-matchers
        expect(_iframe.style.padding).toBeFalsy();
    });

    it('execute with styleprops', async () => {
        initializeOptions = merge(initializeOptions, {
            bluesnapv2: {
                style: {
                    border: '1px solid gray',
                    height: '40vh',
                    width: '100%',
                },
            },
        });
        await strategy.initialize(initializeOptions);

        const iframeCreator = jest.spyOn(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            BlueSnapV2PaymentStrategy.prototype as any,
            '_createIframe',
        );

        await strategy.execute(payload, options);

        expect(iframeCreator).toHaveBeenCalledWith('bluesnapv2_hosted_payment_page', {
            border: '1px solid gray',
            height: '40vh',
            width: '100%',
        });
    });
});
