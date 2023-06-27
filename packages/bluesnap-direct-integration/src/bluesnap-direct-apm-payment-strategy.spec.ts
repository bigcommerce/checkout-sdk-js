import { omit } from 'lodash';

import {
    OrderFinalizationNotRequiredError,
    PaymentArgumentInvalidError,
    PaymentIntegrationService,
    RequestError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getErrorPaymentResponseBody,
    getOrderRequestBody,
    getResponse,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BlueSnapDirectAPMPaymentStrategy from './bluesnap-direct-apm-payment-strategy';
import * as iframeCreator from './bluesnap-direct-iframe-creator';

describe('BlueSnapDirectAPMPaymentStrategy', () => {
    let strategy: BlueSnapDirectAPMPaymentStrategy;
    let paymentIntegrationService: PaymentIntegrationService;
    const onLoad = jest.fn();

    const initializeOptions = {
        methodId: 'foobar',
        bluesnapdirect: {
            onLoad,
            style: {
                border: '1px solid gray',
                height: '40vh',
                width: '100%',
            },
        },
    };

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
        strategy = new BlueSnapDirectAPMPaymentStrategy(paymentIntegrationService);
    });

    describe('#execute()', () => {
        const payload = {
            payment: {
                gatewayId: 'bluesnapdirect',
                methodId: 'moneybookers',
                paymentData: {
                    terms: false,
                    shouldCreateAccount: true,
                    shouldSaveInstrument: false,
                },
            },
        };
        const options = { methodId: 'bluesnapdirect' };

        it('throws error when payment data is empty', async () => {
            await strategy.initialize(initializeOptions);

            await expect(strategy.execute({})).rejects.toThrow(PaymentArgumentInvalidError);
        });

        it('submits order without payment data', async () => {
            await strategy.initialize(initializeOptions);

            await strategy.execute(payload, options);

            expect(paymentIntegrationService.submitOrder).toHaveBeenCalledWith(
                omit(payload, 'payment'),
                options,
            );
            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId: payload.payment.methodId,
            });
        });

        it('rejects payment when error is different to additional_action_required', async () => {
            await strategy.initialize(initializeOptions);

            const error = new RequestError(getResponse(getErrorPaymentResponseBody()));

            jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValueOnce(
                Promise.reject(error),
            );

            await expect(strategy.execute(getOrderRequestBody())).rejects.toThrow(error);

            expect(onLoad).not.toHaveBeenCalled();
        });

        it('redirects to bluesnapdirect if additional action is required', async () => {
            const createIframeMock = jest.fn();

            jest.spyOn(iframeCreator, 'createIframe').mockImplementation(createIframeMock);

            await strategy.initialize(initializeOptions);

            const redirect_url = 'https://sandbox.bluesnap.com/buynow/checkout?enc=test';
            const error = new RequestError(
                getResponse({
                    additional_action_required: {
                        data: {
                            redirect_url,
                        },
                        type: 'offsite_redirect',
                    },
                    status: 'additional_action_required',
                    provider_data: JSON.stringify({
                        merchantid: '123',
                    }),
                }),
            );

            jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValueOnce(
                Promise.reject(error),
            );

            void strategy.execute(payload, options);

            await new Promise((resolve) => process.nextTick(resolve));

            expect(createIframeMock).toHaveBeenCalledWith(
                'bluesnap_direct_hosted_payment_page',
                `${redirect_url}&merchantid=123`,
                initializeOptions.bluesnapdirect.style,
            );
            expect(onLoad).toHaveBeenCalled();
        });
    });

    describe('#initialize()', () => {
        it('initializes the strategy successfully', async () => {
            const result = await strategy.initialize(initializeOptions);

            expect(result).toBeUndefined();
        });
    });

    describe('#finalize()', () => {
        it('throws error to inform that order finalization is not required', async () => {
            await expect(strategy.finalize()).rejects.toThrow(OrderFinalizationNotRequiredError);
        });
    });

    describe('#deinitialize()', () => {
        it('deinitializes strategy', async () => {
            const result = await strategy.deinitialize();

            expect(result).toBeUndefined();
        });
    });
});
