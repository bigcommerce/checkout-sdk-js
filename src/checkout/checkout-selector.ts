import { BillingAddressSelector } from '../billing';
import { CartSelector } from '../cart';
import { selector } from '../common/selector';
import { CouponSelector, GiftCertificateSelector } from '../coupon';
import { CustomerSelector } from '../customer';
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
        private _customer: CustomerSelector,
        private _giftCertificates: GiftCertificateSelector
    ) {}

    getCheckout(): Checkout | undefined {
        const { data } = this._checkout;
        const billingAddress = this._billingAddress.getBillingAddress();
        const cart = this._cart.getCart();
        const customer = this._customer.getCustomer();
        const consignments = this._consignments.getConsignments() || [];
        const coupons = this._coupons.getCoupons() || [];
        const giftCertificates = this._giftCertificates.getGiftCertificates() || [];

        if (!data || !cart || !customer) {
            return;
        }

        return {
            ...data,
            billingAddress,
            cart,
            customer,
            consignments,
            coupons,
            giftCertificates,
        };
    }

    getGrandTotal(useStoreCredit?: boolean): number | undefined {
        const checkout = this.getCheckout();

        if (!checkout) {
            return;
        }

        const grandTotal = checkout.grandTotal || 0;
        const storeCredit = checkout.customer.storeCredit || 0;

        return useStoreCredit ? Math.max(grandTotal - storeCredit, 0) : grandTotal;
    }

    getLoadError(): Error | undefined {
        return this._checkout.errors.loadError;
    }

    isLoading(): boolean {
        return this._checkout.statuses.isLoading === true;
    }

    getUpdateError(): Error | undefined {
        return this._checkout.errors.updateError;
    }

    isUpdating(): boolean {
        return this._checkout.statuses.isUpdating === true;
    }
}
