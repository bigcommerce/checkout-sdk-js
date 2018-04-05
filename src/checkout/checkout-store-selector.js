// eslint-disable-next-line no-unused-vars
import { selectorDecorator as selector } from '../common/selector';

@selector
export default class CheckoutStoreSelector {
    /**
     * @constructor
     * @param {BillingAddressSelector} billingAddress
     * @param {CartSelector} cart
     * @param {CheckoutSelector} checkout
     * @param {ConfigSelector} config
     * @param {CountrySelector} countries
     * @param {CustomerSelector} customer
     * @param {FormSelector} form
     * @param {InstrumentSelector} instruments
     * @param {OrderSelector} order
     * @param {PaymentMethodSelector} paymentMethods
     * @param {QuoteSelector} quote
     * @param {RemoteCheckoutSelector} remoteCheckout
     * @param {ShippingAddressSelector} shippingAddress
     * @param {ShippingCountrySelector} shippingCountries
     * @param {ShippingOptionSelector} shippingOptions
     */
    constructor(
        billingAddress,
        cart,
        checkout,
        config,
        countries,
        customer,
        form,
        instruments,
        order,
        paymentMethods,
        quote,
        remoteCheckout,
        shippingAddress,
        shippingCountries,
        shippingOptions
    ) {
        this._billingAddress = billingAddress;
        this._cart = cart;
        this._checkout = checkout;
        this._config = config;
        this._countries = countries;
        this._customer = customer;
        this._form = form;
        this._instruments = instruments;
        this._order = order;
        this._paymentMethods = paymentMethods;
        this._quote = quote;
        this._remoteCheckout = remoteCheckout;
        this._shippingAddress = shippingAddress;
        this._shippingCountries = shippingCountries;
        this._shippingOptions = shippingOptions;
    }

    /**
     * @return {Checkout}
     */
    getCheckout() {
        return this._checkout.getCheckout();
    }

    /**
     * @return {CheckoutMeta}
     */
    getCheckoutMeta() {
        const orderMeta = this._order.getOrderMeta();
        const quoteMeta = this._quote.getQuoteMeta();
        const isCartVerified = this._cart.isValid();
        const paymentAuthToken = this._order.getPaymentAuthToken();
        const instrumentsMeta = this._instruments.getInstrumentsMeta();
        const remoteCheckout = this._remoteCheckout.getCheckout();
        const remoteCheckoutMeta = this._remoteCheckout.getCheckoutMeta();

        return {
            ...orderMeta,
            ...(quoteMeta && quoteMeta.request),
            ...instrumentsMeta,
            isCartVerified,
            paymentAuthToken,
            remoteCheckout: {
                ...remoteCheckout,
                ...remoteCheckoutMeta,
            },
        };
    }

    /**
     * @return {Order}
     */
    getOrder() {
        return this._order.getOrder();
    }

    /**
     * @return {InternalQuote}
     */
    getQuote() {
        return this._quote.getQuote();
    }

    /**
     * @return {Config}
     */
    getConfig() {
        return this._config.getConfig();
    }

    /**
     * @return {Address}
     */
    getShippingAddress() {
        return this._shippingAddress.getShippingAddress();
    }

    /**
     * @return {InternalShippingOptionList}
     */
    getShippingOptions() {
        return this._shippingOptions.getShippingOptions();
    }

    /**
     * @return {?ShippingOption}
     */
    getSelectedShippingOption() {
        return this._shippingOptions.getSelectedShippingOption();
    }

    /**
     * @return {Country[]}
     */
    getShippingCountries() {
        return this._shippingCountries.getShippingCountries();
    }

    /**
     * @return {Address}
     */
    getBillingAddress() {
        return this._billingAddress.getBillingAddress();
    }

    /**
     * @return {Country[]}
     */
    getBillingCountries() {
        return this._countries.getCountries();
    }

    /**
     * @return {PaymentMethod[]}
     */
    getPaymentMethods() {
        return this._paymentMethods.getPaymentMethods();
    }

    /**
     * @param {string} methodId
     * @param {string} [gatewayId]
     * @return {?PaymentMethod}
     */
    getPaymentMethod(methodId, gatewayId) {
        return this._paymentMethods.getPaymentMethod(methodId, gatewayId);
    }

    /**
     * @return {?PaymentMethod}
     */
    getSelectedPaymentMethod() {
        return this._paymentMethods.getSelectedPaymentMethod();
    }

    /**
     * @return {InternalCart}
     */
    getCart() {
        return this._cart.getCart();
    }

    /**
     * @return {InternalCustomer}
     */
    getCustomer() {
        return this._customer.getCustomer();
    }

    /**
     * @param {boolean|undefined} useStoreCredit
     * @return {boolean}
     */
    isPaymentDataRequired(useStoreCredit = false) {
        return this._order.isPaymentDataRequired(useStoreCredit);
    }

    /**
     * @param {string} methodId
     * @param {string} [gatewayId]
     * @return {boolean}
     */
    isPaymentDataSubmitted(methodId, gatewayId) {
        return this._order.isPaymentDataSubmitted(this.getPaymentMethod(methodId, gatewayId));
    }

    /**
     * @return {Instrument[]}
     */
    getInstruments() {
        return this._instruments.getInstruments();
    }

    /**
     * @return {Field[]}
     */
    getBillingAddressFields(countryCode) {
        return this._form.getBillingAddressFields(this.getBillingCountries(), countryCode);
    }

    /**
     * @return {Field[]}
     */
    getShippingAddressFields(countryCode) {
        return this._form.getShippingAddressFields(this.getShippingCountries(), countryCode);
    }
}
