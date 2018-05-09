import { Address } from '../address';
import { BillingAddressActionCreator } from '../billing';
import { CartActionCreator } from '../cart';
import { MissingDataError } from '../common/error/errors';
import { RequestOptions } from '../common/http-request';
import { ConfigActionCreator } from '../config';
import { CouponActionCreator, GiftCertificateActionCreator } from '../coupon';
import { CustomerCredentials, CustomerInitializeOptions, CustomerRequestOptions, CustomerStrategyActionCreator } from '../customer';
import { CountryActionCreator } from '../geography';
import { OrderActionCreator, OrderRequestBody } from '../order';
import { PaymentInitializeOptions, PaymentMethodActionCreator, PaymentRequestOptions, PaymentStrategyActionCreator } from '../payment';
import { InstrumentActionCreator } from '../payment/instrument';
import { QuoteActionCreator } from '../quote';
import {
    ConsignmentActionCreator,
    ShippingCountryActionCreator,
    ShippingInitializeOptions,
    ShippingRequestOptions,
    ShippingStrategyActionCreator,
} from '../shipping';

import CheckoutActionCreator from './checkout-action-creator';
import CheckoutSelectors from './checkout-selectors';
import CheckoutStore from './checkout-store';
import createCheckoutSelectors from './create-checkout-selectors';
import InternalCheckoutSelectors from './internal-checkout-selectors';

/**
 * TODO: Convert this file into TypeScript properly
 * i.e.: Instrument, InitializePaymentOptions etc...
 */
export default class CheckoutService {
    private _state: CheckoutSelectors;

    /**
     * @internal
     */
    constructor(
        private _store: CheckoutStore,
        private _billingAddressActionCreator: BillingAddressActionCreator,
        private _cartActionCreator: CartActionCreator,
        private _checkoutActionCreator: CheckoutActionCreator,
        private _configActionCreator: ConfigActionCreator,
        private _consignmentActionCreator: ConsignmentActionCreator,
        private _countryActionCreator: CountryActionCreator,
        private _couponActionCreator: CouponActionCreator,
        private _customerStrategyActionCreator: CustomerStrategyActionCreator,
        private _giftCertificateActionCreator: GiftCertificateActionCreator,
        private _instrumentActionCreator: InstrumentActionCreator,
        private _orderActionCreator: OrderActionCreator,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _paymentStrategyActionCreator: PaymentStrategyActionCreator,
        private _quoteActionCreator: QuoteActionCreator,
        private _shippingCountryActionCreator: ShippingCountryActionCreator,
        private _shippingStrategyActionCreator: ShippingStrategyActionCreator
    ) {
        this._state = createCheckoutSelectors(this._store.getState());

        this._store.subscribe(state => {
            this._state = createCheckoutSelectors(state);
        });
    }

    getState(): CheckoutSelectors {
        return this._state;
    }

    notifyState(): void {
        this._store.notifyState();
    }

    subscribe(
        subscriber: (state: CheckoutSelectors) => void,
        ...filters: Array<(state: CheckoutSelectors) => any>
    ): () => void {
        return this._store.subscribe(
            () => subscriber(this.getState()),
            ...filters.map(filter => (state: InternalCheckoutSelectors) => filter(createCheckoutSelectors(state)))
        );
    }

    loadCheckout(id: string, options?: RequestOptions): Promise<CheckoutSelectors> {
        return Promise.all([
            this._store.dispatch(this._quoteActionCreator.loadQuote(options)),
            this._store.dispatch(this._checkoutActionCreator.loadCheckout(id, options)),
        ]).then(() => this.getState());
    }

    loadConfig(options?: RequestOptions): Promise<CheckoutSelectors> {
        const action = this._configActionCreator.loadConfig(options);

        return this._store.dispatch(action, { queueId: 'config' })
            .then(() => this.getState());
    }

    loadCart(options?: RequestOptions): Promise<CheckoutSelectors> {
        const action = this._cartActionCreator.loadCart(options);

        return this._store.dispatch(action)
            .then(() => this.getState());
    }

    loadOrder(orderId: number, options?: RequestOptions): Promise<CheckoutSelectors> {
        return Promise.all([
            this._store.dispatch(this._orderActionCreator.loadInternalOrder(orderId, options)),
            this._store.dispatch(this._orderActionCreator.loadOrder(orderId, options)),
        ]).then(() => this.getState());
    }

    submitOrder(payload: OrderRequestBody, options?: RequestOptions): Promise<CheckoutSelectors> {
        const action = this._paymentStrategyActionCreator.execute(payload, options);

        return this._store.dispatch(action, { queueId: 'paymentStrategy' })
            .then(() => this.getState());
    }

    /**
     * @deprecated
     */
    finalizeOrder(orderId: number, options?: RequestOptions): Promise<CheckoutSelectors> {
        const action = this._orderActionCreator.finalizeOrder(orderId, options);

        return this._store.dispatch(action)
            .then(() => this.getState());
    }

    finalizeOrderIfNeeded(options?: RequestOptions): Promise<CheckoutSelectors> {
        const action = this._paymentStrategyActionCreator.finalize(options);

        return this._store.dispatch(action, { queueId: 'paymentStrategy' })
            .then(() => this.getState());
    }

    loadPaymentMethods(options?: RequestOptions): Promise<CheckoutSelectors> {
        const action = this._paymentMethodActionCreator.loadPaymentMethods(options);

        return this._store.dispatch(action, { queueId: 'paymentMethods' })
            .then(() => this.getState());
    }

    loadPaymentMethod(methodId: string, options: RequestOptions): Promise<CheckoutSelectors> {
        const action = this._paymentMethodActionCreator.loadPaymentMethod(methodId, options);

        return this._store.dispatch(action, { queueId: 'paymentMethods' })
            .then(() => this.getState());
    }

    initializePayment(options: PaymentInitializeOptions): Promise<CheckoutSelectors> {
        const action = this._paymentStrategyActionCreator.initialize(options);

        return this._store.dispatch(action, { queueId: 'paymentStrategy' })
            .then(() => this.getState());
    }

    deinitializePayment(options: PaymentRequestOptions): Promise<CheckoutSelectors> {
        const action = this._paymentStrategyActionCreator.deinitialize(options);

        return this._store.dispatch(action, { queueId: 'paymentStrategy' })
            .then(() => this.getState());
    }

    loadBillingCountries(options?: RequestOptions): Promise<CheckoutSelectors> {
        const action = this._countryActionCreator.loadCountries(options);

        return this._store.dispatch(action, { queueId: 'billingCountries' })
            .then(() => this.getState());
    }

    loadShippingCountries(options?: RequestOptions): Promise<CheckoutSelectors> {
        const action = this._shippingCountryActionCreator.loadCountries(options);

        return this._store.dispatch(action, { queueId: 'shippingCountries' })
            .then(() => this.getState());
    }

    loadBillingAddressFields(options?: RequestOptions): Promise<CheckoutSelectors> {
        return this.loadBillingCountries(options);
    }

    loadShippingAddressFields(options?: RequestOptions): Promise<CheckoutSelectors> {
        return this.loadShippingCountries(options);
    }

    initializeCustomer(options?: CustomerInitializeOptions): Promise<CheckoutSelectors> {
        const action = this._customerStrategyActionCreator.initialize(options);

        return this._store.dispatch(action, { queueId: 'customerStrategy' })
            .then(() => this.getState());
    }

    deinitializeCustomer(options?: CustomerRequestOptions): Promise<CheckoutSelectors> {
        const action = this._customerStrategyActionCreator.deinitialize(options);

        return this._store.dispatch(action, { queueId: 'customerStrategy' })
            .then(() => this.getState());
    }

    signInCustomer(credentials: CustomerCredentials, options?: CustomerRequestOptions): Promise<CheckoutSelectors> {
        const action = this._customerStrategyActionCreator.signIn(credentials, options);

        return this._store.dispatch(action, { queueId: 'customerStrategy' })
            .then(() => this.getState());
    }

    signOutCustomer(options?: CustomerRequestOptions): Promise<CheckoutSelectors> {
        const action = this._customerStrategyActionCreator.signOut(options);

        return this._store.dispatch(action, { queueId: 'customerStrategy' })
            .then(() => this.getState());
    }

    loadShippingOptions(options: RequestOptions = {}): Promise<CheckoutSelectors> {
        const action = this._consignmentActionCreator.loadShippingOptions(options);

        return this._store.dispatch(action)
            .then(() => this.getState());
    }

    initializeShipping(options?: ShippingInitializeOptions): Promise<CheckoutSelectors> {
        const action = this._shippingStrategyActionCreator.initialize(options);

        return this._store.dispatch(action, { queueId: 'shippingStrategy' })
            .then(() => this.getState());
    }

    deinitializeShipping(options?: ShippingRequestOptions): Promise<CheckoutSelectors> {
        const action = this._shippingStrategyActionCreator.deinitialize(options);

        return this._store.dispatch(action, { queueId: 'shippingStrategy' })
            .then(() => this.getState());
    }

    selectShippingOption(shippingOptionId: string, options?: ShippingRequestOptions): Promise<CheckoutSelectors> {
        const action = this._shippingStrategyActionCreator.selectOption(shippingOptionId, options);

        return this._store.dispatch(action, { queueId: 'shippingStrategy' })
            .then(() => this.getState());
    }

    updateShippingAddress(address: Address, options?: ShippingRequestOptions): Promise<CheckoutSelectors> {
        const action = this._shippingStrategyActionCreator.updateAddress(address, options);

        return this._store.dispatch(action, { queueId: 'shippingStrategy' })
            .then(() => this.getState());
    }

    updateBillingAddress(address: Address, options: RequestOptions = {}): Promise<CheckoutSelectors> {
        const action = this._billingAddressActionCreator.updateAddress(address, options);

        return this._store.dispatch(action)
            .then(() => this.getState());
    }

    applyCoupon(code: string, options: RequestOptions = {}): Promise<CheckoutSelectors> {
        return Promise.all([
            this._store.dispatch(this._quoteActionCreator.loadQuote(options)),
            this._store.dispatch(this._couponActionCreator.applyCoupon(code, options)),
        ]).then(() => this.getState());
    }

    removeCoupon(code: string, options: RequestOptions = {}): Promise<CheckoutSelectors> {
        return Promise.all([
            this._store.dispatch(this._quoteActionCreator.loadQuote(options)),
            this._store.dispatch(this._couponActionCreator.removeCoupon(code, options)),
        ]).then(() => this.getState());
    }

    applyGiftCertificate(code: string, options: RequestOptions = {}): Promise<CheckoutSelectors> {
        return Promise.all([
            this._store.dispatch(this._quoteActionCreator.loadQuote(options)),
            this._store.dispatch(this._giftCertificateActionCreator.applyGiftCertificate(code, options)),
        ]).then(() => this.getState());
    }

    removeGiftCertificate(code: string, options: RequestOptions = {}): Promise<CheckoutSelectors> {
        return Promise.all([
            this._store.dispatch(this._quoteActionCreator.loadQuote(options)),
            this._store.dispatch(this._giftCertificateActionCreator.removeGiftCertificate(code, options)),
        ]).then(() => this.getState());
    }

    loadInstruments(): Promise<CheckoutSelectors> {
        const { storeId, customerId, token } = this._getInstrumentState();

        const action = this._instrumentActionCreator.loadInstruments(
            storeId,
            customerId,
            token
        );

        return this._store.dispatch(action)
            .then(() => this.getState());
    }

    vaultInstrument(instrument: any): Promise<CheckoutSelectors> {
        const { storeId, customerId, token } = this._getInstrumentState();

        const action = this._instrumentActionCreator.vaultInstrument(
            storeId,
            customerId,
            token,
            instrument
        );

        return this._store.dispatch(action)
            .then(() => this.getState());
    }

    deleteInstrument(instrumentId: string): Promise<CheckoutSelectors> {
        const { storeId, customerId, token } = this._getInstrumentState();

        const action = this._instrumentActionCreator.deleteInstrument(
            storeId,
            customerId,
            token,
            instrumentId
        );

        return this._store.dispatch(action)
            .then(() => this.getState());
    }

    private _getInstrumentState(): any {
        const state = this._store.getState();
        const config = state.config.getConfig();
        const customer = state.customer.getCustomer();

        if (!config || !customer) {
            throw new MissingDataError('Unable to proceed because "config" or "customer" data is missing.');
        }

        const { customerId } = customer;
        const { storeId } = config.storeProfile;
        const { vaultAccessToken = null, vaultAccessExpiry = null } = state.instruments.getInstrumentsMeta() || {};

        return {
            customerId,
            storeId,
            token: {
                vaultAccessToken,
                vaultAccessExpiry,
            },
        };
    }
}
