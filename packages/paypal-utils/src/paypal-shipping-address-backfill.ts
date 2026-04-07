import {
    Address,
    BillingAddressRequestBody,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { PayPalOrderDetails } from './paypal-types';

export function isBlankAddressField(value?: string): boolean {
    return value === undefined || value === null || String(value).trim() === '';
}

/**
 * Maps storefront consignment shipping address to the request body shape used for updates.
 */
export function shippingAddressFromConsignmentShippingAddress(
    address: Partial<Address>,
): BillingAddressRequestBody {
    return {
        firstName: address.firstName ?? '',
        lastName: address.lastName ?? '',
        company: address.company ?? '',
        address1: address.address1 ?? '',
        address2: address.address2 ?? '',
        city: address.city ?? '',
        countryCode: address.countryCode ?? '',
        postalCode: address.postalCode ?? '',
        stateOrProvince: address.stateOrProvince ?? '',
        stateOrProvinceCode: address.stateOrProvinceCode ?? '',
        phone: address.phone ?? '',
        customFields: address.customFields ?? [],
        email: '',
    };
}

/**
 * Safe extraction of shipping address from PayPal order details (no throw when shipping block is incomplete).
 */
export function tryGetShippingAddressFromOrderDetails(
    orderDetails: PayPalOrderDetails,
): BillingAddressRequestBody | undefined {
    const pu = orderDetails.purchase_units?.[0];
    const shipping = pu?.shipping;

    if (!shipping?.address || !shipping.name) {
        return undefined;
    }

    const { address } = shipping;
    const name = shipping.name as {
        full_name?: string;
        given_name?: string;
        surname?: string;
    };
    let firstName = '';
    let lastName = '';

    if (name.full_name) {
        const parts = name.full_name.trim().split(/\s+/);

        firstName = parts[0] ?? '';
        lastName = parts.slice(1).join(' ');
    } else {
        firstName = name.given_name ?? '';
        lastName = name.surname ?? '';
    }

    const payer = orderDetails.payer;

    return {
        firstName,
        lastName,
        email: payer?.email_address ?? '',
        company: '',
        address1: address.address_line_1 ?? '',
        address2: address.address_line_2 ?? '',
        city: address.admin_area_2 ?? '',
        countryCode: address.country_code ?? '',
        postalCode: address.postal_code ?? '',
        stateOrProvince: '',
        stateOrProvinceCode: address.admin_area_1 ?? '',
        phone: payer?.phone?.phone_number?.national_number ?? '',
        customFields: [],
    };
}

function normalizeComparable(value: string): string {
    return value.trim().toLowerCase();
}

/**
 * True when quote and order shipping are the same region (country/state/postal/city where both sides have values).
 */
export function addressesRegionallyCompatible(
    quote: BillingAddressRequestBody,
    order: BillingAddressRequestBody,
): boolean {
    if (!isBlankAddressField(quote.countryCode) && !isBlankAddressField(order.countryCode)) {
        if (
            normalizeComparable(quote.countryCode) !== normalizeComparable(order.countryCode)
        ) {
            return false;
        }
    }

    if (!isBlankAddressField(quote.stateOrProvinceCode) && !isBlankAddressField(order.stateOrProvinceCode)) {
        if (
            normalizeComparable(quote.stateOrProvinceCode) !==
            normalizeComparable(order.stateOrProvinceCode)
        ) {
            return false;
        }
    }

    if (!isBlankAddressField(quote.postalCode) && !isBlankAddressField(order.postalCode)) {
        const q = normalizeComparable(quote.postalCode).replace(/\s+/g, '');
        const o = normalizeComparable(order.postalCode).replace(/\s+/g, '');

        if (q !== o && !q.startsWith(o) && !o.startsWith(q)) {
            return false;
        }
    }

    if (!isBlankAddressField(quote.city) && !isBlankAddressField(order.city)) {
        if (normalizeComparable(quote.city) !== normalizeComparable(order.city)) {
            return false;
        }
    }

    return true;
}

/**
 * True when `order` has meaningful non-empty line-level fields where `quote` is empty.
 */
export function orderHasAdditionalLineFillVsQuote(
    quote: BillingAddressRequestBody,
    order: BillingAddressRequestBody,
): boolean {
    const lineFields: Array<keyof typeof quote> = [
        'address1',
        'address2',
        'firstName',
        'lastName',
        'email',
        'phone',
    ];

    return lineFields.some((field) => {
        const q = quote[field];
        const o = order[field];

        return isBlankAddressField(typeof q === 'string' ? q : undefined) && !isBlankAddressField(
            typeof o === 'string' ? o : undefined,
        );
    });
}

export function mergeShippingAddressForBackfill(
    quote: BillingAddressRequestBody,
    order: BillingAddressRequestBody,
): BillingAddressRequestBody {
    return {
        firstName: !isBlankAddressField(quote.firstName) ? quote.firstName : order.firstName,
        lastName: !isBlankAddressField(quote.lastName) ? quote.lastName : order.lastName,
        email: !isBlankAddressField(quote.email) ? quote.email ?? '' : order.email ?? '',
        company: !isBlankAddressField(quote.company) ? quote.company : order.company,
        address1: !isBlankAddressField(quote.address1) ? quote.address1 : order.address1,
        address2: !isBlankAddressField(quote.address2) ? quote.address2 : order.address2,
        city: !isBlankAddressField(quote.city) ? quote.city : order.city,
        countryCode: !isBlankAddressField(quote.countryCode) ? quote.countryCode : order.countryCode,
        postalCode: !isBlankAddressField(quote.postalCode) ? quote.postalCode : order.postalCode,
        stateOrProvince: !isBlankAddressField(quote.stateOrProvince)
            ? quote.stateOrProvince
            : order.stateOrProvince,
        stateOrProvinceCode: !isBlankAddressField(quote.stateOrProvinceCode)
            ? quote.stateOrProvinceCode
            : order.stateOrProvinceCode,
        phone: !isBlankAddressField(quote.phone) ? quote.phone : order.phone,
        customFields: quote.customFields?.length ? quote.customFields : order.customFields ?? [],
    };
}

export function shouldBackfillShippingAddress(
    quoteAddress: BillingAddressRequestBody,
    orderDetails: PayPalOrderDetails,
): boolean {
    const orderAddress = tryGetShippingAddressFromOrderDetails(orderDetails);

    if (!orderAddress) {
        return false;
    }

    if (!addressesRegionallyCompatible(quoteAddress, orderAddress)) {
        return false;
    }

    return orderHasAdditionalLineFillVsQuote(quoteAddress, orderAddress);
}

export function buildMergedShippingAddressForBackfill(
    quoteAddress: BillingAddressRequestBody,
    orderDetails: PayPalOrderDetails,
): BillingAddressRequestBody {
    const orderAddress = tryGetShippingAddressFromOrderDetails(orderDetails);

    if (!orderAddress) {
        return quoteAddress;
    }

    return mergeShippingAddressForBackfill(quoteAddress, orderAddress);
}
