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
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { getCybersource } from '../../payment-methods.mock';
import { PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import CardinalClient from './cardinal-client';
import CardinalThreeDSecureFlow from './cardinal-three-d-secure-flow';

describe('CardinalThreeDSecureFlow', () => {
    let state: InternalCheckoutSelectors;
    let store: CheckoutStore;
    let cardinalClient: Pick<CardinalClient, 'configure' | 'getThreeDSecureData' | 'load' | 'runBinProcess'>;
    let threeDSecureFlow: CardinalThreeDSecureFlow;
    let paymentMethod: PaymentMethod;
    let paymentActionCreator: Pick<PaymentActionCreator, 'submitPayment'>;
    let paymentMethodActionCreator: Pick<PaymentMethodActionCreator, 'loadPaymentMethod'>;

    beforeEach(() => {
        store = createCheckoutStore(getCheckoutStoreStateWithOrder());

        paymentMethod = {
            ...getCybersource(),
            clientToken: 'foo',
        };

        cardinalClient = {
            configure: jest.fn(() => Promise.resolve()),
            getThreeDSecureData: jest.fn(() => Promise.resolve()),
            load: jest.fn(() => Promise.resolve()),
            runBinProcess: jest.fn(() => Promise.resolve()),
        };

        paymentActionCreator = {
            submitPayment: jest.fn(() => of()),
        };

        paymentMethodActionCreator = {
            loadPaymentMethod: jest.fn(() => of()),
        };

        state = store.getState();

        jest.spyOn(store, 'getState')
            .mockReturnValue(state);

        jest.spyOn(state.paymentMethods, 'getPaymentMethodOrThrow')
            .mockReturnValue(paymentMethod);

        threeDSecureFlow = new CardinalThreeDSecureFlow(
            store,
            paymentActionCreator as PaymentActionCreator,
            paymentMethodActionCreator as PaymentMethodActionCreator,
            cardinalClient as CardinalClient
        );
    });

    describe('#prepare', () => {
        it('loads Cardinal client', async () => {
            await threeDSecureFlow.prepare(paymentMethod);

            expect(cardinalClient.load)
                .toHaveBeenCalledWith(paymentMethod.id, paymentMethod.config.testMode);
        });

        it('configures Cardinal client', async () => {
            await threeDSecureFlow.prepare(paymentMethod);

            expect(cardinalClient.configure)
                .toHaveBeenCalledWith(paymentMethod.clientToken);
        });

        it('configures Cardinal client', async () => {
            await threeDSecureFlow.prepare(paymentMethod);

            expect(cardinalClient.configure)
                .toHaveBeenCalledWith(paymentMethod.clientToken);
        });

        it('reloads payment method if client token is undefined', async () => {
            paymentMethod = {
                ...getCybersource(),
                clientToken: '',
            };

            jest.spyOn(state.paymentMethods, 'getPaymentMethodOrThrow')
                .mockReturnValue(paymentMethod);

            await threeDSecureFlow.prepare(paymentMethod);

            expect(paymentMethodActionCreator.loadPaymentMethod)
                .toHaveBeenCalledWith(paymentMethod.id);
        });

        it('does not reload payment method if client token is defined', async () => {
            await threeDSecureFlow.prepare(paymentMethod);

            expect(paymentMethodActionCreator.loadPaymentMethod)
                .not.toHaveBeenCalled();
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

        it('runs BIN detection process if defined', async () => {
            await threeDSecureFlow.start(execute, payload, options, form as HostedForm);

            expect(cardinalClient.runBinProcess)
                .toHaveBeenCalledWith(form.getBin());
        });

        it('executes order submission with client token', async () => {
            await threeDSecureFlow.start(execute, payload, options, form as HostedForm);

            expect(execute)
                .toHaveBeenCalledWith(merge(payload, {
                    payment: {
                        paymentData: {
                            threeDSecure: { token: paymentMethod.clientToken },
                        },
                    },
                }), options);
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
                await threeDSecureFlow.start(execute, payload, options, form as HostedForm);

                expect(cardinalClient.getThreeDSecureData)
                    .toHaveBeenCalledWith(response.body.three_ds_result, {
                        billingAddress: getBillingAddress(),
                        shippingAddress: getShippingAddress(),
                        currencyCode: getCheckout().cart.currency.code,
                        id: getOrder().orderId.toString(),
                        amount: getCheckout().cart.cartAmount,
                    });
            });

            it('submits 3DS token using hosted form if provided', async () => {
                jest.spyOn(cardinalClient, 'getThreeDSecureData')
                    .mockResolvedValue('three_d_secure');

                await threeDSecureFlow.start(execute, payload, options, form as HostedForm);

                expect(form.submit)
                    .toHaveBeenCalledWith(merge(payload.payment, {
                        paymentData: { threeDSecure: 'three_d_secure' },
                    }));
            });

            it('submits 3DS token directly if hosted form is not provided', async () => {
                jest.spyOn(cardinalClient, 'getThreeDSecureData')
                    .mockResolvedValue('three_d_secure');

                await threeDSecureFlow.start(execute, payload, options);

                expect(paymentActionCreator.submitPayment)
                    .toHaveBeenCalledWith(merge(payload.payment, {
                        paymentData: { threeDSecure: 'three_d_secure' },
                    }));
            });
        });
    });
});
