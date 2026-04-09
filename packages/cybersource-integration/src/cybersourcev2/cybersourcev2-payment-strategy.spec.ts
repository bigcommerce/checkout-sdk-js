import {
    InvalidArgumentError,
    MissingDataError,
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentArgumentInvalidError,
    PaymentIntegrationService,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getOrderRequestBody,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import { getCybersource } from '../cybersource.mock';

import CybersourceUnifiedCheckoutClient from './cybersource-unified-checkout-client';
import CyberSourceV2PaymentStrategy from './cybersourcev2-payment-strategy';

describe('CyberSourceV2PaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;
    let paymentMethod: PaymentMethod;
    let strategy: CyberSourceV2PaymentStrategy;
    let unifiedCheckoutClient: jest.Mocked<
        Pick<CybersourceUnifiedCheckoutClient, 'load' | 'initialize' | 'createTransientToken' | 'teardown'>
    >;

    const containerId = 'unified-checkout-container';

    beforeEach(() => {
        paymentMethod = {
            ...getCybersource(),
            id: 'cybersourcev2',
            clientToken: 'capture-context-jwt',
        };

        paymentIntegrationService = new PaymentIntegrationServiceMock();

        unifiedCheckoutClient = {
            load: jest.fn(() => Promise.resolve()),
            initialize: jest.fn(),
            createTransientToken: jest.fn(() => Promise.resolve('transient-token')),
            teardown: jest.fn(),
        };

        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethod,
        );

        strategy = new CyberSourceV2PaymentStrategy(
            paymentIntegrationService,
            unifiedCheckoutClient as unknown as CybersourceUnifiedCheckoutClient,
        );
    });

    describe('#initialize', () => {
        it('throws InvalidArgumentError if containerId is not provided', async () => {
            await expect(
                strategy.initialize({ methodId: paymentMethod.id }),
            ).rejects.toThrow(InvalidArgumentError);
        });

        it('throws MissingDataError if clientToken is missing', async () => {
            paymentMethod.clientToken = undefined;

            await expect(
                strategy.initialize({
                    methodId: paymentMethod.id,
                    cybersourcev2: { containerId },
                }),
            ).rejects.toThrow(MissingDataError);
        });

        it('throws error if payment method is not defined', async () => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockImplementation(() => {
                throw new Error();
            });

            await expect(
                strategy.initialize({
                    methodId: paymentMethod.id,
                    cybersourcev2: { containerId },
                }),
            ).rejects.toThrow(Error);
        });

        it('loads and initializes the Unified Checkout SDK', async () => {
            await strategy.initialize({
                methodId: paymentMethod.id,
                cybersourcev2: { containerId },
            });

            expect(unifiedCheckoutClient.load).toHaveBeenCalledWith(paymentMethod.config.testMode);
            expect(unifiedCheckoutClient.initialize).toHaveBeenCalledWith(
                paymentMethod.clientToken,
                containerId,
            );
        });
    });

    describe('#execute', () => {
        let payload: OrderRequestBody;

        beforeEach(async () => {
            payload = {
                ...getOrderRequestBody(),
                payment: {
                    methodId: paymentMethod.id,
                    gatewayId: paymentMethod.gateway,
                },
            };

            await strategy.initialize({
                methodId: paymentMethod.id,
                cybersourcev2: { containerId },
            });
        });

        it('throws PaymentArgumentInvalidError with empty payload', async () => {
            await expect(strategy.execute({})).rejects.toThrow(PaymentArgumentInvalidError);
        });

        it('creates a transient token and submits order and payment', async () => {
            await strategy.execute(payload);

            expect(unifiedCheckoutClient.createTransientToken).toHaveBeenCalled();
            expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(
                expect.objectContaining({
                    paymentData: { nonce: 'transient-token' },
                }),
            );
        });
    });

    describe('#deinitialize', () => {
        it('tears down the Unified Checkout SDK', async () => {
            await strategy.deinitialize();

            expect(unifiedCheckoutClient.teardown).toHaveBeenCalled();
        });
    });

    describe('#finalize', () => {
        it('rejects with OrderFinalizationNotRequiredError', async () => {
            await expect(strategy.finalize()).rejects.toThrow(OrderFinalizationNotRequiredError);
        });
    });
});
