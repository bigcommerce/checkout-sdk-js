import { BillingAddressSelector } from '../billing';
import { CartSelector } from '../cart';
import { selector } from '../common/selector';
import { ConfigSelector } from '../config';
import { CouponSelector, GiftCertificateSelector } from '../coupon';
import { CustomerStrategySelector } from '../customer';
import { CountrySelector } from '../geography';
import { OrderSelector } from '../order';
import { PaymentMethodSelector, PaymentStrategySelector } from '../payment';
import { InstrumentSelector } from '../payment/instrument';
import { QuoteSelector } from '../quote';
import { ShippingCountrySelector, ShippingOptionSelector, ShippingStrategySelector } from '../shipping';

import InternalCheckoutSelectors from './internal-checkout-selectors';

@selector
export default class CheckoutStoreStatusSelector {
    private _billingAddress: BillingAddressSelector;
    private _cart: CartSelector;
    private _config: ConfigSelector;
    private _countries: CountrySelector;
    private _coupons: CouponSelector;
    private _customerStrategies: CustomerStrategySelector;
    private _giftCertificates: GiftCertificateSelector;
    private _instruments: InstrumentSelector;
    private _order: OrderSelector;
    private _paymentMethods: PaymentMethodSelector;
    private _paymentStrategies: PaymentStrategySelector;
    private _quote: QuoteSelector;
    private _shippingCountries: ShippingCountrySelector;
    private _shippingOptions: ShippingOptionSelector;
    private _shippingStrategies: ShippingStrategySelector;

    /**
     * @internal
     */
    constructor(selectors: InternalCheckoutSelectors) {
        this._billingAddress = selectors.billingAddress;
        this._cart = selectors.cart;
        this._config = selectors.config;
        this._countries = selectors.countries;
        this._coupons = selectors.coupons;
        this._customerStrategies = selectors.customerStrategies;
        this._giftCertificates = selectors.giftCertificates;
        this._instruments = selectors.instruments;
        this._order = selectors.order;
        this._paymentMethods = selectors.paymentMethods;
        this._paymentStrategies = selectors.paymentStrategies;
        this._quote = selectors.quote;
        this._shippingCountries = selectors.shippingCountries;
        this._shippingOptions = selectors.shippingOptions;
        this._shippingStrategies = selectors.shippingStrategies;
    }

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
            this.isInitializingPayment() ||
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
        return this._paymentStrategies.isExecuting();
    }

    isFinalizingOrder(): boolean {
        return this._paymentStrategies.isFinalizing();
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

    isInitializingPayment(methodId?: string): boolean {
        return this._paymentStrategies.isInitializing(methodId);
    }

    isSigningIn(methodId?: string): boolean {
        return this._customerStrategies.isSigningIn(methodId);
    }

    isSigningOut(methodId?: string): boolean {
        return this._customerStrategies.isSigningOut(methodId);
    }

    isInitializingCustomer(methodId?: string): boolean {
        return this._customerStrategies.isInitializing(methodId);
    }

    isLoadingShippingOptions(): boolean {
        return this._shippingOptions.isLoading();
    }

    isSelectingShippingOption(): boolean {
        return this._shippingStrategies.isSelectingOption();
    }

    isUpdatingBillingAddress(): boolean {
        return this._billingAddress.isUpdating();
    }

    isUpdatingShippingAddress(): boolean {
        return this._shippingStrategies.isUpdatingAddress();
    }

    isInitializingShipping(methodId?: string) {
        return this._shippingStrategies.isInitializing(methodId);
    }

    isApplyingCoupon(): boolean {
        return this._coupons.isApplying();
    }

    isRemovingCoupon(): boolean {
        return this._coupons.isRemoving();
    }

    isApplyingGiftCertificate(): boolean {
        return this._giftCertificates.isApplying();
    }

    isRemovingGiftCertificate(): boolean {
        return this._giftCertificates.isRemoving();
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
