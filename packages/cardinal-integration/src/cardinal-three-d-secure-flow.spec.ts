import { Response } from '@bigcommerce/request-sender';
import { merge } from 'lodash';

import {
    HostedForm,
    OrderRequestBody,
    PaymentIntegrationService,
    PaymentMethod,
    PaymentRequestOptions,
    PaymentStrategy,
    RequestError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getBillingAddress,
    getCheckout,
    getOrder,
    getOrderRequestBody,
    getPaymentMethod,
    getResponse,
    getShippingAddress,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import CardinalClient from './cardinal-client';
import CardinalThreeDSecureFlow from './cardinal-three-d-secure-flow';

describe('CardinalThreeDSecureFlow', () => {
    let cardinalClient: Pick<
        CardinalClient,
        'configure' | 'getThreeDSecureData' | 'load' | 'runBinProcess'
    >;
    let threeDSecureFlow: CardinalThreeDSecureFlow;
    let paymentMethod: PaymentMethod;
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentMethod = {
            ...getPaymentMethod(),
            clientToken: 'foo',
        };

        cardinalClient = {
            configure: jest.fn(() => Promise.resolve()),
            getThreeDSecureData: jest.fn(),
            load: jest.fn(() => Promise.resolve()),
            runBinProcess: jest.fn(() => Promise.resolve()),
        };

        paymentIntegrationService = new PaymentIntegrationServiceMock();

        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethod,
        );

        threeDSecureFlow = new CardinalThreeDSecureFlow(
            paymentIntegrationService,
            cardinalClient as CardinalClient,
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('#prepare', () => {
        it('loads Cardinal client', async () => {
            await threeDSecureFlow.prepare(paymentMethod);

            expect(cardinalClient.load).toHaveBeenCalledWith(
                paymentMethod.id,
                paymentMethod.config.testMode,
            );
        });

        it('configures Cardinal client', async () => {
            await threeDSecureFlow.prepare(paymentMethod);

            expect(cardinalClient.configure).toHaveBeenCalledWith(paymentMethod.clientToken);
        });

        it('reloads payment method if client token is undefined', async () => {
            paymentMethod = {
                ...getPaymentMethod(),
                clientToken: '',
            };

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(paymentMethod);

            await threeDSecureFlow.prepare(paymentMethod);

            expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalledWith(
                paymentMethod.id,
            );
        });

        it('does not reload payment method if client token is defined', async () => {
            await threeDSecureFlow.prepare(paymentMethod);

            expect(paymentIntegrationService.loadPaymentMethod).not.toHaveBeenCalled();
        });
    });

    describe('#start', () => {
        let execute: PaymentStrategy['execute'];
        let form: HostedForm;
        let options: PaymentRequestOptions;
        let payload: OrderRequestBody;

        beforeEach(() => {
            execute = jest.fn(() => Promise.resolve());
            options = { methodId: paymentMethod.id };

            form = {
                getBin: jest.fn(() => '411111'),
                submit: jest.fn(),
                attach: jest.fn(),
                detach: jest.fn(),
                getCardType: jest.fn(),
                validate: jest.fn(),
            };

            payload = merge({}, getOrderRequestBody(), {
                payment: {
                    methodId: paymentMethod.id,
                    gatewayId: paymentMethod.gateway,
                },
            });
        });

        it('runs BIN detection process if defined', async () => {
            await threeDSecureFlow.start(execute, payload, options, form);

            expect(cardinalClient.runBinProcess).toHaveBeenCalledWith(form.getBin());
        });

        it('executes order submission with client token', async () => {
            await threeDSecureFlow.start(execute, payload, options, form);

            expect(execute).toHaveBeenCalledWith(
                merge(payload, {
                    payment: {
                        paymentData: {
                            threeDSecure: { token: paymentMethod.clientToken },
                        },
                    },
                }),
                options,
            );
        });

        it('throws error in case it is not a request error', async () => {
            execute = jest.fn(() => Promise.reject(new Error()));

            try {
                await threeDSecureFlow.start(execute, payload, options, form);
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });

        describe('if 3DS is required', () => {
            let response: Response<any>;

            beforeEach(() => {
                response = getResponse({
                    errors: [{ code: 'three_d_secure_required' }],
                    three_ds_result: {},
                });

                execute = jest.fn(() => Promise.reject(new RequestError(response)));
            });

            it('handles 3DS error and prompts shopper to authenticate', async () => {
                await threeDSecureFlow.start(execute, payload, options, form);

                expect(cardinalClient.getThreeDSecureData).toHaveBeenCalledWith(
                    response.body.three_ds_result,
                    {
                        billingAddress: getBillingAddress(),
                        shippingAddress: getShippingAddress(),
                        currencyCode: getCheckout().cart.currency.code,
                        id: getOrder().orderId.toString(),
                        amount: getCheckout().cart.cartAmount,
                    },
                );
            });

            it('submits 3DS token using hosted form if provided', async () => {
                jest.spyOn(cardinalClient, 'getThreeDSecureData').mockResolvedValue({
                    token: 'token',
                });

                await threeDSecureFlow.start(execute, payload, options, form);

                expect(form.submit).toHaveBeenCalledWith(
                    merge(payload.payment, {
                        paymentData: { threeDSecure: 'three_d_secure' },
                    }),
                );
            });

            it('submits 3DS token directly if hosted form is not provided', async () => {
                jest.spyOn(cardinalClient, 'getThreeDSecureData').mockResolvedValue({
                    token: 'token',
                });

                await threeDSecureFlow.start(execute, payload, options);

                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(
                    merge(payload.payment, {
                        paymentData: { threeDSecure: 'three_d_secure' },
                    }),
                );
            });
        });
    });
});
