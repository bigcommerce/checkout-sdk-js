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
import { ConsignmentSelector, ShippingCountrySelector, ShippingStrategySelector } from '../shipping';

import CheckoutSelector from './checkout-selector';
import InternalCheckoutSelectors from './internal-checkout-selectors';

/**
 * Responsible for getting the error of any asynchronous checkout action, if
 * there is any.
 *
 * This object has a set of getters that would return an error if an action is
 * not executed successfully. For example, if you are unable to submit an order,
 * you can use this object to retrieve the reason for the failure.
 */
@selector
export default class CheckoutStoreErrorSelector {
    private _billingAddress: BillingAddressSelector;
    private _cart: CartSelector;
    private _checkout: CheckoutSelector;
    private _config: ConfigSelector;
    private _consignments: ConsignmentSelector;
    private _countries: CountrySelector;
    private _coupons: CouponSelector;
    private _customerStrategies: CustomerStrategySelector;
    private _giftCertificates: GiftCertificateSelector;
    private _instruments: InstrumentSelector;
    private _order: OrderSelector;
    private _paymentMethods: PaymentMethodSelector;
    private _paymentStrategies: PaymentStrategySelector;
    private _shippingCountries: ShippingCountrySelector;
    private _shippingStrategies: ShippingStrategySelector;

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
        this._customerStrategies = selectors.customerStrategies;
        this._giftCertificates = selectors.giftCertificates;
        this._instruments = selectors.instruments;
        this._order = selectors.order;
        this._paymentMethods = selectors.paymentMethods;
        this._paymentStrategies = selectors.paymentStrategies;
        this._shippingCountries = selectors.shippingCountries;
        this._shippingStrategies = selectors.shippingStrategies;
    }

    /**
     * Gets the error of any checkout action that has failed.
     *
     * @returns The error object if unable to perform any checkout action,
     * otherwise undefined.
     */
    getError(): Error | undefined {
        return this.getLoadCheckoutError() ||
            this.getSubmitOrderError() ||
            this.getFinalizeOrderError() ||
            this.getLoadOrderError() ||
            this.getLoadCartError() ||
            this.getLoadBillingCountriesError() ||
            this.getLoadShippingCountriesError() ||
            this.getLoadPaymentMethodsError() ||
            this.getLoadPaymentMethodError() ||
            this.getInitializePaymentError() ||
            this.getLoadShippingOptionsError() ||
            this.getSelectShippingOptionError() ||
            this.getSignInError() ||
            this.getSignOutError() ||
            this.getInitializeCustomerError() ||
            this.getUpdateShippingAddressError() ||
            this.getUpdateBillingAddressError() ||
            this.getUpdateConsignmentError() ||
            this.getCreateConsignmentsError() ||
            this.getInitializeShippingError() ||
            this.getApplyCouponError() ||
            this.getRemoveCouponError() ||
            this.getApplyGiftCertificateError() ||
            this.getRemoveGiftCertificateError() ||
            this.getLoadInstrumentsError() ||
            this.getDeleteInstrumentError() ||
            this.getLoadConfigError();
    }

    /**
     * Returns an error if unable to load the current checkout.
     *
     * @returns The error object if unable to load, otherwise undefined.
     */
    getLoadCheckoutError(): Error | undefined {
        return this._checkout.getLoadError();
    }

    /**
     * Returns an error if unable to submit the current order.
     *
     * @returns The error object if unable to submit, otherwise undefined.
     */
    getSubmitOrderError(): Error | undefined {
        return this._paymentStrategies.getExecuteError();
    }

    /**
     * Returns an error if unable to finalize the current order.
     *
     * @returns The error object if unable to finalize, otherwise undefined.
     */
    getFinalizeOrderError(): Error | undefined {
        return this._paymentStrategies.getFinalizeError();
    }

    /**
     * Returns an error if unable to load the current order.
     *
     * @returns The error object if unable to load, otherwise undefined.
     */
    getLoadOrderError(): Error | undefined {
        return this._order.getLoadError();
    }

    /**
     * Returns an error if unable to load the current cart.
     *
     * @returns The error object if unable to load, otherwise undefined.
     */
    getLoadCartError(): Error | undefined {
        return this._cart.getLoadError();
    }

    /**
     * Returns an error if unable to load billing countries.
     *
     * @returns The error object if unable to load, otherwise undefined.
     */
    getLoadBillingCountriesError(): Error | undefined {
        return this._countries.getLoadError();
    }

    /**
     * Returns an error if unable to load shipping countries.
     *
     * @returns The error object if unable to load, otherwise undefined.
     */
    getLoadShippingCountriesError(): Error | undefined {
        return this._shippingCountries.getLoadError();
    }

    /**
     * Returns an error if unable to load payment methods.
     *
     * @returns The error object if unable to load, otherwise undefined.
     */
    getLoadPaymentMethodsError(): Error | undefined {
        return this._paymentMethods.getLoadError();
    }

    /**
     * Returns an error if unable to load a specific payment method.
     *
     * @param methodId - The identifier of the payment method to load.
     * @returns The error object if unable to load, otherwise undefined.
     */
    getLoadPaymentMethodError(methodId?: string): Error | undefined {
        return this._paymentMethods.getLoadMethodError(methodId);
    }

    /**
     * Returns an error if unable to initialize a specific payment method.
     *
     * @param methodId - The identifier of the payment method to initialize.
     * @returns The error object if unable to initialize, otherwise undefined.
     */
    getInitializePaymentError(methodId?: string): Error | undefined {
        return this._paymentStrategies.getInitializeError(methodId);
    }

    /**
     * Returns an error if unable to sign in.
     *
     * @returns The error object if unable to sign in, otherwise undefined.
     */
    getSignInError(): Error | undefined {
        return this._customerStrategies.getSignInError();
    }

    /**
     * Returns an error if unable to sign out.
     *
     * @returns The error object if unable to sign out, otherwise undefined.
     */
    getSignOutError(): Error | undefined {
        return this._customerStrategies.getSignOutError();
    }

    /**
     * Returns an error if unable to initialize the customer step of a checkout
     * process.
     *
     * @param methodId - The identifer of the initialization method to execute.
     * @returns The error object if unable to initialize, otherwise undefined.
     */
    getInitializeCustomerError(methodId?: string): Error | undefined {
        return this._customerStrategies.getInitializeError(methodId);
    }

    /**
     * Returns an error if unable to load shipping options.
     *
     * @returns The error object if unable to load, otherwise undefined.
     */
    getLoadShippingOptionsError(): Error | undefined {
        return this._consignments.getLoadShippingOptionsError();
    }

    /**
     * Returns an error if unable to select a shipping option.
     *
     * A consignment ID should be provided when checking for an error for a
     * specific consignment, otherwise it will check for all available consignments.
     *
     * @param consignmentId - The identifier of the consignment to be checked.
     * @returns The error object if unable to select, otherwise undefined.
     */
    getSelectShippingOptionError(consignmentId?: string): Error | undefined {
        return this._shippingStrategies.getSelectOptionError() ||
            this._consignments.getupdateShippingOptionError(consignmentId);
    }

    /**
     * Returns an error if unable to update billing address.
     *
     * @returns The error object if unable to update, otherwise undefined.
     */
    getUpdateBillingAddressError(): Error | undefined {
        return this._billingAddress.getUpdateError();
    }

    /**
     * Returns an error if unable to update shipping address.
     *
     * @returns The error object if unable to update, otherwise undefined.
     */
    getUpdateShippingAddressError(): Error | undefined {
        return this._shippingStrategies.getUpdateAddressError();
    }

    /**
     * Returns an error if unable to update a consignment.
     *
     * A consignment ID should be provided when checking for an error for a
     * specific consignment, otherwise it will check for all available consignments.
     *
     * @param consignmentId - The identifier of the consignment to be checked.
     * @returns The error object if unable to update, otherwise undefined.
     */
    getUpdateConsignmentError(consignmentId?: string): Error | undefined {
        return this._consignments.getUpdateConsignmentError(consignmentId);
    }

    /**
     * Returns an error if unable to create consignments.
     *
     * @returns The error object if unable to create, otherwise undefined.
     */
    getCreateConsignmentsError(): Error | undefined {
        return this._consignments.getCreateError();
    }

    /**
     * Returns an error if unable to initialize the shipping step of a checkout
     * process.
     *
     * @param methodId - The identifer of the initialization method to execute.
     * @returns The error object if unable to initialize, otherwise undefined.
     */
    getInitializeShippingError(methodId?: string): Error | undefined {
        return this._shippingStrategies.getInitializeError(methodId);
    }

    /**
     * Returns an error if unable to apply a coupon code.
     *
     * @returns The error object if unable to apply, otherwise undefined.
     */
    getApplyCouponError(): Error | undefined {
        return this._coupons.getApplyError();
    }

    /**
     * Returns an error if unable to remove a coupon code.
     *
     * @returns The error object if unable to remove, otherwise undefined.
     */
    getRemoveCouponError(): Error | undefined {
        return this._coupons.getRemoveError();
    }

    /**
     * Returns an error if unable to apply a gift certificate.
     *
     * @returns The error object if unable to apply, otherwise undefined.
     */
    getApplyGiftCertificateError(): Error | undefined {
        return this._giftCertificates.getApplyError();
    }

    /**
     * Returns an error if unable to remove a gift certificate.
     *
     * @returns The error object if unable to remove, otherwise undefined.
     */
    getRemoveGiftCertificateError(): Error | undefined {
        return this._giftCertificates.getRemoveError();
    }

    /**
     * Returns an error if unable to load payment instruments.
     *
     * @returns The error object if unable to load, otherwise undefined.
     */
    getLoadInstrumentsError(): Error | undefined {
        return this._instruments.getLoadError();
    }

    /**
     * Returns an error if unable to delete a payment instrument.
     *
     * @param instrumentId - The identifier of the payment instrument to delete.
     * @returns The error object if unable to delete, otherwise undefined.
     */
    getDeleteInstrumentError(instrumentId?: string): Error | undefined {
        return this._instruments.getDeleteError(instrumentId);
    }

    /**
     * Returns an error if unable to load the checkout configuration of a store.
     *
     * @returns The error object if unable to load, otherwise undefined.
     */
    getLoadConfigError(): Error | undefined {
        return this._config.getLoadError();
    }
}
