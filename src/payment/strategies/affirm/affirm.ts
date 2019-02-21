export interface AffirmRequestData {
    merchant: {
        user_confirmation_url: string,
        user_cancel_url: string,
        user_confirmation_url_action?: string,
        name?: string,
    };
    shipping: {
        name: {
            first: string,
            last: string,
            full?: string,
        },
        address: {
            line1: string,
            line2?: string,
            city: string,
            state: string,
            zipcode: string,
            country?: string,
        },
        phone_number?: string,
        email?: string,
    };
    billing?: {
        name: {
            first: string,
            last: string,
            full?: string,
        },
        address: {
            line1: string,
            line2?: string,
            city: string,
            state: string,
            zipcode: string,
            country?: string,
        },
        phone_number?: string,
        email?: string,
    };
    items: Array<AffirmItem>;
    metadata: {
        shipping_type: string,
        entity_name?: string,
        platform_type?: string,
        webhook_session_id?: string,
        mode?: string,
    };
    order_id?: string;
    shipping_ammount: number;
    tax_amount: number;
    total: number;
}

export interface AffirmItem {
    display_name: string,
    sku: string,
    unit_price: number,
    qty: number,
    item_image_url: string,
    item_url: string,
    categories?: Array<[string]>,
}

interface AffirmScripts {
    PROD: string;
    SANDBOX: string;
}

export const SCRIPTS_DEFAULT: AffirmScripts = {
    PROD: '//cdn1.affirm.com/js/v2/affirm.js',
    SANDBOX: '//cdn1-sandbox.affirm.com/js/v2/affirm.js',
};