import { keys } from 'lodash';

import {
    AnalyticsExtraItemsManager,
    AnalyticsTracker,
    ExtraItemsData,
} from '@bigcommerce/checkout-sdk/analytics';

import { DigitalItem, LineItemMap, PhysicalItem } from '../cart';
import { Checkout, CheckoutService } from '../checkout';
import { InvalidArgumentError } from '../common/error/errors';
import { ShopperCurrency, StoreProfile } from '../config';
import { Coupon } from '../coupon';
import { Order } from '../order';
import { ShippingOption } from '../shipping';

import {
    isGoogleAnalyticsAvailable,
    isPayloadSizeLimitReached,
    sendGoogleAnalytics,
} from './analytics-tracker-ga';
import StepTracker from './step-tracker';

export interface StepTrackerConfig {
    checkoutSteps?: AnalyticStepType[];
}

export type AnalyticStepType = 'customer' | 'shipping' | 'billing' | 'payment';

export enum AnalyticStepId {
    CUSTOMER = 1,
    SHIPPING,
    BILLING,
    PAYMENT,
}

const ANALYTIC_STEPS: { [key: string]: AnalyticStepId } = {
    customer: AnalyticStepId.CUSTOMER,
    shipping: AnalyticStepId.SHIPPING,
    billing: AnalyticStepId.BILLING,
    payment: AnalyticStepId.PAYMENT,
};

export default class AnalyticsStepTracker implements StepTracker {
    private _checkoutStarted = false;
    private _completedSteps: { [key: string]: boolean } = {};
    private _viewedSteps: { [key in AnalyticStepId]?: boolean } = {};
    private _analyticStepOrder: AnalyticStepType[] = ['customer', 'shipping', 'billing', 'payment'];

    constructor(
        private checkoutService: CheckoutService,
        private analyticsExtraItemsManager: AnalyticsExtraItemsManager,
        private analytics: AnalyticsTracker,
        { checkoutSteps }: StepTrackerConfig = {},
    ) {
        if (checkoutSteps !== undefined) {
            if (checkoutSteps.some((value) => !(value in ANALYTIC_STEPS))) {
                throw new InvalidArgumentError(
                    `Invalid checkout steps provided. Valid values are: ${keys(ANALYTIC_STEPS).join(
                        ', ',
                    )}.`,
                );
            }

            this._analyticStepOrder = checkoutSteps;
        }
    }

    trackCheckoutStarted(): void {
        if (this._checkoutStarted) {
            return;
        }

        const checkout = this.getCheckout();

        if (!checkout) {
            return;
        }

        const {
            coupons,
            grandTotal,
            shippingCostTotal,
            taxTotal,
            cart: { lineItems, discountAmount, id },
        } = checkout;

        const extraItemsData = this.analyticsExtraItemsManager.saveExtraItemsData(id, lineItems);

        this.analytics.track(
            'Checkout Started',
            this.getTrackingPayload({
                revenue: grandTotal,
                shipping: shippingCostTotal,
                tax: taxTotal,
                discount: discountAmount,
                coupons,
                lineItems,
                extraItemsData,
            }),
        );

        this._checkoutStarted = true;
    }

    trackOrderComplete(): void {
        const order = this.getOrder();

        if (!order) {
            return;
        }

        const {
            isComplete,
            orderId,
            orderAmount,
            shippingCostTotal,
            taxTotal,
            discountAmount,
            coupons,
            lineItems,
            cartId,
        } = order;

        if (!isComplete) {
            return;
        }

        const extraItemsData = this.analyticsExtraItemsManager.readExtraItemsData(cartId);

        if (extraItemsData === null) {
            return;
        }

        const isMissingOrdersExperimentEnabled = this.checkoutService.getState().data.getConfig()
            ?.checkoutSettings.features['DATA-6891.missing_orders_within_GA'];

        const payload = this.getTrackingPayload({
            orderId,
            revenue: orderAmount,
            shipping: shippingCostTotal,
            tax: taxTotal,
            discount: discountAmount,
            coupons,
            extraItemsData,
            lineItems,
        });

        if (
            isMissingOrdersExperimentEnabled &&
            isGoogleAnalyticsAvailable() &&
            isPayloadSizeLimitReached(payload)
        ) {
            sendGoogleAnalytics('transaction', {
                '&ti': payload.order_id,
                '&ta': payload.affiliation,
                '&tr': payload.revenue,
                '&ts': payload.shipping,
                '&tt': payload.tax,
                '&tcc': payload.coupon,
                '&cu': payload.currency,
            });
            payload.products.forEach((product) => {
                sendGoogleAnalytics('item', {
                    '&ti': payload.order_id,
                    '&in': product.name,
                    '&ic': product.sku,
                    '&iv': `${product.category}`,
                    '&ip': product.price,
                    '&iq': product.quantity,
                });
            });

            // TODO: decide how to send large orders to Segment without sending to GA again
            return this.analyticsExtraItemsManager.clearExtraItemData(cartId);
        }

        this.analytics.track('Order Completed', payload);

        this.analyticsExtraItemsManager.clearExtraItemData(cartId);
    }

    trackStepViewed(step: AnalyticStepType): void {
        const stepId = this.getIdFromStep(step);

        if (!stepId || this.hasStepViewed(stepId)) {
            return;
        }

        this.trackViewed(stepId);
        this.backfill(stepId);
    }

    trackStepCompleted(step: AnalyticStepType): void {
        const stepId = this.getIdFromStep(step);

        if (!stepId || this.hasStepCompleted(stepId)) {
            return;
        }

        this.backfill(stepId);
        this.trackCompleted(stepId);
    }

    private backfill(stepId: AnalyticStepId): void {
        for (const i of this._analyticStepOrder) {
            const id = this.getIdFromStep(i);

            if (!id) {
                break;
            }

            if (!this.hasStepViewed(id)) {
                this.trackViewed(id);
            }

            if (id === stepId) {
                break;
            }

            if (!this.hasStepCompleted(id)) {
                this.trackCompleted(id);
            }
        }
    }

    private trackCompleted(stepId: AnalyticStepId): void {
        const shippingMethod = this.getSelectedShippingOption();
        const { code: currency = '' } = this.getShopperCurrency() || {};
        const paymentMethod = this.getPaymentMethodName();

        const payload: {
            step: number;
            currency: string;
            shipping_method?: string;
            payment_method?: string;
        } = {
            step: stepId,
            currency,
        };

        if (shippingMethod) {
            payload.shipping_method = shippingMethod.description;
        }

        if (paymentMethod) {
            payload.payment_method = paymentMethod;
        }

        // due to an issue with the way the segment library works, we must send at least one of the two
        // options--otherwise it rejects the track call with no diagnostic messages. however, if we blindly
        // include both options, it sends a single comma for the value, which is undesireable. by only adding
        // one of the two (shippingMethod here being arbitrarily chosen), we always have at least one value, but
        // never send two empty values.
        if (!payload.shipping_method && !payload.payment_method) {
            payload.shipping_method = ' ';
        }

        this.analytics.track('Checkout Step Completed', payload);

        const shippingMethodId = shippingMethod ? shippingMethod.id : '';
        const completedStepId =
            stepId === AnalyticStepId.SHIPPING ? `${stepId}-${shippingMethodId}` : stepId;

        this._completedSteps[completedStepId] = true;
    }

    private getTrackingPayload({
        orderId,
        revenue,
        shipping,
        tax,
        discount,
        coupons,
        extraItemsData,
        lineItems,
    }: {
        orderId?: number;
        revenue: number;
        shipping: number;
        tax: number;
        discount: number;
        coupons: Coupon[];
        extraItemsData: ExtraItemsData;
        lineItems: LineItemMap;
    }) {
        const { code = '' } = this.getShopperCurrency() || {};
        const { storeName = '' } = this.getStoreProfile() || {};

        return {
            order_id: String(orderId),
            affiliation: storeName,
            revenue: this.toShopperCurrency(revenue),
            shipping: this.toShopperCurrency(shipping),
            tax: this.toShopperCurrency(tax),
            discount: this.toShopperCurrency(discount),
            coupon: (coupons || []).map((coupon) => coupon.code.toUpperCase()).join(','),
            currency: code,
            products: this.getProducts(extraItemsData, lineItems),
        };
    }

    private hasStepCompleted(stepId: AnalyticStepId): boolean {
        const shippingOption = this.getSelectedShippingOption();
        const shippingMethodId = shippingOption ? shippingOption.id : '';

        return (
            Object.prototype.hasOwnProperty.call(this._completedSteps, stepId) ||
            (stepId === AnalyticStepId.SHIPPING &&
                Object.prototype.hasOwnProperty.call(
                    this._completedSteps,
                    `${stepId}-${shippingMethodId}`,
                ))
        );
    }

    private hasStepViewed(stepId: AnalyticStepId): boolean {
        return !!this._viewedSteps[stepId];
    }

    private getIdFromStep(step: string): AnalyticStepId | null {
        const name = step.split('.');

        return ANALYTIC_STEPS[name[0]] || null;
    }

    private trackViewed(stepId: AnalyticStepId): void {
        const currency = this.getShopperCurrency();

        this.analytics.track('Checkout Step Viewed', {
            step: stepId,
            currency: currency ? currency.code : '',
        });

        this._viewedSteps[stepId] = true;
    }

    private getOrder(): Order | undefined {
        const {
            data: { getOrder },
        } = this.checkoutService.getState();

        return getOrder();
    }

    private getCheckout(): Checkout | undefined {
        const {
            data: { getCheckout },
        } = this.checkoutService.getState();

        return getCheckout();
    }

    private getShopperCurrency(): ShopperCurrency | undefined {
        const {
            data: { getConfig },
        } = this.checkoutService.getState();
        const config = getConfig();

        return config && config.shopperCurrency;
    }

    private getStoreProfile(): StoreProfile | undefined {
        const {
            data: { getConfig },
        } = this.checkoutService.getState();
        const config = getConfig();

        return config && config.storeProfile;
    }

    private toShopperCurrency(amount: number): number {
        const { exchangeRate = 1 } = this.getShopperCurrency() || {};

        return Math.round(amount * exchangeRate * 100) / 100;
    }

    private getSelectedShippingOption(): ShippingOption | null {
        const { data } = this.checkoutService.getState();
        const shippingOption = data.getSelectedShippingOption();

        return shippingOption && shippingOption.id && shippingOption.description
            ? shippingOption
            : null;
    }

    private getPaymentMethodName(): string {
        const { data } = this.checkoutService.getState();
        const paymentMethod = data.getSelectedPaymentMethod();

        return paymentMethod && paymentMethod.config ? paymentMethod.config.displayName || '' : '';
    }

    private getProducts(itemsData: ExtraItemsData, lineItems: LineItemMap): AnalyticsProduct[] {
        const customItems: AnalyticsProduct[] = (lineItems.customItems || []).map((item) => ({
            product_id: item.id,
            sku: item.sku,
            price: item.listPrice,
            quantity: item.quantity,
            name: item.name,
        }));

        const giftCertificateItems: AnalyticsProduct[] = lineItems.giftCertificates.map((item) => {
            return {
                product_id: item.id,
                price: this.toShopperCurrency(item.amount),
                name: item.name,
                quantity: 1,
            };
        });

        const transformItem = (item: PhysicalItem | DigitalItem): AnalyticsProduct => {
            let itemAttributes;

            if (item.options && item.options.length) {
                itemAttributes = item.options.map((option) => `${option.name}:${option.value}`);
                itemAttributes.sort();
            }

            const variant =
                Array.isArray(itemAttributes) && itemAttributes.length
                    ? itemAttributes.join(', ')
                    : 'single-product-option';

            const brand = itemsData[item.productId] && itemsData[item.productId].brand;

            return {
                product_id: String(item.productId),
                sku: item.sku,
                price: item.salePrice,
                image_url: item.imageUrl,
                name: item.name,
                quantity: item.quantity,
                category: itemsData[item.productId] ? itemsData[item.productId].category : '',
                variant,
                ...(brand && { brand }),
            };
        };

        const physicalAndDigitalItems: AnalyticsProduct[] = [
            ...lineItems.physicalItems,
            ...lineItems.digitalItems,
        ].map(transformItem);

        return [...customItems, ...physicalAndDigitalItems, ...giftCertificateItems];
    }
}

export interface AnalyticsProduct {
    product_id: string | number;
    price: number;
    quantity: number;
    name: string;
    sku?: string;
    image_url?: string;
    category?: string;
    variant?: string;
    brand?: string;
}
