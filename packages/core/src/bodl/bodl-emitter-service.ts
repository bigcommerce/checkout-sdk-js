import { LineItemMap } from '../cart';
import { CheckoutSelectors, CheckoutStoreSelector } from '../checkout';
import { MissingDataError, MissingDataErrorType } from '../common/error/errors';

import BodlService from "./bodl-service";
import { BodlEventsCheckout, BODLProduct } from './bodl-window';

export default class BodlEmitterService implements BodlService {
    private _checkoutStarted = false;
    private state?: CheckoutStoreSelector;

    constructor(
        private subscribe: (subscriber: (state: CheckoutSelectors) => void) => void,
        private bodlEvents: BodlEventsCheckout
    ) {
        this.subscribe(state => {
            this.setState(state.data);

            const config = this.state?.getConfig();

            if (!config) {
                throw new MissingDataError(MissingDataErrorType.MissingCheckoutConfig);
            }
        });
    }

    setState(state: CheckoutStoreSelector) {
        this.state = state;
    }

    checkoutBegin(): void {
        if (this._checkoutStarted) {
            return;
        }

        const checkout = this.state?.getCheckout();

        if (!checkout) {
            return;
        }

        const {
            cart: {
                cartAmount,
                currency,
                lineItems,
                id,
                coupons,
            },
            channelId,
        } = checkout;

        this.bodlEvents.emitCheckoutBeginEvent({
            id,
            currency: currency.code,
            cart_value: cartAmount,
            coupon: coupons.map(coupon => coupon.code.toUpperCase()).join(','),
            line_items: this.getProducts(lineItems, currency.code),
            channel_id: channelId,
        });

        this._checkoutStarted = true;
    }

    orderPurchased(): void {
        const order = this.state?.getOrder();

        if (!order) {
            return;
        }

        const {
            currency,
            isComplete,
            orderId,
            orderAmount,
            shippingCostTotal,
            lineItems,
            cartId,
            coupons,
            channelId,
            taxTotal,
        } = order;

        if (!isComplete) {
            return;
        }

        this.bodlEvents.emitOrderPurchasedEvent({
            id: cartId,
            currency: currency.code,
            transaction_id: orderId,
            tax: taxTotal,
            channel_id: channelId,
            cart_value: orderAmount,
            coupon: coupons.map(coupon => coupon.code.toUpperCase()).join(','),
            shipping_cost: shippingCostTotal,
            line_items: this.getProducts(lineItems, currency.code),
        });
    }

    private getProducts(lineItems: LineItemMap, currencyCode: string): BODLProduct[] {
        const customItems: BODLProduct[] = (lineItems.customItems || []).map(item => ({
            product_id: item.id,
            sku: item.sku,
            base_price: item.listPrice,
            sale_price: item.listPrice,
            purchase_price: item.listPrice,
            quantity: item.quantity,
            product_name: item.name,
            currency: currencyCode,
        }));

        const giftCertificateItems: BODLProduct[] = lineItems.giftCertificates.map(item => {
            return {
                product_id: item.id,
                gift_certificate_id: item.id,
                base_price: item.amount,
                sale_price: item.amount,
                purchase_price: item.amount,
                product_name: item.name,
                gift_certificate_name: item.name,
                gift_certificate_theme: item.theme,
                quantity: 1,
                currency: currencyCode,
            };
        });

        const physicalAndDigitalItems: BODLProduct[] = [
            ...lineItems.physicalItems,
            ...lineItems.digitalItems,
        ].map(item => {
            let itemAttributes;

            if (item.options && item.options.length) {
                itemAttributes = item.options.map(option => `${option.name}:${option.value}`);
                itemAttributes.sort();
            }

            return {
                product_id: item.productId,
                quantity: item.quantity,
                product_name: item.name,
                base_price: item.listPrice,
                sale_price: item.salePrice,
                purchase_price: item.salePrice > 0 ? item.salePrice : item.listPrice,
                sku: item.sku,
                variant_id: item.variantId,
                discount: item.discountAmount,
                brand_name: item.brand,
                currency: currencyCode,
                category_name: item.categoryNames ? item.categoryNames.join(', ') : '',
            };
        });

        return [
            ...customItems,
            ...physicalAndDigitalItems,
            ...giftCertificateItems,
        ];
    }

}

