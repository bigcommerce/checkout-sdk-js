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
    discountAmount: number;
    cartAmount: number;
    coupons: Coupon[];
    discounts: Discount[];
    lineItems: LineItemMap;
    createdTime: string;
    updatedTime: string;
}
