import { InternalAddress } from '../address';
import { BillingAddressSelector } from '../billing';
import { CartSelector, InternalCart } from '../cart';
import { selector } from '../common/selector';
import { ConfigSelector } from '../config';
import { StoreConfig } from '../config/config';
import { CustomerSelector, InternalCustomer } from '../customer';
import { FormField, FormSelector } from '../form';
import { Country, CountrySelector } from '../geography';
import { InternalOrder, OrderSelector } from '../order';
import { PaymentMethod, PaymentMethodSelector } from '../payment';
import { Instrument, InstrumentSelector } from '../payment/instrument';
import { InternalQuote, QuoteSelector } from '../quote';
import {
    InternalShippingOption,
    InternalShippingOptionList,
    ShippingAddressSelector,
    ShippingCountrySelector,
    ShippingOptionSelector,
} from '../shipping';

import Checkout from './checkout';
import CheckoutSelector from './checkout-selector';
import InternalCheckoutSelectors from './internal-checkout-selectors';

/**
 * TODO: Convert this file into TypeScript properly
 * i.e.: Instrument
 */
@selector
export default class CheckoutStoreSelector {
    private _billingAddress: BillingAddressSelector;
    private _cart: CartSelector;
    private _checkout: CheckoutSelector;
    private _config: ConfigSelector;
    private _countries: CountrySelector;
    private _customer: CustomerSelector;
    private _form: FormSelector;
    private _instruments: InstrumentSelector;
    private _order: OrderSelector;
    private _paymentMethods: PaymentMethodSelector;
    private _quote: QuoteSelector;
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
        this._countries = selectors.countries;
        this._customer = selectors.customer;
        this._form = selectors.form;
        this._instruments = selectors.instruments;
        this._order = selectors.order;
        this._paymentMethods = selectors.paymentMethods;
        this._quote = selectors.quote;
        this._shippingAddress = selectors.shippingAddress;
        this._shippingCountries = selectors.shippingCountries;
        this._shippingOptions = selectors.shippingOptions;
    }

    getCheckout(): Checkout | undefined {
        return this._checkout.getCheckout();
    }

    getOrder(): InternalOrder | undefined {
        return this._order.getOrder();
    }

    getQuote(): InternalQuote | undefined {
        return this._quote.getQuote();
    }

    getConfig(): StoreConfig | undefined {
        return this._config.getStoreConfig();
    }

    getShippingAddress(): InternalAddress | undefined {
        return this._shippingAddress.getShippingAddress();
    }

    getShippingOptions(): InternalShippingOptionList | undefined {
        return this._shippingOptions.getShippingOptions();
    }

    getSelectedShippingOption(): InternalShippingOption | undefined {
        return this._shippingOptions.getSelectedShippingOption();
    }

    getShippingCountries(): Country[] | undefined {
        return this._shippingCountries.getShippingCountries();
    }

    getBillingAddress(): InternalAddress | undefined {
        return this._billingAddress.getBillingAddress();
    }

    getBillingCountries(): Country[] | undefined {
        return this._countries.getCountries();
    }

    getPaymentMethods(): PaymentMethod[] | undefined {
        return this._paymentMethods.getPaymentMethods();
    }

    getPaymentMethod(methodId: string, gatewayId?: string): PaymentMethod | undefined {
        return this._paymentMethods.getPaymentMethod(methodId, gatewayId);
    }

    getSelectedPaymentMethod(): PaymentMethod | undefined {
        return this._paymentMethods.getSelectedPaymentMethod();
    }

    getCart(): InternalCart | undefined {
        return this._cart.getCart();
    }

    getCustomer(): InternalCustomer | undefined {
        return this._customer.getCustomer();
    }

    isPaymentDataRequired(useStoreCredit?: boolean): boolean {
        return this._order.isPaymentDataRequired(useStoreCredit);
    }

    isPaymentDataSubmitted(methodId: string, gatewayId?: string): boolean {
        return this._order.isPaymentDataSubmitted(this.getPaymentMethod(methodId, gatewayId));
    }

    getInstruments(): Instrument[] | undefined {
        return this._instruments.getInstruments();
    }

    getBillingAddressFields(countryCode: string): FormField[] {
        return this._form.getBillingAddressFields(this.getBillingCountries(), countryCode);
    }

    getShippingAddressFields(countryCode: string): FormField[] {
        return this._form.getShippingAddressFields(this.getShippingCountries(), countryCode);
    }
}
