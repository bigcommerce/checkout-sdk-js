import { isEqual, map } from 'lodash';

import { Cart, CartComparator } from '../cart';
import { CartChangedError } from '../cart/errors';
import { MissingDataError, MissingDataErrorType } from '../common/error/errors';
import { RequestOptions } from '../common/http-request';
import { Coupon, GiftCertificate } from '../coupon';

import Checkout from './checkout';
import CheckoutRequestSender from './checkout-request-sender';

export type ComparableCheckout = Pick<
    Checkout,
    'outstandingBalance' | 'coupons' | 'giftCertificates'
> & {
    cart: Partial<Cart>;
};

export default class CheckoutValidator {
    constructor(private _checkoutRequestSender: CheckoutRequestSender) {}

    validate(checkout?: Checkout, options?: RequestOptions): Promise<void> {
        if (!checkout) {
            throw new MissingDataError(MissingDataErrorType.MissingCheckout);
        }

        return this._checkoutRequestSender.loadCheckout(checkout.id, options).then((response) => {
            const comparator = new CartComparator();

            if (
                checkout.outstandingBalance === response.body.outstandingBalance &&
                this._compareCoupons(checkout.coupons, response.body.coupons) &&
                this._compareGiftCertificates(
                    checkout.giftCertificates,
                    response.body.giftCertificates,
                ) &&
                comparator.isEqual(checkout.cart, response.body.cart)
            ) {
                return;
            }

            throw new CartChangedError(
                this._getComparableCheckout(checkout),
                this._getComparableCheckout(response.body),
            );
        });
    }

    private _compareCoupons(couponsA: Coupon[], couponsB: Coupon[]): boolean {
        return isEqual(map(couponsA, 'code'), map(couponsB, 'code'));
    }

    private _compareGiftCertificates(
        giftCertificatesA: GiftCertificate[],
        giftCertificatesB: GiftCertificate[],
    ): boolean {
        return isEqual(map(giftCertificatesA, 'code'), map(giftCertificatesB, 'code'));
    }

    private _getComparableCheckout(checkout: Checkout): ComparableCheckout {
        const { cart, coupons, giftCertificates, outstandingBalance } = checkout;

        return {
            cart: {
                cartAmount: cart.cartAmount,
                currency: cart.currency,
                lineItems: cart.lineItems,
            },
            coupons,
            giftCertificates,
            outstandingBalance,
        };
    }
}
