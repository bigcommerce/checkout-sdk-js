import { CartSource } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { Coupon } from '../coupon';
import { Currency } from '../currency';
import { Discount } from '../discount';

import LineItemMap from './line-item-map';

export default interface Cart {
    id: string;
    customerId: number;
    currency: Currency;
    email: string;
    isTaxIncluded: boolean;
    baseAmount: number;

    /**
     * This is the total amount of discount applied on line_items.
     */
    discountAmount: number;

    cartAmount: number;

    /**
     * This is an array of all applied coupons.
     */
    coupons: Coupon[];

    /**
     * This is the total amount of discount applied on cart including coupons and line_items discounts.
     */
    discounts: Discount[];

    lineItems: LineItemMap;
    createdTime: string;
    updatedTime: string;
    source?: CartSource;
    version: number;
}
