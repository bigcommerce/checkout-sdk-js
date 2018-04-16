import { BillingAddressSelector } from '../billing';
import { CartSelector } from '../cart';
import { selectorDecorator as selector } from '../common/selector';
import { ConfigSelector } from '../config';
import { CouponSelector, GiftCertificateSelector } from '../coupon';
import { CustomerStrategySelector } from '../customer';
import { CountrySelector } from '../geography';
import { OrderSelector } from '../order';
import { PaymentMethodSelector, PaymentStrategySelector } from '../payment';
import { InstrumentSelector } from '../payment/instrument';
import { QuoteSelector } from '../quote';
import { ShippingCountrySelector, ShippingOptionSelector, ShippingStrategySelector } from '../shipping';

@selector
export default class CheckoutStatusSelector {
    /**
     * @internal
     */
    constructor(
        private _billingAddress: BillingAddressSelector,
        private _cart: CartSelector,
        private _config: ConfigSelector,
        private _countries: CountrySelector,
        private _coupon: CouponSelector,
        private _customerStrategy: CustomerStrategySelector,
        private _giftCertificate: GiftCertificateSelector,
        private _instruments: InstrumentSelector,
        private _order: OrderSelector,
        private _paymentMethods: PaymentMethodSelector,
        private _paymentStrategy: PaymentStrategySelector,
        private _quote: QuoteSelector,
        private _shippingCountries: ShippingCountrySelector,
        private _shippingOptions: ShippingOptionSelector,
        private _shippingStrategy: ShippingStrategySelector
    ) {}

    isPending(): boolean {
        return this.isLoadingCheckout() ||
            this.isSubmittingOrder() ||
            this.isFinalizingOrder() ||
            this.isLoadingOrder() ||
            this.isLoadingCart() ||
            this.isVerifyingCart() ||
            this.isLoadingBillingCountries() ||
            this.isLoadingShippingCountries() ||
            this.isLoadingPaymentMethods() ||
            this.isLoadingPaymentMethod() ||
            this.isInitializingPaymentMethod() ||
            this.isLoadingShippingOptions() ||
            this.isSelectingShippingOption() ||
            this.isSigningIn() ||
            this.isSigningOut() ||
            this.isInitializingCustomer() ||
            this.isUpdatingBillingAddress() ||
            this.isUpdatingShippingAddress() ||
            this.isInitializingShipping() ||
            this.isApplyingCoupon() ||
            this.isRemovingCoupon() ||
            this.isApplyingGiftCertificate() ||
            this.isRemovingGiftCertificate() ||
            this.isLoadingInstruments() ||
            this.isVaultingInstrument() ||
            this.isDeletingInstrument() ||
            this.isLoadingConfig();
    }

    isLoadingCheckout(): boolean {
        return this._quote.isLoading();
    }

    isSubmittingOrder(): boolean {
        return this._paymentStrategy.isExecuting();
    }

    isFinalizingOrder(): boolean {
        return this._paymentStrategy.isFinalizing();
    }

    isLoadingOrder(): boolean {
        return this._order.isLoading();
    }

    isLoadingCart(): boolean {
        return this._cart.isLoading();
    }

    isVerifyingCart(): boolean {
        return this._cart.isVerifying();
    }

    isLoadingBillingCountries(): boolean {
        return this._countries.isLoading();
    }

    isLoadingShippingCountries(): boolean {
        return this._shippingCountries.isLoading();
    }

    isLoadingPaymentMethods(): boolean {
        return this._paymentMethods.isLoading();
    }

    isLoadingPaymentMethod(methodId?: string): boolean {
        return this._paymentMethods.isLoadingMethod(methodId);
    }

    isInitializingPaymentMethod(methodId?: string): boolean {
        return this._paymentStrategy.isInitializing(methodId);
    }

    isSigningIn(methodId?: string): boolean {
        return this._customerStrategy.isSigningIn(methodId);
    }

    isSigningOut(methodId?: string): boolean {
        return this._customerStrategy.isSigningOut(methodId);
    }

    isInitializingCustomer(methodId?: string): boolean {
        return this._customerStrategy.isInitializing(methodId);
    }

    isLoadingShippingOptions(): boolean {
        return this._shippingOptions.isLoading();
    }

    isSelectingShippingOption(): boolean {
        return this._shippingStrategy.isSelectingOption();
    }

    isUpdatingBillingAddress(): boolean {
        return this._billingAddress.isUpdating();
    }

    isUpdatingShippingAddress(): boolean {
        return this._shippingStrategy.isUpdatingAddress();
    }

    isInitializingShipping(methodId?: string) {
        return this._shippingStrategy.isInitializing(methodId);
    }

    isApplyingCoupon(): boolean {
        return this._coupon.isApplying();
    }

    isRemovingCoupon(): boolean {
        return this._coupon.isRemoving();
    }

    isApplyingGiftCertificate(): boolean {
        return this._giftCertificate.isApplying();
    }

    isRemovingGiftCertificate(): boolean {
        return this._giftCertificate.isRemoving();
    }

    isLoadingInstruments(): boolean {
        return this._instruments.isLoading();
    }

    isVaultingInstrument(): boolean {
        return this._instruments.isVaulting();
    }

    isDeletingInstrument(instrumentId?: string): boolean {
        return this._instruments.isDeleting(instrumentId);
    }

    isLoadingConfig(): boolean {
        return this._config.isLoading();
    }
}
