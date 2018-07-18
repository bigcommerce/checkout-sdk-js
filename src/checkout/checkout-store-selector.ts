import { Address } from '../address';
import { BillingAddressSelector } from '../billing';
import { Cart, CartSelector } from '../cart';
import { selector } from '../common/selector';
import { ConfigSelector } from '../config';
import { StoreConfig } from '../config/config';
import { Coupon, CouponSelector, GiftCertificate, GiftCertificateSelector } from '../coupon';
import { Customer, CustomerSelector } from '../customer';
import { FormField, FormSelector } from '../form';
import { Country, CountrySelector } from '../geography';
import { Order, OrderSelector } from '../order';
import { PaymentMethod, PaymentMethodSelector, PaymentSelector } from '../payment';
import { Instrument, InstrumentSelector } from '../payment/instrument';
import {
    Consignment,
    ConsignmentSelector,
    ShippingAddressSelector,
    ShippingCountrySelector,
    ShippingOption,
} from '../shipping';

import Checkout from './checkout';
import CheckoutSelector from './checkout-selector';
import InternalCheckoutSelectors from './internal-checkout-selectors';

/**
 * Responsible for getting the state of the current checkout.
 *
 * This object has a set of methods that allow you to get a specific piece of
 * checkout information, such as shipping and billing details.
 */
@selector
export default class CheckoutStoreSelector {
    private _billingAddress: BillingAddressSelector;
    private _cart: CartSelector;
    private _checkout: CheckoutSelector;
    private _config: ConfigSelector;
    private _consignments: ConsignmentSelector;
    private _countries: CountrySelector;
    private _coupons: CouponSelector;
    private _customer: CustomerSelector;
    private _form: FormSelector;
    private _giftCertificates: GiftCertificateSelector;
    private _instruments: InstrumentSelector;
    private _order: OrderSelector;
    private _payment: PaymentSelector;
    private _paymentMethods: PaymentMethodSelector;
    private _shippingAddress: ShippingAddressSelector;
    private _shippingCountries: ShippingCountrySelector;

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
        this._customer = selectors.customer;
        this._form = selectors.form;
        this._giftCertificates = selectors.giftCertificates;
        this._instruments = selectors.instruments;
        this._order = selectors.order;
        this._payment = selectors.payment;
        this._paymentMethods = selectors.paymentMethods;
        this._shippingAddress = selectors.shippingAddress;
        this._shippingCountries = selectors.shippingCountries;
    }

    /**
     * Gets the current checkout.
     *
     * @returns The current checkout if it is loaded, otherwise undefined.
     */
    getCheckout(): Checkout | undefined {
        return this._checkout.getCheckout();
    }

    /**
     * Gets the current order.
     *
     * @returns The current order if it is loaded, otherwise undefined.
     */
    getOrder(): Order | undefined {
        return this._order.getOrder();
    }

    /**
     * Gets the checkout configuration of a store.
     *
     * @returns The configuration object if it is loaded, otherwise undefined.
     */
    getConfig(): StoreConfig | undefined {
        return this._config.getStoreConfig();
    }

    /**
     * Gets the shipping address of the current checkout.
     *
     * If the address is partially complete, it may not have shipping options
     * associated with it.
     *
     * @returns The shipping address object if it is loaded, otherwise
     * undefined.
     */
    getShippingAddress(): Address | undefined {
        return this._shippingAddress.getShippingAddress();
    }

    /**
     * Gets a list of shipping options available for the shipping address.
     *
     * If there is no shipping address assigned to the current checkout, the
     * list of shipping options will be empty.
     *
     * @returns The list of shipping options if any, otherwise undefined.
     */
    getShippingOptions(): ShippingOption[] | undefined {
        const consignments = this._consignments.getConsignments();

        if (consignments && consignments.length) {
            return consignments[0].availableShippingOptions;
        }

        return;
    }

    /**
     * Gets a list of consignments.
     *
     * If there are no consignments created for to the current checkout, the
     * list will be empty.
     *
     * @returns The list of consignments if any, otherwise undefined.
     */
    getConsignments(): Consignment[] | undefined {
        return this._consignments.getConsignments();
    }

    /**
     * Gets the selected shipping option for the current checkout.
     *
     * @returns The shipping option object if there is a selected option,
     * otherwise undefined.
     */
    getSelectedShippingOption(): ShippingOption | undefined {
        const consignments = this._consignments.getConsignments();

        if (consignments && consignments.length) {
            return consignments[0].selectedShippingOption;
        }

        return;
    }

    /**
     * Gets a list of countries available for shipping.
     *
     * @returns The list of countries if it is loaded, otherwise undefined.
     */
    getShippingCountries(): Country[] | undefined {
        return this._shippingCountries.getShippingCountries();
    }

    /**
     * Gets the billing address of an order.
     *
     * @returns The billing address object if it is loaded, otherwise undefined.
     */
    getBillingAddress(): Address | undefined {
        return this._billingAddress.getBillingAddress();
    }

    /**
     * Gets a list of countries available for billing.
     *
     * @returns The list of countries if it is loaded, otherwise undefined.
     */
    getBillingCountries(): Country[] | undefined {
        return this._countries.getCountries();
    }

    /**
     * Gets a list of payment methods available for checkout.
     *
     * @returns The list of payment methods if it is loaded, otherwise undefined.
     */
    getPaymentMethods(): PaymentMethod[] | undefined {
        return this._paymentMethods.getPaymentMethods();
    }

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
    getPaymentMethod(methodId: string, gatewayId?: string): PaymentMethod | undefined {
        return this._paymentMethods.getPaymentMethod(methodId, gatewayId);
    }

    /**
     * Gets the payment method that is selected for checkout.
     *
     * @returns The payment method object if there is a selected method;
     * undefined if otherwise.
     */
    getSelectedPaymentMethod(): PaymentMethod | undefined {
        const payment = this._payment.getPaymentId();

        return payment && this._paymentMethods.getPaymentMethod(payment.providerId, payment.gatewayId);
    }

    /**
     * Gets the current cart.
     *
     * @returns The current cart object if it is loaded, otherwise undefined.
     */
    getCart(): Cart | undefined {
        return this._cart.getCart();
    }

    /**
     * Gets a list of coupons that are applied to the current checkout.
     *
     * @returns The list of applied coupons if there is any, otherwise undefined.
     */
    getCoupons(): Coupon[] | undefined {
        return this._coupons.getCoupons();
    }

    /**
     * Gets a list of gift certificates that are applied to the current checkout.
     *
     * @returns The list of applied gift certificates if there is any, otherwise undefined.
     */
    getGiftCertificates(): GiftCertificate[] | undefined {
        return this._giftCertificates.getGiftCertificates();
    }

    /**
     * Gets the current customer.
     *
     * @returns The current customer object if it is loaded, otherwise
     * undefined.
     */
    getCustomer(): Customer | undefined {
        return this._customer.getCustomer();
    }

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
    isPaymentDataRequired(useStoreCredit?: boolean): boolean {
        return this._payment.isPaymentDataRequired(useStoreCredit);
    }

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
    isPaymentDataSubmitted(methodId: string, gatewayId?: string): boolean {
        return this._payment.isPaymentDataSubmitted(this.getPaymentMethod(methodId, gatewayId));
    }

    /**
     * Gets a list of payment instruments associated with the current customer.
     *
     * @returns The list of payment instruments if it is loaded, otherwise undefined.
     */
    getInstruments(): Instrument[] | undefined {
        return this._instruments.getInstruments();
    }

    /**
     * Gets a set of form fields that should be presented to customers in order
     * to capture their billing address for a specific country.
     *
     * @param countryCode - A 2-letter country code (ISO 3166-1 alpha-2).
     * @returns The set of billing address form fields if it is loaded,
     * otherwise undefined.
     */
    getBillingAddressFields(countryCode: string): FormField[] {
        return this._form.getBillingAddressFields(this.getBillingCountries(), countryCode);
    }

    /**
     * Gets a set of form fields that should be presented to customers in order
     * to capture their shipping address for a specific country.
     *
     * @param countryCode - A 2-letter country code (ISO 3166-1 alpha-2).
     * @returns The set of shipping address form fields if it is loaded,
     * otherwise undefined.
     */
    getShippingAddressFields(countryCode: string): FormField[] {
        return this._form.getShippingAddressFields(this.getShippingCountries(), countryCode);
    }
}
