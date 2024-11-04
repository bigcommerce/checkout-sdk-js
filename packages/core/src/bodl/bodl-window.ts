export interface BODLProduct {
    product_id: string | number;
    product_name: string;
    variant_id?: number;
    sku?: string;
    gift_certificate_id?: string | number;
    gift_certificate_name?: string;
    gift_certificate_theme?: string;
    base_price: number;
    sale_price?: number;
    retail_price?: number;
    quantity: number;
    discount?: number;
    coupon_amount?: number;
    index?: number;
    brand_name?: string;
    category_names?: string[];
    currency?: string;
}

export interface CommonCheckoutData {
    event_id: string;
    currency: string;
    channel_id: number;
    cart_value: number;
    coupon_codes: string[];
    line_items: BODLProduct[];
}

export interface OrderPurchasedData extends CommonCheckoutData {
    tax: number;
    order_id: number;
    shipping_cost: number;
}

export interface ShippingDetailsProvidedData extends CommonCheckoutData {
    shipping_method: string;
}

export interface BillingDetailsProvidedData extends CommonCheckoutData {
    payment_type: string;
}

export interface BodlEventsCheckout {
    emitShippingDetailsProvidedEvent(data: ShippingDetailsProvidedData): boolean;
    emitPaymentDetailsProvidedEvent(data: BillingDetailsProvidedData): boolean;
    emitCheckoutBeginEvent(data: CommonCheckoutData): boolean;
    emitOrderPurchasedEvent(data: OrderPurchasedData): boolean;
    emit(name: string, data?: BodlEventsPayload): void;
}

export interface BodlEventsPayload {
    [key: string]: unknown;
}

export interface BodlEvents {
    checkout: BodlEventsCheckout;
}

export default interface BodlEventsWindow extends Window {
    bodlEvents: BodlEvents;
}
