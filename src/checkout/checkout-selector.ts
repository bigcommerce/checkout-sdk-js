import { BillingAddressSelector } from '../billing';
import { CartSelector } from '../cart';
import { selector } from '../common/selector';
import { CouponSelector, GiftCertificateSelector } from '../coupon';
import { ConsignmentSelector } from '../shipping';

import Checkout from './checkout';
import CheckoutState from './checkout-state';

@selector
export default class CheckoutSelector {
    constructor(
        private _checkout: CheckoutState,
        private _billingAddress: BillingAddressSelector,
        private _cart: CartSelector,
        private _consignments: ConsignmentSelector,
        private _coupons: CouponSelector,
        private _giftCertificates: GiftCertificateSelector
    ) {}

    getCheckout(): Checkout | undefined {
        const { data } = this._checkout;
        const billingAddress = this._billingAddress.getBillingAddress();
        const cart = this._cart.getCart();
        const consignments = this._consignments.getConsignments() || [];
        const coupons = this._coupons.getCoupons() || [];
        const giftCertificates = this._giftCertificates.getGiftCertificates() || [];

        if (!data || !cart) {
            return;
        }

        return {
            ...data,
            billingAddress,
            cart,
            consignments,
            coupons,
            giftCertificates,
        };
    }

    getLoadError(): Error | undefined {
        return this._checkout.errors.loadError;
    }

    isLoading(): boolean {
        return this._checkout.statuses.isLoading === true;
    }
}
