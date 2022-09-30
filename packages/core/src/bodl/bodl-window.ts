export interface BODLProduct {
    product_id: string | number;
    product_name: string;
    product_sku?: string;
    variant_id?: number;
    variant_sku?: string;
    gift_certificate_id?: string | number;
    gift_certificate_name?: string;
    gift_certificate_theme?: string;
    price: number;
    sale_price?: number;
    base_price?: number;
    retail_price?: number;
    quantity: number;
    discount?: number;
    index?: number;
    brand_name?: string;
    category_name?: string;
    currency?: string;
}


export interface CheckoutBeginData {
    id: string
    currency: string,
    cart_value: number,
    coupon: string,
    line_items: BODLProduct[]
}


export interface OrderPurchasedData {
    id: string
    currency: string,
    transaction_id: number,
    cart_value: number,
    coupon: string,
    shipping_cost: number,
    line_items: BODLProduct[]

}

export interface BodlEventsCheckout { 
    emitCheckoutBeginEvent(data: CheckoutBeginData): boolean;
    emitOrderPurchasedEvent(data: OrderPurchasedData): boolean;
}

export interface BodlEvents {
    checkout: BodlEventsCheckout;
}

export default interface BodlEventsWindow extends Window {
    bodlEvents: BodlEvents;
}
