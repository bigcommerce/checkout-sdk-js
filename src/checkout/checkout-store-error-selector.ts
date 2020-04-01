import { memoizeOne } from '@bigcommerce/memoize';

import { RequestError } from '../common/error/errors';
import { createSelector, createShallowEqualSelector } from '../common/selector';
import { Omit } from '../common/types';

import InternalCheckoutSelectors from './internal-checkout-selectors';

/**
 * Responsible for getting the error of any asynchronous checkout action, if
 * there is any.
 *
 * This object has a set of getters that would return an error if an action is
 * not executed successfully. For example, if you are unable to submit an order,
 * you can use this object to retrieve the reason for the failure.
 */
export default interface CheckoutStoreErrorSelector {
    getError(): Error | undefined;

    /**
     * Returns an error if unable to load the current checkout.
     *
     * @returns The error object if unable to load, otherwise undefined.
     */
    getLoadCheckoutError(): Error | undefined;

    /**
     * Returns an error if unable to update the current checkout.
     *
     * @returns The error object if unable to update, otherwise undefined.
     */
    getUpdateCheckoutError(): Error | undefined;

    /**
     * Returns an error if unable to submit the current order.
     *
     * @returns The error object if unable to submit, otherwise undefined.
     */
    getSubmitOrderError(): Error | undefined;

    /**
     * Returns an error if unable to finalize the current order.
     *
     * @returns The error object if unable to finalize, otherwise undefined.
     */
    getFinalizeOrderError(): Error | undefined;

    /**
     * Returns an error if unable to load the current order.
     *
     * @returns The error object if unable to load, otherwise undefined.
     */
    getLoadOrderError(): Error | undefined;

    /**
     * Returns an error if unable to load the current cart.
     *
     * @returns The error object if unable to load, otherwise undefined.
     */
    getLoadCartError(): Error | undefined;

    /**
     * Returns an error if unable to load billing countries.
     *
     * @returns The error object if unable to load, otherwise undefined.
     */
    getLoadBillingCountriesError(): Error | undefined;

    /**
     * Returns an error if unable to load shipping countries.
     *
     * @returns The error object if unable to load, otherwise undefined.
     */
    getLoadShippingCountriesError(): Error | undefined;

    /**
     * Returns an error if unable to load payment methods.
     *
     * @returns The error object if unable to load, otherwise undefined.
     */
    getLoadPaymentMethodsError(): Error | undefined;

    /**
     * Returns an error if unable to load a specific payment method.
     *
     * @param methodId - The identifier of the payment method to load.
     * @returns The error object if unable to load, otherwise undefined.
     */
    getLoadPaymentMethodError(methodId?: string): Error | undefined;

    /**
     * Returns an error if unable to initialize a specific payment method.
     *
     * @param methodId - The identifier of the payment method to initialize.
     * @returns The error object if unable to initialize, otherwise undefined.
     */
    getInitializePaymentError(methodId?: string): Error | undefined;

    /**
     * Returns an error if unable to sign in.
     *
     * @returns The error object if unable to sign in, otherwise undefined.
     */
    getSignInError(): Error | undefined;

    /**
     * Returns an error if unable to sign out.
     *
     * @returns The error object if unable to sign out, otherwise undefined.
     */
    getSignOutError(): Error | undefined;

    /**
     * Returns an error if unable to initialize the customer step of a checkout
     * process.
     *
     * @param methodId - The identifer of the initialization method to execute.
     * @returns The error object if unable to initialize, otherwise undefined.
     */
    getInitializeCustomerError(methodId?: string): Error | undefined;

    /**
     * Returns an error if unable to load shipping options.
     *
     * @returns The error object if unable to load, otherwise undefined.
     */
    getLoadShippingOptionsError(): Error | undefined;

    /**
     * Returns an error if unable to select a shipping option.
     *
     * A consignment ID should be provided when checking for an error for a
     * specific consignment, otherwise it will check for all available consignments.
     *
     * @param consignmentId - The identifier of the consignment to be checked.
     * @returns The error object if unable to select, otherwise undefined.
     */
    getSelectShippingOptionError(consignmentId?: string): Error | undefined;

    /**
     * Returns an error if unable to continue as guest.
     *
     * @returns The error object if unable to continue, otherwise undefined.
     */
    getContinueAsGuestError(): Error | undefined;

    /**
     * Returns an error if unable to update billing address.
     *
     * @returns The error object if unable to update, otherwise undefined.
     */
    getUpdateBillingAddressError(): Error | undefined;

    /**
     * Returns an error if unable to update subscriptions.
     *
     * @returns The error object if unable to update, otherwise undefined.
     */
    getUpdateSubscriptionsError(): Error | undefined;

    /**
     * Returns an error if unable to update shipping address.
     *
     * @returns The error object if unable to update, otherwise undefined.
     */
    getUpdateShippingAddressError(): Error | undefined;

    /**
     * Returns an error if unable to delete a consignment.
     *
     * A consignment ID should be provided when checking for an error for a
     * specific consignment, otherwise it will check for all available consignments.
     *
     * @param consignmentId - The identifier of the consignment to be checked.
     * @returns The error object if unable to delete, otherwise undefined.
     */
    getDeleteConsignmentError(consignmentId?: string): Error | undefined;

    /**
     * Returns an error if unable to update a consignment.
     *
     * A consignment ID should be provided when checking for an error for a
     * specific consignment, otherwise it will check for all available consignments.
     *
     * @param consignmentId - The identifier of the consignment to be checked.
     * @returns The error object if unable to update, otherwise undefined.
     */
    getUpdateConsignmentError(consignmentId?: string): Error | undefined;

    /**
     * Returns an error if unable to create consignments.
     *
     * @returns The error object if unable to create, otherwise undefined.
     */
    getCreateConsignmentsError(): Error | undefined;

    /**
     * Returns an error if unable to initialize the shipping step of a checkout
     * process.
     *
     * @param methodId - The identifer of the initialization method to execute.
     * @returns The error object if unable to initialize, otherwise undefined.
     */
    getInitializeShippingError(methodId?: string): Error | undefined;

    /**
     * Returns an error if unable to apply store credit.
     *
     * @returns The error object if unable to apply, otherwise undefined.
     */
    getApplyStoreCreditError(): RequestError | undefined;

    /**
     * Returns an error if unable to apply a coupon code.
     *
     * @returns The error object if unable to apply, otherwise undefined.
     */
    getApplyCouponError(): RequestError | undefined;

    /**
     * Returns an error if unable to remove a coupon code.
     *
     * @returns The error object if unable to remove, otherwise undefined.
     */
    getRemoveCouponError(): RequestError | undefined;

    /**
     * Returns an error if unable to apply a gift certificate.
     *
     * @returns The error object if unable to apply, otherwise undefined.
     */
    getApplyGiftCertificateError(): RequestError | undefined;

    /**
     * Returns an error if unable to remove a gift certificate.
     *
     * @returns The error object if unable to remove, otherwise undefined.
     */
    getRemoveGiftCertificateError(): RequestError | undefined;

    /**
     * Returns an error if unable to load payment instruments.
     *
     * @returns The error object if unable to load, otherwise undefined.
     */
    getLoadInstrumentsError(): Error | undefined;

    /**
     * Returns an error if unable to delete a payment instrument.
     *
     * @param instrumentId - The identifier of the payment instrument to delete.
     * @returns The error object if unable to delete, otherwise undefined.
     */
    getDeleteInstrumentError(instrumentId?: string): Error | undefined;

    /**
     * Returns an error if unable to load the checkout configuration of a store.
     *
     * @returns The error object if unable to load, otherwise undefined.
     */
    getLoadConfigError(): Error | undefined;
}

export type CheckoutStoreErrorSelectorFactory = (state: InternalCheckoutSelectors) => CheckoutStoreErrorSelector;

export function createCheckoutStoreErrorSelectorFactory(): CheckoutStoreErrorSelectorFactory {
    const getError = createShallowEqualSelector(
        (selector: Omit<CheckoutStoreErrorSelector, 'getError'>) => selector,
        selector => () => {
            for (const key of Object.keys(selector) as Array<keyof Omit<CheckoutStoreErrorSelector, 'getError'>>) {
                const error = selector[key]();

                if (error) {
                    return error;
                }
            }
        }
    );

    const getSelectShippingOptionError = createSelector(
        ({ shippingStrategies }: InternalCheckoutSelectors) => shippingStrategies.getSelectOptionError,
        ({ consignments }: InternalCheckoutSelectors) => consignments.getUpdateShippingOptionError,
        (getSelectOptionError, getUpdateShippingOptionError) => (consignmentId?: string) => {
            return (
                getSelectOptionError() ||
                getUpdateShippingOptionError(consignmentId)
            );
        }
    );

    return memoizeOne((
        state: InternalCheckoutSelectors
    ): CheckoutStoreErrorSelector => {
        const selector = {
            getLoadCheckoutError: state.checkout.getLoadError,
            getUpdateCheckoutError: state.checkout.getUpdateError,
            getSubmitOrderError: state.paymentStrategies.getExecuteError,
            getFinalizeOrderError: state.paymentStrategies.getFinalizeError,
            getLoadOrderError: state.order.getLoadError,
            getLoadCartError: state.cart.getLoadError,
            getLoadBillingCountriesError: state.countries.getLoadError,
            getLoadShippingCountriesError: state.shippingCountries.getLoadError,
            getLoadPaymentMethodsError: state.paymentMethods.getLoadError,
            getLoadPaymentMethodError: state.paymentMethods.getLoadMethodError,
            getInitializePaymentError: state.paymentStrategies.getInitializeError,
            getSignInError: state.customerStrategies.getSignInError,
            getSignOutError: state.customerStrategies.getSignOutError,
            getInitializeCustomerError: state.customerStrategies.getInitializeError,
            getLoadShippingOptionsError: state.consignments.getLoadShippingOptionsError,
            getSelectShippingOptionError: getSelectShippingOptionError(state),
            getContinueAsGuestError: state.billingAddress.getContinueAsGuestError,
            getUpdateBillingAddressError: state.billingAddress.getUpdateError,
            getUpdateSubscriptionsError: state.subscriptions.getUpdateError,
            getUpdateShippingAddressError: state.shippingStrategies.getUpdateAddressError,
            getDeleteConsignmentError: state.consignments.getDeleteError,
            getUpdateConsignmentError: state.consignments.getUpdateError,
            getCreateConsignmentsError: state.consignments.getCreateError,
            getInitializeShippingError: state.shippingStrategies.getInitializeError,
            getApplyStoreCreditError: state.storeCredit.getApplyError,
            getApplyCouponError: state.coupons.getApplyError,
            getRemoveCouponError: state.coupons.getRemoveError,
            getApplyGiftCertificateError: state.giftCertificates.getApplyError,
            getRemoveGiftCertificateError: state.giftCertificates.getRemoveError,
            getLoadInstrumentsError: state.instruments.getLoadError,
            getDeleteInstrumentError: state.instruments.getDeleteError,
            getLoadConfigError: state.config.getLoadError,
        };

        return {
            getError: getError(selector),
            ...selector,
        };
    });
}
