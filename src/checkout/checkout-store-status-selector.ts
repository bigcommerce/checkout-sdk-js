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
import { ConsignmentSelector, ShippingCountrySelector, ShippingStrategySelector } from '../shipping';

import CheckoutSelector from './checkout-selector';
import InternalCheckoutSelectors from './internal-checkout-selectors';

/**
 * Responsible for checking the statuses of various asynchronous actions related
 * to checkout.
 *
 * This object has a set of getters that return true if an action is in
 * progress. For example, you can check whether a customer is submitting an
 * order and waiting for the request to complete.
 */
@selector
export default class CheckoutStoreStatusSelector {
    private _billingAddress: BillingAddressSelector;
    private _cart: CartSelector;
    private _checkout: CheckoutSelector;
    private _config: ConfigSelector;
    private _consignments: ConsignmentSelector;
    private _countries: CountrySelector;
    private _coupons: CouponSelector;
    private _customerStrategies: CustomerStrategySelector;
    private _giftCertificates: GiftCertificateSelector;
    private _instruments: InstrumentSelector;
    private _order: OrderSelector;
    private _paymentMethods: PaymentMethodSelector;
    private _paymentStrategies: PaymentStrategySelector;
    private _shippingCountries: ShippingCountrySelector;
    private _shippingStrategies: ShippingStrategySelector;

    /**
     * @internal
     */
    constructor(selectors: InternalCheckoutSelectors) {
        this._billingAddress = selectors.billingAddress;
        this._cart = selectors.cart;
        this._checkout = selectors.checkout;
        this._config = selectors.config;
        this._consignments = selectors.consignments;
        this._countries = selectors.countries;
        this._coupons = selectors.coupons;
        this._customerStrategies = selectors.customerStrategies;
        this._giftCertificates = selectors.giftCertificates;
        this._instruments = selectors.instruments;
        this._order = selectors.order;
        this._paymentMethods = selectors.paymentMethods;
        this._paymentStrategies = selectors.paymentStrategies;
        this._shippingCountries = selectors.shippingCountries;
        this._shippingStrategies = selectors.shippingStrategies;
    }

    /**
     * Checks whether any checkout action is pending.
     *
     * @returns True if there is a pending action, otherwise false.
     */
    isPending(): boolean {
        return this.isLoadingCheckout() ||
            this.isSubmittingOrder() ||
            this.isFinalizingOrder() ||
            this.isLoadingOrder() ||
            this.isLoadingCart() ||
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
            this.isUpdatingConsignment() ||
            this.isCreatingConsignments() ||
            this.isInitializingShipping() ||
            this.isApplyingCoupon() ||
            this.isRemovingCoupon() ||
            this.isApplyingGiftCertificate() ||
            this.isRemovingGiftCertificate() ||
            this.isLoadingInstruments() ||
            this.isDeletingInstrument() ||
            this.isLoadingConfig() ||
            this.isCustomerStepPending() ||
            this.isPaymentStepPending();
    }

    /**
     * Checks whether the current checkout is loading.
     *
     * @returns True if the current checkout is loading, otherwise false.
     */
    isLoadingCheckout(): boolean {
        return this._checkout.isLoading();
    }

    /**
     * Checks whether the current order is submitting.
     *
     * @returns True if the current order is submitting, otherwise false.
     */
    isSubmittingOrder(): boolean {
        return this._paymentStrategies.isExecuting();
    }

    /**
     * Checks whether the current order is finalizing.
     *
     * @returns True if the current order is finalizing, otherwise false.
     */
    isFinalizingOrder(): boolean {
        return this._paymentStrategies.isFinalizing();
    }

    /**
     * Checks whether the current order is loading.
     *
     * @returns True if the current order is loading, otherwise false.
     */
    isLoadingOrder(): boolean {
        return this._order.isLoading();
    }

    /**
     * Checks whether the current cart is loading.
     *
     * @returns True if the current cart is loading, otherwise false.
     */
    isLoadingCart(): boolean {
        return this._cart.isLoading();
    }

    /**
     * Checks whether billing countries are loading.
     *
     * @returns True if billing countries are loading, otherwise false.
     */
    isLoadingBillingCountries(): boolean {
        return this._countries.isLoading();
    }

    /**
     * Checks whether shipping countries are loading.
     *
     * @returns True if shipping countries are loading, otherwise false.
     */
    isLoadingShippingCountries(): boolean {
        return this._shippingCountries.isLoading();
    }

    /**
     * Checks whether payment methods are loading.
     *
     * @returns True if payment methods are loading, otherwise false.
     */
    isLoadingPaymentMethods(): boolean {
        return this._paymentMethods.isLoading();
    }

    /**
     * Checks whether a specific or any payment method is loading.
     *
     * The method returns true if no ID is provided and at least one payment
     * method is loading.
     *
     * @param methodId - The identifier of the payment method to check.
     * @returns True if the payment method is loading, otherwise false.
     */
    isLoadingPaymentMethod(methodId?: string): boolean {
        return this._paymentMethods.isLoadingMethod(methodId);
    }

    /**
     * Checks whether a specific or any payment method is initializing.
     *
     * The method returns true if no ID is provided and at least one payment
     * method is initializing.
     *
     * @param methodId - The identifier of the payment method to check.
     * @returns True if the payment method is initializing, otherwise false.
     */
    isInitializingPayment(methodId?: string): boolean {
        return this._paymentStrategies.isInitializing(methodId);
    }

    /**
     * Checks whether the current customer is signing in.
     *
     * If an ID is provided, the method also checks whether the customer is
     * signing in using a specific customer method with the same ID.
     *
     * @param methodId - The identifier of the method used for signing in the
     * current customer.
     * @returns True if the customer is signing in, otherwise false.
     */
    isSigningIn(methodId?: string): boolean {
        return this._customerStrategies.isSigningIn(methodId);
    }

    /**
     * Checks whether the current customer is signing out.
     *
     * If an ID is provided, the method also checks whether the customer is
     * signing out using a specific customer method with the same ID.
     *
     * @param methodId - The identifier of the method used for signing out the
     * current customer.
     * @returns True if the customer is signing out, otherwise false.
     */
    isSigningOut(methodId?: string): boolean {
        return this._customerStrategies.isSigningOut(methodId);
    }

    /**
     * Checks whether the customer step is initializing.
     *
     * If an ID is provided, the method also checks whether the customer step is
     * initializing using a specific customer method with the same ID.
     *
     * @param methodId - The identifier of the method used for initializing the
     * customer step of checkout.
     * @returns True if the customer step is initializing, otherwise false.
     */
    isInitializingCustomer(methodId?: string): boolean {
        return this._customerStrategies.isInitializing(methodId);
    }

    /**
     * Checks whether shipping options are loading.
     *
     * @returns True if shipping options are loading, otherwise false.
     */
    isLoadingShippingOptions(): boolean {
        return this._consignments.isLoadingShippingOptions();
    }

    /**
     * Checks whether a shipping option is being selected.
     *
     * A consignment ID should be provided when checking if a shipping option
     * is being selected for a specific consignment, otherwise it will check
     * for all consignments.
     *
     * @param consignmentId - The identifier of the consignment to be checked.
     * @returns True if selecting a shipping option, otherwise false.
     */
    isSelectingShippingOption(consignmentId?: string): boolean {
        return this._shippingStrategies.isSelectingOption() ||
            this._consignments.isUpdatingShippingOption(consignmentId);
    }

    /**
     * Checks whether the current customer is updating their billing address.
     *
     * @returns True if updating their billing address, otherwise false.
     */
    isUpdatingBillingAddress(): boolean {
        return this._billingAddress.isUpdating();
    }

    /**
     * Checks whether the current customer is updating their shipping address.
     *
     * @returns True if updating their shipping address, otherwise false.
     */
    isUpdatingShippingAddress(): boolean {
        return this._shippingStrategies.isUpdatingAddress();
    }

    /**
     * Checks whether a given/any consignment is being updated.
     *
     * A consignment ID should be provided when checking for a specific consignment,
     * otherwise it will check for any consignment.
     *
     * @param consignmentId - The identifier of the consignment to be checked.
     * @returns True if updating consignment(s), otherwise false.
     */
    isUpdatingConsignment(consignmentId?: string): boolean {
        return this._consignments.isUpdating(consignmentId);
    }

    /**
     * Checks whether a given/any consignment is being updated.
     *
     * A consignment ID should be provided when checking for a specific consignment,
     * otherwise it will check for any consignment.
     *
     * @returns True if creating consignments, otherwise false.
     */
    isCreatingConsignments(): boolean {
        return this._consignments.isCreating();
    }

    /**
     * Checks whether the shipping step of a checkout process is initializing.
     *
     * If an identifier is provided, the method also checks whether the shipping
     * step is initializing using a specific shipping method with the same
     * identifier.
     *
     * @param methodId - The identifer of the initialization method to check.
     * @returns True if the shipping step is initializing, otherwise false.
     */
    isInitializingShipping(methodId?: string) {
        return this._shippingStrategies.isInitializing(methodId);
    }

    /**
     * Checks whether the current customer is applying a coupon code.
     *
     * @returns True if applying a coupon code, otherwise false.
     */
    isApplyingCoupon(): boolean {
        return this._coupons.isApplying();
    }

    /**
     * Checks whether the current customer is removing a coupon code.
     *
     * @returns True if removing a coupon code, otherwise false.
     */
    isRemovingCoupon(): boolean {
        return this._coupons.isRemoving();
    }

    /**
     * Checks whether the current customer is applying a gift certificate.
     *
     * @returns True if applying a gift certificate, otherwise false.
     */
    isApplyingGiftCertificate(): boolean {
        return this._giftCertificates.isApplying();
    }

    /**
     * Checks whether the current customer is removing a gift certificate.
     *
     * @returns True if removing a gift certificate, otherwise false.
     */
    isRemovingGiftCertificate(): boolean {
        return this._giftCertificates.isRemoving();
    }

    /**
     * Checks whether the current customer's payment instruments are loading.
     *
     * @returns True if payment instruments are loading, otherwise false.
     */
    isLoadingInstruments(): boolean {
        return this._instruments.isLoading();
    }

    /**
     * Checks whether the current customer is deleting a payment instrument.
     *
     * @returns True if deleting a payment instrument, otherwise false.
     */
    isDeletingInstrument(instrumentId?: string): boolean {
        return this._instruments.isDeleting(instrumentId);
    }

    /**
     * Checks whether the checkout configuration of a store is loading.
     *
     * @returns True if the configuration is loading, otherwise false.
     */
    isLoadingConfig(): boolean {
        return this._config.isLoading();
    }

    /**
     * Checks whether the customer step of a checkout is in a pending state.
     *
     * The customer step is considered to be pending if it is in the process of
     * initializing, signing in, signing out, and/or interacting with a customer
     * widget.
     *
     * @returns True if the customer step is pending, otherwise false.
     */
    isCustomerStepPending(): boolean {
        return this._customerStrategies.isInitializing() ||
            this._customerStrategies.isSigningIn() ||
            this._customerStrategies.isSigningOut() ||
            this._customerStrategies.isWidgetInteracting();
    }

    /**
     * Checks whether the payment step of a checkout is in a pending state.
     *
     * The payment step is considered to be pending if it is in the process of
     * initializing, submitting an order, finalizing an order, and/or
     * interacting with a payment widget.
     *
     * @returns True if the payment step is pending, otherwise false.
     */
    isPaymentStepPending(): boolean {
        return this._paymentStrategies.isInitializing() ||
            this._paymentStrategies.isExecuting() ||
            this._paymentStrategies.isFinalizing() ||
            this._paymentStrategies.isWidgetInteracting();
    }
}
