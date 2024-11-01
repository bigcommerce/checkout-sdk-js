import { FormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';

import {
    OrderRequestBody,
    PaymentArgumentInvalidError,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import createGooglePayScriptLoader from '../factories/create-google-pay-script-loader';
import GooglePayPaymentProcessor from '../google-pay-payment-processor';
import GooglePayPaymentStrategy from '../google-pay-payment-strategy';
import * as TdOnlineMartAdditionalAction from '../guards/is-google-pay-td-online-mart-additional-action';
import { getGeneric } from '../mocks/google-pay-payment-method.mock';

import GooglePayGateway from './google-pay-gateway';
import GooglePayTdOnlineMartGateway from './google-pay-tdonlinemart-gateway';

describe('GooglePayTdOnlineMartGateway', () => {
    let gateway: GooglePayTdOnlineMartGateway;
    let paymentIntegrationService: PaymentIntegrationService;
    let processor: GooglePayPaymentProcessor;
    let strategy: GooglePayPaymentStrategy;
    let payload: OrderRequestBody;
    let formPoster: FormPoster;

    beforeEach(() => {
        formPoster = {
            postForm: jest.fn(),
        } as unknown as FormPoster;

        paymentIntegrationService = new PaymentIntegrationServiceMock();

        gateway = new GooglePayTdOnlineMartGateway(paymentIntegrationService, formPoster);

        processor = new GooglePayPaymentProcessor(
            createGooglePayScriptLoader(),
            new GooglePayTdOnlineMartGateway(paymentIntegrationService, formPoster),
            createRequestSender(),
            formPoster,
        );

        strategy = new GooglePayPaymentStrategy(paymentIntegrationService, processor);

        payload = {
            payment: {
                methodId: 'worldlinena',
            },
        };

        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            getGeneric(),
        );

        jest.spyOn(processor, 'initialize').mockResolvedValue(undefined);
        jest.spyOn(processor, 'getNonce').mockResolvedValue('nonceValue');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('is a special type of GooglePayGateway', () => {
        jest.spyOn(processor, 'processAdditionalAction').mockResolvedValue(undefined);

        expect(gateway).toBeInstanceOf(GooglePayGateway);
    });

    it('should process additional action', async () => {
        jest.spyOn(processor, 'processAdditionalAction').mockResolvedValue(undefined);

        jest.spyOn(paymentIntegrationService, 'submitPayment').mockRejectedValue('error');

        await strategy.execute(payload);

        expect(processor.processAdditionalAction).toHaveBeenCalledWith('error');
    });

    it('throw not additional action error', async () => {
        let submitPaymentError;

        jest.spyOn(TdOnlineMartAdditionalAction, 'isTdOnlineMartAdditionalAction').mockReturnValue(
            false,
        );

        jest.spyOn(paymentIntegrationService, 'submitPayment').mockRejectedValue({
            message: 'any_error',
        });

        try {
            await strategy.execute(payload);
        } catch (error) {
            submitPaymentError = error;
        } finally {
            expect(submitPaymentError).toEqual({ message: 'any_error' });
        }
    });

    it('throw error when not enough 3DS data', async () => {
        let submitPaymentError;

        jest.spyOn(TdOnlineMartAdditionalAction, 'isTdOnlineMartAdditionalAction').mockReturnValue(
            true,
        );

        jest.spyOn(paymentIntegrationService, 'submitPayment').mockRejectedValue({
            body: {
                errors: [
                    {
                        code: 'three_ds_result',
                    },
                ],
                three_ds_result: {},
            },
        });

        try {
            await strategy.execute(payload);
        } catch (error) {
            submitPaymentError = error;
        } finally {
            expect(submitPaymentError).toBeInstanceOf(PaymentArgumentInvalidError);
        }
    });

    it('execute 3DS challenge', async () => {
        const postFormMock = jest.fn((_url, _options, resolveFn) => Promise.resolve(resolveFn()));

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        jest.spyOn(formPoster, 'postForm').mockImplementation(postFormMock);
        jest.spyOn(TdOnlineMartAdditionalAction, 'isTdOnlineMartAdditionalAction').mockReturnValue(
            true,
        );
        jest.spyOn(paymentIntegrationService, 'submitPayment').mockRejectedValue({
            body: {
                errors: [
                    {
                        code: 'three_ds_result',
                    },
                ],
                three_ds_result: {
                    acs_url: 'https://example.com',
                    payer_auth_request: '3ds_session_data',
                    merchant_data: 'creq_data',
                },
            },
        });

        await strategy.execute(payload);

        expect(postFormMock).toHaveBeenCalledWith(
            'https://example.com',
            {
                threeDSSessionData: '3ds_session_data',
                creq: 'creq_data',
            },
            expect.any(Function),
            '_top',
        );
    });
});
