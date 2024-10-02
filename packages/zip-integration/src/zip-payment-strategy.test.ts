import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { omit } from 'lodash';

import {
    MissingDataError,
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentMethod,
    RequestError,
    StorefrontPaymentRequestSender,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getCheckout,
    getErrorPaymentResponseBody,
    getOrderRequestBody,
    getResponse,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import ZipPaymentStrategy from './zip-payment-strategy';

function getZip(): PaymentMethod {
    return {
        id: 'zip',
        logoUrl: '',
        method: 'zip',
        supportedCards: [],
        config: {
            displayName: 'Zip',
            testMode: false,
        },
        type: 'PAYMENT_TYPE_API',
        clientToken: '{"id":"checkout_id"}',
        initializationData: {
            redirectUrl: 'http://some-url',
        },
    };
}

describe('ZipPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;
    let paymentMethodMock: PaymentMethod;
    let requestSender: RequestSender;
    let strategy: ZipPaymentStrategy;
    let storefrontPaymentRequestSender: StorefrontPaymentRequestSender;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
        requestSender = createRequestSender();
        paymentMethodMock = { ...getZip() };

        jest.spyOn(paymentIntegrationService, 'loadPaymentMethod').mockResolvedValue(
            paymentIntegrationService.getState(),
        );
        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethodMock,
        );
        jest.spyOn(paymentIntegrationService, 'applyStoreCredit').mockImplementation(jest.fn());

        jest.spyOn(paymentIntegrationService, 'initializePayment').mockImplementation(jest.fn());

        jest.spyOn(paymentIntegrationService, 'submitOrder').mockImplementation(jest.fn());

        jest.spyOn(paymentIntegrationService, 'submitPayment').mockImplementation(jest.fn());

        storefrontPaymentRequestSender = new StorefrontPaymentRequestSender(requestSender);
        jest.spyOn(storefrontPaymentRequestSender, 'saveExternalId').mockResolvedValue(undefined);

        strategy = new ZipPaymentStrategy(
            paymentIntegrationService,
            storefrontPaymentRequestSender,
        );
    });

    describe('#initialize()', () => {
        it('initializes the strategy successfully', async () => {
            await strategy.initialize();

            await expect(strategy.initialize()).resolves.toBeUndefined();
        });
    });

    describe('#execute()', () => {
        let payload: OrderRequestBody;
        let options: PaymentInitializeOptions;
        let order: Omit<OrderRequestBody, 'payment'>;

        beforeEach(async () => {
            payload = {
                ...getOrderRequestBody(),
                payment: {
                    methodId: 'zip',
                },
            };
            options = { methodId: 'zip' };
            order = omit(payload, 'payment');

            await strategy.initialize();
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        it('executes the strategy successfully', async () => {
            await strategy.execute(payload, options);

            expect(paymentIntegrationService.applyStoreCredit).toHaveBeenCalledWith(false);
            expect(paymentIntegrationService.initializePayment).toHaveBeenCalledWith('zip', {
                useStoreCredit: false,
            });
            expect(paymentIntegrationService.submitOrder).toHaveBeenCalledWith(order, options);
            expect(storefrontPaymentRequestSender.saveExternalId).toHaveBeenCalledWith(
                'zip',
                'checkout_id',
            );
            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId: 'zip',
                paymentData: { nonce: 'checkout_id' },
            });
        });

        it('applies store credit to order', async () => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getCheckoutOrThrow',
            ).mockReturnValueOnce({
                ...getCheckout(),
                isStoreCreditApplied: true,
            });

            await strategy.execute(payload, options);

            expect(paymentIntegrationService.applyStoreCredit).toHaveBeenCalledWith(true);
        });

        it('redirects to Zip URL', async () => {
            Object.defineProperty(window, 'location', {
                value: {
                    replace: jest.fn(),
                },
            });
            await strategy.initialize();

            const error = new RequestError(
                getResponse({
                    ...getErrorPaymentResponseBody(),
                    status: 'additional_action_required',
                }),
            );

            jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValueOnce(
                Promise.reject(error),
            );

            void strategy.execute(payload);
            await new Promise((resolve) => process.nextTick(resolve));

            expect(window.location.replace).toHaveBeenCalledWith('http://some-url');
        });

        describe('fails to execute if:', () => {
            it('payment argument is invalid', async () => {
                payload.payment = undefined;

                await expect(strategy.execute(payload, options)).rejects.toThrow(
                    PaymentArgumentInvalidError,
                );
            });

            it('payment token is not found', async () => {
                jest.spyOn(
                    paymentIntegrationService.getState(),
                    'getPaymentMethodOrThrow',
                ).mockReturnValue({ ...getZip(), clientToken: '' });

                await expect(strategy.execute(payload, options)).rejects.toThrow(MissingDataError);
            });

            it('clientToken is not valid JSON', async () => {
                jest.spyOn(
                    paymentIntegrationService.getState(),
                    'getPaymentMethodOrThrow',
                ).mockReturnValue({ ...getZip(), clientToken: 'm4lf0rm3d j50n' });

                await expect(strategy.execute(payload, options)).rejects.toThrow(SyntaxError);
            });

            it('nonce is empty', async () => {
                jest.spyOn(
                    paymentIntegrationService.getState(),
                    'getPaymentMethodOrThrow',
                ).mockReturnValue({ ...getZip(), clientToken: JSON.stringify({ id: '' }) });

                await expect(strategy.execute(payload, options)).rejects.toThrow(MissingDataError);
            });

            it('redirectUrl is empty', async () => {
                jest.spyOn(
                    paymentIntegrationService.getState(),
                    'getPaymentMethodOrThrow',
                ).mockReturnValue({ ...getZip(), initializationData: { redirectUrl: '' } });

                await expect(strategy.execute(payload, options)).rejects.toThrow(MissingDataError);
            });

            it('RequestError status is not additional_action_required', async () => {
                await strategy.initialize();

                const error = new RequestError(getResponse(getErrorPaymentResponseBody()));

                jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValueOnce(
                    Promise.reject(error),
                );

                await expect(strategy.execute(getOrderRequestBody())).rejects.toThrow(error);
            });
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
