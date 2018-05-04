import { InternalAddress } from '../address';
import { BillingAddressSelector } from '../billing';
import { CartSelector, InternalCart } from '../cart';
import { selector } from '../common/selector';
import { ConfigSelector } from '../config';
import { StoreConfig } from '../config/config';
import { CustomerSelector, InternalCustomer } from '../customer';
import { FormSelector } from '../form';
import { CountrySelector } from '../geography';
import { InternalOrder, OrderSelector } from '../order';
import { PaymentMethod, PaymentMethodSelector } from '../payment';
import { InstrumentSelector } from '../payment/instrument';
import { InternalQuote, QuoteSelector } from '../quote';
import {
    InternalShippingOption,
    InternalShippingOptionList,
    ShippingAddressSelector,
    ShippingCountrySelector,
    ShippingOptionSelector,
} from '../shipping';

/**
 * TODO: Convert this file into TypeScript properly
 * i.e.: CheckoutMeta, Config, Country, Instrument, Field
 */
@selector
export default class CheckoutSelector {
    /**
     * @internal
     */
    constructor(
        private _billingAddress: BillingAddressSelector,
        private _cart: CartSelector,
        private _config: ConfigSelector,
        private _countries: CountrySelector,
        private _customer: CustomerSelector,
        private _form: FormSelector,
        private _instruments: InstrumentSelector,
        private _order: OrderSelector,
        private _paymentMethods: PaymentMethodSelector,
        private _quote: QuoteSelector,
        private _shippingAddress: ShippingAddressSelector,
        private _shippingCountries: ShippingCountrySelector,
        private _shippingOptions: ShippingOptionSelector
    ) {}

    getOrder(): InternalOrder | undefined {
        return this._order.getOrder();
    }

    getQuote(): InternalQuote | undefined {
        return this._quote.getQuote();
    }

    getConfig(): StoreConfig | undefined {
        return this._config.getConfig();
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

    /**
     * @return {Country[]}
     */
    getShippingCountries(): any[] {
        return this._shippingCountries.getShippingCountries();
    }

    getBillingAddress(): InternalAddress | undefined {
        return this._billingAddress.getBillingAddress();
    }

    /**
     * @return {Country[]}
     */
    getBillingCountries(): any[] {
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

    /**
     * @return {Instrument[]}
     */
    getInstruments(): any[] {
        return this._instruments.getInstruments();
    }

    /**
     * @return {Field[]}
     */
    getBillingAddressFields(countryCode: string): any[] {
        return this._form.getBillingAddressFields(this.getBillingCountries(), countryCode);
    }

    /**
     * @return {Field[]}
     */
    getShippingAddressFields(countryCode: string): any[] {
        return this._form.getShippingAddressFields(this.getShippingCountries(), countryCode);
    }
}
