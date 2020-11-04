import { Response } from '@bigcommerce/request-sender';
import { merge } from 'lodash';
import { of } from 'rxjs';

import { getBillingAddress } from '../../../billing/billing-addresses.mock';
import { createCheckoutStore, CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { getCheckout, getCheckoutStoreStateWithOrder } from '../../../checkout/checkouts.mock';
import { RequestError } from '../../../common/error/errors';
import { getResponse } from '../../../common/http-request/responses.mock';
import { HostedForm } from '../../../hosted-form';
import { OrderRequestBody } from '../../../order';
import { getOrderRequestBody } from '../../../order/internal-orders.mock';
import { getOrder } from '../../../order/orders.mock';
import { getShippingAddress } from '../../../shipping/shipping-addresses.mock';
import PaymentActionCreator from '../../payment-action-creator';
import PaymentMethod from '../../payment-method';
import { getBarclays } from '../../payment-methods.mock';
import { PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import CardinalClient from './cardinal-client';
import CardinalThreeDSecureFlowV2 from './cardinal-three-d-secure-flow-v2';

describe('CardinalBarclaysThreeDSecureFlow', () => {
    let state: InternalCheckoutSelectors;
    let store: CheckoutStore;
    let cardinalClient: Pick<CardinalClient, 'configure' | 'getThreeDSecureData' | 'load' | 'runBinProcess'>;
    let threeDSecureFlow: CardinalThreeDSecureFlowV2;
    let paymentMethod: PaymentMethod;
    let paymentActionCreator: Pick<PaymentActionCreator, 'submitPayment'>;

    beforeEach(() => {
        store = createCheckoutStore(getCheckoutStoreStateWithOrder());

        paymentMethod = getBarclays();

        cardinalClient = {
            configure: jest.fn(() => Promise.resolve()),
            getThreeDSecureData: jest.fn(() => Promise.resolve()),
            load: jest.fn(() => Promise.resolve()),
            runBinProcess: jest.fn(() => Promise.resolve()),
        };

        paymentActionCreator = {
            submitPayment: jest.fn(() => of()),
        };

        state = store.getState();

        jest.spyOn(store, 'getState')
            .mockReturnValue(state);

        threeDSecureFlow = new CardinalThreeDSecureFlowV2(
            store,
            paymentActionCreator as PaymentActionCreator,
            cardinalClient as CardinalClient
        );
    });

    describe('#prepare', () => {
        it('loads Cardinal client', async () => {
            await threeDSecureFlow.prepare(paymentMethod);

            expect(cardinalClient.load)
                .toHaveBeenCalledWith(paymentMethod.id, paymentMethod.config.testMode);
        });
    });

    describe('#start', () => {
        let execute: PaymentStrategy['execute'];
        let form: Pick<HostedForm, 'getBin' | 'submit'>;
        let options: PaymentRequestOptions;
        let payload: OrderRequestBody;

        beforeEach(() => {
            execute = jest.fn(() => Promise.resolve(state));
            options = { methodId: paymentMethod.id };

            form = {
                getBin: jest.fn(() => '411111'),
                submit: jest.fn(),
            };

            payload = merge({}, getOrderRequestBody(), {
                payment: {
                    methodId: paymentMethod.id,
                    gatewayId: paymentMethod.gateway,
                },
            });
        });

        it('executes order submission', async () => {
            await threeDSecureFlow.start(execute, payload, options, form as HostedForm);

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
                await threeDSecureFlow.start(execute, payload, options, form as HostedForm);

                expect(cardinalClient.configure)
                    .toHaveBeenCalledWith('JWT123');
            });

            it('runs BIN detection process if defined', async () => {
                await threeDSecureFlow.start(execute, payload, options, form as HostedForm);

                expect(cardinalClient.runBinProcess)
                    .toHaveBeenCalledWith(form.getBin());
            });

            it('submits XID token using hosted form if provided', async () => {
                await threeDSecureFlow.start(execute, payload, options, form as HostedForm);

                expect(form.submit)
                    .toHaveBeenCalledWith(merge({}, payload.payment, {
                        paymentData: { threeDSecure: { xid: 'TOKEN123' } },
                    }));
            });

            it('submits XID token directly if hosted form is not provided', async () => {
                await threeDSecureFlow.start(execute, payload, options);

                expect(paymentActionCreator.submitPayment)
                    .toHaveBeenCalledWith(merge({}, payload.payment, {
                        paymentData: { threeDSecure: { xid: 'TOKEN123' } },
                    }));
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

                    jest.spyOn(form, 'submit')
                        .mockRejectedValueOnce(new RequestError(threeDSecureRequired));
                    jest.spyOn(paymentActionCreator, 'submitPayment')
                        .mockRejectedValueOnce(new RequestError(threeDSecureRequired));
                });

                it('handles 3DS error and prompts shopper to authenticate', async () => {
                    await threeDSecureFlow.start(execute, payload, options, form as HostedForm);

                    expect(cardinalClient.getThreeDSecureData)
                        .toHaveBeenCalledWith(threeDSecureRequired.body.three_ds_result, {
                            billingAddress: getBillingAddress(),
                            shippingAddress: getShippingAddress(),
                            currencyCode: getCheckout().cart.currency.code,
                            id: getOrder().orderId.toString(),
                            amount: getCheckout().cart.cartAmount,
                        });
                });

                it('submits 3DS token using hosted form if provided', async () => {
                    await threeDSecureFlow.start(execute, payload, options, form as HostedForm);

                    expect(form.submit)
                        .toHaveBeenCalledWith(merge({}, payload.payment, {
                            paymentData: { threeDSecure: { token: 'TOKEN345' } },
                        }));
                });

                it('submits 3DS token directly if hosted form is not provided', async () => {
                    await threeDSecureFlow.start(execute, payload, options);

                    expect(paymentActionCreator.submitPayment)
                        .toHaveBeenCalledWith(merge({}, payload.payment, {
                            paymentData: { threeDSecure: { token: 'TOKEN345' } },
                        }));
                });
            });
        });
    });
});
