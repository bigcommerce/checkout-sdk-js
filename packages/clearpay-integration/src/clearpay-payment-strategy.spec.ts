import { createScriptLoader } from '@bigcommerce/script-loader';
import { merge, noop } from 'lodash';

import {
    InvalidArgumentError,
    MissingDataError,
    NotInitializedError,
    OrderFinalizationNotCompletedError,
    OrderRequestBody,
    PaymentIntegrationService,
    PaymentMethod,
    RequestError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getBillingAddress,
    getCheckout,
    getErrorPaymentResponseBody,
    getErrorResponse,
    getOrderRequestBody,
    getResponse,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import ClearpayPaymentStrategy from './clearpay-payment-strategy';
import ClearpayScriptLoader from './clearpay-script-loader';
import { getClearpay } from './clearpay.mock';

describe('ClearpayPaymentStrategy', () => {
    let payload: OrderRequestBody;
    let paymentMethod: PaymentMethod;
    let scriptLoader: ClearpayScriptLoader;
    let strategy: ClearpayPaymentStrategy;
    let paymentIntegrationService: PaymentIntegrationService;

    const clearpaySdk = {
        initialize: noop,
        redirect: noop,
    };

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
        scriptLoader = new ClearpayScriptLoader(createScriptLoader());
        strategy = new ClearpayPaymentStrategy(paymentIntegrationService, scriptLoader);

        paymentMethod = getClearpay();

        payload = merge({}, getOrderRequestBody(), {
            payment: {
                methodId: paymentMethod.id,
                gatewayId: paymentMethod.gateway,
            },
        });

        jest.spyOn(paymentIntegrationService, 'validateCheckout').mockReturnValue(
            new Promise<void>((resolve) => resolve()),
        );

        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethod,
        );

        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethod').mockReturnValue(
            paymentMethod,
        );

        jest.spyOn(scriptLoader, 'load').mockReturnValue(Promise.resolve(clearpaySdk));

        jest.spyOn(clearpaySdk, 'initialize').mockImplementation(noop);

        jest.spyOn(clearpaySdk, 'redirect').mockImplementation(noop);
    });

    describe('#initialize()', () => {
        it('loads script when initializing strategy', async () => {
            await strategy.initialize({
                methodId: paymentMethod.id,
                gatewayId: paymentMethod.gateway,
            });

            expect(scriptLoader.load).toHaveBeenCalledWith(paymentMethod);
        });
    });

    describe('#execute()', () => {
        const successHandler = jest.fn();

        beforeEach(async () => {
            await strategy.initialize({
                methodId: paymentMethod.id,
                gatewayId: paymentMethod.gateway,
            });

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getBillingAddressOrThrow',
            ).mockReturnValue({
                ...getBillingAddress(),
                countryCode: 'GB',
            });

            jest.spyOn(paymentIntegrationService.getState(), 'getCheckout').mockReturnValue(
                getCheckout(),
            );

            strategy.execute(payload).then(successHandler);

            await new Promise((resolve) => process.nextTick(resolve));
        });

        it('redirects to Clearpay', () => {
            expect(clearpaySdk.initialize).toHaveBeenCalledWith({ countryCode: 'GB' });
            expect(clearpaySdk.redirect).toHaveBeenCalledWith({ token: paymentMethod.clientToken });
        });

        it('applies store credit usage', () => {
            expect(paymentIntegrationService.applyStoreCredit).toHaveBeenCalledWith(false);
        });

        it('validates nothing has changed before redirecting to Clearpay checkout page', async () => {
            await new Promise((resolve) => process.nextTick(resolve));

            expect(paymentIntegrationService.validateCheckout).toHaveBeenCalled();
        });

        it('rejects with error if execution is unsuccessful', async () => {
            jest.spyOn(paymentIntegrationService, 'applyStoreCredit').mockReturnValueOnce(
                Promise.reject(new RequestError()),
            );

            const errorHandler = jest.fn();

            strategy.execute(payload).catch(errorHandler);

            await new Promise((resolve) => process.nextTick(resolve));

            expect(errorHandler).toHaveBeenCalled();
        });

        it('throws error if trying to execute before initialization', async () => {
            await strategy.deinitialize();

            try {
                await strategy.execute(payload);
            } catch (error) {
                expect(error).toBeInstanceOf(NotInitializedError);
            }
        });

        it('throws InvalidArgumentError if loadPaymentMethod fails', async () => {
            const errorResponse = merge(getErrorResponse(), {
                body: {
                    status: 422,
                },
            });

            jest.spyOn(paymentIntegrationService, 'loadPaymentMethod').mockImplementationOnce(
                () => {
                    throw new RequestError(errorResponse);
                },
            );

            expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalledWith(
                payload.payment?.gatewayId,
                {
                    params: { method: payload.payment?.methodId },
                },
            );

            await expect(strategy.execute(payload)).rejects.toThrow(InvalidArgumentError);
        });

        it('throws RequestError if loadPaymentMethod fails', async () => {
            jest.spyOn(paymentIntegrationService, 'loadPaymentMethod').mockImplementationOnce(
                () => {
                    throw new RequestError(getErrorResponse());
                },
            );

            await expect(strategy.execute(payload)).rejects.toThrow(RequestError);
        });

        it('loads payment client token', () => {
            expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalledWith(
                paymentMethod.gateway,
                { params: { method: paymentMethod.id } },
            );
        });

        it("throws error if GB isn't the courtryCode in the billing address", async () => {
            await strategy.deinitialize();

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getBillingAddressOrThrow',
            ).mockReturnValue({
                ...getBillingAddress(),
                countryCode: 'US',
            });

            strategy = new ClearpayPaymentStrategy(paymentIntegrationService, scriptLoader);

            await expect(strategy.execute(payload)).rejects.toThrow(InvalidArgumentError);
        });
    });

    describe('#finalize()', () => {
        const nonce = 'bar';

        beforeEach(() => {
            strategy = new ClearpayPaymentStrategy(paymentIntegrationService, scriptLoader);
        });

        it('submits the order and the payment', async () => {
            jest.spyOn(paymentIntegrationService.getState(), 'getContextConfig').mockReturnValue({
                checkoutId: '6a6071cc-82ba-45aa-adb0-ebec42d6ff6f',
                flashMessages: [],
                geoCountryCode: 'AU',
                payment: {
                    formId: 'dc030783-6129-4ee3-8e06-6f4270df1527',
                    token: nonce,
                },
            });
            jest.spyOn(paymentIntegrationService.getState(), 'getPaymentId').mockReturnValue({
                providerId: paymentMethod.id,
            });

            await strategy.initialize({
                methodId: paymentMethod.id,
                gatewayId: paymentMethod.gateway,
            });
            await strategy.finalize({
                methodId: paymentMethod.id,
                gatewayId: paymentMethod.gateway,
            });

            expect(paymentIntegrationService.submitOrder).toHaveBeenCalledWith(
                {},
                { methodId: paymentMethod.id, gatewayId: paymentMethod.gateway },
            );

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId: paymentMethod.id,
                paymentData: { nonce },
            });

            jest.spyOn(paymentIntegrationService, 'forgetCheckout');

            expect(paymentIntegrationService.forgetCheckout).not.toHaveBeenCalled();
        });

        it('throws error if unable to finalize order due to missing data', async () => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getContextConfig',
            ).mockReturnValueOnce(undefined);

            await expect(
                strategy.finalize({ methodId: paymentMethod.id, gatewayId: paymentMethod.gateway }),
            ).rejects.toThrow(MissingDataError);
        });

        it('throws OrderFinalizationNotCompleted error if unable to finalize order', async () => {
            const response = new RequestError(getResponse(getErrorPaymentResponseBody()));

            jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValue(
                Promise.reject(response),
            );
            jest.spyOn(paymentIntegrationService, 'forgetCheckout').mockImplementation(jest.fn());
            jest.spyOn(paymentIntegrationService, 'loadPaymentMethods').mockImplementation(
                jest.fn(),
            );

            await strategy.initialize({
                methodId: paymentMethod.id,
                gatewayId: paymentMethod.gateway,
            });

            await expect(
                strategy.finalize({ methodId: paymentMethod.id, gatewayId: paymentMethod.gateway }),
            ).rejects.toThrow(OrderFinalizationNotCompletedError);

            expect(paymentIntegrationService.submitOrder).toHaveBeenCalledWith(
                {},
                { methodId: paymentMethod.id, gatewayId: paymentMethod.gateway },
            );

            expect(paymentIntegrationService.forgetCheckout).toHaveBeenCalledWith(paymentMethod.id);
            expect(paymentIntegrationService.loadPaymentMethods).toHaveBeenCalled();
        });
    });
});
