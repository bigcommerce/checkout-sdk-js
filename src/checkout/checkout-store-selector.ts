import { memoizeOne } from '@bigcommerce/memoize';
import { omit, values } from 'lodash';

import { Address } from '../address';
import { BillingAddress } from '../billing';
import { Cart } from '../cart';
import { createSelector } from '../common/selector';
import { cloneResult as clone } from '../common/utility';
import { StoreConfig } from '../config';
import { Coupon, GiftCertificate } from '../coupon';
import { Customer } from '../customer';
import { FormField } from '../form';
import { Country } from '../geography';
import { Order } from '../order';
import { PaymentMethod } from '../payment';
import { CardInstrument, PaymentInstrument } from '../payment/instrument';
import { Consignment, ShippingOption } from '../shipping';
import { SignInEmail } from '../signin-email';

import Checkout from './checkout';
import InternalCheckoutSelectors from './internal-checkout-selectors';

export type Instrument = CardInstrument;

/**
 * Responsible for getting the state of the current checkout.
 *
 * This object has a set of methods that allow you to get a specific piece of
 * checkout information, such as shipping and billing details.
 */
export default interface CheckoutStoreSelector {
    /**
     * Gets the current checkout.
     *
     * @returns The current checkout if it is loaded, otherwise undefined.
     */
    getCheckout(): Checkout | undefined;

    /**
     * Gets the current order.
     *
     * @returns The current order if it is loaded, otherwise undefined.
     */
    getOrder(): Order | undefined;

    /**
     * Gets the checkout configuration of a store.
     *
     * @returns The configuration object if it is loaded, otherwise undefined.
     */
    getConfig(): StoreConfig | undefined;

    /**
     * Gets the sign-in email.
     *
     * @returns The sign-in email object if sent, otherwise undefined
     */
    getSignInEmail(): SignInEmail | undefined;

    /**
     * Gets the shipping address of the current checkout.
     *
     * If the address is partially complete, it may not have shipping options
     * associated with it.
     *
     * @returns The shipping address object if it is loaded, otherwise
     * undefined.
     */
    getShippingAddress(): Address | undefined;

    /**
     * Gets a list of shipping options available for the shipping address.
     *
     * If there is no shipping address assigned to the current checkout, the
     * list of shipping options will be empty.
     *
     * @returns The list of shipping options if any, otherwise undefined.
     */
    getShippingOptions(): ShippingOption[] | undefined;

    /**
     * Gets a list of consignments.
     *
     * If there are no consignments created for to the current checkout, the
     * list will be empty.
     *
     * @returns The list of consignments if any, otherwise undefined.
     */
    getConsignments(): Consignment[] | undefined;

    /**
     * Gets the selected shipping option for the current checkout.
     *
     * @returns The shipping option object if there is a selected option,
     * otherwise undefined.
     */
    getSelectedShippingOption(): ShippingOption | undefined;

    /**
     * Gets a list of countries available for shipping.
     *
     * @returns The list of countries if it is loaded, otherwise undefined.
     */
    getShippingCountries(): Country[] | undefined;

    /**
     * Gets the billing address of an order.
     *
     * @returns The billing address object if it is loaded, otherwise undefined.
     */
    getBillingAddress(): BillingAddress | undefined;

    /**
     * Gets a list of countries available for billing.
     *
     * @returns The list of countries if it is loaded, otherwise undefined.
     */
    getBillingCountries(): Country[] | undefined;

    /**
     * Gets a list of payment methods available for checkout.
     *
     * @returns The list of payment methods if it is loaded, otherwise undefined.
     */
    getPaymentMethods(): PaymentMethod[] | undefined;

    /**
     * Gets a payment method by an id.
     *
     * The method returns undefined if unable to find a payment method with the
     * specified id, either because it is not available for the customer, or it
     * is not loaded.
     *
     * @param methodId - The identifier of the payment method.
     * @param gatewayId - The identifier of a payment provider providing the
     * payment method.
     * @returns The payment method object if loaded and available, otherwise,
     * undefined.
     */
    getPaymentMethod(methodId: string, gatewayId?: string): PaymentMethod | undefined;

    /**
     * Gets the payment method that is selected for checkout.
     *
     * @returns The payment method object if there is a selected method;
     * undefined if otherwise.
     */
    getSelectedPaymentMethod(): PaymentMethod | undefined;

    /**
     * Gets the current cart.
     *
     * @returns The current cart object if it is loaded, otherwise undefined.
     */
    getCart(): Cart | undefined;

    /**
     * Gets a list of coupons that are applied to the current checkout.
     *
     * @returns The list of applied coupons if there is any, otherwise undefined.
     */
    getCoupons(): Coupon[] | undefined;

    /**
     * Gets a list of gift certificates that are applied to the current checkout.
     *
     * @returns The list of applied gift certificates if there is any, otherwise undefined.
     */
    getGiftCertificates(): GiftCertificate[] | undefined;

    /**
     * Gets the current customer.
     *
     * @returns The current customer object if it is loaded, otherwise
     * undefined.
     */
    getCustomer(): Customer | undefined;

    /**
     * Checks if payment data is required or not.
     *
     * If payment data is required, customers should be prompted to enter their
     * payment details.
     *
     * ```js
     * if (state.checkout.isPaymentDataRequired()) {
     *     // Render payment form
     * } else {
     *     // Render "Payment is not required for this order" message
     * }
     * ```
     *
     * @param useStoreCredit - If true, check whether payment data is required
     * with store credit applied; otherwise, check without store credit.
     * @returns True if payment data is required, otherwise false.
     */
    isPaymentDataRequired(useStoreCredit?: boolean): boolean;

    /**
     * Checks if payment data is submitted or not.
     *
     * If payment data is already submitted using a payment method, customers
     * should not be prompted to enter their payment details again.
     *
     * @param methodId - The identifier of the payment method.
     * @param gatewayId - The identifier of a payment provider providing the
     * payment method.
     * @returns True if payment data is submitted, otherwise false.
     */
    isPaymentDataSubmitted(methodId: string, gatewayId?: string): boolean;

    /**
     * Gets a list of payment instruments associated with the current customer.
     *
     * @returns The list of payment instruments if it is loaded, otherwise undefined.
     */
    getInstruments(): Instrument[] | undefined;
    getInstruments(paymentMethod: PaymentMethod): PaymentInstrument[] | undefined;

    /**
     * Gets a set of form fields that should be presented to customers in order
     * to capture their billing address for a specific country.
     *
     * @param countryCode - A 2-letter country code (ISO 3166-1 alpha-2).
     * @returns The set of billing address form fields if it is loaded,
     * otherwise undefined.
     */
    getBillingAddressFields(countryCode: string): FormField[];

    /**
     * Gets a set of form fields that should be presented to customers in order
     * to capture their shipping address for a specific country.
     *
     * @param countryCode - A 2-letter country code (ISO 3166-1 alpha-2).
     * @returns The set of shipping address form fields if it is loaded,
     * otherwise undefined.
     */
    getShippingAddressFields(countryCode: string): FormField[];
}

export type CheckoutStoreSelectorFactory = (state: InternalCheckoutSelectors) => CheckoutStoreSelector;

export function createCheckoutStoreSelectorFactory(): CheckoutStoreSelectorFactory {
    const getCheckout = createSelector(
        ({ checkout }: InternalCheckoutSelectors) => checkout.getCheckout,
        getCheckout => clone(getCheckout)
    );

    const getOrder = createSelector(
        ({ order }: InternalCheckoutSelectors) => order.getOrder,
        getOrder => clone(getOrder)
    );

    const getConfig = createSelector(
        ({ config }: InternalCheckoutSelectors) => config.getStoreConfig,
        getStoreConfig => clone(getStoreConfig)
    );

    const getShippingAddress = createSelector(
        ({ shippingAddress }: InternalCheckoutSelectors) => shippingAddress.getShippingAddress,
        ({ config }: InternalCheckoutSelectors) => config.getContextConfig,
        (getShippingAddress, getContextConfig) => clone(() => {
            const shippingAddress = getShippingAddress();
            const context = getContextConfig();

            if (!shippingAddress) {
                if (!context || !context.geoCountryCode) {
                    return;
                }

                return {
                    firstName: '',
                    lastName: '',
                    company: '',
                    address1: '',
                    address2: '',
                    city: '',
                    stateOrProvince: '',
                    stateOrProvinceCode: '',
                    postalCode: '',
                    country: '',
                    phone: '',
                    customFields: [],
                    countryCode: context.geoCountryCode,
                };
            }

            return shippingAddress;
        })
    );

    const getShippingOptions = createSelector(
        ({ consignments }: InternalCheckoutSelectors) => consignments.getConsignments,
        getConsignments => clone(() => {
            const consignments = getConsignments();

            if (consignments && consignments.length) {
                return consignments[0].availableShippingOptions;
            }
        })
    );

    const getConsignments = createSelector(
        ({ consignments }: InternalCheckoutSelectors) => consignments.getConsignments,
        getConsignments => clone(getConsignments)
    );

    const getSelectedShippingOption = createSelector(
        ({ consignments }: InternalCheckoutSelectors) => consignments.getConsignments,
        getConsignments => clone(() => {
            const consignments = getConsignments();

            if (!consignments || !consignments.length) {
                return;
            }

            return consignments[0].selectedShippingOption;
        })
    );

    const getShippingCountries = createSelector(
        ({ shippingCountries }: InternalCheckoutSelectors) => shippingCountries.getShippingCountries,
        getShippingCountries => clone(getShippingCountries)
    );

    const getBillingAddress = createSelector(
        ({ billingAddress }: InternalCheckoutSelectors) => billingAddress.getBillingAddress,
        ({ config }: InternalCheckoutSelectors) => config.getContextConfig,
        (getBillingAddress, getContextConfig) => clone(() => {
            const billingAddress = getBillingAddress();
            const context = getContextConfig();
            const isEmptyBillingAddress = !billingAddress ||
                values(omit(billingAddress, 'email', 'id')).every(val => !val || !val.length);

            if (isEmptyBillingAddress) {
                if (!context || !context.geoCountryCode) {
                    return billingAddress;
                }

                return {
                    id: billingAddress ? billingAddress.id : '',
                    firstName: '',
                    lastName: '',
                    company: '',
                    address1: '',
                    address2: '',
                    city: '',
                    email: billingAddress ? billingAddress.email : '',
                    stateOrProvince: '',
                    stateOrProvinceCode: '',
                    postalCode: '',
                    country: '',
                    phone: '',
                    customFields: [],
                    countryCode: context.geoCountryCode,
                };
            }

            return billingAddress;
        })
    );

    const getBillingCountries = createSelector(
        ({ countries }: InternalCheckoutSelectors) => countries.getCountries,
        getCountries => clone(getCountries)
    );

    const getPaymentMethods = createSelector(
        ({ paymentMethods }: InternalCheckoutSelectors) => paymentMethods.getPaymentMethods,
        getPaymentMethods => clone(getPaymentMethods)
    );

    const getPaymentMethod = createSelector(
        ({ paymentMethods }: InternalCheckoutSelectors) => paymentMethods.getPaymentMethod,
        getPaymentMethod => clone(getPaymentMethod)
    );

    const getSelectedPaymentMethod = createSelector(
        ({ payment }: InternalCheckoutSelectors) => payment.getPaymentId,
        ({ paymentMethods }: InternalCheckoutSelectors) => paymentMethods.getPaymentMethod,
        (getPaymentId, getPaymentMethod) => clone(() => {
            const payment = getPaymentId();

            return payment && getPaymentMethod(payment.providerId, payment.gatewayId);
        })
    );

    const getCart = createSelector(
        ({ cart }: InternalCheckoutSelectors) => cart.getCart,
        getCart => clone(getCart)
    );

    const getCoupons = createSelector(
        ({ coupons }: InternalCheckoutSelectors) => coupons.getCoupons,
        getCoupons => clone(getCoupons)
    );

    const getGiftCertificates = createSelector(
        ({ giftCertificates }: InternalCheckoutSelectors) => giftCertificates.getGiftCertificates,
        getGiftCertificates => clone(getGiftCertificates)
    );

    const getCustomer = createSelector(
        ({ customer }: InternalCheckoutSelectors) => customer.getCustomer,
        getCustomer => clone(getCustomer)
    );

    const getSignInEmail = createSelector(
        ({ signInEmail }: InternalCheckoutSelectors) => signInEmail.getEmail,
        getEmail => clone(getEmail)
    );

    const isPaymentDataRequired = createSelector(
        ({ payment }: InternalCheckoutSelectors) => payment.isPaymentDataRequired,
        isPaymentDataRequired => clone(isPaymentDataRequired)
    );

    const isPaymentDataSubmitted = createSelector(
        ({ payment }: InternalCheckoutSelectors) => payment.isPaymentDataSubmitted,
        ({ paymentMethods }: InternalCheckoutSelectors) => paymentMethods.getPaymentMethod,
        (isPaymentDataSubmitted, getPaymentMethod) => clone((methodId: string, gatewayId?: string) => {
            return isPaymentDataSubmitted(getPaymentMethod(methodId, gatewayId));
        })
    );

    const getInstruments = createSelector(
        ({ instruments }: InternalCheckoutSelectors) => instruments.getInstruments,
        ({ instruments }: InternalCheckoutSelectors) => instruments.getInstrumentsByPaymentMethod,
        (getInstruments, getInstrumentsByPaymentMethod) => {
            function getInstrumentsSelector(): Instrument[] | undefined;
            function getInstrumentsSelector(paymentMethod: PaymentMethod): PaymentInstrument[] | undefined;
            function getInstrumentsSelector(paymentMethod?: PaymentMethod): PaymentInstrument[] | undefined {
                return paymentMethod ? getInstrumentsByPaymentMethod(paymentMethod) : getInstruments();
            }

            return clone(getInstrumentsSelector);
        }
    );

    const getBillingAddressFields = createSelector(
        ({ form }: InternalCheckoutSelectors) => form.getBillingAddressFields,
        ({ countries }: InternalCheckoutSelectors) => countries.getCountries,
        (getBillingAddressFields, getCountries) => clone((countryCode: string) => {
            return getBillingAddressFields(getCountries(), countryCode);
        })
    );

    const getShippingAddressFields = createSelector(
        ({ form }: InternalCheckoutSelectors) => form.getShippingAddressFields,
        ({ shippingCountries }: InternalCheckoutSelectors) => shippingCountries.getShippingCountries,
        (getShippingAddressFields, getShippingCountries) => clone((countryCode: string) => {
            return getShippingAddressFields(getShippingCountries(), countryCode);
        })
    );

    return memoizeOne((
        state: InternalCheckoutSelectors
    ): CheckoutStoreSelector => {
        return {
            getCheckout: getCheckout(state),
            getOrder: getOrder(state),
            getConfig: getConfig(state),
            getShippingAddress: getShippingAddress(state),
            getShippingOptions: getShippingOptions(state),
            getConsignments: getConsignments(state),
            getSelectedShippingOption: getSelectedShippingOption(state),
            getShippingCountries: getShippingCountries(state),
            getBillingAddress: getBillingAddress(state),
            getBillingCountries: getBillingCountries(state),
            getPaymentMethods: getPaymentMethods(state),
            getPaymentMethod: getPaymentMethod(state),
            getSelectedPaymentMethod: getSelectedPaymentMethod(state),
            getCart: getCart(state),
            getCoupons: getCoupons(state),
            getGiftCertificates: getGiftCertificates(state),
            getCustomer: getCustomer(state),
            isPaymentDataRequired: isPaymentDataRequired(state),
            isPaymentDataSubmitted: isPaymentDataSubmitted(state),
            getSignInEmail: getSignInEmail(state),
            getInstruments: getInstruments(state),
            getBillingAddressFields: getBillingAddressFields(state),
            getShippingAddressFields: getShippingAddressFields(state),
        };
    });
}
