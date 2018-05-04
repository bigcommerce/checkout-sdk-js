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

@selector
export default class CheckoutErrorSelector {
    /**
     * @internal
     */
    constructor(
        private _billingAddress: BillingAddressSelector,
        private _cart: CartSelector,
        private _config: ConfigSelector,
        private _countries: CountrySelector,
        private _coupon: CouponSelector,
        private _customerStrategy: CustomerStrategySelector,
        private _giftCertificate: GiftCertificateSelector,
        private _instruments: InstrumentSelector,
        private _order: OrderSelector,
        private _paymentMethods: PaymentMethodSelector,
        private _paymentStrategy: PaymentStrategySelector,
        private _quote: QuoteSelector,
        private _shippingCountries: ShippingCountrySelector,
        private _shippingOptions: ShippingOptionSelector,
        private _shippingStrategy: ShippingStrategySelector
    ) {}

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
        return this._paymentStrategy.getExecuteError();
    }

    getFinalizeOrderError(): Error | undefined {
        return this._paymentStrategy.getFinalizeError();
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
        return this._paymentStrategy.getInitializeError(methodId);
    }

    getSignInError(): Error | undefined {
        return this._customerStrategy.getSignInError();
    }

    getSignOutError(): Error | undefined {
        return this._customerStrategy.getSignOutError();
    }

    getInitializeCustomerError(methodId?: string): Error | undefined {
        return this._customerStrategy.getInitializeError(methodId);
    }

    getLoadShippingOptionsError(): Error | undefined {
        return this._shippingOptions.getLoadError();
    }

    getSelectShippingOptionError(): Error | undefined {
        return this._shippingStrategy.getSelectOptionError();
    }

    getUpdateBillingAddressError(): Error | undefined {
        return this._billingAddress.getUpdateError();
    }

    getUpdateShippingAddressError(): Error | undefined {
        return this._shippingStrategy.getUpdateAddressError();
    }

    getInitializeShippingError(methodId?: string): Error | undefined {
        return this._shippingStrategy.getInitializeError(methodId);
    }

    getApplyCouponError(): Error | undefined {
        return this._coupon.getApplyError();
    }

    getRemoveCouponError(): Error | undefined {
        return this._coupon.getRemoveError();
    }

    getApplyGiftCertificateError(): Error | undefined {
        return this._giftCertificate.getApplyError();
    }

    getRemoveGiftCertificateError(): Error | undefined {
        return this._giftCertificate.getRemoveError();
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
