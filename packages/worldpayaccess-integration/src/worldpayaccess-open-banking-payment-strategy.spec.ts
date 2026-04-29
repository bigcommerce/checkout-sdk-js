import {
    OrderFinalizationNotRequiredError,
    PaymentArgumentInvalidError,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import WorldpayAccessOpenBankingPaymentStrategy from './worldpayaccess-open-banking-payment-strategy';

describe('WorldpayAccessOpenBankingPaymentStrategy', () => {
    let strategy: WorldpayAccessOpenBankingPaymentStrategy;
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
        strategy = new WorldpayAccessOpenBankingPaymentStrategy(paymentIntegrationService);
    });

    describe('#execute()', () => {
        afterEach(() => {
            (paymentIntegrationService.submitOrder as jest.Mock).mockClear();
        });

        it('throws error when payment is missing', async () => {
            await strategy.initialize();

            await expect(strategy.execute({})).rejects.toThrow(PaymentArgumentInvalidError);
        });

        it('submits open banking payment with formattedPayload for BigPay mapping', async () => {
            const payload = {
                payment: {
                    methodId: 'open_banking',
                    gatewayId: 'worldpayaccess',
                },
            };

            await strategy.initialize();
            await strategy.execute(payload);

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId: 'open_banking',
                gatewayId: 'worldpayaccess',
                paymentData: {
                    formattedPayload: {
                        open_banking: {},
                        vault_payment_instrument: false,
                        set_as_default_stored_instrument: false,
                    },
                },
            });
        });

        it('redirects when additional_action_required with redirect_url is returned', async () => {
            const payload = {
                payment: {
                    methodId: 'open_banking',
                    gatewayId: 'worldpayaccess',
                },
            };

            Object.defineProperty(window, 'location', {
                value: {
                    replace: jest.fn(),
                },
                writable: true,
                configurable: true,
            });

            await strategy.initialize();

            const redirectUrl = 'https://secure-test.worldpay.com/example';

            jest.spyOn(paymentIntegrationService, 'submitPayment').mockRejectedValueOnce({
                body: {
                    status: 'additional_action_required',
                    additional_action_required: {
                        type: 'offsite_redirect',
                        data: {
                            redirect_url: redirectUrl,
                        },
                    },
                },
            });

            void strategy.execute(payload);
            await new Promise((resolve) => process.nextTick(resolve));

            expect(window.location.replace).toHaveBeenCalledWith(redirectUrl);
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
