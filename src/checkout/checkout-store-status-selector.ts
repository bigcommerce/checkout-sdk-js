import { memoizeOne } from '@bigcommerce/memoize';

import { createSelector, createShallowEqualSelector } from '../common/selector';
import { Omit } from '../common/types';

import InternalCheckoutSelectors from './internal-checkout-selectors';

/**
 * Responsible for checking the statuses of various asynchronous actions related
 * to checkout.
 *
 * This object has a set of getters that return true if an action is in
 * progress. For example, you can check whether a customer is submitting an
 * order and waiting for the request to complete.
 */
export default interface CheckoutStoreStatusSelector {
    /**
     * Checks whether any checkout action is pending.
     *
     * @returns True if there is a pending action, otherwise false.
     */
    isPending(): boolean;

    /**
     * Checks whether the current checkout is loading.
     *
     * @returns True if the current checkout is loading, otherwise false.
     */
    isLoadingCheckout(): boolean;

    /**
     * Checks whether the current checkout is being updated.
     *
     * @returns True if the current checkout is being updated, otherwise false.
     */
    isUpdatingCheckout(): boolean;

    /**
     * Checks whether spam check is executing.
     *
     * @returns True if the current checkout is being updated, otherwise false.
     */
    isExecutingSpamCheck(): boolean;

    /**
     * Checks whether the current order is submitting.
     *
     * @returns True if the current order is submitting, otherwise false.
     */
    isSubmittingOrder(): boolean;

    /**
     * Checks whether the current order is finalizing.
     *
     * @returns True if the current order is finalizing, otherwise false.
     */
    isFinalizingOrder(): boolean;

    /**
     * Checks whether the current order is loading.
     *
     * @returns True if the current order is loading, otherwise false.
     */
    isLoadingOrder(): boolean;

    /**
     * Checks whether the current cart is loading.
     *
     * @returns True if the current cart is loading, otherwise false.
     */
    isLoadingCart(): boolean;

    /**
     * Checks whether billing countries are loading.
     *
     * @returns True if billing countries are loading, otherwise false.
     */
    isLoadingBillingCountries(): boolean;

    /**
     * Checks whether shipping countries are loading.
     *
     * @returns True if shipping countries are loading, otherwise false.
     */
    isLoadingShippingCountries(): boolean;

    /**
     * Checks whether payment methods are loading.
     *
     * @returns True if payment methods are loading, otherwise false.
     */
    isLoadingPaymentMethods(): boolean;

    /**
     * Checks whether a specific or any payment method is loading.
     *
     * The method returns true if no ID is provided and at least one payment
     * method is loading.
     *
     * @param methodId - The identifier of the payment method to check.
     * @returns True if the payment method is loading, otherwise false.
     */
    isLoadingPaymentMethod(methodId?: string): boolean;

    /**
     * Checks whether a specific or any payment method is initializing.
     *
     * The method returns true if no ID is provided and at least one payment
     * method is initializing.
     *
     * @param methodId - The identifier of the payment method to check.
     * @returns True if the payment method is initializing, otherwise false.
     */
    isInitializingPayment(methodId?: string): boolean;

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
    isSigningIn(methodId?: string): boolean;

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
    isSigningOut(methodId?: string): boolean;

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
    isInitializingCustomer(methodId?: string): boolean;

    /**
     * Checks whether shipping options are loading.
     *
     * @returns True if shipping options are loading, otherwise false.
     */
    isLoadingShippingOptions(): boolean;

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
    isSelectingShippingOption(consignmentId?: string): boolean;

    /**
     * Checks whether the billing address is being updated.
     *
     * @returns True if updating their billing address, otherwise false.
     */
    isUpdatingBillingAddress(): boolean;

    /**
     * Checks whether the shopper is continuing out as a guest.
     *
     * @returns True if continuing as guest, otherwise false.
     */
    isContinuingAsGuest(): boolean;

    /**
     * Checks the shipping address is being updated.
     *
     * @returns True if updating their shipping address, otherwise false.
     */
    isUpdatingShippingAddress(): boolean;

    /**
     * Checks whether a given/any consignment is being updated.
     *
     * A consignment ID should be provided when checking for a specific consignment,
     * otherwise it will check for any consignment.
     *
     * @param consignmentId - The identifier of the consignment to be checked.
     * @returns True if updating consignment(s), otherwise false.
     */
    isUpdatingConsignment(consignmentId?: string): boolean;

    /**
     * Checks whether a given/any consignment is being deleted.
     *
     * A consignment ID should be provided when checking for a specific consignment,
     * otherwise it will check for any consignment.
     *
     * @param consignmentId - The identifier of the consignment to be checked.
     * @returns True if deleting consignment(s), otherwise false.
     */
    isDeletingConsignment(consignmentId?: string): boolean;

    /**
     * Checks whether a given/any consignment is being updated.
     *
     * A consignment ID should be provided when checking for a specific consignment,
     * otherwise it will check for any consignment.
     *
     * @returns True if creating consignments, otherwise false.
     */
    isCreatingConsignments(): boolean;

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
    isInitializingShipping(methodId?: string): boolean;

    /**
     * Checks whether the current customer is applying a coupon code.
     *
     * @returns True if applying a coupon code, otherwise false.
     */
    isApplyingCoupon(): boolean;

    /**
     * Checks whether the current customer is applying store credit.
     *
     * @returns True if applying store credit, otherwise false.
     */
    isApplyingStoreCredit(): boolean;

    /**
     * Checks whether the current customer is removing a coupon code.
     *
     * @returns True if removing a coupon code, otherwise false.
     */
    isRemovingCoupon(): boolean;

    /**
     * Checks whether a sign-in email is being sent.
     *
     * @returns True if sending a sign-in email, otherwise false
     */
    isSendingSignInEmail(): boolean;

    /**
     * Checks whether the current customer is applying a gift certificate.
     *
     * @returns True if applying a gift certificate, otherwise false.
     */
    isApplyingGiftCertificate(): boolean;

    /**
     * Checks whether the current customer is removing a gift certificate.
     *
     * @returns True if removing a gift certificate, otherwise false.
     */
    isRemovingGiftCertificate(): boolean;

    /**
     * Checks whether the current customer's payment instruments are loading.
     *
     * @returns True if payment instruments are loading, otherwise false.
     */
    isLoadingInstruments(): boolean;

    /**
     * Checks whether the current customer is deleting a payment instrument.
     *
     * @returns True if deleting a payment instrument, otherwise false.
     */
    isDeletingInstrument(instrumentId?: string): boolean;

    /**
     * Checks whether the checkout configuration of a store is loading.
     *
     * @returns True if the configuration is loading, otherwise false.
     */
    isLoadingConfig(): boolean;

    /**
     * Checks whether the customer step of a checkout is in a pending state.
     *
     * The customer step is considered to be pending if it is in the process of
     * initializing, signing in, signing out, and/or interacting with a customer
     * widget.
     *
     * @returns True if the customer step is pending, otherwise false.
     */
    isCustomerStepPending(): boolean;

    /**
     * Checks whether the payment step of a checkout is in a pending state.
     *
     * The payment step is considered to be pending if it is in the process of
     * initializing, submitting an order, finalizing an order, and/or
     * interacting with a payment widget.
     *
     * @returns True if the payment step is pending, otherwise false.
     */
    isPaymentStepPending(): boolean;

    /**
     * Checks whether the subscriptions are being updated.
     *
     * @returns True if updating subscriptions, otherwise false.
     */
    isUpdatingSubscriptions(): boolean;
}

export type CheckoutStoreStatusSelectorFactory = (state: InternalCheckoutSelectors) => CheckoutStoreStatusSelector;

export function createCheckoutStoreStatusSelectorFactory(): CheckoutStoreStatusSelectorFactory {
    const isPending = createShallowEqualSelector(
        (selector: Omit<CheckoutStoreStatusSelector, 'isPending'>) => selector,
        selector => () => {
            return (Object.keys(selector) as Array<keyof Omit<CheckoutStoreStatusSelector, 'isPending'>>)
                .some(key => selector[key]());
        }
    );

    const isSelectingShippingOption = createSelector(
        ({ shippingStrategies }: InternalCheckoutSelectors) => shippingStrategies.isSelectingOption,
        ({ consignments }: InternalCheckoutSelectors) => consignments.isUpdatingShippingOption,
        (isSelectingOption, isUpdatingShippingOption) => (consignmentId?: string) => {
            return (
                isSelectingOption() ||
                isUpdatingShippingOption(consignmentId)
            );
        }
    );

    const isCustomerStepPending = createSelector(
        ({ customerStrategies }: InternalCheckoutSelectors) => customerStrategies.isInitializing,
        ({ customerStrategies }: InternalCheckoutSelectors) => customerStrategies.isSigningIn,
        ({ customerStrategies }: InternalCheckoutSelectors) => customerStrategies.isSigningOut,
        ({ customerStrategies }: InternalCheckoutSelectors) => customerStrategies.isWidgetInteracting,
        (isInitializing, isSigningIn, isSigningOut, isWidgetInteracting) => (methodId?: string) => {
            return (
                isInitializing(methodId) ||
                isSigningIn(methodId) ||
                isSigningOut(methodId) ||
                isWidgetInteracting(methodId)
            );
        }
    );

    const isPaymentStepPending = createSelector(
        ({ paymentStrategies }: InternalCheckoutSelectors) => paymentStrategies.isInitializing,
        ({ paymentStrategies }: InternalCheckoutSelectors) => paymentStrategies.isExecuting,
        ({ paymentStrategies }: InternalCheckoutSelectors) => paymentStrategies.isFinalizing,
        ({ paymentStrategies }: InternalCheckoutSelectors) => paymentStrategies.isWidgetInteracting,
        (isInitializing, isExecuting, isFinalizing, isWidgetInteracting) => (methodId?: string) => {
            return (
                isInitializing(methodId) ||
                isExecuting(methodId) ||
                isFinalizing(methodId) ||
                isWidgetInteracting(methodId)
            );
        }
    );

    const isSubmittingOrder = createSelector(
        ({ paymentStrategies }: InternalCheckoutSelectors) => paymentStrategies.isExecuting,
        ({ checkout }: InternalCheckoutSelectors) => checkout.isExecutingSpamCheck, // Remove this when CheckoutService#initializeSpamProtection is deprecated
        (isExecuting, isExecutingSpamCheck) => (methodId?: string) => {
            return (
                isExecuting(methodId) ||
                isExecutingSpamCheck()
            );
        }
    );

    return memoizeOne((
        state: InternalCheckoutSelectors
    ): CheckoutStoreStatusSelector => {
        const selector = {
            isLoadingCheckout: state.checkout.isLoading,
            isUpdatingCheckout: state.checkout.isUpdating,
            isExecutingSpamCheck: state.checkout.isExecutingSpamCheck,
            isSubmittingOrder: isSubmittingOrder(state),
            isFinalizingOrder: state.paymentStrategies.isFinalizing,
            isLoadingOrder: state.order.isLoading,
            isLoadingCart: state.cart.isLoading,
            isLoadingBillingCountries: state.countries.isLoading,
            isLoadingShippingCountries: state.shippingCountries.isLoading,
            isLoadingPaymentMethods: state.paymentMethods.isLoading,
            isLoadingPaymentMethod: state.paymentMethods.isLoadingMethod,
            isInitializingPayment: state.paymentStrategies.isInitializing,
            isSigningIn: state.customerStrategies.isSigningIn,
            isSigningOut: state.customerStrategies.isSigningOut,
            isInitializingCustomer: state.customerStrategies.isInitializing,
            isLoadingShippingOptions: state.consignments.isLoadingShippingOptions,
            isSelectingShippingOption: isSelectingShippingOption(state),
            isUpdatingBillingAddress: state.billingAddress.isUpdating,
            isUpdatingSubscriptions: state.subscriptions.isUpdating,
            isContinuingAsGuest: state.billingAddress.isContinuingAsGuest,
            isUpdatingShippingAddress: state.shippingStrategies.isUpdatingAddress,
            isUpdatingConsignment: state.consignments.isUpdating,
            isDeletingConsignment: state.consignments.isDeleting,
            isCreatingConsignments: state.consignments.isCreating,
            isInitializingShipping: state.shippingStrategies.isInitializing,
            isApplyingStoreCredit: state.storeCredit.isApplying,
            isApplyingCoupon: state.coupons.isApplying,
            isRemovingCoupon: state.coupons.isRemoving,
            isApplyingGiftCertificate: state.giftCertificates.isApplying,
            isRemovingGiftCertificate: state.giftCertificates.isRemoving,
            isLoadingInstruments: state.instruments.isLoading,
            isDeletingInstrument: state.instruments.isDeleting,
            isLoadingConfig: state.config.isLoading,
            isSendingSignInEmail: state.signInEmail.isSending,
            isCustomerStepPending: isCustomerStepPending(state),
            isPaymentStepPending: isPaymentStepPending(state),
        };

        return {
            isPending: isPending(selector),
            ...selector,
        };
    });
}
