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
    index?: number;
    brand_name?: string;
    category_names?: string[];
    currency?: string;
}


export interface CheckoutBeginData {
    event_id: string
    currency: string,
    channel_id: number,
    cart_value: number,
    coupon_codes: string[],
    line_items: BODLProduct[]
}


export interface OrderPurchasedData {
    event_id: string
    currency: string,
    tax: number,
    channel_id: number,
    order_id: number,
    cart_value: number,
    coupon_codes: string[],
    shipping_cost: number,
    line_items: BODLProduct[]

}

export interface BodlEventsCheckout {
    emitCheckoutBeginEvent(data: CheckoutBeginData): boolean;
    emitOrderPurchasedEvent(data: OrderPurchasedData): boolean;
    emit(name: string, data?: BodlEventsPayload): void;
}

export interface BodlEventsPayload {
    [key: string]: unknown
}

export interface BodlEvents {
    checkout: BodlEventsCheckout;
}

export default interface BodlEventsWindow extends Window {
    bodlEvents: BodlEvents;
}
