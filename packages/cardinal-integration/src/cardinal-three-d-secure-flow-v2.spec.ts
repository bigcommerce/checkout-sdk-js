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
import CardinalThreeDSecureFlowV2 from './cardinal-three-d-secure-flow-v2';

describe('CardinalBarclaysThreeDSecureFlow', () => {
    let cardinalClient: Pick<
        CardinalClient,
        'configure' | 'getThreeDSecureData' | 'load' | 'runBinProcess'
    >;
    let threeDSecureFlow: CardinalThreeDSecureFlowV2;
    let paymentMethod: PaymentMethod;
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentMethod = getPaymentMethod();

        cardinalClient = {
            configure: jest.fn(() => Promise.resolve()),
            getThreeDSecureData: jest.fn(() => Promise.resolve()),
            load: jest.fn(() => Promise.resolve()),
            runBinProcess: jest.fn(() => Promise.resolve()),
        };

        paymentIntegrationService = new PaymentIntegrationServiceMock();

        threeDSecureFlow = new CardinalThreeDSecureFlowV2(
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

        it('executes order submission', async () => {
            await threeDSecureFlow.start(execute, payload, options, form);

            expect(execute).toHaveBeenCalledWith(payload, options);
        });

        describe('if additional action is required', () => {
            let additionalActionRequired: Response<any>;

            beforeEach(() => {
                additionalActionRequired = getResponse({
                    status: 'additional_action_required',
                    additional_action_required: { data: { token: 'JWT123' } },
                    three_ds_result: { payer_auth_request: 'TOKEN123' },
                });

                execute = jest.fn(() => Promise.reject(new RequestError(additionalActionRequired)));
            });

            it('configures Cardinal client', async () => {
                await threeDSecureFlow.start(execute, payload, options, form);

                expect(cardinalClient.configure).toHaveBeenCalledWith('JWT123');
            });

            it('runs BIN detection process if defined', async () => {
                await threeDSecureFlow.start(execute, payload, options, form);

                expect(cardinalClient.runBinProcess).toHaveBeenCalledWith(form.getBin());
            });

            it('submits XID token using hosted form if provided', async () => {
                await threeDSecureFlow.start(execute, payload, options, form);

                expect(form.submit).toHaveBeenCalledWith(
                    merge({}, payload.payment, {
                        paymentData: { threeDSecure: { xid: 'TOKEN123' } },
                    }),
                );
            });

            it('submits XID token directly if hosted form is not provided', async () => {
                await threeDSecureFlow.start(execute, payload, options);

                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(
                    merge({}, payload.payment, {
                        paymentData: { threeDSecure: { xid: 'TOKEN123' } },
                    }),
                );
            });

            describe('if 3DS is required', () => {
                let threeDSecureRequired: Response<any>;

                beforeEach(() => {
                    threeDSecureRequired = getResponse({
                        errors: [{ code: 'three_d_secure_required' }],
                        three_ds_result: {
                            acs_url: 'https://foo.com',
                            payer_auth_request: 'TOKEN345',
                            merchant_data: 'qwerty123...',
                            callback_url: null,
                        },
                    });

                    jest.spyOn(form, 'submit').mockRejectedValueOnce(
                        new RequestError(threeDSecureRequired),
                    );
                });

                it('handles 3DS error and prompts shopper to authenticate', async () => {
                    await threeDSecureFlow.start(execute, payload, options, form);

                    expect(cardinalClient.getThreeDSecureData).toHaveBeenCalledWith(
                        threeDSecureRequired.body.three_ds_result,
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
                    await threeDSecureFlow.start(execute, payload, options, form);

                    expect(form.submit).toHaveBeenCalledWith(
                        merge({}, payload.payment, {
                            paymentData: { threeDSecure: { token: 'TOKEN345' } },
                        }),
                    );
                });

                it('submits 3DS token directly if hosted form is not provided', async () => {
                    jest.spyOn(paymentIntegrationService, 'submitPayment').mockRejectedValueOnce(
                        new RequestError(threeDSecureRequired),
                    );

                    await threeDSecureFlow.start(execute, payload, options);

                    expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(
                        merge({}, payload.payment, {
                            paymentData: { threeDSecure: { token: 'TOKEN345' } },
                        }),
                    );
                });
            });
        });
    });
});
