import { InternalAddress } from '../address';
import { BillingAddressSelector } from '../billing';
import { CartSelector, InternalCart } from '../cart';
import { selectorDecorator as selector } from '../common/selector';
import { ConfigSelector } from '../config';
import { CustomerSelector, InternalCustomer } from '../customer';
import { FormSelector } from '../form';
import { CountrySelector } from '../geography';
import { InternalOrder, OrderSelector } from '../order';
import { PaymentMethod, PaymentMethodSelector } from '../payment';
import { InstrumentSelector } from '../payment/instrument';
import { InternalQuote, QuoteSelector } from '../quote';
import { RemoteCheckoutSelector } from '../remote-checkout';
import {
    InternalShippingOption,
    InternalShippingOptionList,
    ShippingAddressSelector,
    ShippingCountrySelector,
    ShippingOptionSelector,
} from '../shipping';

import Checkout from './checkout';
import CheckoutSelector from './checkout-selector';

/**
 * TODO: Convert this file into TypeScript properly
 * i.e.: CheckoutMeta, Config, Country, Instrument, Field
 */
@selector
export default class CheckoutStoreSelector {
    /**
     * @internal
     */
    constructor(
        private _billingAddress: BillingAddressSelector,
        private _cart: CartSelector,
        private _checkout: CheckoutSelector,
        private _config: ConfigSelector,
        private _countries: CountrySelector,
        private _customer: CustomerSelector,
        private _form: FormSelector,
        private _instruments: InstrumentSelector,
        private _order: OrderSelector,
        private _paymentMethods: PaymentMethodSelector,
        private _quote: QuoteSelector,
        private _remoteCheckout: RemoteCheckoutSelector,
        private _shippingAddress: ShippingAddressSelector,
        private _shippingCountries: ShippingCountrySelector,
        private _shippingOptions: ShippingOptionSelector
    ) {}

    getCheckout(): Checkout | undefined {
        return this._checkout.getCheckout();
    }

    /**
     * @return {CheckoutMeta}
     */
    getCheckoutMeta() {
        const orderMeta = this._order.getOrderMeta();
        const paymentMethodsMeta = this._paymentMethods.getPaymentMethodsMeta();
        const isCartVerified = this._cart.isValid();
        const paymentAuthToken = this._order.getPaymentAuthToken();
        const instrumentsMeta = this._instruments.getInstrumentsMeta();
        const remoteCheckout = this._remoteCheckout.getCheckout();
        const remoteCheckoutMeta = this._remoteCheckout.getCheckoutMeta();

        return {
            ...orderMeta,
            ...(paymentMethodsMeta && paymentMethodsMeta.request),
            ...instrumentsMeta,
            isCartVerified,
            paymentAuthToken,
            remoteCheckout: {
                ...remoteCheckout,
                ...remoteCheckoutMeta,
            },
        };
    }

    getOrder(): InternalOrder | undefined {
        return this._order.getOrder();
    }

    getQuote(): InternalQuote | undefined {
        return this._quote.getQuote();
    }

    /**
     * @return {Config}
     */
    getConfig(): any {
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

    isPaymentDataRequired(useStoreCredit: boolean = false): boolean {
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
