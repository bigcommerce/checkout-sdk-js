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
import { QuoteSelector } from '../quote';
import { ShippingCountrySelector, ShippingOptionSelector, ShippingStrategySelector } from '../shipping';

import InternalCheckoutSelectors from './internal-checkout-selectors';

@selector
export default class CheckoutErrorSelector {
    private _billingAddress: BillingAddressSelector;
    private _cart: CartSelector;
    private _config: ConfigSelector;
    private _countries: CountrySelector;
    private _coupons: CouponSelector;
    private _customerStrategies: CustomerStrategySelector;
    private _giftCertificates: GiftCertificateSelector;
    private _instruments: InstrumentSelector;
    private _order: OrderSelector;
    private _paymentMethods: PaymentMethodSelector;
    private _paymentStrategies: PaymentStrategySelector;
    private _quote: QuoteSelector;
    private _shippingCountries: ShippingCountrySelector;
    private _shippingOptions: ShippingOptionSelector;
    private _shippingStrategies: ShippingStrategySelector;

    /**
     * @internal
     */
    constructor(selectors: InternalCheckoutSelectors) {
        this._billingAddress = selectors.billingAddress;
        this._cart = selectors.cart;
        this._config = selectors.config;
        this._countries = selectors.countries;
        this._coupons = selectors.coupons;
        this._customerStrategies = selectors.customerStrategies;
        this._giftCertificates = selectors.giftCertificates;
        this._instruments = selectors.instruments;
        this._order = selectors.order;
        this._paymentMethods = selectors.paymentMethods;
        this._paymentStrategies = selectors.paymentStrategies;
        this._quote = selectors.quote;
        this._shippingCountries = selectors.shippingCountries;
        this._shippingOptions = selectors.shippingOptions;
        this._shippingStrategies = selectors.shippingStrategies;
    }

    getError(): Error | undefined {
        return this.getLoadCheckoutError() ||
            this.getSubmitOrderError() ||
            this.getFinalizeOrderError() ||
            this.getLoadOrderError() ||
            this.getLoadCartError() ||
            this.getVerifyCartError() ||
            this.getLoadBillingCountriesError() ||
            this.getLoadShippingCountriesError() ||
            this.getLoadPaymentMethodsError() ||
            this.getLoadPaymentMethodError() ||
            this.getInitializePaymentMethodError() ||
            this.getLoadShippingOptionsError() ||
            this.getSelectShippingOptionError() ||
            this.getSignInError() ||
            this.getSignOutError() ||
            this.getInitializeCustomerError() ||
            this.getUpdateBillingAddressError() ||
            this.getUpdateShippingAddressError() ||
            this.getInitializeShippingError() ||
            this.getApplyCouponError() ||
            this.getRemoveCouponError() ||
            this.getApplyGiftCertificateError() ||
            this.getRemoveGiftCertificateError() ||
            this.getLoadInstrumentsError() ||
            this.getDeleteInstrumentError() ||
            this.getVaultInstrumentError() ||
            this.getLoadConfigError();
    }

    getLoadCheckoutError(): Error | undefined {
        return this._quote.getLoadError();
    }

    getSubmitOrderError(): Error | undefined {
        return this._paymentStrategies.getExecuteError();
    }

    getFinalizeOrderError(): Error | undefined {
        return this._paymentStrategies.getFinalizeError();
    }

    getLoadOrderError(): Error | undefined {
        return this._order.getLoadError();
    }

    getLoadCartError(): Error | undefined {
        return this._cart.getLoadError();
    }

    getVerifyCartError(): Error | undefined {
        return this._cart.getVerifyError();
    }

    getLoadBillingCountriesError(): Error | undefined {
        return this._countries.getLoadError();
    }

    getLoadShippingCountriesError(): Error | undefined {
        return this._shippingCountries.getLoadError();
    }

    getLoadPaymentMethodsError(): Error | undefined {
        return this._paymentMethods.getLoadError();
    }

    getLoadPaymentMethodError(methodId?: string): Error | undefined {
        return this._paymentMethods.getLoadMethodError(methodId);
    }

    getInitializePaymentMethodError(methodId?: string): Error | undefined {
        return this._paymentStrategies.getInitializeError(methodId);
    }

    getSignInError(): Error | undefined {
        return this._customerStrategies.getSignInError();
    }

    getSignOutError(): Error | undefined {
        return this._customerStrategies.getSignOutError();
    }

    getInitializeCustomerError(methodId?: string): Error | undefined {
        return this._customerStrategies.getInitializeError(methodId);
    }

    getLoadShippingOptionsError(): Error | undefined {
        return this._shippingOptions.getLoadError();
    }

    getSelectShippingOptionError(): Error | undefined {
        return this._shippingStrategies.getSelectOptionError();
    }

    getUpdateBillingAddressError(): Error | undefined {
        return this._billingAddress.getUpdateError();
    }

    getUpdateShippingAddressError(): Error | undefined {
        return this._shippingStrategies.getUpdateAddressError();
    }

    getInitializeShippingError(methodId?: string): Error | undefined {
        return this._shippingStrategies.getInitializeError(methodId);
    }

    getApplyCouponError(): Error | undefined {
        return this._coupons.getApplyError();
    }

    getRemoveCouponError(): Error | undefined {
        return this._coupons.getRemoveError();
    }

    getApplyGiftCertificateError(): Error | undefined {
        return this._giftCertificates.getApplyError();
    }

    getRemoveGiftCertificateError(): Error | undefined {
        return this._giftCertificates.getRemoveError();
    }

    getLoadInstrumentsError(): Error | undefined {
        return this._instruments.getLoadError();
    }

    getVaultInstrumentError(): Error | undefined {
        return this._instruments.getVaultError();
    }

    getDeleteInstrumentError(instrumentId?: string): Error | undefined {
        return this._instruments.getDeleteError(instrumentId);
    }

    getLoadConfigError(): Error | undefined {
        return this._config.getLoadError();
    }
}
