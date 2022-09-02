import { createCheckoutService, CheckoutService, CheckoutSelectors } from '../checkout';
import { getCheckoutWithCoupons } from '../checkout/checkouts.mock';
import { getConfig } from '../config/configs.mock';
import { getOrder } from '../order/orders.mock';

import BodlEmitterService from './bodl-emitter-service';
import { BodlEventsCheckout } from './bodl-window';

describe('BodlEmitterService', () => {
    let checkoutService: CheckoutService;
    let bodlEmitterService: BodlEmitterService;
    let bodlEvents: BodlEventsCheckout;
    let subscriber: (subscriber: (state: CheckoutSelectors) => void) => void;

    beforeEach(() => {
        bodlEvents = {
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

            expect(bodlEvents.emit).toBeCalledTimes(1);
        });

        it('tracks the id', () => {
            expect(bodlEvents.emit).toHaveBeenCalledWith(
                'create_checkout_begin',
                expect.objectContaining({
                    id: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
                })
            );
        });

        it('tracks the currency', () => {
            expect(bodlEvents.emit).toHaveBeenCalledWith(
                'create_checkout_begin',
                expect.objectContaining({
                    currency: 'USD',
                })
            );
        });

        it('tracks the cart value', () => {
            expect(bodlEvents.emit).toHaveBeenCalledWith(
                'create_checkout_begin',
                expect.objectContaining({
                    cart_value: 190,
                })
            );
        });

        it('tracks the coupon string', () => {
            expect(bodlEvents.emit).toHaveBeenCalledWith(
                'create_checkout_begin',
                expect.objectContaining({
                    coupon: 'SAVEBIG2015,279F507D817E3E7',
                })
            );
        });

        it('tracks products', () => {
            expect(bodlEvents.emit).toHaveBeenCalledWith(
                'create_checkout_begin',
                expect.objectContaining({
                    coupon: 'SAVEBIG2015,279F507D817E3E7',
                    cart_value: 190,
                    currency: 'USD',
                    id: "b20deef40f9699e48671bbc3fef6ca44dc80e3c7",
                    line_items: [{
                        product_id: 103,
                        product_sku: 'CLC',
                        product_name: 'Canvas Laundry Cart',
                        price: 190,
                        quantity: 1,
                        brand_name: 'OFS',
                        discount: 10,
                        category_name: 'Cat 1',
                        variant_id: 71,
                        currency: 'USD'
                    }, {
                        product_id: 104,
                        product_sku: 'CLX',
                        product_name: 'Digital Book',
                        price: 200,
                        quantity: 1,
                        discount: 0,
                        brand_name: 'Digitalia',
                        category_name: 'Ebooks, Audio Books',
                        variant_id: 72,
                        currency: 'USD'
                    }, {
                        gift_certificate_id: "bd391ead-8c58-4105-b00e-d75d233b429a",
                        gift_certificate_name: "$100 Gift Certificate",
                        gift_certificate_theme: "General",
                        product_name: '$100 Gift Certificate',
                        price: 100,
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


        it('tracks the id', () => {
            expect(bodlEvents.emit).toHaveBeenCalledWith(
                'create_order_purchased',
                expect.objectContaining({
                    id: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
                })
            );
        });

        it('tracks the currency', () => {
            expect(bodlEvents.emit).toHaveBeenCalledWith(
                'create_order_purchased',
                expect.objectContaining({
                    currency: 'USD',
                })
            );
        });

        it('tracks the transaction id', () => {
            expect(bodlEvents.emit).toHaveBeenCalledWith(
                'create_order_purchased',
                expect.objectContaining({
                    transaction_id: 295,
                })
            );
        });

        it('tracks the cart amount', () => {
            expect(bodlEvents.emit).toHaveBeenCalledWith(
                'create_order_purchased',
                expect.objectContaining({
                    cart_value: 190,
                })
            );
        });

        it('tracks the coupon amount, single field, comma separated', () => {
            expect(bodlEvents.emit).toHaveBeenCalledWith(
                'create_order_purchased',
                expect.objectContaining({
                    coupon: 'SAVEBIG2015,279F507D817E3E7',
                })
            );
        });

        it('tracks the shipping cost', () => {
            expect(bodlEvents.emit).toHaveBeenCalledWith(
                'create_order_purchased',
                expect.objectContaining({
                    shipping_cost: 15,
                })
            );
        });

        it('tracks products', () => {
            expect(bodlEvents.emit).toHaveBeenCalledWith(
                'create_order_purchased',
                expect.objectContaining({
                    line_items: [{
                        product_id: 103,
                        product_sku: 'CLC',
                        product_name: 'Canvas Laundry Cart',
                        price: 190,
                        quantity: 1,
                        brand_name: 'OFS',
                        discount: 10,
                        category_name: 'Cat 1',
                        variant_id: 71,
                        currency: 'USD'
                    }, {
                        gift_certificate_id: "bd391ead-8c58-4105-b00e-d75d233b429a",
                        gift_certificate_name: "$100 Gift Certificate",
                        gift_certificate_theme: "General",
                        product_name: '$100 Gift Certificate',
                        price: 100,
                        product_id: 'bd391ead-8c58-4105-b00e-d75d233b429a',
                        quantity: 1,
                        currency: 'USD'
                    }],
                })
            );
        });
    });
});

