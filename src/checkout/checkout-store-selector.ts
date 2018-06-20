import { mapToInternalAddress, InternalAddress } from '../address';
import { BillingAddressSelector } from '../billing';
import { Cart, CartSelector } from '../cart';
import { selector } from '../common/selector';
import { ConfigSelector } from '../config';
import { StoreConfig } from '../config/config';
import { Coupon, CouponSelector, GiftCertificate, GiftCertificateSelector } from '../coupon';
import { mapToInternalCustomer, CustomerSelector, InternalCustomer } from '../customer';
import { FormField, FormSelector } from '../form';
import { Country, CountrySelector } from '../geography';
import { Order, OrderSelector } from '../order';
import { PaymentMethod, PaymentMethodSelector, PaymentSelector } from '../payment';
import { Instrument, InstrumentSelector } from '../payment/instrument';
import { mapToInternalQuote, InternalQuote } from '../quote';
import {
    mapToInternalShippingOption,
    mapToInternalShippingOptions,
    InternalShippingOption,
    InternalShippingOptionList,
    ShippingAddressSelector,
    ShippingCountrySelector,
    ShippingOptionSelector,
} from '../shipping';
import ConsignmentSelector from '../shipping/consignment-selector';

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
    private _shippingOptions: ShippingOptionSelector;

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
        this._shippingOptions = selectors.shippingOptions;
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
     * Gets the current quote.
     *
     * @deprecated This method will be replaced in the future.
     * @returns The current quote if it is loaded, otherwise undefined.
     */
    getQuote(): InternalQuote | undefined {
        const checkout = this._checkout.getCheckout();
        const shippingAddress = this._shippingAddress.getShippingAddress();

        return checkout && mapToInternalQuote(checkout, shippingAddress);
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
    getShippingAddress(): InternalAddress | undefined {
        const shippingAddress = this._shippingAddress.getShippingAddress();

        return shippingAddress && mapToInternalAddress(shippingAddress);
    }

    /**
     * Gets a list of shipping options available for each shipping address.
     *
     * If there is no shipping address assigned to the current checkout, the
     * list of shipping options will be empty.
     *
     * @returns The list of shipping options per address if loaded, otherwise
     * undefined.
     */
    getShippingOptions(): InternalShippingOptionList | undefined {
        // @todo: once we remove the mappers, this should use the shippingOption selector
        const consignments = this._consignments.getConsignments();

        return consignments && mapToInternalShippingOptions(consignments);
    }

    /**
     * Gets the selected shipping option for the current checkout.
     *
     * @returns The shipping option object if there is a selected option,
     * otherwise undefined.
     */
    getSelectedShippingOption(): InternalShippingOption | undefined {
        const shippingOption = this._shippingOptions.getSelectedShippingOption();

        return shippingOption  && mapToInternalShippingOption(shippingOption, true);
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
    getBillingAddress(): InternalAddress | undefined {
        const billingAddress = this._billingAddress.getBillingAddress();

        return billingAddress && mapToInternalAddress(billingAddress);
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
    getCustomer(): InternalCustomer | undefined {
        const customer = this._customer.getCustomer();
        const checkout = this._checkout.getCheckout();
        const cart = checkout && checkout.cart;
        const billingAddress = checkout && checkout.billingAddress;

        if (!customer || !billingAddress || !cart) {
            return;
        }

        return mapToInternalCustomer(customer, cart, billingAddress);
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
