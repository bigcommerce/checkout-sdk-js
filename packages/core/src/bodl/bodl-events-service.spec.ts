import { createCheckoutService, CheckoutService, CheckoutSelectors } from '../checkout';
import { getCheckoutWithCoupons } from '../checkout/checkouts.mock';
import { getConfig } from '../config/configs.mock';
import { getOrder } from '../order/orders.mock';

import BodlEmitterService from './bodl-emitter-service';
import { BodlEventsCheckout, BodlEventsPayload } from './bodl-window';
import { AnalyticStepType } from './analytics-steps';

describe('BodlEmitterService', () => {
    let checkoutService: CheckoutService;
    let bodlEmitterService: BodlEmitterService;
    let bodlEvents: BodlEventsCheckout;
    let subscriber: (subscriber: (state: CheckoutSelectors) => void) => void;

    beforeEach(() => {
        bodlEvents = {
            emitOrderPurchasedEvent: jest.fn(),
            emitCheckoutBeginEvent: jest.fn(),
            emit: jest.fn(),
        };

        checkoutService = createCheckoutService();

        subscriber = (cb) => {
            cb(checkoutService.getState());
        };

        jest.spyOn(checkoutService.getState().data, 'getCheckout')
            .mockReturnValue(getCheckoutWithCoupons());

        jest.spyOn(checkoutService.getState().data, 'getConfig')
            .mockReturnValue(getConfig().storeConfig);

        bodlEmitterService = new BodlEmitterService(
            subscriber,
            bodlEvents
        );
    });

    describe('#checkoutBegin()', () => {
        beforeEach(() => {
            bodlEmitterService.checkoutBegin();
        });

        it('only tracks event once', () => {
            bodlEmitterService.checkoutBegin();
            bodlEmitterService.checkoutBegin();

            expect(bodlEvents.emitCheckoutBeginEvent).toBeCalledTimes(1);
        });

        it('tracks the event id', () => {
            expect(bodlEvents.emitCheckoutBeginEvent).toHaveBeenCalledWith(
                expect.objectContaining({
                    event_id: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
                })
            );
        });

        it('tracks the currency', () => {
            expect(bodlEvents.emitCheckoutBeginEvent).toHaveBeenCalledWith(
                expect.objectContaining({
                    currency: 'USD',
                })
            );
        });

        it('tracks the cart value', () => {
            expect(bodlEvents.emitCheckoutBeginEvent).toHaveBeenCalledWith(
                expect.objectContaining({
                    cart_value: 190,
                })
            );
        });

        it('tracks the coupon_codes array', () => {
            expect(bodlEvents.emitCheckoutBeginEvent).toHaveBeenCalledWith(
                expect.objectContaining({
                    coupon_codes: ['SAVEBIG2015', '279F507D817E3E7'],
                })
            );
        });

        it('tracks the channel id', () => {
            expect(bodlEvents.emitCheckoutBeginEvent).toHaveBeenCalledWith(
                expect.objectContaining({
                    channel_id: 1,
                })
            );
        });

        it('tracks products', () => {
            expect(bodlEvents.emitCheckoutBeginEvent).toHaveBeenCalledWith(
                expect.objectContaining({
                    coupon_codes: ['SAVEBIG2015', '279F507D817E3E7'],
                    cart_value: 190,
                    currency: 'USD',
                    event_id: "b20deef40f9699e48671bbc3fef6ca44dc80e3c7",
                    line_items: [{
                        product_id: 103,
                        sku: 'CLC',
                        product_name: 'Canvas Laundry Cart',
                        base_price: 200,
                        sale_price: 190,
                        purchase_price: 190,
                        quantity: 1,
                        brand_name: 'OFS',
                        discount: 10,
                        category_names: ['Cat 1'],
                        variant_id: 71,
                        currency: 'USD'
                    }, {
                        product_id: 104,
                        sku: 'CLX',
                        product_name: 'Digital Book',
                        base_price: 200,
                        purchase_price: 200,
                        sale_price: 200,
                        quantity: 1,
                        discount: 0,
                        brand_name: 'Digitalia',
                        category_names: ['Ebooks', 'Audio Books'],
                        variant_id: 72,
                        currency: 'USD'
                    }, {
                        gift_certificate_id: "bd391ead-8c58-4105-b00e-d75d233b429a",
                        gift_certificate_name: "$100 Gift Certificate",
                        gift_certificate_theme: "General",
                        product_name: '$100 Gift Certificate',
                        base_price: 100,
                        purchase_price: 100,
                        sale_price: 100,
                        product_id: 'bd391ead-8c58-4105-b00e-d75d233b429a',
                        quantity: 1,
                        currency: 'USD'
                    }],
                })
            );
        });
    });

    describe('#orderPurchased()', () => {
        beforeEach(() => {
            jest.spyOn(checkoutService.getState().data, 'getOrder')
                .mockReturnValue(getOrder());

            bodlEmitterService.orderPurchased();
        });


        it('tracks the event id', () => {
            expect(bodlEvents.emitOrderPurchasedEvent).toHaveBeenCalledWith(
                expect.objectContaining({
                    event_id: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
                })
            );
        });

        it('tracks the currency', () => {
            expect(bodlEvents.emitOrderPurchasedEvent).toHaveBeenCalledWith(
                expect.objectContaining({
                    currency: 'USD',
                })
            );
        });

        it('tracks the transaction id', () => {
            expect(bodlEvents.emitOrderPurchasedEvent).toHaveBeenCalledWith(
                expect.objectContaining({
                    order_id: 295,
                })
            );
        });

        it('tracks the cart amount', () => {
            expect(bodlEvents.emitOrderPurchasedEvent).toHaveBeenCalledWith(
                expect.objectContaining({
                    cart_value: 190,
                })
            );
        });

        it('tracks the coupon amount, single field, comma separated', () => {
            expect(bodlEvents.emitOrderPurchasedEvent).toHaveBeenCalledWith(
                expect.objectContaining({
                    coupon_codes: ['SAVEBIG2015', '279F507D817E3E7'],
                })
            );
        });

        it('tracks the shipping cost', () => {
            expect(bodlEvents.emitOrderPurchasedEvent).toHaveBeenCalledWith(
                expect.objectContaining({
                    shipping_cost: 15,
                })
            );
        });

        it('tracks the channel id', () => {
            expect(bodlEvents.emitOrderPurchasedEvent).toHaveBeenCalledWith(
                expect.objectContaining({
                    channel_id: 1,
                })
            );
        });

        it('tracks total tax', () => {
            expect(bodlEvents.emitOrderPurchasedEvent).toHaveBeenCalledWith(
                expect.objectContaining({
                    tax: 3,
                })
            );
        });

        it('tracks products', () => {
            expect(bodlEvents.emitOrderPurchasedEvent).toHaveBeenCalledWith(
                expect.objectContaining({
                    line_items: [{
                        product_id: 103,
                        sku: 'CLC',
                        product_name: 'Canvas Laundry Cart',
                        base_price: 200,
                        sale_price: 190,
                        purchase_price: 190,
                        quantity: 1,
                        brand_name: 'OFS',
                        discount: 10,
                        category_names: ['Cat 1'],
                        variant_id: 71,
                        currency: 'USD'
                    }, {
                        gift_certificate_id: "bd391ead-8c58-4105-b00e-d75d233b429a",
                        gift_certificate_name: "$100 Gift Certificate",
                        gift_certificate_theme: "General",
                        product_name: '$100 Gift Certificate',
                        base_price: 100,
                        sale_price: 100,
                        purchase_price: 100,
                        product_id: 'bd391ead-8c58-4105-b00e-d75d233b429a',
                        quantity: 1,
                        currency: 'USD'
                    }],
                })
            );
        });
    });

    describe('#stepCompleted(step)', () => {
        it('no step has not completed yet', () => {
            bodlEmitterService.stepCompleted();
            expect(bodlEvents.emit).not.toHaveBeenCalled();
        });

        it('First step completed', () => {
            bodlEmitterService.stepCompleted('customer' as AnalyticStepType);
            expect(bodlEvents.emit).toHaveBeenCalledTimes(1);
            expect(bodlEvents.emit).toHaveBeenCalledWith('bodl_checkout_step_completed', {step: 'customer'});
            expect(bodlEvents.emit).not.toHaveBeenCalledWith('bodl_checkout_step_completed', {step: 'shipping'});
            expect(bodlEvents.emit).not.toHaveBeenCalledWith('bodl_checkout_step_completed', {step: 'billing'});
            expect(bodlEvents.emit).not.toHaveBeenCalledWith('bodl_checkout_step_completed', {step: 'payment'});
        });

        it('Complete the same step three times', () => {
            bodlEmitterService.stepCompleted('customer' as AnalyticStepType);
            bodlEmitterService.stepCompleted('customer' as AnalyticStepType);
            bodlEmitterService.stepCompleted('customer' as AnalyticStepType);
            expect(bodlEvents.emit).toHaveBeenCalledTimes(1);
            expect(bodlEvents.emit).toHaveBeenCalledWith('bodl_checkout_step_completed', {step: 'customer'});
            expect(bodlEvents.emit).not.toHaveBeenCalledWith('bodl_checkout_step_completed', {step: 'shipping'});
        });

        it('Manually complete three steps', () => {
            bodlEmitterService.stepCompleted('customer' as AnalyticStepType);
            bodlEmitterService.stepCompleted('shipping' as AnalyticStepType);
            bodlEmitterService.stepCompleted('billing' as AnalyticStepType);
            expect(bodlEvents.emit).toHaveBeenCalledTimes(3);
            expect(bodlEvents.emit).toHaveBeenCalledWith('bodl_checkout_step_completed', {step: 'customer'});
            expect(bodlEvents.emit).toHaveBeenCalledWith('bodl_checkout_step_completed', {step: 'shipping'});
            expect(bodlEvents.emit).toHaveBeenCalledWith('bodl_checkout_step_completed', {step: 'billing'});
            expect(bodlEvents.emit).not.toHaveBeenCalledWith('bodl_checkout_step_completed', {step: 'payment'});
        });

        it('First and third step completed manually, second - autocompleted', () => {
            bodlEmitterService.stepCompleted('customer' as AnalyticStepType);
            bodlEmitterService.stepCompleted('billing' as AnalyticStepType);
            expect(bodlEvents.emit).toHaveBeenCalledTimes(3);
            expect(bodlEvents.emit).toHaveBeenCalledWith('bodl_checkout_step_completed', {step: 'customer'});
            expect(bodlEvents.emit).toHaveBeenCalledWith('bodl_checkout_step_completed', {step: 'shipping'});
            expect(bodlEvents.emit).toHaveBeenCalledWith('bodl_checkout_step_completed', {step: 'billing'});
            expect(bodlEvents.emit).not.toHaveBeenCalledWith('bodl_checkout_step_completed', {step: 'payment'});
        });
    });

    describe('#customerEmailEntry(email)', () => {
        it('Shopper has not yet entered email', () => {
            bodlEmitterService.customerEmailEntry();
            expect(bodlEvents.emit).not.toHaveBeenCalled();
        });

        it('Shopper begins to enter an email', () => {
            bodlEmitterService.customerEmailEntry('e');
            bodlEmitterService.customerEmailEntry('em');
            bodlEmitterService.customerEmailEntry('ema');
            bodlEmitterService.customerEmailEntry('emai');
            bodlEmitterService.customerEmailEntry('email');
            expect(bodlEvents.emit).toHaveBeenCalledTimes(1);
            expect(bodlEvents.emit).toHaveBeenCalledWith('bodl_checkout_email_entry_began');
        });
    });

    describe('#showShippingMethods()', () => {
        it('emit show shipping methods', () => {
            bodlEmitterService.showShippingMethods();
            expect(bodlEvents.emit).toHaveBeenCalledTimes(1);
            expect(bodlEvents.emit).toHaveBeenCalledWith('bodl_checkout_show_shipping_options');
        });

        it('show shipping methods more then once', () => {
            bodlEmitterService.showShippingMethods();
            bodlEmitterService.showShippingMethods();
            bodlEmitterService.showShippingMethods();
            expect(bodlEvents.emit).toHaveBeenCalledTimes(1);
            expect(bodlEvents.emit).toHaveBeenCalledWith('bodl_checkout_show_shipping_options');
        });
    });

    describe('simple bodl events', () => {
        it('emit simple BODL events', () => {
            const bodlEventsList: {
                eventMethod(arg?: string|BodlEventsPayload): void,
                methodArguments?: string|BodlEventsPayload,
                expectedData: [string, BodlEventsPayload?],
            }[] = [
                {
                    eventMethod: () => bodlEmitterService.customerSuggestionExecute(),
                    expectedData: ['bodl_checkout_customer_suggestion_execute']
                },
                {
                    eventMethod: (payload: BodlEventsPayload) => bodlEmitterService.customerPaymentMethodExecuted(payload),
                    methodArguments: {test: 'data'},
                    expectedData: [
                        'bodl_checkout_customer_payment_method_executed',
                        {test: 'data'}
                    ]
                },
                {
                    eventMethod: (paymentOption: string) => bodlEmitterService.selectedPaymentMethod(paymentOption),
                    methodArguments: 'paymentOptionDisplayName',
                    expectedData: [
                        'bodl_checkout_payment_method_selected',
                        {paymentOption: 'paymentOptionDisplayName'}
                    ]
                },
                {
                    eventMethod: (payload: BodlEventsPayload) => bodlEmitterService.clickPayButton(payload),
                    methodArguments: {test: 'data'},
                    expectedData: [
                        'bodl_checkout_click_pay_button',
                        {test: 'data'}
                    ]
                },
                {
                    eventMethod: () => bodlEmitterService.paymentRejected(),
                    expectedData: ['bodl_checkout_payment_rejected']
                },
                {
                    eventMethod: () => bodlEmitterService.paymentComplete(),
                    expectedData: ['bodl_checkout_payment_complete']
                },
                {
                    eventMethod: () => bodlEmitterService.exitCheckout(),
                    expectedData: ['bodl_checkout_exit']
                },
            ];

            bodlEventsList.forEach((event) => {
                const {
                    eventMethod,
                    methodArguments,
                    expectedData
                } = event;

                bodlEvents.emit = jest.fn();

                eventMethod(methodArguments);
                expect(bodlEvents.emit).toHaveBeenCalledTimes(1);
                expect(bodlEvents.emit).toHaveBeenCalledWith(...expectedData);
            });
        });
    });
});

