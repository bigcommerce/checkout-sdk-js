import { FormPoster } from '@bigcommerce/form-poster';
import { merge } from 'lodash';

import {
    OrderRequestBody,
    PaymentArgumentInvalidError,
    PaymentExecuteError,
    PaymentIntegrationService,
    PaymentMethod,
    RequestError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getErrorPaymentResponseBody,
    getOrderRequestBody,
    getResponse,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import { getHumm } from './humm-payment-method.mock';
import HummPaymentStrategy from './humm-payment-strategy';

describe('HummPaymentStrategy', () => {
    let payload: OrderRequestBody;
    let paymentMethod: PaymentMethod;
    let strategy: HummPaymentStrategy;
    let formPoster: FormPoster;
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();

        paymentMethod = getHumm();
        payload = merge({}, getOrderRequestBody(), {
            payment: {
                methodId: paymentMethod.id,
                gatewayId: paymentMethod.gateway,
            },
        });

        formPoster = {
            postForm: jest.fn(),
        } as unknown as FormPoster;

        jest.spyOn(formPoster, 'postForm').mockImplementation(jest.fn());

        jest.spyOn(paymentIntegrationService, 'submitOrder').mockImplementation(jest.fn());

        jest.spyOn(paymentIntegrationService, 'submitPayment').mockImplementation(jest.fn());

        jest.spyOn(paymentIntegrationService, 'loadPaymentMethod').mockResolvedValue(
            paymentIntegrationService.getState(),
        );

        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            {
                ...getHumm(),
                initializationData: { processable: true },
            },
        );

        strategy = new HummPaymentStrategy(paymentIntegrationService, formPoster);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('#execute()', () => {
        it('throws error when undefined payment is provided', async () => {
            payload = { payment: undefined };

            await expect(strategy.execute(payload)).rejects.toThrow(PaymentArgumentInvalidError);
        });

        it('redirect to Humm', async () => {
            const postFormMock = jest.fn((_url, _options, resolveFn) => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                resolveFn();
            });

            jest.spyOn(formPoster, 'postForm').mockImplementation(postFormMock);

            const data = JSON.stringify({ data: 'data' });
            const error = new RequestError(
                getResponse({
                    ...getErrorPaymentResponseBody(),
                    provider_data: data,
                    additional_action_required: {
                        type: 'offsite_redirect',
                        data: {
                            redirect_url: 'https://sandbox-payment.humm.com',
                        },
                    },
                    status: 'additional_action_required',
                }),
            );

            jest.spyOn(paymentIntegrationService, 'submitPayment').mockRejectedValue(error);

            await strategy.execute(payload);
            await new Promise((resolve) => process.nextTick(resolve));

            expect(postFormMock).toHaveBeenCalledWith(
                'https://sandbox-payment.humm.com',
                {
                    data: 'data',
                },
                expect.any(Function),
            );
        });

        it('throws PaymentExecuteError when not processable', async () => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue({
                ...getHumm(),
                initializationData: { processable: false },
            });

            await expect(strategy.execute(payload)).rejects.toThrow(PaymentExecuteError);
        });

        it('reject payment when error is different to additional_action_required', async () => {
            const error = new RequestError(getResponse(getErrorPaymentResponseBody()));

            jest.spyOn(paymentIntegrationService, 'submitPayment').mockRejectedValue(error);

            await expect(strategy.execute(getOrderRequestBody())).rejects.toThrow(error);
        });
    });

    describe('#initialize()', () => {
        it('deinitializes strategy', async () => {
            await expect(strategy.initialize()).resolves.not.toThrow();
        });
    });

    describe('#deinitialize()', () => {
        it('deinitializes strategy', async () => {
            await expect(strategy.deinitialize()).resolves.not.toThrow();
        });
    });
});
