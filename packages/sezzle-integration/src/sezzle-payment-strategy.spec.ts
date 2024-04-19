import { createFormPoster, FormPoster } from '@bigcommerce/form-poster';

import {
    PaymentIntegrationService,
    RequestError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getErrorPaymentResponseBody,
    getOrderRequestBody,
    getResponse,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import SezzlePaymentStrategy from './sezzle-payment-strategy';

describe('SezzlePaymentStrategy', () => {
    let formPoster: FormPoster;
    let strategy: SezzlePaymentStrategy;
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        formPoster = createFormPoster();
        paymentIntegrationService = new PaymentIntegrationServiceMock();

        strategy = new SezzlePaymentStrategy(formPoster, paymentIntegrationService);
    });

    describe('#execute()', () => {
        it('redirect to Sezzle if additional action is required with GET mothod', async () => {
            Object.defineProperty(window, 'location', {
                value: {
                    replace: jest.fn(),
                },
            });

            const error = new RequestError(
                getResponse({
                    ...getErrorPaymentResponseBody(),
                    provider_data: '',
                    additional_action_required: {
                        data: {
                            redirect_url: 'https://sandbox.checkout.sezzle.com',
                        },
                        type: 'offsite_redirect',
                    },
                    status: 'additional_action_required',
                }),
            );

            jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValueOnce(
                Promise.reject(error),
            );

            strategy.execute(getOrderRequestBody());

            await new Promise((resolve) => process.nextTick(resolve));

            expect(window.location.replace).toHaveBeenCalledWith(
                'https://sandbox.checkout.sezzle.com',
            );
        });
    });
});
