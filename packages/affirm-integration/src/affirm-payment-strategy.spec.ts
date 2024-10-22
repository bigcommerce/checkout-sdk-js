import { merge } from 'lodash';

import {
    MissingDataError,
    NotInitializedError,
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentArgumentInvalidError,
    PaymentIntegrationService,
    PaymentMethod,
    PaymentMethodCancelledError,
    PaymentMethodInvalidError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getBillingAddress,
    getOrderRequestBody,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import { Affirm } from './affirm';
import AffirmPaymentStrategy from './affirm-payment-strategy';
import AffirmScriptLoader from './affirm-script-loader';
import { getAffirm, getAffirmScriptMock } from './affirm.mock';

describe('AffirmPaymentStrategy', () => {
    let affirm: Affirm;
    let payload: OrderRequestBody;
    let paymentMethod: PaymentMethod;
    let strategy: AffirmPaymentStrategy;
    let affirmScriptLoader: AffirmScriptLoader;
    let paymentIntegrationService: PaymentIntegrationService;
    const affirmCheckoutMock = jest.fn();

    beforeEach(() => {
        affirm = getAffirmScriptMock(affirmCheckoutMock);
        affirm.checkout.open = jest.fn();
        affirm.ui.error.on = jest.fn();
        paymentMethod = getAffirm();
        paymentIntegrationService = new PaymentIntegrationServiceMock();
        affirmScriptLoader = new AffirmScriptLoader();
        strategy = new AffirmPaymentStrategy(paymentIntegrationService, affirmScriptLoader);

        jest.spyOn(paymentIntegrationService, 'submitOrder').mockImplementation(jest.fn());

        jest.spyOn(paymentIntegrationService, 'submitPayment').mockImplementation(jest.fn());

        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethod,
        );

        jest.spyOn(paymentIntegrationService, 'loadPaymentMethod').mockResolvedValue(
            paymentIntegrationService.getState(),
        );

        jest.spyOn(affirmScriptLoader, 'load').mockResolvedValue(affirm);

        jest.spyOn(paymentIntegrationService.getState(), 'getBillingAddress').mockImplementation(
            () => getBillingAddress(),
        );

        payload = merge({}, getOrderRequestBody(), {
            payment: {
                methodId: paymentMethod.id,
                gatewayId: paymentMethod.gateway,
            },
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('#initialize()', () => {
        it('throws error if client token is missing', async () => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue({
                ...paymentMethod,
                clientToken: undefined,
            });

            await expect(strategy.initialize({ methodId: paymentMethod.id })).rejects.toThrow(
                MissingDataError,
            );
        });

        it('loads affirm script from snippet with testMode equals to true', async () => {
            paymentMethod.config.testMode = true;
            await strategy.initialize({ methodId: paymentMethod.id });

            expect(affirmScriptLoader.load).toHaveBeenCalledWith(paymentMethod.clientToken, true);
        });

        it('loads affirm script from snippet with testMode equals to false', async () => {
            await strategy.initialize({ methodId: paymentMethod.id });

            expect(affirmScriptLoader.load).toHaveBeenCalledWith(paymentMethod.clientToken, false);
        });
    });

    describe('#execute()', () => {
        beforeEach(() => {
            jest.spyOn(affirm.checkout, 'open').mockImplementation(({ onSuccess }) => {
                onSuccess({
                    checkout_token: '1234',
                    created: '1234',
                });
            });
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        it('creates order, checkout and payment', async () => {
            const options = {
                methodId: 'affirm',
                gatewayId: undefined,
                timeout: undefined,
                params: {
                    include: [
                        'lineItems.physicalItems.categories',
                        'lineItems.digitalItems.categories',
                    ],
                },
            };

            await strategy.initialize({
                methodId: paymentMethod.id,
                gatewayId: paymentMethod.gateway,
            });

            await strategy.execute(payload, options);

            expect(paymentIntegrationService.submitOrder).toHaveBeenCalledWith(
                { useStoreCredit: false },
                options,
            );
            expect(affirmCheckoutMock).toHaveBeenCalled();
            expect(affirm.checkout.open).toHaveBeenCalled();
            expect(affirm.ui.error.on).toHaveBeenCalled();
            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId: paymentMethod.id,
                paymentData: { nonce: '1234' },
            });
        });

        it('initializes the Affirm checkout call with the correct payload', async () => {
            const checkoutPayload = {
                billing: {
                    address: {
                        city: 'Some City',
                        country: 'US',
                        line1: '12345 Testing Way',
                        line2: '',
                        state: 'CA',
                        zipcode: '95555',
                    },
                    email: 'test@bigcommerce.com',
                    name: {
                        first: 'Test',
                        full: 'Test Tester',
                        last: 'Tester',
                    },
                    phone_number: '555-555-5555',
                },
                discounts: {
                    '279F507D817E3E7': {
                        discount_amount: 500,
                        discount_display_name: '$5.00 off the shipping total',
                    },
                    DISCOUNTED_AMOUNT: {
                        discount_amount: 1000,
                        discount_display_name: 'discount',
                    },
                    savebig2015: {
                        discount_amount: 500,
                        discount_display_name: '20% off each item',
                    },
                },
                items: [
                    {
                        categories: [['Cat 1'], ['Furniture', 'Bed']],
                        display_name: 'Canvas Laundry Cart',
                        item_image_url: '/images/canvas-laundry-cart.jpg',
                        item_url: '/canvas-laundry-cart/',
                        qty: 1,
                        sku: 'CLC',
                        unit_price: 19000,
                    },
                    {
                        display_name: '$100 Gift Certificate',
                        item_image_url: '',
                        item_url: '',
                        qty: 1,
                        sku: '',
                        unit_price: 10000,
                    },
                ],
                merchant: {
                    user_cancel_url: 'https://store-k1drp8k8.bcapp.dev/checkout',
                    user_confirmation_url: 'https://store-k1drp8k8.bcapp.dev/checkout',
                    user_confirmation_url_action: 'POST',
                },
                metadata: {
                    mode: 'modal',
                    platform_affirm: '',
                    platform_type: 'BigCommerce',
                    platform_version: '',
                    shipping_type: 'shipping_flatrate',
                },
                order_id: '295',
                shipping: {
                    address: {
                        city: 'Some City',
                        country: 'US',
                        line1: '12345 Testing Way',
                        line2: '',
                        state: 'CA',
                        zipcode: '95555',
                    },
                    name: {
                        first: 'Test',
                        full: 'Test Tester',
                        last: 'Tester',
                    },
                    phone_number: '555-555-5555',
                },
                shipping_amount: 1500,
                tax_amount: 300,
                total: 19000,
            };

            const options = { methodId: 'affirm', gatewayId: undefined };

            await strategy.initialize({
                methodId: paymentMethod.id,
                gatewayId: paymentMethod.gateway,
            });

            await strategy.execute(payload, options);

            expect(affirmCheckoutMock).toHaveBeenCalledWith(checkoutPayload);
        });

        it('does not create affirm object if shippingAddress does not exist', async () => {
            jest.spyOn(paymentIntegrationService.getState(), 'getShippingAddress').mockReturnValue(
                undefined,
            );

            await strategy.initialize({
                methodId: paymentMethod.id,
                gatewayId: paymentMethod.gateway,
            });

            await strategy.execute(payload);

            expect(paymentIntegrationService.getState().getShippingAddress).toHaveBeenCalled();
        });

        it('returns cancel error on affirm if users cancel flow', async () => {
            jest.spyOn(affirm.checkout, 'open').mockImplementation(({ onFail }) => {
                onFail({
                    reason: 'canceled',
                });
            });

            await strategy.initialize({
                methodId: paymentMethod.id,
                gatewayId: paymentMethod.gateway,
            });

            await expect(strategy.execute(payload)).rejects.toThrow(PaymentMethodCancelledError);
        });

        it('returns invalid error on affirm if payment method was invalid', async () => {
            jest.spyOn(affirm.checkout, 'open').mockImplementation(({ onFail }) => {
                onFail({
                    reason: 'not canceled',
                });
            });

            await strategy.initialize({
                methodId: paymentMethod.id,
                gatewayId: paymentMethod.gateway,
            });

            await expect(strategy.execute(payload)).rejects.toThrow(PaymentMethodInvalidError);
        });

        it('throw NotInitializedError if Affirm script is not initialized', async () => {
            await expect(strategy.execute(payload)).rejects.toThrow(NotInitializedError);
        });

        it('does not create order/payment if methodId is not passed', async () => {
            payload.payment = undefined;

            await strategy.initialize({
                methodId: paymentMethod.id,
                gatewayId: paymentMethod.gateway,
            });

            try {
                await strategy.execute(payload);
            } catch (error) {
                // eslint-disable-next-line jest/no-conditional-expect
                expect(error).toBeInstanceOf(PaymentArgumentInvalidError);
            }
        });

        it('does not create affirm object if billingAddress does not exist', async () => {
            jest.spyOn(paymentIntegrationService.getState(), 'getBillingAddress').mockReturnValue(
                undefined,
            );

            await strategy.initialize({
                methodId: paymentMethod.id,
                gatewayId: paymentMethod.gateway,
            });

            await expect(strategy.execute(payload)).rejects.toThrow(MissingDataError);
        });

        it('initializes the Affirm checkout call with the correct payload even when shipping address is undefined, it takes it from billing address', async () => {
            const checkoutPayload = {
                billing: {
                    address: {
                        city: 'Some City',
                        country: 'US',
                        line1: '12345 Testing Way',
                        line2: '',
                        state: 'CA',
                        zipcode: '95555',
                    },
                    email: 'test@bigcommerce.com',
                    name: {
                        first: 'Test',
                        full: 'Test Tester',
                        last: 'Tester',
                    },
                    phone_number: '555-555-5555',
                },
                discounts: {
                    '279F507D817E3E7': {
                        discount_amount: 500,
                        discount_display_name: '$5.00 off the shipping total',
                    },
                    DISCOUNTED_AMOUNT: {
                        discount_amount: 1000,
                        discount_display_name: 'discount',
                    },
                    savebig2015: {
                        discount_amount: 500,
                        discount_display_name: '20% off each item',
                    },
                },
                items: [
                    {
                        categories: [['Cat 1'], ['Furniture', 'Bed']],
                        display_name: 'Canvas Laundry Cart',
                        item_image_url: '/images/canvas-laundry-cart.jpg',
                        item_url: '/canvas-laundry-cart/',
                        qty: 1,
                        sku: 'CLC',
                        unit_price: 19000,
                    },
                    {
                        display_name: '$100 Gift Certificate',
                        item_image_url: '',
                        item_url: '',
                        qty: 1,
                        sku: '',
                        unit_price: 10000,
                    },
                ],
                merchant: {
                    user_cancel_url: 'https://store-k1drp8k8.bcapp.dev/checkout',
                    user_confirmation_url: 'https://store-k1drp8k8.bcapp.dev/checkout',
                    user_confirmation_url_action: 'POST',
                },
                metadata: {
                    mode: 'modal',
                    platform_affirm: '',
                    platform_type: 'BigCommerce',
                    platform_version: '',
                    shipping_type: 'shipping_flatrate',
                },
                order_id: '295',
                shipping: {
                    address: {
                        city: 'Some City',
                        country: 'US',
                        line1: '12345 Testing Way',
                        line2: '',
                        state: 'CA',
                        zipcode: '95555',
                    },
                    email: 'test@bigcommerce.com',
                    name: {
                        first: 'Test',
                        full: 'Test Tester',
                        last: 'Tester',
                    },
                    phone_number: '555-555-5555',
                },
                shipping_amount: 1500,
                tax_amount: 300,
                total: 19000,
            };

            jest.spyOn(paymentIntegrationService.getState(), 'getShippingAddress').mockReturnValue(
                undefined,
            );

            const options = { methodId: 'affirm', gatewayId: undefined };

            await strategy.initialize({
                methodId: paymentMethod.id,
                gatewayId: paymentMethod.gateway,
            });

            await strategy.execute(payload, options);

            expect(affirmCheckoutMock).toHaveBeenCalledWith(checkoutPayload);
        });

        it('execute checkout on Affirm script without shipping_type', async () => {
            jest.spyOn(paymentIntegrationService.getState(), 'getConsignments').mockReturnValue(
                undefined,
            );

            await strategy.initialize({
                methodId: paymentMethod.id,
                gatewayId: paymentMethod.gateway,
            });

            await strategy.execute(payload);

            expect(affirmCheckoutMock).toHaveBeenCalled();
        });

        it('does not create affirm object if config does not exist', async () => {
            jest.spyOn(paymentIntegrationService.getState(), 'getStoreConfig').mockReturnValue(
                undefined,
            );

            await strategy.initialize({
                methodId: paymentMethod.id,
                gatewayId: paymentMethod.gateway,
            });

            await expect(strategy.execute(payload)).rejects.toThrow(MissingDataError);
        });

        it('does not create affirm object if order does not exist', async () => {
            jest.spyOn(paymentIntegrationService.getState(), 'getOrder').mockReturnValue(undefined);

            await strategy.initialize({
                methodId: paymentMethod.id,
                gatewayId: paymentMethod.gateway,
            });

            await expect(strategy.execute(payload)).rejects.toThrow(MissingDataError);
        });
    });

    describe('#deinitialize()', () => {
        it('deinitializes strategy', async () => {
            const result = await strategy.deinitialize();

            expect(result).toBeUndefined();
        });

        it('deinitializes when Affirm script exist', async () => {
            await strategy.initialize({
                methodId: paymentMethod.id,
                gatewayId: paymentMethod.gateway,
            });

            const result = await strategy.deinitialize();

            expect(result).toBeUndefined();
        });
    });

    describe('#finalize()', () => {
        it('throws error to inform that order finalization is not required', async () => {
            await expect(strategy.finalize()).rejects.toThrow(OrderFinalizationNotRequiredError);
        });
    });
});
