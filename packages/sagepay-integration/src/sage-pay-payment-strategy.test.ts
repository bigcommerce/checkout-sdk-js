import { FormPoster } from '@bigcommerce/form-poster';
import { noop, omit } from 'lodash';

import { CreditCardPaymentStrategy } from '@bigcommerce/checkout-sdk/credit-card-integration';
import {
    MissingDataError,
    NotInitializedError,
    OrderFinalizationNotRequiredError,
    PaymentIntegrationService,
    PaymentMethod,
    RequestError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getConfig,
    getErrorPaymentResponseBody,
    getOrder,
    getOrderRequestBody,
    getPaymentMethod,
    getResponse,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import SagePayPaymentStrategy from './sage-pay-payment-strategy';

describe('SagePayPaymentStrategy', () => {
    let formPoster: FormPoster;
    let paymentIntegrationService: PaymentIntegrationService;
    let paymentMethod: PaymentMethod;
    let strategy: SagePayPaymentStrategy;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
        formPoster = {
            postForm: jest.fn(),
        } as unknown as FormPoster;

        paymentMethod = getPaymentMethod();

        jest.spyOn(formPoster, 'postForm').mockImplementation((_url, _data, callback = noop) =>
            callback(),
        );

        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethod,
        );

        jest.spyOn(paymentIntegrationService, 'loadPaymentMethod').mockResolvedValue(
            paymentIntegrationService.getState(),
        );
        jest.spyOn(paymentIntegrationService, 'finalizeOrder').mockImplementation(jest.fn());

        jest.spyOn(paymentIntegrationService, 'submitOrder').mockImplementation(jest.fn());

        jest.spyOn(paymentIntegrationService, 'submitPayment').mockImplementation(jest.fn());

        strategy = new SagePayPaymentStrategy(paymentIntegrationService, formPoster);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('submits order without payment data', async () => {
        const payload = getOrderRequestBody();
        const options = { methodId: 'sagepay' };

        await strategy.execute(payload, options);

        expect(paymentIntegrationService.submitOrder).toHaveBeenCalledWith(
            omit(payload, 'payment'),
            options,
        );
    });

    it('submits payment separately', async () => {
        const payload = getOrderRequestBody();
        const options = { methodId: 'sagepay' };

        await strategy.execute(payload, options);

        expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(payload.payment);
    });

    it('posts 3ds data to Sage if 3ds is enabled', async () => {
        const error = new RequestError(
            getResponse({
                ...getErrorPaymentResponseBody(),
                errors: [{ code: 'three_d_secure_required' }],
                three_ds_result: {
                    acs_url: 'https://acs/url',
                    callback_url: 'https://callback/url',
                    payer_auth_request: 'payer_auth_request',
                    merchant_data: 'merchant_data',
                },
                status: 'error',
            }),
        );

        jest.spyOn(paymentIntegrationService, 'submitPayment').mockRejectedValue(error);

        strategy.execute(getOrderRequestBody());

        await new Promise((resolve) => process.nextTick(resolve));

        expect(formPoster.postForm).toHaveBeenCalledWith(
            'https://acs/url',
            {
                PaReq: 'payer_auth_request',
                TermUrl: 'https://callback/url',
                MD: 'merchant_data',
            },
            undefined,
            '_top',
        );
    });

    it('does not post 3ds data to Sage if 3ds is not enabled', async () => {
        jest.spyOn(paymentIntegrationService, 'submitPayment').mockImplementation(jest.fn());

        await strategy.execute(getOrderRequestBody());

        expect(formPoster.postForm).not.toHaveBeenCalled();
    });

    it('does not finalize order if order is not created', async () => {
        const state = paymentIntegrationService.getState();

        jest.spyOn(state, 'getOrder').mockReturnValue(undefined);

        try {
            await strategy.finalize();
        } catch (error) {
            expect(paymentIntegrationService.finalizeOrder).not.toHaveBeenCalled();
            expect(error).toBeInstanceOf(OrderFinalizationNotRequiredError);
        }
    });

    it('does not finalize order if order is not finalized', async () => {
        const order = getOrder();

        jest.spyOn(paymentIntegrationService, 'finalizeOrder').mockResolvedValue({
            ...paymentIntegrationService.getState(),
            getOrder: () => order,
            getPaymentStatus: () => 'INITIALIZE',
        });

        await expect(strategy.finalize()).rejects.toThrow(OrderFinalizationNotRequiredError);
    });

    it('throws error if order is missing', async () => {
        const state = paymentIntegrationService.getState();

        jest.spyOn(state, 'getOrder').mockReturnValue(undefined);

        try {
            await strategy.finalize();
        } catch (error) {
            expect(error).toBeInstanceOf(OrderFinalizationNotRequiredError);
        }
    });

    it('is special type of credit card strategy', () => {
        expect(strategy).toBeInstanceOf(CreditCardPaymentStrategy);
    });

    describe('#finalize()', () => {
        it('throws an error to inform that order finalization is not required', () => {
            const promise = strategy.finalize();

            return expect(promise).rejects.toBeInstanceOf(OrderFinalizationNotRequiredError);
        });
    });

    describe('#Execute with 3DS2 experiment on', () => {
        beforeEach(() => {
            const config = getConfig();

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getStoreConfigOrThrow',
            ).mockReturnValue({
                ...config.storeConfig,
                checkoutSettings: {
                    ...config.storeConfig.checkoutSettings,
                    features: {
                        'INT-4994.Opayo_3DS2': true,
                    },
                },
            });
        });

        it('submit payment with browser_info', async () => {
            const payload = getOrderRequestBody();
            const options = { methodId: 'sagepay' };

            await strategy.execute(payload, options);

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                ...payload.payment,
                paymentData: {
                    ...payload.payment?.paymentData,
                    browser_info: {
                        color_depth: expect.any(Number),
                        java_enabled: expect.any(Boolean),
                        language: expect.any(String),
                        screen_height: expect.any(Number),
                        screen_width: expect.any(Number),
                        time_zone_offset: expect.any(String),
                    },
                },
            });
        });

        it('posts 3ds data to Sage if 3ds is enabled', async () => {
            const error = new RequestError(
                getResponse({
                    ...getErrorPaymentResponseBody(),
                    errors: [{ code: 'three_d_secure_required' }],
                    three_ds_result: {
                        acs_url: 'https://acs/url',
                        payer_auth_request: 'c_request',
                    },
                    status: 'error',
                }),
            );

            jest.spyOn(paymentIntegrationService, 'submitPayment').mockRejectedValue(error);

            strategy.execute(getOrderRequestBody());

            await new Promise((resolve) => process.nextTick(resolve));
            expect(formPoster.postForm).toHaveBeenCalledWith(
                'https://acs/url',
                {
                    creq: 'c_request',
                },
                undefined,
                '_top',
            );
        });
    });
    describe('should fail if...', () => {
        test('payment data is not provided', async () => {
            const payload = {
                ...getOrderRequestBody(),
                payment: undefined,
            };

            try {
                await strategy.execute(payload);
            } catch (error) {
                expect(error).toBeInstanceOf(NotInitializedError);
            }
        });
        test('payment is not provided', async () => {
            const payload = {
                ...getOrderRequestBody(),
                payment: {
                    paymentData: undefined,
                    methodId: 'sagepay',
                },
            };

            try {
                await strategy.execute(payload);
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });
    });
});
