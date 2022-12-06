import { createFormPoster, FormPoster } from '@bigcommerce/form-poster';
import { noop, omit } from 'lodash';

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

import ExternalPaymentStrategy from './external-payment-strategy';

describe('ExternalPaymentStrategy', () => {
    let formPoster: FormPoster;
    let strategy: ExternalPaymentStrategy;
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        formPoster = createFormPoster();

        paymentIntegrationService = new PaymentIntegrationServiceMock();
        strategy = new ExternalPaymentStrategy(formPoster, paymentIntegrationService);

        jest.spyOn(formPoster, 'postForm').mockImplementation((_url, _data, callback = noop) =>
            callback(),
        );
    });

    describe('#execute()', () => {
        it('throws error when payment data is empty', async () => {
            await expect(strategy.execute({})).rejects.toThrow(PaymentArgumentInvalidError);
        });

        it('submits order without payment data', async () => {
            const payload = getOrderRequestBody();
            const options = { methodId: 'laybuy' };
            const { payment } = payload;
            const paymentData = payment && payment.paymentData;

            await strategy.execute(payload, options);

            expect(paymentIntegrationService.submitOrder).toHaveBeenCalledWith(
                omit(payload, 'payment'),
                options,
            );
            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                ...payment,
                paymentData,
            });
        });

        it('rejects payment when error is different to additional_action_required', async () => {
            const error = new RequestError(getResponse(getErrorPaymentResponseBody()));

            jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValueOnce(
                Promise.reject(error),
            );

            await expect(strategy.execute(getOrderRequestBody())).rejects.toThrow(error);

            expect(formPoster.postForm).not.toHaveBeenCalled();
        });

        it('redirects to Laybuy if additional action is required', async () => {
            const redirect_url = 'https://sandbox-payment.laybuy.com';
            const error = new RequestError(
                getResponse({
                    ...getErrorPaymentResponseBody(),

                    additional_action_required: {
                        data: {
                            redirect_url,
                        },
                        type: 'offsite_redirect',
                    },
                    status: 'additional_action_required',
                }),
            );

            jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValueOnce(
                Promise.reject(error),
            );

            void strategy.execute(getOrderRequestBody());

            await new Promise((resolve) => process.nextTick(resolve));

            expect(formPoster.postForm).toHaveBeenCalledWith(redirect_url, {});
        });
    });

    describe('#initialize()', () => {
        it('initializes the strategy successfully', async () => {
            const result = await strategy.initialize();

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
